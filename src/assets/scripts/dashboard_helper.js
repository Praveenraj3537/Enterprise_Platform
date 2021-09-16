var dashboardDataCollection = [];

//const { delay } = require("underscore");
var processDualJsonData = function (dataInput) {
    let graphColumns = dataInput['DataLegendTexts'] != null ? JSON.parse(dataInput['DataLegendTexts']) : []; // ["Projects", "Revenue$"];
    let reportData_temp = [];
    reportData_temp = dataInput['ReportData'] != null ? dataInput['ReportData'] : [];
    var n = reportData_temp.length;
    //do null check and length check
    var keys = reportData_temp != null && reportData_temp.length > 0 ? Object.keys(reportData_temp[0]) : [];
    var arr = [];

    for (let i = 1; i < keys.length; i++) {
        if (!graphColumns.includes(keys[i])) {
            continue;
        }

        obj = {};
        arr[i - 1] = [];
        for (let j = 0; j < n; j++) {

            var obj = {};
            //obj[keys[0]] = humans[j][keys[0]];
            obj['label'] = reportData_temp[j][keys[0]];

            //obj[keys[i]] = humans[j][keys[i]];
            obj['y'] = reportData_temp[j][keys[i]];

            arr[i - 1].push(obj);
        }
    }
    return arr;
}

var loadDashboards = function (start, end) {

    var storedArray = sessionStorage.getItem("DASHBOARD_URLS") != null ?
        JSON.parse(sessionStorage.getItem("DASHBOARD_URLS")) : null;
    if (storedArray == null) {
        return;
    }
    //var dashboardDataCollection = [];
    let token = getToken();
    dashboardDataCollection = [];
    storedArray.forEach(url => {

        var requestUrl = url + '/v1/Dashboard/' + start + '/' + end;
        var temp = $.ajax({
            type: "GET",
            url: requestUrl,
            headers: { 'Authorization': token },
            async: false,
            success: function (data) {
                $(data.DataCollection).each(function (index) {
                    dashboardDataCollection.push(data.DataCollection[index]);
                    //

                });
            },
            error: function (error) {
                console.log(JSON.stringify(error));
            }
        });

    });
    dashboardDataCollection.push(
       
    );

    //Add dummy data in dashboardDataCollection
    //clearing the div Container
    $('#divContainer').html('');
    //Building the Divs
    $(dashboardDataCollection).each(function (index) {
        //    if (dashboardDataCollection[index].ReportData != null && dashboardDataCollection[index].ReportData != '') {
        let divId = 'divBox-' + index;
        let existingDiv = $('#' + divId);
        if (existingDiv == null || (existingDiv != null && existingDiv.length == 0)) {

            let typeofChart = dashboardDataCollection[index]['ReportType'];
            let splittedValues = typeofChart.toString().split(0);


            let divData =
                '<div class="divSideBySide" id="' + divId + '">' +
                '<div class="pillsPosition">' +
                '<p class="titlePClass">' + dashboardDataCollection[index]['ReportTitle'] + '</p>' +
                '<div class="navigationHolder">' +
                '{placeholder}' +
                '</div>' +
                '</div>' +
                '<div class="actualContent" id="content_div_' + divId + '"></div>' +
                '</div>';

            let temp_hyperlink = '';

            splittedValues.forEach(item => {
                temp_hyperlink += '<a class="anchorposition" title="' + populateTitle(item) + '" ' +
                    'onclick="switchableDivDataGenerator(\'' + divId + '\',' + index + ',' + item + ');">' +
                    '<i class="' + populateIcon(item) + '" aria-hidden="true">' +
                    '</i>' +
                    '</a>'
            });

            // splittedValues.forEach(item => {
            //     temp_hyperlink += '<a class="anchorposition" title="' + ((item == 1) ? 'Table' : 'Chart') + '" ' +
            //         'onclick="switchableDivDataGenerator(\'' + divId + '\',' + index + ',' + item + ');">' +
            //         '<i class="' + ((item == 1) ? 'fa fa-table' : 'fa fa-line-chart') + '" aria-hidden="true">' +
            //         '</i>' +
            //         '</a>'
            // });
            divData = divData.replace('{placeholder}', temp_hyperlink);
            $('#divContainer').append(divData)
        }
        // }
        index++;
    });

    function populateTitle(typeofChart) {
        let getTitle = '';
        switch (typeofChart) {
            case "1": //"Table"
                getTitle = 'Table';
                break;
            case "2": //"card"
                getTitle = 'Boxes';
                break;
            case "3": //"Bar"
                getTitle = 'BarChart';
                break;
            case "4": //"plotDoubleBar"
                getTitle = 'DoubleBarChart';
                break;
            case "5":  //Pie
                getTitle = 'fa fa-pie-chart';
                break;
            case "6":  //dualDiv
                getTitle = 'RowChart';
                break;
        }
        return getTitle;
    }

    function populateIcon(typeofChart) {
        let getClass = '';
        switch (typeofChart) {
            case "1": //"Table"
                getClass = 'fa fa-table';
                break;
            case "2": //"card"
                getClass = 'fa fa-trello';
                break;
            case "3": //"Bar"
                getClass = 'fa fa-bar-chart';
                break;
            case "4": //"plotDoubleBar"
                getClass = 'fa fa-bar-chart';
                break;
            case "5":  //Pie
                getClass = 'fa fa-pie-chart';
                break;
            case "6":  //dualDiv
                getClass = 'fa fa-columns rotateIcon';
                break;
        }
        return getClass;
    }
    //Populate the chart data
    let allDivBoxes = $('.divSideBySide');

    $(allDivBoxes).each(function (index) {
        var currentBox = $(this)[0];
        // processBoxes($(currentBox), dashboardDataCollection[index]);
        //  switchableDivDataGenerator($(currentBox).id,index,null);
        let divid = 'divBox-' + index
        switchableDivDataGenerator(divid, index, null);

    });
};
function sleep(miliseconds) {
    var currentTime = new Date().getTime();
    while (currentTime + miliseconds >= new Date().getTime()) {
    }
}
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

