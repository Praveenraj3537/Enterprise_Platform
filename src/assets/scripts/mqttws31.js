
var GENERAL_HIDDEN_LAST_TD_ID = 'hidden_last_td_id';
var GENERAL_HIDDEN_MANUALY_SET_ID = 'hidden_manually_set';
var HIDDEN_MANUALY_SET_ID = 'hidden_manually_set';
var HIDDEN_LAST_TD_ID = 'hidden_last_td_id';
var ws;

var divControl;


/**
 * 
 * @param tokenType > this can be 'access_token' or 'id_token', default is 'access_token'
 */
//Get Token for dashboard Pages

var getToken = function (tokenType = 'access_token') {
	let token = '';
	//  let waitCounter=0;
	let userManagerSettings = sessionStorage.getItem('oidc_settings') != null ? JSON.parse(sessionStorage.getItem('oidc_settings')) : null;

	let user_specific_info = (userManagerSettings != null) ? (userManagerSettings.authority + ':' + userManagerSettings.client_id) : '';
	let oidc_token = sessionStorage.getItem('oidc.user:' + user_specific_info);
	if (oidc_token != null) {
		let oidc_token_object = JSON.parse(oidc_token);
		token = oidc_token_object[tokenType];
	}
	return 'Bearer ' + token;
};

function getInputValue(controlId) {
	let controlRef = document.getElementById(controlId);
	return controlRef != null ? controlRef.value : '';

}

function setInputValue(currentId, valueToSet) {
	let controlRef = document.getElementById(currentId)
	if (controlRef != null)
		controlRef.value = valueToSet;
}

var onClickForTd = function (id, splitedValue, instrumentValue) {

	if (splitedValue == "balancerecords" || splitedValue == "balanceRecords") {

		let patternToMatch = /WeightValue_[0-9_]*/g;
		let result = id.match(patternToMatch);
		if (result != null) {
			$('table tr td').removeClass('tblActive');
			$('#' + id).addClass('tblActive');
			setInputValue(GENERAL_HIDDEN_LAST_TD_ID, id);
			setInputValue(GENERAL_HIDDEN_MANUALY_SET_ID, 'true');

		}

	} else if (splitedValue == "samplemethodstagereadings2") {
		let patternToMatch = /[a-z,A-Z_][0-9_]*/g;
		let result = id.match(patternToMatch);
		if (result != null) {
			$('table tr td').removeClass('tblActive');
			$('#' + id).addClass('tblActive');
			setInputValue(GENERAL_HIDDEN_LAST_TD_ID, id);
			setInputValue(GENERAL_HIDDEN_MANUALY_SET_ID, 'true');

		}
	} else if (splitedValue == "instrumentcalibrationsets" || splitedValue == "InstrumentCalibrationSetDetails") {
		let patternToMatch = /td_Observed_[0-9_]*/g;
		let result = id.match(patternToMatch);

		if (result != null) {
			$('table tr td').removeClass('tblActive');
			$('#' + id).addClass('tblActive');
			setInputValue(GENERAL_HIDDEN_LAST_TD_ID, id);
			setInputValue(GENERAL_HIDDEN_MANUALY_SET_ID, 'true');

		}
	}


};

// var disconnectWebSocket = function () {
// 	if(ws!=null){

// 		onWSClose();
// 	}

// };

// var disconnectWebSocketOnDestroy = function () {
// 	if (ws != null) {

// 		onWSClose();

// 	}
// };


