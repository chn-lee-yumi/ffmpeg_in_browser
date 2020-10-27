self.importScripts('ffmpeg.js');

onmessage = function(e) {
  // console.log('ffmpeg_run', ffmpeg_run);
  console.log(e.data)
  var files = e.data.fileList;
  var videoBitrate = e.data.videoBitrate;
  var audioBitrate = e.data.audioBitrate;
  var outputName = e.data.outputName;
  var arguments=['-hide_banner', '-i', '/input/' + files[0].name]
  console.log(videoBitrate,audioBitrate,outputName)
  if(videoBitrate!=""){
      arguments=arguments.concat(['-b:v', videoBitrate])
  }
  if(audioBitrate!=""){
      arguments=arguments.concat(['-b:a', audioBitrate])
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
