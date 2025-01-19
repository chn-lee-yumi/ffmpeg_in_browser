var ffmpeg = null;
var tryMultiThread = false; // currently use false since it's not stable, and it need a special HTTP header which github.io doesn't support

const FFMPEG_VERSION = "0.12.15"
const baseURLFFMPEG = `https://unpkg.com/@ffmpeg/ffmpeg@${FFMPEG_VERSION}/dist/umd`;
const CORE_VERSION = "0.12.10"
const baseURLCore = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;
const CORE_MT_VERSION = "0.12.9"
const baseURLCoreMT = `https://unpkg.com/@ffmpeg/core-mt@${CORE_MT_VERSION}/dist/umd`;
const CORE_SIZE = {
  [`https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd/ffmpeg-core.js`]: 112059,
  [`https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd/ffmpeg-core.wasm`]: 32232419,
  [`https://unpkg.com/@ffmpeg/core-mt@${CORE_MT_VERSION}/dist/umd/ffmpeg-core.js`]: 132680, // TODO: update size
  [`https://unpkg.com/@ffmpeg/core-mt@${CORE_MT_VERSION}/dist/umd/ffmpeg-core.wasm`]: 32609891, // TODO: update size
  [`https://unpkg.com/@ffmpeg/core-mt@${CORE_MT_VERSION}/dist/umd/ffmpeg-core.worker.js`]: 2915, // TODO: update size
  [`https://unpkg.com/@ffmpeg/ffmpeg@${FFMPEG_VERSION}/dist/umd/814.ffmpeg.js`]: 3177,
};

const toBlobURLPatched = async (url, mimeType, patcher) => {
    var resp = await fetch(url);
    var body = await resp.text();
    if (patcher) body = patcher(body);
    var blob = new Blob([body], {
        type: mimeType
    });
    return URL.createObjectURL(blob);
};

const toBlobURL = async (url, mimeType, cb) => {
    const resp = await fetch(url);
    let buf;
    if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
    }
    const total = CORE_SIZE[url];
    let loaded = 0;
    const reader = resp.body.getReader();
    const chunks = [];
    let received = 0;
    for (;;) {
        const { done, value } = await reader.read();
        const delta = value ? value.length : 0;
        if (done) {
            if (total != -1 && total !== received) throw new Error(`Incompleted download!`);
            cb && cb({ url, total, received, delta, done });
            break;
        }
        chunks.push(value);
        received += delta;
        cb && cb({ url, total, received, delta, done });
    }
    const data = new Uint8Array(received);
    let position = 0;
    for (const chunk of chunks) {
      data.set(chunk, position);
      position += chunk.length;
    }
    const stream = data.buffer;
    const body = await new Response(stream).blob();
    const blob = new Blob([body], { type: mimeType });
    return URL.createObjectURL(blob);
};


function log(message) {
    document.getElementById("tty")
        .innerHTML = document.getElementById("tty")
        .innerHTML + "</br>" + message;
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth' // 使滚动平滑
    });
}

function cleanLog() {
    document.getElementById("tty").innerHTML = "";
}

const load = async (threadMode, cb) => {
    tryMultiThread = threadMode;
    const ffmpegBlobURL = await toBlobURLPatched(`${baseURLFFMPEG}/ffmpeg.js`, 'text/javascript', (js) => js.replace('new URL(e.p+e.u(814),e.b)', 'r.workerLoadURL'));
    await import(ffmpegBlobURL);
    ffmpeg = new FFmpegWASM.FFmpeg();
    ffmpeg.on('log', ({
        message
    }) => {
        log(message);
        console.log(message);
    });
    // check if SharedArrayBuffer is supported via crossOriginIsolated global var
    // https://developer.mozilla.org/en-US/docs/Web/API/crossOriginIsolated
    if (tryMultiThread && window.crossOriginIsolated) {
        console.log("multi-threaded");
        await ffmpeg.load({
            workerLoadURL: await toBlobURL(`${baseURLFFMPEG}/814.ffmpeg.js`, 'text/javascript', cb),
            coreURL: await toBlobURL(`${baseURLCoreMT}/ffmpeg-core.js`, 'text/javascript', cb),
            wasmURL: await toBlobURL(`${baseURLCoreMT}/ffmpeg-core.wasm`, 'application/wasm', cb),
            workerURL: await toBlobURL(`${baseURLCoreMT}/ffmpeg-core.worker.js`, 'application/javascript', cb),
        });
    } else {
        console.log("single-threaded");
        await ffmpeg.load({
            workerLoadURL: await toBlobURL(`${baseURLFFMPEG}/814.ffmpeg.js`, 'text/javascript', cb),
            coreURL: await toBlobURL(`${baseURLCore}/ffmpeg-core.js`, 'text/javascript', cb),
            wasmURL: await toBlobURL(`${baseURLCore}/ffmpeg-core.wasm`, 'application/wasm', cb),
        });
    }
    console.log('ffmpeg load success');
}

function downloadFileByBlob(blobUrl, filename) {
    const eleLink = document.createElement('a')
    eleLink.download = filename
    eleLink.style.display = 'none'
    eleLink.href = blobUrl
    document.body.appendChild(eleLink)
    eleLink.click()
    document.body.removeChild(eleLink)
}