var incrementTdValueForInstrumentCalibrationSet = function (cellValue, tdRowNum) {

	let path = window.location.pathname;
	let splittedValues = path.split('/');
	let splittedName = splittedValues[2].toLowerCase();
	switch (splittedName) {
		case "instrumentcalibrationsets":

			let next_id_to_search = 'td_Observed_0_1';

			let last_row = 0;
			let last_col = 1;
			let isFound = false;
			//get from hidden input 
			//let lastCell_reference_id_from_hidden_value = lastCell_reference_id_from_hidden.value;
			let idValue = getInputValue(GENERAL_HIDDEN_LAST_TD_ID);
			let isManuallySet = getInputValue(GENERAL_HIDDEN_MANUALY_SET_ID);
			let is_manually_set_value = isManuallySet == null ? 'false' : isManuallySet;
			next_id_to_search = idValue != null && idValue != '' ? idValue : next_id_to_search;

			let lastCell_reference_id_from_hidden_value = idValue;
			// &&  this.isManuallySetTd == false;
			if (lastCell_reference_id_from_hidden_value != ''
				&& lastCell_reference_id_from_hidden_value.includes('Observed')
				&& is_manually_set_value == 'false') {


				let splitted_value = lastCell_reference_id_from_hidden_value.split('_');
				last_row = parseInt(splitted_value[2]);
				last_col = parseInt(splitted_value[3]);

				//check if we have reached the last of row if so then increment col else check for if you have reacehd the last of col then increment row


				//loop and test and gfine
				//Hard code Ids
				var table_element = document.getElementById("InstrumentCalibrationSetDetails"); // as HTMLTableElement;

				if (table_element != null) {


					let totalRows = table_element.rows.length - 3;
					let totalColumns = table_element.rows[1].cells.length;

					let control_ref = null;
					//GO VERTICALLY DOWN 
					for (let row_num = last_row; row_num < totalRows; row_num++) {
						let control_id = 'td_Observed_' + row_num.toString() + '_' + last_col.toString();
						control_ref = document.getElementById(control_id);

						//IF NOT FOUND IN ROWS THEN WE MASRK no foun

						isFound = (control_ref != null);

						if (isFound) {

							let control_id = 'td_Observed_' + row_num.toString() + '_' + last_col.toString();
							//let input_control = document.getElementById('txtValue') ;
							control_ref.innerText = cellValue;
							detectChange(control_id, control_ref.innerText);

							$('table tr td').removeClass('tblActive');
							$(control_ref).addClass('tblActive');

							let currentRow = row_num + 1;
							let control_id1 = 'td_Observed_' + currentRow.toString() + '_' + last_col.toString();
							// lastCell_reference_id_from_hidden.value = control_id;
							setInputValue(GENERAL_HIDDEN_LAST_TD_ID, control_id1);

							break;
						}


					}

					let isfound_in_Column = false;
					if (!isFound) {
						//setting it backto first row as there are other columns
						//check if we have not reached the end of columns/cells

						last_row = 0;
						let control_id = '';
						//we traversed the ROW now we traverse the col till its end of colmn to check if control ref is there
						for (let col_num = last_col + 1; col_num < totalColumns; col_num++) {
							control_id = 'td_Observed_' + last_row.toString() + '_' + col_num.toString();
							control_ref = document.getElementById(control_id);

							isfound_in_Column = (control_ref != null);

							if (isfound_in_Column) {
								control_id = 'td_Observed_' + last_row.toString() + '_' + col_num.toString();
								//let input_control = document.getElementById('txtValue');
								control_ref.innerText = cellValue;
								detectChange(control_id, control_ref.innerText);

								$('table tr td').removeClass('tblActive');
								$(control_ref).addClass('tblActive');
								// lastCell_reference_id_from_hidden.value = control_id;
								let currentRow = last_row + 1;
								let control_id1 = 'td_Observed_' + currentRow.toString() + '_' + col_num.toString();
								setInputValue(GENERAL_HIDDEN_LAST_TD_ID, control_id1);
								break;
							}
						}

						if (isfound_in_Column) {
							console.log(control_id);
						}
					}
				}
			}
			break;
		case "balancerecords":
			let next_balanceId_to_search = 'WeightValue_0';
			let idValueForBalance = getInputValue(GENERAL_HIDDEN_LAST_TD_ID);
			let isManuallySetBalance = getInputValue(GENERAL_HIDDEN_MANUALY_SET_ID);
			let is_manually_balance_set_value = isManuallySetBalance == null ? 'false' : isManuallySetBalance;
			next_balanceId_to_search = idValueForBalance != null && idValueForBalance != '' ? idValueForBalance : next_balanceId_to_search;

			let lastCell_reference_balance_id_from_hidden_value = idValueForBalance;
			if (lastCell_reference_balance_id_from_hidden_value != ''
				&& lastCell_reference_balance_id_from_hidden_value.includes('WeightValue')
				&& is_manually_balance_set_value == 'false') {


				let splitted_value1 = lastCell_reference_balance_id_from_hidden_value.split('_');
				let last_row1 = parseInt(splitted_value1[1]);
				let balanceId_to_search = last_row1.toString();
				let control_ref = document.getElementById("WeightValue_" + balanceId_to_search);
				control_ref.innerText = cellValue;

				$('table tr td').removeClass('tblActive');
				$(control_ref).addClass('tblActive');
				let balanceIdToSearch = (last_row1 + 1).toString();
				setInputValue(GENERAL_HIDDEN_MANUALY_SET_ID, 'false');
				setInputValue(GENERAL_HIDDEN_LAST_TD_ID, "WeightValue_" + balanceIdToSearch);

			}
			break;
		case "samplemethodstagereadings2":

			let idValueForBalance1 = getInputValue(GENERAL_HIDDEN_LAST_TD_ID);
			let isManuallySetBalance1 = getInputValue(GENERAL_HIDDEN_MANUALY_SET_ID);

			//Check the hidden value, if it null only then perform the below else evaluate/calculate the next row number and set it to hidden variable

			//'WeightValue_0' --> 0 is the row number , 0 is column number
			//loop thru the TH and find is_input = true & is_text=false col number , get all the col numbers that match it.
			//you will get array of col numbers, get the first item matching the above conditions within the array
			//that item will have to be set to the hidden variable for next reference.
			//loop thru the arrya of col numebrs and perform the below for that row 
			//Increment the row number from previous 
			console.log('incrementTdValueForInstrumentCalibrationSet (start time): ' + getCurrentDateTime());

			let selectedColumns = [];
			let selectedColumnNames = [];
			let selectedId = [];

			$("#SampleMethodStageReadings2 tr th").each(function (index) {
				let th = $(this)[0];
				if (th.getAttribute("IsInput") == "true" && th.getAttribute("IsText") == "false") {
					selectedColumns.push(index);
					selectedColumnNames.push(th.innerHTML);
				}
			});
			var sampleMethodStageRed2HeaderName = [];
			$("#SampleMethodStageReadings2 tr:gt(" + tdRowNum + ")").each(function (index1) {
				let currentTr = $(this)[0];
				for (let i = 0; i < selectedColumns.length; i++) {
					let contextualTd = $(currentTr).find('td:eq(' + selectedColumns[i] + ')');
					selectedId.push(contextualTd[0].id);
					sampleMethodStageRed2HeaderName.push(contextualTd[0].innerText)
				}
			});
			let next_balanceId_to_search1 = selectedId[0]; //this has to be set after the evaluation loop

			for (let y = 0; y < selectedColumnNames.length; y++) {
				// let splittedValues = selectedId[0].split('_');
				let splittedName = selectedColumnNames[y];
				splittedName = splittedName.includes(' ') ? splittedName.replace(' ', '_') : splittedName;


				let is_manually_balance_set_value1 = isManuallySetBalance1 == null ? 'false' : isManuallySetBalance1;
				next_balanceId_to_search1 = idValueForBalance1 != null && idValueForBalance1 != '' ? idValueForBalance1 : next_balanceId_to_search1;

				let lastCell_reference_balance_id_from_hidden_value1 = idValueForBalance1;
				if (lastCell_reference_balance_id_from_hidden_value1 != ''
					&& lastCell_reference_balance_id_from_hidden_value1.includes(splittedName)
					&& is_manually_balance_set_value1 == 'false') {


					let splitted_value11 = lastCell_reference_balance_id_from_hidden_value1.split('_');
					let last_row11 = parseInt(splitted_value11[splitted_value11.length - 2]);
					let last_row12 = parseInt(splitted_value11[splitted_value11.length - 1]);
					let balanceId_to_search1 = last_row11.toString();
					let control_ref1 = document.getElementById(splittedName + "_" + balanceId_to_search1 + "_" + last_row12);
					control_ref1.innerText = cellValue;

					//$('table tr td').removeClass('tblActive');
					$(control_ref1).addClass('tblActive');
					let balanceIdToSearch1 = (last_row11 + 1).toString();
					setInputValue(GENERAL_HIDDEN_MANUALY_SET_ID, 'false');
					setInputValue(GENERAL_HIDDEN_LAST_TD_ID, splittedName + "_" + balanceIdToSearch1 + "_" + last_row12);


				}
			}

			console.log('incrementTdValueForInstrumentCalibrationSet (end time): ' + getCurrentDateTime());
			break;
	}
};

