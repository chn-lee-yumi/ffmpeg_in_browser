var ffmpeg = null;
var tryMultiThread = false; // currently use false since it's not stable

const fetchFile = async (url) => {
    var resp = await fetch(url);
    var buffer = await resp.arrayBuffer();
    return new Uint8Array(buffer);
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

const toBlobURL = async (url, mimeType) => {
    var resp = await fetch(url);
    var body = await resp.blob();
    var blob = new Blob([body], {
        type: mimeType
    });
    return URL.createObjectURL(blob);
};

function log(message) {
    document.getElementById("tty")
        .innerHTML = document.getElementById("tty")
        .innerHTML + "</br>" + message;
}

const load = async () => {
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
            workerLoadURL: await toBlobURL(`${baseURLFFMPEG}/814.ffmpeg.js`, 'text/javascript'),
            coreURL: await toBlobURL(`${baseURLCoreMT}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURLCoreMT}/ffmpeg-core.wasm`, 'application/wasm'),
            workerURL: await toBlobURL(`${baseURLCoreMT}/ffmpeg-core.worker.js`, 'application/javascript'),
        });
    } else {
        console.log("single-threaded");
        await ffmpeg.load({
            workerLoadURL: await toBlobURL(`${baseURLFFMPEG}/814.ffmpeg.js`, 'text/javascript'),
            coreURL: await toBlobURL(`${baseURLCore}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURLCore}/ffmpeg-core.wasm`, 'application/wasm'),
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