//------------------Fetch Dashboard Data-------------------------------------------------
var loadDashboard = function (url, data_temp = null) {
    if (data_temp != null) {

    }
    else {
        var temp = $.ajax({
            type: "GET",
            url: requestUrlForProjectPlusDashboard,
            async: false,
            success: function (data) {
                //Pushing all collection to 'dashboardData'
                var dashboadCollection_temp;
                $(data.DataCollection).each(function (index) {
                    dashboadCollection_temp.push(data.DataCollection[index]);
                });

                processCollectionForDashboard(dashboadCollection_temp);

            },
            error: function (error) {
                console.log(JSON.stringify(error));
            }

        }).responseText;
    }
};

var processCollectionForDashboard = function (collection) {

    //clearing the div Container
    $('#divContainer').html('');

    //Building the Divs
    $(collection).each(function (index) {
        let divId = 'divBox-' + index;
        let divData = '<div class="divSideBySide" id="' + divId + '"></div>';
        $('#divContainer').append(divData)

    });

    let allDivBoxes = $('.divSideBySide');
    $(allDivBoxes).each(function (index) {
        var currentBox = $(this)[0];
        let divid = 'divBox-' + index
        switchableDivDataGenerator(divid, index, null);
    });
};

var switchableDivDataGenerator = function (currentDivId, dataPositionIndex, typeNumber) {
    let data = this.dashboardDataCollection[dataPositionIndex];
    let currentDiv = document.getElementById(currentDivId); //  $(currentDivId);

    let typeofChart = dashboardDataCollection[dataPositionIndex]['ReportType'];
    let splittedValues = typeofChart.toString().split('0');

    //
    let contextualTypeNumber_in_string = typeNumber != null ? typeNumber : splittedValues[0];
    let contextualTypeNumber = parseInt(contextualTypeNumber_in_string);
    //let typeName = getNameFromNumberType(contextualTypeNumber);

    let data_temp_copy = JSON.parse(JSON.stringify(data));
    //
    switch (contextualTypeNumber) {
        case 1: //"Table"
        default:
            plotTable(currentDiv, data);
            // plotMultiLine(currentDiv, data_temp_copy);
            break;
        case 2: //"card"

            plotDiv(currentDiv, data_temp_copy);
            break;
        case 3: //"Bar"
            let data_processed2 = processDualJsonData(data_temp_copy);
            data_temp_copy['ReportData'] = (data_processed2 != null && data_processed2.length > 0) ? data_processed2[0] : null;
            plotBar(currentDiv, data_temp_copy);
            break;
        case 4: //"doughnut"
            let data_processed = processDualJsonData(data_temp_copy);

            data_temp_copy['ReportData'] = data_processed;
            plotDoubleBar(currentDiv, data_temp_copy);
            break;
        case 5:  //Pie

            plotPie(currentDiv, data_temp_copy);
            break;
        case 6:  //dualDiv

            plotDualDiv(currentDiv, data_temp_copy);
            break;
        // case 7:
        //     plotMultiLine(currentDiv, data_temp_copy);
        //     break;
    };

}