var detectChange = function (tdControlId, currentControlValue) {

	let splitedValue = tdControlId.split('_');

	let currentRow = splitedValue[2];

	let currentColForAcceptanceCriteria = parseInt(splitedValue[3]) + 1;

	let control_id = 'td_Acceptance_' + currentRow.toString() + '_' + currentColForAcceptanceCriteria.toString();
	let control_ref = document.getElementById(control_id)
	let currentValue = control_ref.innerText;
	let splitedIdValue = currentValue.split("-");
	let currentIdValue1 = parseFloat(splitedIdValue[0]);
	let currentIdValue2 = parseFloat(splitedIdValue[1]);

	let currentColForConclusion = parseInt(splitedValue[3]) + 2;
	let Conclusion_control_id = 'td_Conclusion_' + currentRow.toString() + '_' + currentColForConclusion.toString();
	let conclusionCol = document.getElementById(Conclusion_control_id);
	let validCurrentValue = parseFloat(currentControlValue.toString().match(/[\d.\d]+/).toString())


	if (validCurrentValue >= currentIdValue1 && validCurrentValue <= currentIdValue2) {
		conclusionCol.innerText = "Pass";
		$('#' + Conclusion_control_id).addClass("conclusionSuc");
		$('#' + Conclusion_control_id).removeClass("conclusionFail");
	} else {
		conclusionCol.innerText = "Fail";
		$('#' + Conclusion_control_id).addClass("conclusionFail");
		$('#' + Conclusion_control_id).removeClass("conclusionSuc");
	}

	//Calculate Avg Value
	calculateAverage(tdControlId);
	// CalculateRSD
	calculateRSD(tdControlId);

};

