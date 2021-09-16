
var chartPopulate = function (data, NoOfColumns) {
      if (NoOfColumns == 1) {
        let options = {
          title: {
            text: ""
          },
          axisY: [{
            title: data['Titles'][0],
            lineColor: "#C24642",
            tickColor: "#C24642",
            labelFontColor: "#C24642",
            titleFontColor: "#C24642",
            includeZero: true,
            suffix: data['Suffix'][0]
          }],

          toolTip: {
            shared: true
          },
          legend: {
            cursor: "pointer",
            itemclick: toggleDataSeries
          },
          data: [
            {
              type: "line",
              name: data.Name[0],
              color: "#C24642",
              axisYIndex: 0,
              showInLegend: true,
              dataPoints: [


              ]
            }]
        };


        for (let j = 0; j < data['ReportData'][0].length; j++) {
          options.data[0].dataPoints.push({
            label: data['ReportData'][0][j] != null ? data['ReportData'][0][j]['x'] : '',
            y: data['ReportData'][0][j] != null ? data['ReportData'][0][j]['y'] : '',
          });
        }

        var chart = new CanvasJS.Chart("chartContainer", options);
        chart.render();
        function toggleDataSeries(e) {
          if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        }

      } else if (NoOfColumns == 2) {

        let options = {
          title: {
            text: ""
          },
          axisY: [{
            title: data['Titles'][0],
            lineColor: "#C24642",
            tickColor: "#C24642",
            labelFontColor: "#C24642",
            titleFontColor: "#C24642",
            includeZero: true,
            suffix: data['Suffix'][0]
          }],
          axisY2: {
            title: data['Titles'][1],
            lineColor: "#7F6084",
            tickColor: "#7F6084",
            labelFontColor: "#7F6084",
            titleFontColor: "#7F6084",
            includeZero: true,
            suffix: data['Suffix'][1]
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
              type: "line",
              name: data.Name[0],
              color: "#C24642",
              axisYIndex: 0,
              showInLegend: true,
              dataPoints: [


              ]
            },
            {
              type: "line",
              name: data.Name[1],
              color: "#7F6084",
              axisYType: "secondary",
              showInLegend: true,
              dataPoints: [


              ]
            }]
        };


        for (let j = 0; j < data['ReportData'][0].length; j++) {
          options.data[0].dataPoints.push({
            label: data['ReportData'][0][j] != null ? data['ReportData'][0][j]['x'] : '',
            y: data['ReportData'][0][j] != null ? data['ReportData'][0][j]['y'] : '',
          });
        }

        for (let j = 0; j < data['ReportData'][1].length; j++) {
          options.data[1].dataPoints.push({
            label: data['ReportData'][1][j] != null ? data['ReportData'][1][j]['x'] : '',
            y: data['ReportData'][1][j] != null ? data['ReportData'][1][j]['y'] : '',
          });
        }

        var chart = new CanvasJS.Chart("chartContainer", options);
        chart.render();
        function toggleDataSeries(e) {
          if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        }
      } else if (NoOfColumns == 3) {

        let options = {
          title: {
            text: ""
          },
          axisY: [{
            title: data['Titles'][0],
            lineColor: "#C24642",
            tickColor: "#C24642",
            labelFontColor: "#C24642",
            titleFontColor: "#C24642",
            includeZero: true,
            suffix: data['Suffix'][0]
          }, {
            title: data['Titles'][1],
            lineColor: "#369EAD",
            tickColor: "#369EAD",
            labelFontColor: "#369EAD",
            titleFontColor: "#369EAD",
            includeZero: true,
            suffix: data['Suffix'][1]
          }],
          axisY2: {
            title: data['Titles'][2],
            lineColor: "#7F6084",
            tickColor: "#7F6084",
            labelFontColor: "#7F6084",
            titleFontColor: "#7F6084",
            includeZero: true,
            suffix: data['Suffix'][2]
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
              type: "line",
              name: data.Name[0],
              color: "#C24642",
              axisYIndex: 0,
              showInLegend: true,
              dataPoints: [


              ]
            },
            {
              type: "line",
              name: data.Name[1],
              color: "#7F6084",
              axisYType: "secondary",
              showInLegend: true,
              dataPoints: [


              ]
            },
            {
              type: "line",
              name: data.Name[2],
              color: "#7F6084",
              axisYType: "secondary",
              showInLegend: true,
              dataPoints: [


              ]
            }]
        };


        for (let j = 0; j < data['ReportData'][0].length; j++) {
          options.data[0].dataPoints.push({
            label: data['ReportData'][0][j] != null ? data['ReportData'][0][j]['x'] : '',
            y: data['ReportData'][0][j] != null ? data['ReportData'][0][j]['y'] : '',
          });
        }

        for (let j = 0; j < data['ReportData'][1].length; j++) {
          options.data[1].dataPoints.push({
            label: data['ReportData'][1][j] != null ? data['ReportData'][1][j]['x'] : '',
            y: data['ReportData'][1][j] != null ? data['ReportData'][1][j]['y'] : '',
          });
        }


        for (let j = 0; j < data['ReportData'][2].length; j++) {
          options.data[2].dataPoints.push({
            label: data['ReportData'][2][j] != null ? data['ReportData'][2][j]['x'] : '',
            y: data['ReportData'][2][j] != null ? data['ReportData'][2][j]['y'] : '',
          });
        }


        var chart = new CanvasJS.Chart("chartContainer", options);
        chart.render();
        function toggleDataSeries(e) {
          if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        }
      }
    };

      
 


    