var GENERAL_HIDDEN_LAST_TD_ID = 'hidden_last_td_id';
var GENERAL_HIDDEN_MANUALY_SET_ID = 'hidden_manually_set';
var HIDDEN_MANUALY_SET_ID = 'hidden_manually_set';
var HIDDEN_LAST_TD_ID = 'hidden_last_td_id';



"use strict";

// window.addEventListener('load', (event) => {
// 	console.log('page is fully loaded');
// 	checkPortStatus();
//   });


class SerialScaleController {

	constructor() {
		this.encoder = new TextEncoder();
		this.decoder = new TextDecoder();
		this.textDecoder = new TextDecoderStream();

		this.text = '';

		this.port = null;
	}
	async deinit(btn, inputPort) {
		if ('serial' in navigator) {
			if (this.port != null) {
				// const port1 = await navigator.serial.requestPort();

				var x = 0;

				// this.reader_temp = await this.reader.read();

				// var done = this.reader_temp.done;
				// var value = this.reader_temp.value;

				// while(value!=null && value!=''){
				//   this.reader_temp = await this.reader.read();
				//   done = this.reader_temp.done;
				//   value = this.reader_temp.value;
				// }

				// 0 += reader_temp.value.length;
				//this.push(reader_temp.value);
				this.reader_temp = null;
				var isCatchBlock=false;

				try{
					await this.reader.releaseLock();
				}
				catch(err){
					console.log(err);
				///	await this.port.close();
					isCatchBlock=true;
				}
				this.delay(1500);

				if(!isCatchBlock)
					await this.port.close();

				btn.style.backgroundColor = "Green";
				// connect.className = "btn btn-primary populatetblbtn";
				btn.innerText = "Connect2";
				this.port = null;
			}
		}

	}
	async init(btn, inputPort) {
		if ('serial' in navigator) {
			try {

				navigator.serial.addEventListener("connect", (event) => {
					console.log('connected');
					// TODO: Automatically open event.target or warn user a port is available.
				});

				navigator.serial.addEventListener("disconnect", (event) => {

					console.log('dis connected');
					// TODO: Remove |event.target| from the UI.
					// If the serial port was opened, a stream error would be observed as well.
				});

				const ports = await navigator.serial.getPorts();


				const port1 = (ports != null && ports.length > 0) ? ports[0] :
					(inputPort != null) ? inputPort : await navigator.serial.requestPort();
				//TODO: Read from 'session-storage' and then do the proper connection 
				//{"WriteTimeOutInMilliSeconds":3000,"ReadTimeOutInMilliSeconds":3000,"BaudRate":1200,"Parity":1,"StopBits":0,"DataBits":7,"Handshake":2,
				//"BreakSignalState":false,"IsDataTerminalReadyEnabled":false,"IsRequestToSendEnabled":false}
				//

				var serial_device_communication_information = sessionStorage.getItem('connectToData');
				var parsed_serial_device_communication_information = (serial_device_communication_information != null) ?
					JSON.parse(serial_device_communication_information) : null;

				var finalObject = { baudRate: 9600 };
				if (parsed_serial_device_communication_information != null) {
					finalObject['baudRate'] = parsed_serial_device_communication_information['BaudRate'];
					finalObject['parity'] = parsed_serial_device_communication_information['Parity'] == 1 ? 'odd' :
						parsed_serial_device_communication_information['Parity'] == 0 ? 'none' : 'even';

					finalObject['stopBits'] = parsed_serial_device_communication_information['StopBits'] == 0 ? 1 : 2;
					finalObject['dataBits'] = parsed_serial_device_communication_information['DataBits'];
					//finalObject['dataBits'] = parsed_serial_device_communication_information['DataBits'];
				};

				//Check here
				//await port.open({ baudRate: 9600 });
				await port1.open(finalObject);
				this.reader = port1.readable.getReader();

				// this.reader = this.textDecoder.readable
				//   .pipeThrough(new TransformStream(new LineBreakTransformer()))
				//   .getReader();

				// const readableStreamClosed = port.readable.pipeTo(this.textDecoder.readable);
				//const readableStreamClosed = port.readable.pipeTo(this.textDecoder.writable);

				let signals = await port1.getSignals();
				this.port = port1;
				console.log(signals);

				btn.style.backgroundColor = "Red";
				// connect.className = "btn btn-primary populatetblbtn";
				btn.innerText = "Disconnect2";
			}
			catch (err) {
				console.error('There was an error opening the serial port:', err);
				alert('There was an error opening the serial port:' + err)
			}
		}
		else {
			console.error('Web serial doesn\'t seem to be enabled in your browser. Try enabling it by visiting:');
			console.error('chrome://flags/#enable-experimental-web-platform-features');
			console.error('opera://flags/#enable-experimental-web-platform-features');
			console.error('edge://flags/#enable-experimental-web-platform-features');
		}
	}