//Calculate Average value
var calculateAverage = function (tdControlId) {

	let splitedValue = tdControlId.split('_');
	let currentRow = splitedValue[2];
	let currentCol = splitedValue[3];

	var patternToCheckNReplace = "td_Observed_{row}_" + currentCol;
	var table_element = document.getElementById("InstrumentCalibrationSetDetails");
	if (table_element != null) {
		let totalRow = table_element.rows.length - 3;
		let totalValue = 0;
		for (let row_num = 0; row_num < totalRow; row_num++) {
			let currentTd_id_observed = patternToCheckNReplace.replace('{row}', row_num.toString());
			let control_ref = document.getElementById(currentTd_id_observed);

			let currentControlValue = control_ref.innerText;
			let validCurrentValue = currentControlValue.match(/[\d\.]+/);
			if (validCurrentValue != null) {
				let ObservedWeightValue = parseFloat(validCurrentValue[0]);
				totalValue = totalValue + ObservedWeightValue;
			}
		}
		//calculate Avg
		let currentColumnInInteger = parseInt(currentCol);
		let columnNumForAvg = currentColumnInInteger; // + (currentColumnInInteger== 1 ? 0: 2);
		let averageId = "td_Avg_" + columnNumForAvg.toString();
		let averageCol = document.getElementById(averageId);
		let averageValue = totalValue / totalRow;
		averageCol.innerText = averageValue.toString();

		let currentColForAcceptanceCriteria = parseInt(currentCol) + 1;
		let control_id = 'td_Acceptance_' + currentRow.toString() + '_' + currentColForAcceptanceCriteria.toString();
		let control_ref = document.getElementById(control_id)
		let currentValue = control_ref.innerText;
		let splitedIdValue = currentValue.split("-");
		let currentIdValue1 = parseFloat(splitedIdValue[0]);
		let currentIdValue2 = parseFloat(splitedIdValue[1]);


		let currentConclusionColumnInInteger = parseInt(currentCol) + 2;
		let Conclusion_control_id = "td_Avg_" + currentConclusionColumnInInteger.toString();
		let conclusionCol = document.getElementById(Conclusion_control_id);

		if (averageValue >= currentIdValue1 && averageValue <= currentIdValue2) {
			conclusionCol.innerText = "Pass";

			$('#' + Conclusion_control_id).addClass("conclusionSuc");
			$('#' + Conclusion_control_id).removeClass("conclusionFail");
		} else {
			conclusionCol.innerText = "Fail";

			$('#' + Conclusion_control_id).addClass("conclusionFail");
			$('#' + Conclusion_control_id).removeClass("conclusionSuc");
		}
	};

};

