self.importScripts('ffmpeg.js');

onmessage = function(e) {
  // console.log('ffmpeg_run', ffmpeg_run);
  console.log(e.data)
  var files = e.data.fileList;
  var outputName = e.data.outputName;
  var mode = e.data.mode;
  var arguments=['-hide_banner', '-i', '/input/' + files[0].name]
  if (mode == 1){
    var params = e.data.params
    arguments=arguments.concat(params.trim().split(" "))
  } else {
      var videoBitrate = e.data.videoBitrate;
      var audioBitrate = e.data.audioBitrate;
      console.log(videoBitrate,audioBitrate,outputName)
      if(videoBitrate!=""){
          arguments=arguments.concat(['-b:v', videoBitrate])
      }
      if(audioBitrate!=""){
          arguments=arguments.concat(['-b:a', audioBitrate])
      }
  }
  arguments.push(outputName)
  console.log(arguments)
  ffmpeg_run({
	  arguments: arguments,
      files: files
  }, function(results) {
    console.log('result',results[0].data);
	var blob = new Blob([results[0].data], {type: "application/octet-stream"});
	console.log(blob)
	var blobURL = URL.createObjectURL(blob);
	console.log(blobURL)
    self.postMessage({"type":"file","value":blobURL,"name":outputName})
  });

}