var plotTable = function (currentDiv, data) {
    // let tableDiv = $('<div class="tableDivStyle"></div>');
    //Adding the class requried for 
    let table = $('<table class="tableStyle"></table>');
    let thead = $('<thead></thead>');
    let body = $('<tbody></tbody>');
    let contextualDiv = $(currentDiv).find('.actualContent');

    // $(contextualDiv).removeClass('tableDivStyle');
    $(contextualDiv).addClass('tableDivStyle');

    $(contextualDiv).html('');

    //Setting the header 

    //Now loop thru the collection and plot TH/TR (TH to be plotted when the index is 0)
    if (data.ReportData == null) {
        let caption = $('<caption>No Data</caption>');
        $(table).append(caption);
    } else {
        $(data.ReportData).each(function (index) {
            //This TR is to be used for ever loop for plotting every row 
            let tr_temp = $('<tr></tr>');

            for (var key in data.ReportData[index]) {
                //Plotting the Header 
                if (index == 0) {
                    let th_temp = $('<th>' + key + '</th>');
                    $(thead).append(th_temp);
                };
                //Plotting the Body
                let content_of_td = data.ReportData[index][key] != null ? data.ReportData[index][key] : '';

                let class_name = '';
                //isnumeric
                if (!isNaN(content_of_td)) {
                    class_name += 'numericTdContent';
                    if (content_of_td == '0') {
                        class_name += (' numericTdContentWithZero');
                    }
                }

                let td_temp = $('<td class="' + class_name + '" >' + content_of_td + '</td>');
                $(tr_temp).append(td_temp);
            };
            $(body).append(tr_temp);
        });
    }
    $(table).append(thead);
    $(table).append(body);

    $(contextualDiv).append(table);
};