// CalculateRSD
var calculateRSD = function (tdControlId) {

	let splitedValue = tdControlId.split('_');
	let currentRow = splitedValue[2];
	let currentCol = splitedValue[3];

	var patternToCheckNReplace = "td_Observed_{row}_" + currentCol;

	var table_element = document.getElementById("InstrumentCalibrationSetDetails");
	if (table_element != null) {
		let totalRow = table_element.rows.length - 3;
		let totalValue = 0;
		for (let row_num = 0; row_num < totalRow; row_num++) {
			let currentTd_id_observed = patternToCheckNReplace.replace('{row}', row_num.toString());
			let control_ref = document.getElementById(currentTd_id_observed);

			let currentControlValue = control_ref.innerText;
			let validCurrentValue = currentControlValue.match(/[\d\.]+/);
			if (validCurrentValue != null) {
				let ObservedWeightValue = parseFloat(validCurrentValue[0]);
				totalValue = totalValue + ObservedWeightValue;
			}
		}
		let currentColumnInInteger = parseInt(currentCol);
		let columnNumForAvg = currentColumnInInteger; // + (currentColumnInInteger== 1 ? 0: 2);
		let rsdId = "td_Rsd_" + columnNumForAvg.toString();
		let rsdCol = document.getElementById(rsdId);
		let rsdValue = (totalValue * 100) / 1;
		rsdCol.innerText = rsdValue.toString();

		let currentColForAcceptanceCriteria = parseInt(currentCol) + 1;
		let control_id = 'td_Acceptance_' + currentRow.toString() + '_' + currentColForAcceptanceCriteria.toString();
		let control_ref = document.getElementById(control_id)
		let currentValue = control_ref.innerText;
		let splitedIdValue = currentValue.split("-");
		let currentIdValue1 = parseFloat(splitedIdValue[0]);
		let currentIdValue2 = parseFloat(splitedIdValue[1]);


		let currentConclusionColumnInInteger = parseInt(currentCol) + 2;
		let Conclusion_control_id = "td_Rsd_" + currentConclusionColumnInInteger.toString();
		let conclusionCol = document.getElementById(Conclusion_control_id);

		if (rsdValue >= currentIdValue1 && rsdValue <= currentIdValue2) {
			conclusionCol.innerText = "Pass";

			$('#' + Conclusion_control_id).addClass("conclusionSuc");
			$('#' + Conclusion_control_id).removeClass("conclusionFail");
		} else {
			conclusionCol.innerText = "Fail";

			$('#' + Conclusion_control_id).addClass("conclusionFail");
			$('#' + Conclusion_control_id).removeClass("conclusionSuc");
		}
	};
};


var onWSOpen = function () {
	// Web Socket is connected, send data using send()
	ws.send("Message to send");
	var btn = document.getElementById("btnConnect");
	btn.innerHTML = "Disconnect";
	btn.style.backgroundColor = "red";

};

var onWSMessage = function (evt) {

	var received_msg = evt.data;
	// This fires after the blob has been read/loaded.
	const reader = new FileReader();
	reader.addEventListener('loadend', (e) => {

		const text = e.srcElement.result;

		let idValue = this.getInputValue(AppConstants.GENERAL.HIDDEN_LAST_TD_ID);
		let isManuallySet = this.getInputValue(AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID);
		$('#' + idValue).html(text);

		console.log(text);
		//populateInstrumentValue(text);
	});

	console.log(received_msg);
	reader.readAsText(received_msg);

};

var onWSClose = function () {

	//Do all the closing and clearingcode 


	if (ws != null) {
		// 	ws.close();
		alert("Socket Connection is closed");
		var btn = document.getElementById("btnConnect");
		btn.style.backgroundColor = "#337ab7";
		btn.className = "btn btn-primary populatetblbtn";
		btn.innerHTML = "Connect";
	}

};