	async connectForPreExistingPort(btn, inputPort) {
		if ('serial' in navigator) {
			try {

				navigator.serial.addEventListener("connect", (event) => {
					console.log('connected');
					// TODO: Automatically open event.target or warn user a port is available.
				});

				navigator.serial.addEventListener("disconnect", (event) => {

					console.log('dis connected');
					// TODO: Remove |event.target| from the UI.
					// If the serial port was opened, a stream error would be observed as well.
				});

				


				const port1 = inputPort;
				//TODO: Read from 'session-storage' and then do the proper connection 
				//{"WriteTimeOutInMilliSeconds":3000,"ReadTimeOutInMilliSeconds":3000,"BaudRate":1200,"Parity":1,"StopBits":0,"DataBits":7,"Handshake":2,
				//"BreakSignalState":false,"IsDataTerminalReadyEnabled":false,"IsRequestToSendEnabled":false}
				//

				var serial_device_communication_information = sessionStorage.getItem('connectToData');
				var parsed_serial_device_communication_information = (serial_device_communication_information != null) ?
					JSON.parse(serial_device_communication_information) : null;

				var finalObject = { baudRate: 9600 };
				if (parsed_serial_device_communication_information != null) {
					finalObject['baudRate'] = parsed_serial_device_communication_information['BaudRate'];
					finalObject['parity'] = parsed_serial_device_communication_information['Parity'] == 1 ? 'odd' :
						parsed_serial_device_communication_information['Parity'] == 0 ? 'none' : 'even';

					finalObject['stopBits'] = parsed_serial_device_communication_information['StopBits'] == 0 ? 1 : 2;
					finalObject['dataBits'] = parsed_serial_device_communication_information['DataBits'];
					//finalObject['dataBits'] = parsed_serial_device_communication_information['DataBits'];
				};

				//Check here
				//await port.open({ baudRate: 9600 });
				await port1.open(finalObject);
				this.reader = port1.readable.getReader();

				// this.reader = this.textDecoder.readable
				//   .pipeThrough(new TransformStream(new LineBreakTransformer()))
				//   .getReader();

				// const readableStreamClosed = port.readable.pipeTo(this.textDecoder.readable);
				//const readableStreamClosed = port.readable.pipeTo(this.textDecoder.writable);

				let signals = await port1.getSignals();
				this.port = port1;
				console.log(signals);

				btn.style.backgroundColor = "Red";
				// connect.className = "btn btn-primary populatetblbtn";
				btn.innerText = "Disconnect2";
			}
			catch (err) {
				console.error('There was an error opening the serial port:', err);
			//	alert('There was an error opening the serial port:' + err)
			}
		}
		else {
			console.error('Web serial doesn\'t seem to be enabled in your browser. Try enabling it by visiting:');
			console.error('chrome://flags/#enable-experimental-web-platform-features');
			console.error('opera://flags/#enable-experimental-web-platform-features');
			console.error('edge://flags/#enable-experimental-web-platform-features');
		}
	}
	async read() {
		try {
			var returnValues = [];


			// Listen to data coming from the serial device.
			while (true) {
				const { value, done } = await this.reader.read();
				if (done) {
					// Allow the serial port to be closed later.
					console.log('serial port is released');
					this.reader.releaseLock();
					break;
				}
				// value is a Uint8Array.
				console.log(value);
				// returnValue=value;
				var decodedValue = this.decoder.decode(value);
				if (decodedValue != " ") {
					returnValues.push(decodedValue);
				}
			}
			returnValue = returnValues.join("");
			return returnValue;

		}
		catch (err) {
			const errorMessage = `error reading data: ${err}`;
			console.error(errorMessage);
			return errorMessage;
		}
	}

	async readValue() {
		return this.text;
	}

	async resetTextValue() {
		this.text = '';
	}

	async delay(milisec) {
		return new Promise(resolve => {
			setTimeout(() => { resolve('') }, milisec);
		})
	}

