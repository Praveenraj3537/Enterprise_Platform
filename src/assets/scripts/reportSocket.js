var ws=null;
var flag = 0;
var disconnectLiveWebSocket = function () {
	if (ws != null) {
		ws.send("CLOSE_CONNECTION");
		ws.close();
		ws = null;
	}
};

var liveReportSocket = function (dataInput) {
	let endpoint = dataInput.replace('https', "wss");
	let url = endpoint;
	LiveWebSocketInitialize(url);
};

var onWSOpen1 = function () {
	// Web Socket is connected, send data using send()
	ws.send("Message to send");
	var btn = document.getElementById("btnConnect");
	btn.innerHTML = "Disconnect";
	btn.textContent = "Disconnect";
	btn.value = "Disconnect";
	btn.style.backgroundColor = "red";

};

function onWSError1() {
	if (ws != null) {
		alert("Socket Error : Seems other connection is Online,please connect after some time or choose other instrument");
	}
}

var onWSClose1 = function () {
		
	//Do all the closing and clearingcode 
	if (ws != null) {
		// 	ws.close();
		alert("Socket Connection is closed");
		var btn = document.getElementById("btnConnect");
		btn.style.backgroundColor = "#337ab7";
		btn.className = "btn btn-primary populatetblbtn";
		btn.innerHTML = "Connect";
		btn.value = "Connect";
	}

};
function LiveWebSocketInitialize(url) {
	if ((ws == undefined || ws == null) || ("WebSocket" in window)) {
		ws = new WebSocket(url);
		ws.onopen = onWSOpen1;
		ws.close = onWSClose1;
		ws.onerror = onWSError1;
		ws.onmessage = function (evt) {

			var received_data = evt.data;
			
			//str = JSON.parse(JSON.parse(received_data));
			str = JSON.parse(received_data);
			delete str.project_id;
			delete str.client_id;
			delete str.iot_device_id;

			let responseKeys = Object.keys(str);
			let responseValues = Object.values(str);

			var maintable = $("<table id='reportTable' class='table table-bordered tableStyle'></table>");
			if (flag == 0) {
				flag = flag + 1;
				var headtr = $("<tr></tr>");
				for (let i = 0; i < responseKeys.length; i++) {
					var temp = $('<th style="color:White">' + responseKeys[i] + '</th>');
					$(headtr).append(temp);
				}
				$(maintable).append(headtr)

				var bodytr = $("<tr></tr>");
				for (let i = 0; i < responseValues.length; i++) {
					var temp1 = $('<td style="height:35px">' + responseValues[i] + '</td>');
					$(bodytr).append(temp1);
				}
				$(maintable).append(bodytr);
			}
			else {
				var bodytr = $("<tr></tr>");
				for (let i = 0; i < responseValues.length; i++) {
					var temp1 = $('<td style="height:35px">' + responseValues[i] + '</td>');
					$(bodytr).append(temp1);
				}
				$("#reportTable").append(bodytr);
			}
			$("#liveProject").append(maintable);
		}
	
	}
	else {
		// The browser doesn't support WebSocket
		alert("WebSocket NOT supported by your Browser!");
	}

	
};