var disconnectWebSocketOnDestroy = async function () {
	if (ws != null) {
		ws.send("CLOSE_CONNECTION");
		ws.close();
		ws = null;
	}
	var btn = document.getElementById("btnConnect");
	if (btn != null && btn.innerText == 'Disconnect')
		await serialScaleController.deinit(btn);

	//Try to close the connection
};

var disconnectWebSocket = function () {
	if (ws != null) {
		ws.send("CLOSE_CONNECTION");
		ws.close();
		ws = null;
	}
};

var sendtoSocket = function (dataInput) {
	let endpoint = dataInput.replace('https', "wss");
	let url = endpoint;
	WebSocketInitialize(url);
	//let url = 'wss://localhost:44322/ws';
	//let url = 'wss://localhost:44366/v1/ws';
	//url += "?DeviceId=ATIoTDev101&DeviceKey=yb703MVLJDQdCiZ/R3/5QcZCqcTUMf9cuUmAIgw3j3k=";
	//ws.send("Message to send 12344");
};

function onWSError() {
	if (ws != null) {
		alert("Socket Error : Seems other connection is Online,please connect after some time or choose other instrument");
	}
}

function WebSocketInitialize(url) {

	if ((ws == undefined || ws == null) || ("WebSocket" in window)) {
		ws = new WebSocket(url);
		ws.onopen = onWSOpen;
		ws.close = onWSClose;
		ws.onerror = onWSError;
		ws.onmessage = function (evt) {

			var received_msg = evt.data;
			updateCellValue(received_msg);
			//const text = e.srcElement.result;
			//console.log('data :' + text);


			//  else{
			// 	$('#' + idValue).html(received_msg);

			// 	setInputValue(GENERAL_HIDDEN_MANUALY_SET_ID, 'false');

			// 	let splittedName = idValue.split('_');
			// 	let currentRowNum = splittedName[splittedName.length - 2];
			// 	calculateFormulae(currentRowNum);
			// 	incrementTdValueForInstrumentCalibrationSet(received_msg);
			// 	putSampleMethodStageReading2(currentRowNum);
			// }
		}
	}
	else {
		// The browser doesn't support WebSocket
		alert("WebSocket NOT supported by your Browser!");
	}
};
var updateCellValue = function (received_msg) {
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
}

var calculateFormulae = function (rowNumber) {
	//formulaeColumns = [];
	console.log()
	allColumnNum = [];
	allColumnName = [];

	console.log('calculateFormulae (start time): ' + getCurrentDateTime());

	$("#SampleMethodStageReadings2 tr th").each(function (index) {
		let th = $(this)[0];
		if (th.getAttribute("Formulae") != "     " && th.getAttribute("Formulae") != "" && th.getAttribute("Formulae") != null) {

			let currentformula = th.getAttribute("Formulae");
			//check pattern for formulae if pattern match get columnNum
			// using split method and push this data one array
			let patternToMatch = /Col_[0-9]*/g;
			let result = currentformula.match(patternToMatch);
			if (result != null) {
				for (let i = 0; i < result.length; i++) {
					let splitedValue = result[i].split("_");
					allColumnNum.push(splitedValue[splitedValue.length - 1]);
					allColumnName.push(result[i]);
				}

				for (let j = 0; j < allColumnNum.length; j++) {
					//get cell value 
					let currentRowNum = parseInt(rowNumber) + 1; // add one because It start form header
					let selectRow = $("#SampleMethodStageReadings2").find('tr:eq(' + currentRowNum + ')').children();
					let currentCellValue = selectRow[(parseInt(allColumnNum[j]) - 1)].innerText;
					currentCellValue = (currentCellValue == "") ? (selectRow[(parseInt(allColumnNum[j]) - 1)].children[0] != undefined ? selectRow[(parseInt(allColumnNum[j]) - 1)].children[0].value : "") : currentCellValue;
					currentCellValue = (currentCellValue == "") ? 0 : currentCellValue;
					let UpdateValue = currentCellValue;
					// UpdateValue = UpdateValue.toString().match(/[\d.\d]+/).toString();
					currentformula = (currentformula.replace(allColumnName[j], UpdateValue));
				}

				let currentformulaColumn = index;
				let currentRowNum = parseInt(rowNumber) + 1;
				let selectRow = $("#SampleMethodStageReadings2").find('tr:eq(' + currentRowNum + ')').children();
				let setValue = eval(currentformula);
				selectRow[(currentformulaColumn)].innerText = setValue.toFixed(4);
				allColumnNum = [];
				allColumnName = [];
			}

		}
	});

	console.log('calculateFormulae (end time): ' + getCurrentDateTime());
}

