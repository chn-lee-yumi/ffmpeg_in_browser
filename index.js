var worker = new Worker('worker.js');
// var inputElement = document.getElementById("file_input")
// inputElement.addEventListener("change", handleFiles, false)
// function handleFiles() {
// 	var fileList = this.files
// 	console.log(fileList)
// 	worker.postMessage({"fileList":fileList,"videoBitrate":"512k"})
// }

worker.onmessage = function (event) {
	console.log(event)
	if(event.data.type=="tty"){
		var temp=document.getElementById("tty").innerHTML
		document.getElementById("tty").innerHTML=temp+"</br>"+event.data.value
		document.body.scrollTop=document.body.scrollHeight;
		// document.write(event.data.value)
	} else if (event.data.type=="file"){
		setLoading(false)
		alert("转码完成！点击确定下载文件。")
		downloadFileByBlob(event.data.value,event.data.name)
	}
}