plotDualDiv = function (currentDiv, data) {

    let contextualDiv = $(currentDiv).find('.actualContent');
    $(contextualDiv).removeClass('tableDivStyle');
    $(contextualDiv).html('');

    if (data['ReportData'] == null) {
        let caption = $('<div class="nodata">No Data</div>');
        $(contextualDiv).append(caption);
        return;
    }
    let dualTitles = data['Titles'].split(':');
    let div1 = $('<div class="dualDiv"></div>');
    let table1 = $('<table class="dualTableStyle"></table>');
    let thead1 = $('<thead></thead>');
    let body1 = $('<tbody></tbody>');
    //Setting the header 
    //Now loop thru the collection and plot TH/TR (TH to be plotted when the index is 0)
    let getLength = parseInt(dualTitles[0]) != null ? parseInt(dualTitles[0]) : data['ReportData'][0].length;

    for (let j = 0; j < getLength; j++) {
        let tr_temp1 = $('<tr></tr>');
        for (var key in data.ReportData[0][j]) {
            //Plotting the Header 
            if (j == 0) {
                let th_temp1 = $('<th class="dualTh">' + key + '</th>');
                $(thead1).append(th_temp1);
            }
            //Plotting the Body
            let content_of_td = data.ReportData[0][j][key] != null ? data.ReportData[0][j][key] : '';

            let class_name = '';
            //isnumeric
            if (!isNaN(content_of_td)) {
                class_name += 'numericTdContent';
                if (content_of_td == '0') {
                    class_name += (' numericTdContentWithZero');
                }
            }

            let td_temp1 = $('<td  class="dualTd  ' + class_name + '">' + content_of_td + '</td>');
            $(tr_temp1).append(td_temp1);
        };
        $(body1).append(tr_temp1);
    }
    $(table1).append(thead1);
    $(table1).append(body1);
    $(div1).append(table1);


    //************* FIRST ITEM  */
    $(contextualDiv).append(div1);
    let div2 = $('<div class="dualDiv"></div>');
    let table2 = $('<table class="dualTableStyle"></table>');
    let thead2 = $('<thead></thead>');
    let body2 = $('<tbody></tbody>');

    //let getLength = dualTitles[1] == "n" ? parseInt(dualTitles[0]) : data['ReportData'][0].length;
    for (let i = 0; i < data['ReportData'][1].length; i++) {
        //This TR is to be used for ever loop for plotting every row 
        let tr_temp2 = $('<tr></tr>');
        for (var key in data.ReportData[1][i]) {
            //Plotting the Header 
            if (i == 0) {
                let th_temp2 = $('<th class="dualTh">' + key + '</th>');
                $(thead2).append(th_temp2);
            }
            //Plotting the Body
            let content_of_td = data.ReportData[1][i][key] != null ? data.ReportData[1][i][key] : '';;
            let class_name = '';
            //isnumeric
            if (!isNaN(content_of_td)) {
                class_name += 'numericTdContent';
                if (content_of_td == '0') {
                    class_name += (' numericTdContentWithZero');
                }
            }

            let td_temp2 = $('<td class="dualTd ' + class_name + '">' + data.ReportData[1][i][key] + '</td>');
            $(tr_temp2).append(td_temp2);
        };
        $(body2).append(tr_temp2);
    }
    $(table2).append(thead2);
    $(table2).append(body2);
    $(div2).append(table2);

    //************ SECOND ITEM */
    $(contextualDiv).append(div2);


};
// Card Chart
var plotDiv = function (currentDiv, data) {
    let contextualDiv = $(currentDiv).find('.actualContent');
    $(contextualDiv).removeClass('tableDivStyle');
    $(contextualDiv).html('');

    if (data['ReportData'] == null) {

        let caption = $('<div class="nodata">No Data</div>');
        $(contextualDiv).append(caption);
    }
    else {

        let record = 0;
        let innerDiv = $("<div class ='container1'></div>");
        let rowData = $("<div class='card1'></div>");

        $(data.ReportData).each(function (index) {
            let temp = $('<div class="col-sm-3 colDiv"></div>');
            for (var key in data.ReportData[index]) {
                if (key == "count") {
                    record += data.ReportData[index][key];
                }
                let temp1 = $('<p class="paragraph">' + data.ReportData[index][key] + '</p>');
                $(temp).append(temp1);
            }
            $(rowData).append(temp);
        });
        let mainDiv = $("<div class='cardStyle'><p class='headerLine'>" + "<h2 style='padding-left: 5px;margin-top: 5px'>" + record + "</h2></p></div>");
        $(mainDiv).css("background-color", data.DataLegendTexts);
        $(innerDiv).append(rowData);
        $(mainDiv).append(innerDiv);
        //clear the contextualDiv
        $(contextualDiv).html('');
        $(contextualDiv).append(mainDiv);
    }

}

//Bar Chart
var plotBar = function (currentDiv, data) {
    let contextualDiv = $(currentDiv).find('.actualContent');
    $(contextualDiv).removeClass('tableDivStyle');
    $(contextualDiv).html('');

    if (data['ReportData'] == null) {

        let caption = $('<div class="nodata">No Data</div>');
        $(contextualDiv).append(caption);
    }
    else {

        // Form or build the data
        let chartData = {
            animationEnabled: true,
            theme: "light2",
            width: 395,
            height: 270,
            title: {
                // text: data != null ? data['ReportTitle'] : 'No Data',
                fontColor: "black",
                fontSize: 12,
                fontFamily: "tahoma",
            },
            axisY: {
                title: JSON.parse(data['Titles'].replace('\"[', '[').replace(']\"', ']'))[0]

            },
            data: [{
                type: "column",
                showInLegend: true,
                legendMarkerColor: "grey",
                dataPoints: [

                ]
            }]
        };
        for (let i = 0; i < data['ReportData'].length; i++) {
            chartData.data[0].dataPoints.push({
                y: data['ReportData'][i] != null ? data['ReportData'][i]['y'] : '',
                label: data['ReportData'][i] != null ? data['ReportData'][i]['label'] : '',
            });
        }

        var chart = new CanvasJS.Chart($(contextualDiv).attr('id'), chartData);
        chart.render();
    }
};