let isfunctionAssignedForAutoDeleteOfLocationStorage = false;

var getMethodStageReading2Data = function () {
	// Store the data with time
	let sampleElement = document.getElementById("hidden_sampleId");
	let methodElement = document.getElementById("hidden_methodId");
	let stageElement = document.getElementById("hidden_stageId");
	let currentPage = sessionStorage.getItem("currentPage");
	let sampleId = sampleElement.value;
	let methodId = methodElement.value;
	let stageId = stageElement.value;
	if (sampleId && methodId && stageId && currentPage) {
		const timestamp = new Date().getTime(); // current time
		const EXPIRE_TIME = timestamp + (60 * 60 * 24 * 1000 * 1);
		const now = new Date();
		let currentKey = 'storeData_' + sampleId + '_' + methodId + '_' + stageId + '_' + currentPage;
		localStorage.setItem('sampleMethodStageReading2', JSON.stringify({
			time: now.getTime() + EXPIRE_TIME,
			keyId: currentKey,
			data: $("#SampleMethodStageReadings2").html()
		}));

		// start the time out

		if (!isfunctionAssignedForAutoDeleteOfLocationStorage) {
			let StorageData = JSON.parse(localStorage.getItem('sampleMethodStageReading2'));
			if (StorageData != null) {
				if (now.getTime() > StorageData.time) {

					localStorage.removeItem('sampleMethodStageReading2');
				}
			}
			//	}, EXPIRE_TIME);
			isfunctionAssignedForAutoDeleteOfLocationStorage = true;
		}

	}
}

var getCurrentDateTime = function () {
	var currentdate = new Date();
	var datetime = "Last date: " + currentdate.getDate() + "/"
		+ (currentdate.getMonth() + 1) + "/"
		+ currentdate.getFullYear() + " @ "
		+ currentdate.getHours() + ":"
		+ currentdate.getMinutes() + ":"
		+ currentdate.getSeconds();

	return datetime;
}

var getToken = function (tokenType = 'access_token') {
	let token = '';
	//  let waitCounter=0;
	let userManagerSettings = sessionStorage.getItem('oidc_settings') != null ? JSON.parse(sessionStorage.getItem('oidc_settings')) : null;

	let user_specific_info = (userManagerSettings != null) ? (userManagerSettings.authority + ':' + userManagerSettings.client_id) : '';
	let oidc_token = sessionStorage.getItem('oidc.user:' + user_specific_info);
	if (oidc_token != null) {
		let oidc_token_object = JSON.parse(oidc_token);
		token = oidc_token_object[tokenType];
	}
	return 'Bearer ' + token;
};