	async printy() {
		for (let i = 0; i < 10; ++i) {
			await delay(1000);
			// console.log(i);
		}
		//  console.log("Loop execution finished!)");
	}


	async read2(callBack) {

		var dStart = new Date();
		var counter = 0;
		var returnValues = [];
		var diff = 0;
		var currentDate = new Date()
		var lastValue = 0;

		while (true) {

			diff = (dStart == null) ? 0 : currentDate.getTime() - dStart.getTime();

			// console.log('diff ' + diff.toString());

			//if (diff >= 1 && diff < 5000 && this.text.length > 3 )
			if (diff >= 1 && diff < 100) {
				// var returnValue = returnValues.join("");
				// returnValues = [];
				//dStart = new Date();
				var retVal2 = JSON.parse(JSON.stringify(this.text));
				// this.text = '';
				dStart = null;
				// console.log('flushed');
				callBack(retVal2);
			}



			dStart = new Date();

			// const { value, done } = this.reader.read();

			// while(this.reader.read()){
			//   //console.log(value);
			//   setTimeout(() => { console.log('hellow') }, 2000);
			// }

			this.reader_temp = await this.reader.read();
			var done = this.reader_temp.done;
			var value = this.reader_temp.value;

			//const { value, done } = await this.reader.read();
			//setTimeout(() => await {}, 50)
			await this.delay(3);

			currentDate = new Date();



			if (done) {
				// Allow the serial port to be closed later.
				//    console.log('serial port is released');
				this.reader.releaseLock();
				break;
			}
			// else{
			//   this.bytesRead += data.value.length;
			//   this.push(data.value);
			// }

			//  console.log(value);

			for (var i = 0; i < value.length; i++) {
				if (value[i] != 0) {
					lastValue = value[i];
					var decodedValue = String.fromCharCode(value[i]); //this.decoder.decode(value);
					this.text += decodedValue;
					// console.log(this.text);
					//returnValues.push(decodedValue);
				}
			}

			//delay for 500 ms
			//setTimeout(() => { console.log('hellow') }, 50);
		}

	}
};

class LineBreakTransformer {
	constructor() {
		// A container for holding stream data until a new line.
		this.chunks = "";
	}

	transform(chunk, controller) {
		// Append new chunks to existing chunks.
		this.chunks += chunk;
		// For each line breaks in chunks, send the parsed lines out.
		const lines = this.chunks.split("\r\n");
		this.chunks = lines.pop();

		//console.log( this.chunks);
		//this.chunks='';
		lines.forEach((line) => controller.enqueue(line));

		if (this.chunks.length > 4) {
			console.log(this.chunks);
			this.chunks = '';
			this.flush(controller);
		}

	}

	flush(controller) {
		// When the stream is closed, flush any remaining chunks out.
		controller.enqueue(this.chunks);
	}
};


const serialScaleController = new SerialScaleController();
var port = null;


// $( document ).ready(function() {
async function checkPortStatus() {

	serialScaleController.delay(3000);
	var btn = document.getElementById("btnConnect2");

	const ports = await navigator.serial.getPorts();

	if (ports != null && ports.length > 0 && btn != null) {
		btn.style.backgroundColor = "Red";
		// connect.className = "btn btn-primary populatetblbtn";
		btn.innerText = "Disconnect2";
	}
};

checkPortStatus();


// });

//************************** SERIAL COMMUNICATION RELATED CODE FOR SERIAL PORT CONFIGURATON ON BROWSER ************************  */



async function doDirectSerialConnection() {

	var btn = document.getElementById("btnConnect2");

	// if(port==null)
	// 	port = await navigator.serial.requestPort();

	// btn.addEventListener('pointerdown', async () => {
	if (btn.innerText = "Connect2") {


		const ports = await navigator.serial.getPorts();

		if (ports != null && ports.length > 0 && btn != null) {


			await serialScaleController.connectForPreExistingPort(btn,ports[0]);

			btn.style.backgroundColor = "Red";
			// connect.className = "btn btn-primary populatetblbtn";
			btn.innerText = "Disconnect2";
		}
		else {
			await serialScaleController.init(btn, port);
			//serialScaleController.read2(printResult);
		}

		serialScaleController.read2(printResult);
		//Once the Connection is established, start listening 

		

		// console.log("hello");
		// serialScaleController.init();

		// btn.innerHTML = "Disconnect2";
		// btn.style.backgroundColor = "red";
	}
	else {
		//do the disconnection
		await serialScaleController.deinit(btn, port);
		//serialScaleController.waitforme(1500);
		// btn.style.backgroundColor = "Green";
		//    // connect.className = "btn btn-primary populatetblbtn";
		// btn.innerHTML = "Connect2";
	}

	// });
};