//Donut Chart
var plotDoubleBar = function (currentDiv, data) {
    let contextualDiv = $(currentDiv).find('.actualContent');
    $(contextualDiv).removeClass('tableDivStyle');
    $(contextualDiv).html('');
    if (data['ReportData'] == null) {

        let caption = $('<div class="nodata">No Data</div>');
        $(contextualDiv).append(caption);
    }
    else {
        let contextualDiv = $(currentDiv).find('.actualContent');
        let options = {
            animationEnabled: true,
            height: 270,
            title: {
                // text: data['ReportTitle'],
                fontColor: "black",
                fontSize: 15,
                fontFamily: "tahoma",
            },
            axisY: {
                title: JSON.parse(data['Titles'].replace('\"[', '[').replace(']\"', ']'))[0], // data['Titles'][0],
                titleFontColor: "#4F81BC",
                lineColor: "#4F81BC",
                labelFontColor: "#4F81BC",
                tickColor: "#4F81BC"
            },
            axisY2: {
                title: JSON.parse(data['Titles'].replace('\"[', '[').replace(']\"', ']'))[1], // data['Titles'][1],
                titleFontColor: "#C0504E",
                lineColor: "#C0504E",
                labelFontColor: "#C0504E",
                tickColor: "#C0504E"
            },
            toolTip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                itemclick: toggleDataSeries
            },
            data: [
                {
                    type: "column",
                    name: JSON.parse(data.DataNames.replace('\"[', '[').replace(']\"', ']'))[0], // data.dataNames[0],  //this is also an array
                    legendText: JSON.parse(data.DataLegendTexts.replace('\"[', '[').replace(']\"', ']'))[0], // data.dataLegendTexts[0],
                    showInLegend: true, //data_dataPoints[0] //this is also an array
                    dataPoints: [

                    ]
                },
                {
                    type: "column",
                    name: JSON.parse(data.DataNames.replace('\"[', '[').replace(']\"', ']'))[1],//this is also an array
                    legendText: JSON.parse(data.DataLegendTexts.replace('\"[', '[').replace(']\"', ']'))[1],
                    axisYType: "secondary",
                    showInLegend: true,
                    dataPoints: [

                    ]
                }]
        };
        //FIRST BAR    
        for (let j = 0; j < data['ReportData'][0].length; j++) {
            options.data[0].dataPoints.push({
                y: data['ReportData'][0][j] != null ? data['ReportData'][0][j]['y'] : '',
                label: data['ReportData'][0][j] != null ? data['ReportData'][0][j]['label'] : '',
            });
        }
        //SECOND BAR
        for (let j = 0; j < data['ReportData'][1].length; j++) {
            options.data[1].dataPoints.push({
                y: data['ReportData'][1][j] != null ? data['ReportData'][1][j]['y'] : '',
                label: data['ReportData'][1][j] != null ? data['ReportData'][1][j]['label'] : '',
            });
        }
        var chart = new CanvasJS.Chart($(contextualDiv).attr('id'), options);
        chart.render();
        function toggleDataSeries(e) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            }
            else {
                e.dataSeries.visible = true;
            }
            chart.render();
        }
    };
}
//Pie Chart
var plotPie = function (currentDiv, data) {
    let contextualDiv = $(currentDiv).find('.actualContent');
    $(contextualDiv).removeClass('tableDivStyle');
    $(contextualDiv).html('');
    if (data['ReportData'] == null) {

        let caption = $('<div class="nodata">No Data</div>');
        $(contextualDiv).append(caption);
    }
    else {

        var options = {
            title: {
                // text: data['ReportTitle'],
                fontColor: "black",
                fontSize: 15,
                fontFamily: "tahoma",
            },
            subtitles: [{
                text: data['ReportTitleY'] = data['ReportTitleY']
            }],
            animationEnabled: true,
            data: [{
                type: "pie",
                startAngle: 40,
                toolTipContent: "<b>{label}</b>: {y}%",
                showInLegend: "true",
                legendText: "{label}",
                indexLabelFontSize: 16,
                indexLabel: "{label} - {y}%",
                dataPoints: [
                ]
            }]
        };

        for (let i = 0; i < data['ReportData'].length; i++) {
            options.data[0].dataPoints.push({
                y: data['ReportData'][i] != null ? data['ReportData'][i]['y'] : '',
                label: data['ReportData'][i] != null ? data['ReportData'][i]['label'] : '',
            });
        }
        var chart = new CanvasJS.Chart($(contextualDiv).attr('id'), options);
        chart.render();
    }
};