var putSampleMethodStageReading2 = function (rowNumber, updatesplitedValue) {

	let selectedColumns = [];
	console.log('putSampleMethodStageReading2 (start time): ' + getCurrentDateTime());

	let elem = document.getElementById("chkPagesave");
	if (elem != null && (!elem.checked)) {
		$("#SampleMethodStageReadings2 tr th").each(function (index) {
			let th = $(this)[0];
			if (((th.getAttribute("Formulae") != "     " && th.getAttribute("Formulae") != "" && th.getAttribute("Formulae") != null) || th.getAttribute("IsInput") == "true" || th.getAttribute("IsText") == "true") || (th.getAttribute("IsText") != "true" && th.getAttribute("IsInput") != "true" && th.getAttribute("IsRunningNumber") != "true" && th.getAttribute("IsRepeat") != "true" && th.getAttribute("IsScan") != "true")) {
				selectedColumns.push(index);
			}
		});

		for (let j = 0; j < selectedColumns.length; j++) {
			let currentRow = [];
			let child_obj = {};
			let currentRowNum = parseInt(updatesplitedValue) + 1; // add one because It start form header
			let selectRow = $("#SampleMethodStageReadings2").find('tr:eq(' + currentRowNum + ')').children();

			let currentCellValue = selectRow[(selectedColumns[j])].innerText;
			currentCellValue = (currentCellValue == "") ? ((selectRow[(selectedColumns[j])].children[0] == undefined) ? "" : selectRow[(selectedColumns[j])].children[0].value) : currentCellValue;
			let UpdateValue = currentCellValue;

			let tableId = selectRow[(selectedColumns[j])].getAttribute('TableId');
			tableId = (tableId == null) ? 0 : tableId;
			tableId = (tableId == 0) ? ((selectRow[(selectedColumns[j])].children[0] == undefined) ? 0 : selectRow[(selectedColumns[j])].children[0].getAttribute('TableId')) : tableId;
			tableId = (tableId == null) ? 0 : tableId;
			let sampleMethodStageId = selectRow[(selectedColumns[j])].getAttribute('sampleMethodStageId');
			sampleMethodStageId = (sampleMethodStageId == null) ? 0 : sampleMethodStageId;
			sampleMethodStageId = (sampleMethodStageId == 0) ? ((selectRow[(selectedColumns[j])].children[0] == undefined) ? 0 : selectRow[(selectedColumns[j])].children[0].getAttribute('sampleMethodStageId')) : sampleMethodStageId;

			child_obj["Id"] = (tableId != 0) ? parseInt(tableId) : 0;
			child_obj["EntityState"] = (tableId != 0) ? 2 : 1;
			child_obj["SampleMethodStageId"] = parseInt(sampleMethodStageId);
			child_obj["Row"] = rowNumber;
			child_obj["Column"] = selectedColumns[j];
			child_obj["SampleMethodStageColumnValue"] = UpdateValue;
			if (UpdateValue != null || UpdateValue != "") {
				currentRow.push(child_obj);
			}
			let requestModel = {
				DataCollection: currentRow
			};

			let token = getToken();
			//let iotPlusBaseUrl = "https://iotplus.antronsys.com";
			let iotPlusBaseUrl = sessionStorage.getItem('baseUrl');
			var requestUrl = iotPlusBaseUrl + '/v1/SampleMethodStageReadings2/UpdateBySampleMethodStageReading/' + tableId;
			var temp = $.ajax({
				type: "PUT",
				url: requestUrl,
				headers: { 'Content-Type': 'application/json', 'Authorization': token },
				data: JSON.stringify(requestModel),
				async: false,
				success: function (data) {
					//TODO SHOW A DIV
					showMessage(true, "Data has been submitted");
				},
				error: function (error) {
					console.log(JSON.stringify(error));
					//TODO: Show the Error
					showMessage(false, JSON.stringify(error));
				}
			});

		}

		console.log('putSampleMethodStageReading2 (end time): ' + getCurrentDateTime());
	} else if (elem != null && (elem.checked)) {
		getMethodStageReading2Data();
	}
}




var socketid = "";
var socket;
var flag = 0;
function connectSocket(dataInput) {


	if (socket == null) {
		let headers = new Headers();
		headers.append('Access-Control-Allow-Origin', 'http://api-gateway.dev.atpltd.net');

		socket = io("https://api-gateway.dev.atpltd.net");

		socket.on('connect', function () {
			console.log(socket.id);
			socketid = socket.id;
			var url = dataInput + "/" + socketid;
			connectConnection(url);
		});

		socket.on('message', function (data) {

			str = JSON.parse(JSON.parse(data));
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

		});
	};

}

function connectConnection(url) {

	let request = new XMLHttpRequest(); request.open("GET", url);
	request.onload = function () {
		var response = request.responseText;
		alert(response);
		var btn = document.getElementById("btnConnect");
		btn.value = "Disconnect";
		btn.style.backgroundColor = "red";
	}
	request.send();



}

function disconnectConnection(dataInput, value) {
	flag = value;
	if (socket != null) {
		var url = dataInput + "/" + socketid;

		let request = new XMLHttpRequest(); request.open("GET", url);
		request.onload = function () {
			var response = request.responseText;

			alert(response);
			var btn = document.getElementById("btnConnect");
			btn.style.backgroundColor = "#337ab7";
			btn.className = "btn btn-primary populatetblbtn";
			btn.value = "Connect";

		}
		request.send();

		//Setting the socket to null
		socket = null;
	}




}
