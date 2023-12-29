# FFmpeg in Browser

Run ffmpeg in browser.

Try online: https://ffmpeg.gcc.ac.cn/

感谢 https://github.com/x213212/build_ffmpeg.js 的 demo。

编译参考：
- https://github.com/ffmpegwasm/ffmpeg.wasm
- https://jeromewu.github.io/build-ffmpeg-webassembly-version-part-2-compile-with-emscripten/

为了让wasm文件使用CDN，我手动修改了`ffmpeg.js`里面的几行：

```
diff --git a/ffmpeg.js b/ffmpeg.js
index 383d762..e0e5ee9 100644
--- a/ffmpeg.js
+++ b/ffmpeg.js
@@ -1306,9 +1306,9 @@ function ffmpeg_run(opts, cb) {
    return asm[name].apply(null, arguments);
   };
  }
- var wasmBinaryFile = "ffmpeg.wasm";
+ var wasmBinaryFile = "https://chn-lee-yumi.github.io/ffmpeg_in_browser/ffmpeg.wasm";
  if (!isDataURI(wasmBinaryFile)) {
-  wasmBinaryFile = locateFile(wasmBinaryFile);
+   //wasmBinaryFile = locateFile(wasmBinaryFile);
  }
  function getBinary() {
   try {
```

# TODO

- 增加FFmpeg命令生成工具
- 增加更多编解码器支持