async function printResult(valueToPrint) {

	await serialScaleController.delay(1000);

	var received_msg = await serialScaleController.readValue();

	await serialScaleController.resetTextValue();

	console.log("printing inside printResult :" + received_msg);

	//Relasing the read lock
	// if(reader_temp!=null){
	// 	delete reader_temp;
	// }

	let idValue = getInputValue(HIDDEN_LAST_TD_ID);
	let isManuallySet = getInputValue(HIDDEN_MANUALY_SET_ID);
	let afterRegEx = received_msg.match(/[\d.\d]+/) || received_msg.match(/[\d+/]+/);
	if (afterRegEx != null) {
		$('#' + idValue).html(afterRegEx);

		setInputValue(GENERAL_HIDDEN_MANUALY_SET_ID, 'false');

		let splittedName = idValue.split('_');
		let currentRowNum = splittedName[splittedName.length - 2];
		let splitedValue = currentRowNum.split('');
		let updatesplitedValue = splitedValue[splitedValue.length - 1];
		//check if page is reading2 then call the below metod
		//This method will find/seach all col header (TH) for formulae's and will apply 
		// as per formulae for for that row.

		//THIS IS NOT REQUIRED AS THIS IS CALLED FROM METHOD 'incrementTdValueForInstrumentCalibrationSet'
		//detectChange(idValue,afterRegEx);
		//THIS WILL INCREMENT THE VALUE FOR THE TD 
		//CHECK IF THE PAGE (IF INSTRUMENT CALIBRATUON THEN THIS METHOD, ELSE BALANCE RECORD METHOD ELSE SAMPLE RECORD)
		incrementTdValueForInstrumentCalibrationSet(afterRegEx, currentRowNum);

		calculateFormulae(updatesplitedValue);
		putSampleMethodStageReading2(currentRowNum, updatesplitedValue);



		// setInputValue(GENERAL_HIDDEN_MANUALY_SET_ID, 'false');

		// let splittedName = idValue.split('_');
		// let currentRowNum = splittedName[splittedName.length - 2];
		// //check if page is reading2 then call the below metod
		// //This method will find/seach all col header (TH) for formulae's and will apply 
		// // as per formulae for for that row.

		// //THIS IS NOT REQUIRED AS THIS IS CALLED FROM METHOD 'incrementTdValueForInstrumentCalibrationSet'
		// //detectChange(idValue,afterRegEx);
		// //THIS WILL INCREMENT THE VALUE FOR THE TD 
		// //CHECK IF THE PAGE (IF INSTRUMENT CALIBRATUON THEN THIS METHOD, ELSE BALANCE RECORD METHOD ELSE SAMPLE RECORD)
		// incrementTdValueForInstrumentCalibrationSet(afterRegEx);

		// calculateFormulae(currentRowNum);
		// putSampleMethodStageReading2(currentRowNum);
		//TODO: Increment the Id, based on Rows and Columns
		// This fires after the blob has been read/loaded.
		// const reader = new FileReader();
		// reader.addEventListener('loadend', (e) => {

		// 	const text = e.srcElement.result;
		// 	console.log('data :' + text);

		// 	let idValue = this.getInputValue(AppConstants.GENERAL.HIDDEN_LAST_TD_ID);
		// 	let isManuallySet = this.getInputValue(AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID);
		// 	$('#' + idValue).html(text);
		// 	//$(divDataRecd).html(text);
		// 	//console.log(text);
		// 	//populateInstrumentValue(text);
		// });

		//reader.readAsText(received_msg);
	}

	// if(test1.trim().length>0)
	//   document.querySelector("#serial-messages-container .message").innerText = test1;

	// console.log(valueToPrint);
	// console.log('-');
	//document.querySelector("#serial-messages-container .message").innerText = valueToPrint;
}

var disconnectDirectSerial = async function () {

	var btn = document.getElementById("btnConnect2");
	if (btn != null && btn.innerText == 'Disconnect2')
		await serialScaleController.deinit(btn, port);

	//Try to close the connection

};
