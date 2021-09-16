import { Section, SectionAttribute, Event as Event1, ReportInput, DataTemplate, ColumnString, Condition, CustomKeyValueString, Scripts, Endpoint, Form, GridColumn, ColumnInformation } from '../../shared/interface/form-data-advanced';
import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { } from '../../shared/interface/form-data-advanced';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TableColumn, TableData, TableRecord } from '../../models/tableContent.model';
import { AuthService } from '../../services/auth.service';
import { UtilityService } from '../../services/utility.service';
import { BaseComponent } from 'src/app/shared/baseComponent/base.component';
import { IdService } from '../../services/id.service';
import { ReportService } from 'src/app/services/report.service';
import * as $ from 'jquery';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { uniq } from 'underscore';
import { AppConstants } from 'src/app/constants/AppConstants';
import { CalendarOptions } from '@fullcalendar/angular';


declare var modalLoader: any;
declare var disconnectConnection: any;
@Component({
  selector: 'app-dynamic-form-reports',
  templateUrl: './dynamic-form-reports.component.html',
  styleUrls: ['./dynamic-form-reports.component.css']
})
export class DynamicFormReportsComponent extends BaseComponent implements AfterViewInit {
  // @ViewChild('calendar', { static: false }) calendar: ElementRef;
  preexisting_rows_for_staff_hours: Array<CustomKeyValueString>;
  tableContents1: Array<any>;
  model: any;
  submitted: boolean;
  headerToPublish: Array<string>;
  printModelData: any
  baseUrl: string;
  dataTemplates: Array<DataTemplate>;
  public header = 'report';
  private moduleName: string;
  private isDataPopulationUnderProcess: boolean;
  private isDataPopulated: boolean;
  private reportInput: any;
  private btnEvent: Event1;
  private dataTemplateList: any;
  private validationErrors: Array<string>;
  public startDate_temp: string;
  public formPrintData: Form;
  public calendarOptions: CalendarOptions;
  public splittedStringV: string;
  // ScriptStore: Scripts[] = [
  //   { name: 'Jquery_Ui_Script', src: '../../../assets/scripts/jquery-ui.js' }
  // ];
  private tblHeaders1: Array<ColumnInformation>;
  constructor(
    httpclient: HttpClient,
    activatedRoute: ActivatedRoute,
    router: Router,
    authService: AuthService,
    private idService: IdService,
    utilityService: UtilityService,
    public reportService: ReportService,
    toastr: ToastrService) {


    super(httpclient, activatedRoute, router, authService, utilityService, toastr);
    this.validationErrors = new Array<string>();
    utilityService.updateIdService(this.idService);
    this.isDataPopulated = false;
    this.isDataPopulationUnderProcess = false;
    this.isAddCase = false;
    this.startDate_temp = '2020-06-01';
    //INITIALING THE SCRIPTS 
    // this.ScriptStore.forEach((script: any) => {
    //   this.scripts[script.name] = {
    //     loaded: false,
    //     src: script.src
    //   };
    // });
  }

  updateModule(moduleTemp: string) {
    this.moduleName = moduleTemp;
  }

  updateTypeOfCase(isAdd: boolean) {
    this.isAddCase = isAdd;
  }

  updateIdService(idService: IdService) {
    this.idService = idService;
  }
  getIdService() {
    return this.idService;
  }
  getUUID() {
    return this.idService.generate();
  }

  getCurrentModel(): Observable<any> {
    return this.model;
  }

  populateIdFieldValue() {
    return (this.model != null) ? this.model['Id'] : 0;
  }
  //**For get value**
  getDataFromService(url: string): Observable<any> {
    var response = this.httpclient.get(url);
    return response;
  }
  getUpdateClass(cssClassName: string) {
    return "col-sm-3 " + cssClassName;
  }
  getDateClass(cssClassName: string) {
    return "col-sm-2 " + cssClassName;
  }
  showLimitedText(inputTxt: string) {
    return (inputTxt.length > 100) ? inputTxt.substring(0, 75) + "....." : inputTxt;
  }
  //set class 
  setCssClassForColData(col) {
    let cls = this.reportService.setCssClass(col);
    cls += ' edit ' + col;
    return cls;
  }
  setCssClass(col) {
    let cls = this.reportService.setCssClass(col);
    cls += ' ' + col
    return cls;
  }
  ngOnInit() {
    let height = $(window).height() - 150;
    $('.modal-content').css("height", height);
    let path = window.location.pathname;
    let splittedValues = path.split('/');
    this.splittedStringV = splittedValues[2].toLowerCase();
    super.ngOnInit();
    this.getFormData('index');
    this.pageInfo1 = {
      currentPage: 1,
      pagesize: 10,
      totalrecords: 0
    };
    //refreshing table record in page load time 
    this.reportService.records = [];
    this.reportService.columns = [];
    this.reportService.sampleTablecolumns = [];
    this.reportService.sampleTableRecords = [];
    this.reportService.summaryData = "";

  }

  getClass() {
    let cls = "";
    this.formData.Sections.forEach(section => {
      if (section.CssClassName != null && section.CssClassName != undefined) {
        cls = section.CssClassName
      }
    });
    return cls
  }

  printTable(event, columnName) {

    let url = ''
    let oidc_image = '';
    let events: Array<Event1>;
    let headerValues_temp = [];
    let currentEvents: Array<Event1>;
    $("#currentDiv").html('');
    let rowElement = event.target.parentElement.parentElement as HTMLTableRowElement;
    let contextualTd = $(rowElement).find('.Id');
    let contextualInput = contextualTd.find("Input");
    let currentId = parseInt($(contextualInput).val().toString());
    //get Image in session
    if (sessionStorage.getItem('oidc_settings') != null) {
      let imageManagerSettings = JSON.parse(sessionStorage.getItem('oidc_settings'));
      oidc_image = imageManagerSettings.siteImageUrl;

    }

    this.formData.Sections.forEach(section => {
      let selectedDataTemplates = section.DataTemplates.filter(t => t.ColumnName == columnName);
      if (selectedDataTemplates != null && selectedDataTemplates.length > 0) {
        events = selectedDataTemplates[0].Events;
        return;
      }
    });

    if (events != null && events.length > 0) {

      events.forEach(event => {
        if (event.EndPoint != null) {
          url = this.utilityService.getApiUrl(this.module) + event.EndPoint.EndpointAddress + currentId;

          if (event.EndPoint != null && event.EndPoint.Headers != null) {
            event.EndPoint.Headers.forEach(data => {
              headerValues_temp.push({
                Key: data.KeyName,
                Value: data.ValueName
              });
            })
          }
        }
      });
    }


    let response = this.utilityService.getDataFormService(url, headerValues_temp);

    response.subscribe(
      data => {
        if (data.DataCollection.length > 0) {
          this.printModelData = data.DataCollection[0];


          //call instrumentCalibration json page and get json

          let path = window.location.pathname;
          let splittedValues = path.split('/');
          let splittedName = splittedValues[2].toLowerCase();
          switch (splittedName) {
            case "instrumentcalibrationsetreports":

              this.tblHeaders1 = new Array<ColumnInformation>();
              let firstHeader = [];
              //Only for this page
              //node json data
              let url = environment.templateUrl + "/iotplus/instrumentCalibrationSets/addEdit";
              if (url != null) {
                let response = this.utilityService.getDataFormService(url);
                response.subscribe(
                  data => {
                    let formPrintData = data as Form;

                    for (let i = 0; i < formPrintData.Sections.length; i++) {
                      let section = formPrintData.Sections[i];
                      if (section.SectionTypeName == 'Normal' || section.SectionTypeName == 'object') {
                        currentEvents = this.getFilterEvent(section);
                        console.log("Event:" + currentEvents);
                        break;
                      }
                    }
                    if (currentEvents != null && currentEvents != undefined) {
                      currentEvents.forEach(event => {
                        if (event.EndPoint.AdditionalParams != null && event.EndPoint.AdditionalParams.length > 0) {
                          for (let i = 0; i < event.EndPoint.AdditionalParams.length; i++) {
                            if (event.EndPoint.AdditionalParams[i].KeyName != null) {
                              // currentModel
                              let controlId = event.EndPoint.AdditionalParams[i].ModelPropName
                              let currentValue = this.printModelData[event.EndPoint.AdditionalParams[i].ModelPropName];

                              let url = this.utilityService.getUrlForGenerateTable(splittedName, event, null, controlId, currentValue);

                              if (url != null) {

                                let controlName_temp = (event.EndPoint.RelatedParams != null && event.EndPoint.RelatedParams.length > 0) ?
                                  event.EndPoint.RelatedParams[0].ControlName : null;
                                if (controlName_temp != null) {
                                  let measurementValue = this.printModelData[event.EndPoint.RelatedParams[0].ModelPropName];
                                  let totalRows = parseInt(measurementValue);
                                  let splittedRow = this.printModelData["Id"];
                                  let addUrl = url;
                                  url = url + "/" + splittedRow;

                                  let responseForAddJson = this.utilityService.getDataFormService(addUrl);
                                  responseForAddJson.subscribe(
                                    data => {
                                      if (data != null) {
                                        //create url that give edit data

                                        //Get sample Data
                                        let response = this.utilityService.getDataFormService(url);
                                        response.subscribe(
                                          tableData => {
                                            tableData.SectionAttributes.forEach(SA => {
                                              let currentTdId = document.getElementById(SA.HelpText) as HTMLTableCellElement;
                                              if (currentTdId != null && currentTdId != undefined) {
                                                currentTdId.innerText = SA.CurrentValue != undefined ? SA.CurrentValue : "";
                                                let currentRowVersion = SA.RowVersion != undefined ? SA.RowVersion : "";
                                                let specialId = SA.EndPointId != undefined ? SA.EndPointId : "";
                                                // currentTdId.setAttribute("RowVersion", currentRowVersion);
                                                // currentTdId.setAttribute("AttributeId", currentAttributeId);
                                                currentTdId.setAttribute('special_id', specialId.toString());
                                                currentTdId.setAttribute('special_rowversion', currentRowVersion);
                                              }
                                            });
                                            this.calculateAvgAndRsd();
                                          });


                                        if (data.Columns == null)
                                          data.Columns = [];

                                        /* Storing the Section as JSON inside 'TableTemplateSection' within the TABLE 
                                        // let sectionAttributesJSON1 = JSON.stringify(data);
                                        //TableTemplate section which is hidden, will store the Entire Section in JSON Format*/

                                        data.SectionAttributes.forEach(sa => {
                                          let classTemp = (sa.IsHidden != null && sa.IsHidden == true) ? 'theadHide' : 'theadShow';
                                          /* Get Instrumentcalibrationsetreports First Row Table Data */
                                          if (sa.LabelName != null) {
                                            let patternToMatch = /[\d]*/g;
                                            let result = sa.LabelName.match(patternToMatch);
                                            if (result[0] != "") {
                                              firstHeader.push(result[0]);
                                            }
                                          }
                                          /* Get Instrumentcalibrationsetreports Second Row Table Data */
                                          if (sa.LabelName != null) {
                                            let patternToMatch = /([a-zA-Z])*/g;
                                            let result = sa.LabelName.match(patternToMatch);
                                            let labelName = result[4] != null ? result[4] : ""

                                            let columnHeader = {
                                              HeaderName: labelName,
                                              CssClassName: classTemp,
                                            };

                                            data.Columns.push(columnHeader);
                                          } else {
                                            let columnHeader = {
                                              HeaderName: "",
                                              CssClassName: classTemp,
                                            };

                                            data.Columns.push(columnHeader);
                                          }
                                        });

                                        /* popultate Instrument CalibrationSet Report Table */
                                        let obj = {};
                                        for (let i of firstHeader) {
                                          obj[i] = true;
                                        }
                                        let firstHeaderValue = Object.keys(obj);
                                        let tr_temp1 = $('<tr></tr>');
                                        let th_temp = $('<th >PosNo</th>');
                                        $(tr_temp1).append(th_temp);
                                        for (let i = 0; i < firstHeaderValue.length; i++) {
                                          let th_temp1 = $('<th colspan="3">' + firstHeaderValue[i] + 'mg</th>');
                                          $(tr_temp1).append(th_temp1);
                                        }
                                        /******************** PRINTIMG THE HEADERS  *****************/

                                        let tr_temp = $('<tr></tr>');
                                        data.Columns.forEach(column => {
                                          let th_temp1 = $('<th class="' + column.CssClassName + '">' + column.HeaderName + '</th>');
                                          $(tr_temp).append(th_temp1);

                                        });


                                        if (this.printModelData != null) {
                                          let coName = this.printModelData["CoName"] != null ? this.printModelData["CoName"] : "";
                                          let instrumentId = this.printModelData["InstrumentName"] != null ? this.printModelData["InstrumentName"] : "";
                                          let CWRNo = this.printModelData["CWRNo"] != null ? this.printModelData["CWRNo"] : "";
                                          let issuedByName = this.printModelData["IssuedByName"] != null ? this.printModelData["IssuedByName"] : "";
                                          let issuedOn = this.printModelData["IssuedOn"] != null ? this.printModelData["IssuedOn"] : "";
                                          let SOPRefNo = this.printModelData["SOPRefNo"] != null ? this.printModelData["SOPRefNo"] : "";
                                          let BoxNo = this.printModelData["BoxNo"] != null ? this.printModelData["SOPRefNo"] : "";
                                          let validUpto = this.printModelData["ValidUpto"] != null ? this.printModelData["ValidUpto"] : "";
                                          let calibrationStartDateNTime = this.printModelData["CalibrationStartDateNTime"] != null ? this.printModelData["CalibrationStartDateNTime"] : "";
                                          let IssuedOn = this.printModelData["IssuedOn"] != null ? this.printModelData["IssuedOn"] : "";
                                          let SectionTypeNameName = this.printModelData["SectionTypeNameName"] != null ? this.printModelData["SectionTypeNameName"] : "";
                                          let traceableTo = this.printModelData["TraceableTo"] != null ? this.printModelData["TraceableTo"] : "";
                                          let remarks = this.printModelData["Remarks"] != null ? this.printModelData["Remarks"] : "";
                                          let conclusion = this.printModelData["Conclusion"] != null ? this.printModelData["Conclusion"] : "";
                                          let checkedByName = this.printModelData["CheckedByName"] != null ? this.printModelData["CheckedByName"] : "";
                                          let approvedByName = this.printModelData["ApprovedByName"] != null ? this.printModelData["ApprovedByName"] : "";
                                          let checkedOn = this.printModelData["CheckedOn"] != null ? this.printModelData["CheckedOn"] : "";
                                          let approvedOn = this.printModelData["ApprovedOn"] != null ? this.printModelData["ApprovedOn"] : "";
                                          let firstTable = $("<table class='printTable tableWidth'><tr class='printTable'><th style='text-align: center;'>" +
                                            "<img src='" + oidc_image + "' alt='Application Image' width='170' height='60'></th><th style='text-align: center;'>" + coName + "</th>" +
                                            " <th style='text-align: center;color:green'>" + this.title + "</th></tr>" +

                                            "<tr class='printTable'><td> <span style='color:green;'>Instrument Name:</span>" + instrumentId + "</td><td><span style='color:green;'>CWR No:</span>" + CWRNo + "</td>" +
                                            "<td><span style='color:green;'>IssuedByName:</span>" + issuedByName + "</td></tr>" +

                                            "<tr class='printTable'><td><span style='color:green;'>Issued On:</span>" + issuedOn + "</td><td><span style='color:green;'>SOPRefNo:</span>" + SOPRefNo + "</td>" +
                                            "<td><span style='color:green;'>IssuedByName:</span>" + BoxNo + "</td></tr>" +

                                            "<tr class='printTable'><td><span style='color:green;'>ValidUp to:</span>" + validUpto + "</td><td><span style='color:green;'>CalibrationStartDateNTime:</span>" + calibrationStartDateNTime + "</td>" +
                                            "<td><span style='color:green;'>IssuedOn:</span>" + IssuedOn + "</td></tr>" +

                                            "<tr class='printTable'><td colspan='3'><span style='color:green;'>Section Type:</span>" + SectionTypeNameName + "</td></tr>" +
                                            "<tr class='printTable'><td colspan='3'><span style='color:green;'>Traceable To :</span>" + traceableTo + "</td></tr>" +
                                            "<tr class='printTable'><td colspan='3'><span style='color:green;'>Remarks :</span>" + remarks + "</td></tr>" +
                                            "<tr class='printTable'><td colspan='3'><span style='color:green;'>Conclusion:</span>" + conclusion + "</td></tr>" +
                                            "</table>");
                                          let br1 = $("<br></br>");

                                          let secondTable = $("<table id='InstrumentCalibrationSetTables' class='printTableTwo'></table>");

                                          let br2 = $("<br></br>");

                                          let thirdTable = $("<table class='printTable tableWidth'><tr class='printTable'><th style='text-align: center;'></th>" +
                                            "<th style='text-align: center;'><h5>CalibratedBy</h5></th><th style='text-align: center;'><h5>Checked By</h5></th> <th style='text-align: center;'><h5>Approved By</h5></th></tr>" +

                                            "<tr class='printTable'><td class='printTable'> <span style='color:green;'> Person </td><td class='printTable'>" + issuedByName + "</td>" +
                                            "<td class='printTable'>" + checkedByName + "</td><td class='printTable'>" + approvedByName + "</td></tr>" +

                                            "<tr class='printTable'><td class='printTable'> <span style='color:green;'> Date </td><td class='printTable'>" + IssuedOn + "</td>" +
                                            "<td class='printTable'>" + checkedOn + "</td><td class='printTable'>" + approvedOn + "</td></tr>" +

                                            "</table>");
                                          $("#currentDiv").append(firstTable);
                                          $("#currentDiv").append(br1);
                                          $("#currentDiv").append(secondTable);
                                          $("#currentDiv").append(br2);
                                          $("#currentDiv").append(thirdTable);
                                        }
                                        let affectedTableControl = document.getElementById("InstrumentCalibrationSetTables") as HTMLTableElement;
                                        $(affectedTableControl).append(tr_temp1);
                                        $(affectedTableControl).append(tr_temp);
                                        let tbody_temp3 = $(affectedTableControl).find('tbody');
                                        for (let i = 0; i < totalRows; i++) {
                                          let tbody_temp4 = tbody_temp3[0] as HTMLTableSectionElement;
                                         this.utilityService.generateRowForGivenTable(tbody_temp4, data, null, this.utilityService, this.printModelData, null, i);
                                        }



                                        let totalTableRows = affectedTableControl.rows.length;
                                        let totalColumns = affectedTableControl.rows[1].cells.length - 1;

                                        var row = affectedTableControl.insertRow(totalTableRows);
                                        /*Adding the word Avg*/
                                        let td_temp = row.insertCell();
                                        td_temp.id = 'td_Avg_' + '_0';
                                        td_temp.innerText = 'Avg';

                                        /*loop the number of columns*/
                                        for (let i = 1; i <= totalColumns; i++) {
                                          let id = 'td_Avg_' + i.toString();
                                          let td_temp = row.insertCell();
                                          td_temp.id = id;

                                        }

                                        var row1 = affectedTableControl.insertRow(totalTableRows + 1);

                                        /*Adding the word RSD*/
                                        let td_temp1 = row1.insertCell();
                                        td_temp1.id = 'td_Rsd_' + '_0';
                                        td_temp1.innerText = 'Rsd';
                                        /*loop the number of columns*/
                                        for (let i = 1; i <= totalColumns; i++) {
                                          let id = 'td_Rsd_' + i.toString();
                                          let td_temp = row1.insertCell();
                                          td_temp.id = id;
                                        }

                                      }
                                    });


                                }

                              }
                            }
                          }
                        }
                      })
                    }

                  });
              }

              break;
            case "balancerecordreports":

              let balanceRecordUrl = environment.templateUrl + "/iotplus/samplereportbalancerecords/addEdit";
              let balanceRecordResponse = this.utilityService.getDataFormService(balanceRecordUrl);
              balanceRecordResponse.subscribe(
                data => {
                  if (data != null) {
                    let coName = this.printModelData["CoName"] != null ? this.printModelData["CoName"] : "";
                    let instrumentName = this.printModelData["InstrumentName"] != null ? this.printModelData["InstrumentName"] : "";
                    let dateOfRecording = this.printModelData["DateNTimeOfRecording"] != null ? this.printModelData["DateNTimeOfRecording"] : "";
                    let imageDiv = $("<div style='text-align: center;'><img src='" + oidc_image + "' alt='Application Image' width='150' height='60'></div>");
                    let compDiv = $("<div style='font-size: 20px;'>" + coName + "</div>");
                    let firstDiv = $("<div style='font-size: 20px;'><spn><b>Instrument Name: </b></span><span>" + instrumentName + "<span></div>");
                    let secondDiv = $("<div style='font-size: 20px;'><span><b>DateOfRecording:</b></span><span>" + dateOfRecording + "<span></div>");
                    let br1 = $("<br></br>");
                    let currentDiv = $("<div style='font-size: 20px;'><b>Balance Record Details</b></div>");
                    let secondTable = $("<table id='BalanceRecordDetailWeighs' class='printTableTwo'></table>");
                    $("#currentDiv").append(imageDiv);
                    $("#currentDiv").append(compDiv);
                    $("#currentDiv").append(firstDiv);
                    $("#currentDiv").append(secondDiv);
                    $("#currentDiv").append(br1);
                    $("#currentDiv").append(currentDiv);
                    $("#currentDiv").append(secondTable);
                    if (data["Sections"][0].Columns == null)
                      data["Sections"][0].Columns = [];
                    //Storing the Section as JSON inside 'TableTemplateSection' within the TABLE 
                    let sectionAttributesJSON1 = JSON.stringify(data);
                    //TableTemplate section which is hidden, will store the Entire Section in JSON Format

                    data["Sections"][0].SectionAttributes.forEach(sa => {
                      let classTemp = (sa.IsHidden != null && sa.IsHidden == true) ? 'theadHide' : 'theadShow';
                      let columnHeader = {
                        HeaderName: sa.LabelName != null ? sa.LabelName : "",
                        CssClassName: classTemp
                      };

                      data["Sections"][0].Columns.push(columnHeader);
                    });


                    //******************** PRINTIMG THE HEADERS  */
                    //let thead_temp = $('<thead></thead>');
                    let tr_temp = $('<tr></tr>');
                    data["Sections"][0].Columns.forEach(column => {
                      let th_temp = $('<th class="' + column.CssClassName + '">' + column.HeaderName + '</th>');
                      $(tr_temp).append(th_temp);
                      // $(thead_temp).append(tr_temp);

                    });

                    let affectedTableControl = document.getElementById("BalanceRecordDetailWeighs") as HTMLTableElement;
                    $(affectedTableControl).append(tr_temp);
                    if (this.printModelData != null && data["Sections"][0].ModelCollectionName != null) {
                      //Get the DataCollection for Table Types 
                      let dataCollection = this.printModelData[data["Sections"][0].ModelCollectionName];
                      let objectData = this.printModelData["BalanceRecordDetail"];
                      //PROCESSING CODE 
                      //CHECK FOR THE PAGE AND APPLY PROCESSING 


                      if (dataCollection != null && Array.isArray(dataCollection)) {
                        dataCollection = dataCollection as Array<any>;
                        if (dataCollection != null) {
                          let tbody_temp3 = $(affectedTableControl).find('tbody');
                          for (let i = 0; i < dataCollection.length; i++) {
                            let tbody_temp4 = tbody_temp3[0] as HTMLTableSectionElement;
                            let upDateDataCollection = Object.assign(dataCollection[i], objectData);
                            this.utilityService.generateRowForGivenTable(tbody_temp4, data["Sections"][0], upDateDataCollection, this.utilityService, this.printModelData, null, i);
                          };
                        }
                      };
                    };
                  }
                });
              break;
            case "internalcalibrationreports":
              let endpointUrl = "";
              events.forEach(event => {
                if (event.EndPoint != null) {
                  endpointUrl = this.utilityService.getApiUrl(this.module) + event.EndPoint.EndpointAddress + currentId;
                }
              });

              let internalCalibrationResponse = this.utilityService.getDataFormService(endpointUrl);
              internalCalibrationResponse.subscribe(
                data => {
                  if (data != null) {
                    let coName = data.DataCollection[0]["CoName"] != null ? data.DataCollection[0]["CoName"] : "";
                    let instrumentName = data.DataCollection[0]["InstrumentName"] != null ? data.DataCollection[0]["InstrumentName"] : "";
                    let instrumentValue = data.DataCollection[0]["InstrumentValue"] != null ? data.DataCollection[0]["InstrumentValue"] : "";
                    let recordDateTime = data.DataCollection[0]["RecordDateTime"] != null ? data.DataCollection[0]["RecordDateTime"] : "";
                    let reportedByName = data.DataCollection[0]["ReportedByName"] != null ? data.DataCollection[0]["ReportedByName"] : "";

                    let imageDiv = $("<div style='text-align: center;'><img src='" + oidc_image + "' alt='Application Image' width='150' height='60'></div>");
                    let compDiv = $("<div style='font-size: 20px;'>" + coName + "</div>");
                    let firstDiv = $("<div style='font-size: 20px;'><spn><b>Instrument Name: </b></span><span>" + instrumentName + "<span></div>");
                    let secondDiv = $("<div style='font-size: 20px;'><spn><b>Instrument Value: </b></span><br><hr style='margin-top: 2px!important;margin-bottom: 5px!important;'><span>" + instrumentValue + "<span><hr style='margin-top: 2px!important;'></div>");
                    let thirddDiv = $("<div style='font-size: 20px;'><span><b>RecordDateTime:</b></span><span>" + recordDateTime + "<span></div>");
                    let fourthdDiv = $("<div style='font-size: 20px;'><span><b>ReportedByName:</b></span><span>" + reportedByName + "<span></div>");

                    let br1 = $("<br></br>");

                    $("#currentDiv").append(imageDiv);
                    $("#currentDiv").append(compDiv);
                    $("#currentDiv").append(firstDiv);
                    $("#currentDiv").append(thirddDiv);
                    $("#currentDiv").append(fourthdDiv);
                    $("#currentDiv").append(secondDiv);
                    $("#currentDiv").append(br1);

                  }
                });
              break;


          };
        }
      });
  }

  /**********************DATE PICKER POPUP FUNCTIONALITY*********************************/

  trigger(event, columnName, ColumnData) {

    //Read the id based on parent and class name (hiddenId)
    let startDateControls = document.getElementsByClassName('startDate');
    let endDateControls = document.getElementsByClassName('endDate');
    let startDateControl = startDateControls != null && startDateControls.length > 0 ? startDateControls[0] as HTMLInputElement : null;
    let endDateControl = endDateControls != null && endDateControls.length > 0 ? endDateControls[0] as HTMLInputElement : null;
    let startDateHeader = document.getElementById('startDateId') as HTMLElement;
    let endDateHeader = document.getElementById('endDateId') as HTMLElement;
    let staffNameHeader = document.getElementById('staffNameId') as HTMLElement;
    startDateHeader.innerHTML = startDateControl.value;
    endDateHeader.innerHTML = endDateControl.value;
    staffNameHeader.innerHTML = ColumnData;
    let rowElement = event.target.parentElement.parentElement.parentElement as HTMLTableRowElement;

    let path = window.location.pathname;
    let splittedValues = path.split('/');
    let splittedName = splittedValues[2]

    if (columnName == "DataContent") {

      this.showHistoryPopUp(columnName, rowElement, ColumnData);

    }
    else if (columnName == "MachineName" && splittedName == "logReport") {

      var hiddenCtrl = rowElement.getElementsByClassName("mainObjectClass");
      if (hiddenCtrl.length > 0) {
        let inputData = JSON.parse(hiddenCtrl[0]['defaultValue']);
        this.showLogReportPopUp(columnName, rowElement, inputData);
      }

    }
    else {
      this.showPopup(startDateControl.value, endDateControl.value, columnName, rowElement);

    }

  }
  /*--------------------------------------HistoyPopUP Functionality--------------------------------*/
  showHistoryPopUp(columnName: any, rowReference: HTMLTableRowElement, ColumnData: any) {
    $("#accordionId").html('');
    if (ColumnData != null) {
      let panelDiv = document.createElement('div') as HTMLDivElement;
      panelDiv.className = 'panel panel-default';

      let panelCtrl = this.utilityService.getHistoryPanelData(ColumnData, panelDiv);
      $("#accordionId").append(panelCtrl);


    }
    var modalHistory = document.getElementById("myHistoryModal")
    modalHistory.style.display = "block";
    var span = document.getElementById("closeHistoryModal");
    span.onclick = function () {
      modalHistory.style.display = "none";
    }

  }
  /*---------------------------------------Get contolType MainObject Data Functionality --------------------------------*/
  mainObjectData(data: any) {
    let currentObj = JSON.stringify(data);
    return currentObj;
  }
  /* -----------------------LOGREPORT Functionality----------------------------*/
  showLogReportPopUp(columnName: any, rowReference: HTMLTableRowElement, ColumnData: any) {
    $("#accordionId1").html('');
    if (ColumnData != null) {
      let panelDiv = document.createElement('div') as HTMLDivElement;
      panelDiv.className = 'panel panel-default';
      let panelCtrl = this.utilityService.getLogData(ColumnData, panelDiv);
      $("#accordionId1").append(panelCtrl);
    }
    var modalLog = document.getElementById("myLogReportModal1")
    modalLog.style.display = "block";
    var span = document.getElementById("closeLogModal");
    span.onclick = function () {
      modalLog.style.display = "none";
    }

  }



  updateClassName(controlName: string, cssClassName: string) {
    return controlName + ' ' + (cssClassName != null) ? cssClassName : "";
  }

  showPopup(stDate: any, endDate: any, columnName: any, rowReference: HTMLTableRowElement) {
    let url = ''
    let events: Array<Event1>;

    this.formData.Sections.forEach(section => {
      let selectedDataTemplates = section.DataTemplates.filter(t => t.ColumnName == columnName);
      if (selectedDataTemplates != null && selectedDataTemplates.length > 0) {
        events = selectedDataTemplates[0].Events;
        return;
      }
    });

    if (events != null && events.length > 0)
      events.forEach(event => {
        if (event.EndPoint != null) {
          let idRef: string = null;
          let value_temp = event.affectedControlName != null && event.affectedControlName != "" ? event.affectedControlName : null;
          var reference_elements = rowReference != null && value_temp != null ?
            rowReference.getElementsByClassName(value_temp) : null;
          if (reference_elements != null && reference_elements.length > 0) {

            let input_temp_list = $(reference_elements[0]).find('input');
            //picking the first input
            let input_temp_control = input_temp_list[0] as HTMLInputElement;
            if (input_temp_control != null) {
              idRef = $(input_temp_control).val().toString();
            }
           // let value = reference_elements[0] as HTMLElement;
           // let value_temp1 = $(reference_elements[0]).find('input') as HTMLInputElement;
           // if (value_temp1 != null) {
           //   idRef = $(value_temp1).val().toString();
            //}
          }
          if (idRef != null) {
            url = this.utilityService.getApiUrl(this.module) + event.EndPoint.EndpointAddress + idRef + "/" + stDate + "/" + endDate;
            var modal = document.getElementById("myModal")
            modal.style.display = "block";
            var span = document.getElementById("close");
            span.onclick = function () {
              modal.style.display = "none";
            }
          }
          else {
            this.toastr.warning('warning', 'There is not reference to the link!');
          }
          return;
        }
      });
    //initialDate

    let startDate_temp = stDate.toString();
    let endDate_temp = endDate.toString();
    console.log(startDate_temp);
    /*-------------------------populate datepicker inside model----------------------------------*/
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      weekends: true,
      height: 380,
      initialDate: '2020-06-01',// startDate_temp,
      titleFormat: { // will produce something like "Tuesday, September 18, 2018"
        month: 'long',
        year: 'numeric',
        day: 'numeric',
        weekday: 'long',

      }
    };
   
    /*-----------------------------Get server call for populate datePicker data  ----------------------*/
    let response = this.utilityService.getDataFormService(url);
    let calendar_array = [];
    response.subscribe(
      data => {
        for (let i = 0; i < data.DataCollection.length; i++) {
          let date_temp = data.DataCollection[i]['ContextDay'].substring(0, 10);

          //**************** FREE HOURS PLOT ***************************** */
          if (data.DataCollection[i]['FreeHours'] > 0)
            calendar_array.push({
              title: data.DataCollection[i]['FreeHours'],
              start: date_temp,
              backgroundColor: 'green',
              textColor: 'white'
            });

          //**************** BLOCKED HOURS ********************* */
          if (data.DataCollection[i]['BlockedHours'] > 0)
            calendar_array.push({
              title: data.DataCollection[i]['BlockedHours'],
              start: date_temp,
              backgroundColor: 'maroon',
              textColor: 'white'
            });

          /*****************PROJECT HOURS ***************************** */
          if (data.DataCollection[i]['ProjectHours'] > 0)
            calendar_array.push({
              title: data.DataCollection[i]['ProjectHours'],
              start: date_temp,
              backgroundColor: 'navy',
              textColor: 'white'
            });

          //***************** HOLIDAY HOURS ****************************** */
          if (data.DataCollection[i]['HolidayHours'] > 0)
            calendar_array.push({
              title: data.DataCollection[i]['HolidayHours'],
              start: date_temp,
              backgroundColor: 'yellow',
              textColor: 'black'
            });

          if (data.DataCollection[i]['LeaveHours'] > 0)
            calendar_array.push({
              title: data.DataCollection[i]['LeaveHours'],
              start: date_temp,
              backgroundColor: 'orange',
              textColor: 'white'
            });
        };

        this.calendarOptions['events'] = calendar_array;
      });
  }

  /*------------------------ Get Class Name DYnamically --------------------*/
  getClassNameForDiv(inputControlName, addedText) {
    return inputControlName + addedText + ' divContainer';
  }
  getClassNameForULHelper(inputControlName, addedText) {
    return inputControlName + addedText + ' ulHelper list-group';
  }

  getAdditionalInfoIdValue(inputControlName) {
    return 'divAdditionalInfo_' + inputControlName;
  }
  //Gives the ID for show refresh icon near select box
  getIdForRefresh(inputControlName: string) {
    return "refresh_" + inputControlName;
  }
  downloadResume(columnData: string) {
    return environment.platformBaseUrl + "/v1/File/ServerFile/" + columnData;
  }
  ngDoCheck() {
    if (this.isDataPopulated)
      return;
    //************ this part ideally should populate all data on the UI including single Child and Children/Array of child/grid ************** */
    if (this.formData != null) {
      this.reportService.updateDataTemplates(this.dataTemplates);
      this.reportService.updateFormData(this.formData); //this method show form data
      try {
        //************* MAIN LOOP ADDED TO LOOP THROUGH THE FORM SECTIONS /
        if (this.formData != null) {
          this.formData.Sections.forEach(
            section => {
              //Looping sub sections to produce relavant controls like tables/...
              this.processSection(this, section, this.model, this.utilityService, false);

            });
        };
        this.isDataPopulated = true;
      }

      catch (error) {
        if (error.status == 500) {
          this.toastr.error(error.message, 'Error',
            { timeOut: 2000 });
        } else if (error.status == 401) {
          this.toastr.warning('Un-authorized', 'Warning',
            { timeOut: 2000 });
        } else if (error.status == 404) {
          this.toastr.warning('No Records', 'Warning',
            { timeOut: 2000 });
        } else if (error.status == 400 || error.status == 409) {
          this.toastr.warning(error.message, 'Warning',
            { timeOut: 2000 });
        }
        else if (error.status == 0) {
          this.toastr.warning('UnAuthorized', 'Warning',
            { timeOut: 2000 });
        }

      }
    }
    else if (this.formData != null && this.model != null) {
      try {
        this.isDataPopulationUnderProcess = true;
        //let idService = this.idService;
        let utilityService = this.utilityService;
        //************* MAIN LOOP ADDED TO LOOP THROUGH THE FORM SECTIONS to populate data mainly for Dropdowns /
        if (this.formData != null) {
          this.formData.Sections.forEach(
            section => {
              //Looping sub sections to produce relavant controls like tables/...
              this.processSection(this, section, this.model, utilityService, false);

            });
        };
      }
      catch (error) { }
    };
  }

  /*-------------------------------------------------------------------pagination--------------------------------------------------------------------------------------*/
  first(currentForm: DynamicFormReportsComponent) {
    let currentForm_temp = currentForm == null ? this : currentForm;

    currentForm_temp.pageInfo1.currentPage = 1;
    currentForm_temp.populateBaseUrl(currentForm_temp);
  }

  prev(currentForm: DynamicFormReportsComponent) {
    let currentForm_temp = currentForm == null ? this : currentForm;

    currentForm_temp.pageInfo1.currentPage = currentForm_temp.pageInfo1.currentPage - 1;
    currentForm_temp.pageInfo1.currentPage = (currentForm_temp.pageInfo1.currentPage <= 0) ? 1 : this.pageInfo1.currentPage;

    currentForm_temp.populateBaseUrl(currentForm_temp);
  }

  next(currentForm: DynamicFormReportsComponent) {
    let currentForm_temp = currentForm == null ? this : currentForm;

    currentForm_temp.pageInfo1.currentPage =
      ((currentForm_temp.pageInfo1.currentPage * currentForm_temp.pageInfo1.pagesize) > (currentForm_temp.pageInfo1.totalrecords)) ?
        Math.round(currentForm_temp.pageInfo1.totalrecords / currentForm_temp.pageInfo1.pagesize) : currentForm_temp.pageInfo1.currentPage + 1;
    currentForm_temp.populateBaseUrl(currentForm_temp);
  }
  last(currentForm: DynamicFormReportsComponent) {
    let currentForm_temp = currentForm == null ? this : currentForm;

    currentForm_temp.pageInfo1.currentPage = Math.ceil(currentForm_temp.pageInfo1.totalrecords / currentForm_temp.pageInfo1.pagesize);
    currentForm_temp.populateBaseUrl(currentForm_temp);
  }

  /*---------------------------------------pagination End--------------------------------------------------------------*/

  ngAfterViewInit() {
    let height = $(window).height() - 85;
    $('.modal-content').css("height", height);
    // let g = "reached ngAfterContentInit";
    let utilityService = this.utilityService;
    let reportService = this.reportService;
    let idService = this.idService;
    let currentModel = this.model;
    let x = this.model;
    //set scroll dynamically on the size of windows.
    window.onresize = onResizeOfWindow;
    function onResizeOfWindow() {
      let windowHeight = $(window).height();
      let model_body = $('#scroll');

      if (model_body != undefined) {
        let heightInPixels = (windowHeight - 130);
        $('#scroll').css("overflow-y", "scroll");
        $('#scroll').css("height", heightInPixels);
      }

    }

    /*********************************USE PROCESSDATATEMPLATES ***********************************************/
    /************* MAIN LOOP ADDED TO LOOP THROUGH THE FORM SECTIONS***********************/
    this.formData.Sections.forEach(
      section => {
        //Looping sub sections to produce relavant controls like tables/...
        utilityService.processSection(section, currentModel, utilityService, true);
      });


  }

  /*----Filter item for Custom Attrinute and find the value thats there and accoringly pass only that after parsing---*/
  getcolumnCollection(keyValues: Array<CustomKeyValueString>, columnName: string, itemCollection: Array<any>) {

    let attributeData_temp: Array<CustomKeyValueString>;
    // let filteredData = itemCollection.filter(t => t.Record['ColumnName'] != null && t.Record['ColumnName'] == 'CustomAttributes');
    let filteredData = itemCollection.filter(t => t.ColumnName != null && t.ColumnName == 'CustomAttributes');
    if (filteredData != null && filteredData.length > 0) {
      // let temp_array = filteredData[0].Record['ColumnName'].ColumnData as Array<any>;
      let temp_array = filteredData[0].ColumnData as Array<any>;
      let selectedAttribute = temp_array.filter(t => t.AttributeName == columnName);
      if (selectedAttribute != null && selectedAttribute.length > 0) {
        let attributeData = selectedAttribute[0]['AttributeData'];
        attributeData_temp = attributeData != null ? JSON.parse(attributeData) : null;

      }
    }
    return attributeData_temp;

    // //check if the data already populated, if yes then pick fro mthe cache 
    // let attributeData_temp: Array<CustomKeyValueString>;
    // if (this.preexisting_rows_for_staff_hours!=null){
    //   return this.preexisting_rows_for_staff_hours;
    // }
    // else{

    //   if (currentRowItem.Record['ColumnName'] !=null && currentRowItem.Record['ColumnName'] == 'CustomAttributes') {
    //     let temp_array = currentRowItem.Record['ColumnName'].ColumnData as Array<any>;
    //     let selectedAttribute = temp_array.filter(t => t.AttributeName == columnName);
    //     if (selectedAttribute != null && selectedAttribute.length > 0) {
    //       let attributeData = selectedAttribute[0]['AttributeData'];
    //       attributeData_temp = attributeData != null ? JSON.parse(attributeData) : null;
    //       break;
    //     }
    //   }
    //   this.preexisting_rows_for_staff_hours = attributeData_temp;
    // }

  }

  /*********************populate selected date value *****************************/
  getDateValue(columnData: any) {
    let data = columnData.slice(0, 10);
    return data;
  }

  //**************************************ngAfterViewInit End****************************************************/
  onPageSizeChanged(currentForm: DynamicFormReportsComponent) {

    let currentForm_temp = currentForm == null ? this : currentForm;
    let elem = document.getElementById('selectPage-size') as HTMLSelectElement;
    var value = elem.options[elem.selectedIndex].value;
    this.pageInfo1 = {
      currentPage: 1,
      pagesize: parseInt(value),
      totalrecords: 0
    };
    currentForm_temp.populateBaseUrl(currentForm);
  }

  submitForm() {
    this.submitted = true;
  }

  submitToServer(url: string, method: string, postedData: any) {
    let stringData = postedData != null && postedData.length > 0 ? JSON.stringify(postedData) : 'none';
    alert('you submitted ' + stringData + ' on url :' + url + ' method:' + method);
  }
  /*=========================================================================================================================================================================*/
  /*================================================================================================================================================================*/

  /*--------------------------------------------------------SECTION FOR HANDLING FORMS, SECTIONS, SECTION ATTRIBUTES ------------------------------------------------*/

  processSection(currentForm: DynamicFormReportsComponent, section: Section, model: any, utilityService?: UtilityService, bindEvents?: boolean) {

    let currentForm_temp = currentForm == null ? this : currentForm;
    let parentControl = document.getElementById(section.SectionName) as HTMLElement;
    //******************* Process SectionAttributes *******************  */
    section.SectionAttributes.forEach(sectionAttribute => {
      // show select box data automatically in  edit time
      this.populateSectionAttributesInterim(currentForm, sectionAttribute, parentControl, section, model, bindEvents);
    });

    /***************** Process SubSections ***************************** */
    section.SubSections.forEach(section => {
      /******** RECURSION TO PROCESS SUB SECTION WITHIN THE SECTIONS ***********************/
      currentForm_temp.processSection(currentForm, section, model, utilityService, bindEvents);
    });
  }
  /***************show select box data automatically in  edit time***********************************/
  populateSectionAttributesInterim(currentForm: DynamicFormReportsComponent, sectionAttribute: SectionAttribute, parentControl: HTMLElement, section: Section, inputModel: any, bindEvents?: boolean) {
    let currentcontrolValue = 0;
    let input_temp_model: any;
    let currentForm_temp = currentForm == null ? this : currentForm;
    input_temp_model = inputModel;
    let moduleName = this.moduleName
    /********** We are finding the value only when its not a bind event, i.e its starting point when we need to populate data */
    if (section.SectionTypeName != 'object' && section.SectionTypeName != undefined && inputModel != null && sectionAttribute.ModelPropName != null) {
      currentcontrolValue = inputModel[sectionAttribute.ModelPropName];
    }
    else if (sectionAttribute.ControlType == 'select' || sectionAttribute.ControlType == 'selectMultiple') {
      if (section.SectionTypeName != null && section.SectionTypeName == 'object' && section.ModelObjectName != null && inputModel != null) {
        currentcontrolValue = inputModel[section.ModelObjectName][sectionAttribute.ModelPropName];

        /*---------------------- In this case its evaluating the mdel from the object inside------------------- */
        input_temp_model = inputModel[section.ModelObjectName];
      }
    }
    else if ((sectionAttribute.ControlType == 'select' || sectionAttribute.ControlType == 'selectMultiple') && !bindEvents) {
      if (section.SectionTypeName != null && section.SectionTypeName == 'object' && section.ModelObjectName != null && inputModel != null) {
        currentcontrolValue = inputModel[section.ModelObjectName][sectionAttribute.ModelPropName];
        /************ In this case its evaluating the mdel from the object inside */
        input_temp_model = inputModel[section.ModelObjectName];
      }
      else if (inputModel != null) {
        //Assigning the default value
        currentcontrolValue = inputModel[sectionAttribute.ModelPropName];
        currentcontrolValue = sectionAttribute.ModelPropName != null &&
          (sectionAttribute.ControlType == 'select' || sectionAttribute.ControlType == 'selectMultiple')
          ? inputModel[sectionAttribute.ModelPropName] : null;
      }
    }

    currentForm_temp.processSectionAttributes(currentForm, sectionAttribute, section, input_temp_model, parentControl, currentcontrolValue, bindEvents);
  }

  processSectionAttributes(currentForm: DynamicFormReportsComponent, sectionAttribute: SectionAttribute, section: Section, inputModel: any, parentControl?: HTMLElement, selectedValue?: any,
    isBindEvents?: boolean) {

    let currentForm_temp = currentForm == null ? this : currentForm;
    /*-----------------------------We are binding the events for button type as this is REPORT MODULE-----------------*/
    let moduleName = this.moduleName
    if ((isBindEvents != null && isBindEvents) || sectionAttribute.ControlType == "button") {
      /*------------------Binding the Events for given Section Attributes*/
      currentForm_temp.bindEvents(currentForm, sectionAttribute, parentControl, selectedValue, inputModel);
    }
    /******** INITIAL DATA POPULATION FOR 'SELECT' & OTHER CONTROLS WHICH NEEDS TO GET DATA FROM API ***********************/
    if (sectionAttribute.EndPoint != null && (sectionAttribute.ControlType == 'select' || sectionAttribute.ControlType == 'selectMultiple')) {
      let selectControl = document.getElementById(sectionAttribute.ControlName) as HTMLSelectElement;
      let module_temp = sectionAttribute.EndPoint.ModuleName != null ? sectionAttribute.EndPoint.ModuleName : moduleName;
      if (sectionAttribute.EndPoint.EndpointAddress != null) {
        let url = this.utilityService.getApiUrl(module_temp) + sectionAttribute.EndPoint.EndpointAddress;
        this.populateDropdown(selectControl, null, url, sectionAttribute.EndPoint, selectedValue, sectionAttribute.Events, inputModel);
      }
    };
  }
  /* --------------------------------   Validation check customly -------------------------------------*/
  processValidation(currentForm: DynamicFormReportsComponent, section: Section) {
    //  this.validationErrors = [];
    // let message_temp = '';
    let currentForm_temp = currentForm == null ? this : currentForm;
    section.SectionAttributes.forEach(sectionAttribute => {
      let elems_temp = [];
      let isCollection = false;
      if (section.ModelCollectionName != null) {
        let elems_temp1 = document.getElementsByClassName(sectionAttribute.ControlName);
        for (let i = 0; i < elems_temp1.length; i++) {
          elems_temp.push(elems_temp1[i]);
        }
        isCollection = true;
      }
      else {
        let elem = document.getElementById(sectionAttribute.ControlName); //as HTMLInputElement;
        elems_temp.push(elem);
        isCollection = false;
      }
      let iCount = 0;
      elems_temp.forEach(elem_temp1 => {
        switch (sectionAttribute.ControlType) { // validation for control type text,tblText,textArea
          case "text":
          case "textarea":
          case "tbltext":
            let elem_temp2 = elem_temp1 as HTMLInputElement;
            if (elem_temp2 != null) {
              sectionAttribute.Validators.forEach(validator => {
                let msg = (section.ModelCollectionName == null) ? sectionAttribute.LabelName + ' is required' + (isCollection) ? sectionAttribute.LabelName + ' is required' + '' : '' : sectionAttribute.LabelName + ' is required' + (isCollection) ? sectionAttribute.LabelName + ' is required' + (' at position :' + iCount) : '';

                if (validator.Maxlength < elem_temp2.value.length || validator.Minlength > elem_temp2.value.length) {
                  if (validator != null) {
                    if (validator.Required == true) {
                      if (!currentForm_temp.validationErrors.includes(msg)) {
                        currentForm_temp.validationErrors.push(msg);
                      }
                    }
                  }
                }

              });
            }
            break;


          case "email":  // validation for control type email
            let elem_temp4 = elem_temp1 as HTMLInputElement;
            if (elem_temp4 != null) {
              sectionAttribute.Validators.forEach(validator => {
                let msg = (section.ModelCollectionName == null) ? sectionAttribute.LabelName + ' is required' + (isCollection) ? sectionAttribute.LabelName + ' is required' + '' : '' : sectionAttribute.LabelName + ' is required' + (isCollection) ? sectionAttribute.LabelName + ' is required' + (' at position :' + iCount) : '';

                if (validator.Maxlength <= elem_temp4.value.length || validator.Minlength > elem_temp4.value.length) {

                  if (validator.Required == true) {
                    if (!currentForm_temp.validationErrors.includes(msg)) {
                      currentForm_temp.validationErrors.push(msg);
                    }
                  }
                } else {
                  let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                  let emailData = "";
                  if (reg.test(elem_temp4.value) == false) {
                    emailData = 'Please enter valid ' + sectionAttribute.LabelName;
                    if (!currentForm_temp.validationErrors.includes(emailData)) {
                      currentForm_temp.validationErrors.push(emailData);
                    }
                  }
                }

              });
            }
            break;
          case "select":   // validation for control type select,tblSelect
          case "tblselect":
            let elem_temp_select = elem_temp1 as HTMLSelectElement;
            let value = (elem_temp_select.options != null && elem_temp_select.options.length > 0) ? elem_temp_select.options[elem_temp_select.selectedIndex].value : "0";
            sectionAttribute.Validators.forEach(validator => {
              if (value == "0" && validator.Required == true) {
                let msg = (section.ModelCollectionName == null) ? sectionAttribute.LabelName + ' is required' + (isCollection) ? sectionAttribute.LabelName + ' is required' + '' : '' : sectionAttribute.LabelName + ' is required' + (isCollection) ? sectionAttribute.LabelName + ' is required' + (' at position :' + iCount) : '';

                //add to the validationArray;
                if (validator.Required == true) {
                  if (!currentForm_temp.validationErrors.includes(msg)) {
                    currentForm_temp.validationErrors.push(msg);
                  }
                }
              }
            });
            break;

          case "date":  // validation for control type date,tblDate
          case "tbldate":
            let elem = elem_temp1 as HTMLInputElement;
            let dateRange = elem != null ? elem.value : "";
            sectionAttribute.Validators.forEach(validator => {
              if (dateRange == "" && validator.Required == true) {
                let msg = (section.ModelCollectionName == null) ? sectionAttribute.LabelName + ' is required' + (isCollection) ? sectionAttribute.LabelName + ' is required' + '' : '' : sectionAttribute.LabelName + ' is required' + (isCollection) ? sectionAttribute.LabelName + ' is required' + (' at position :' + iCount) : '';
                if (validator.Required == true) {
                  if (!currentForm_temp.validationErrors.includes(msg)) {
                    currentForm_temp.validationErrors.push(msg);
                  }
                }
              } else {
                if (validator.DateValidators != null) {
                  validator.DateValidators.forEach(dateValidator => {
                    let controlRef = dateValidator.affectedControl != null ? document.getElementById(dateValidator.affectedControl) as HTMLInputElement : null;
                    if (controlRef != null) {
                      if (dateValidator.rule != null) {
                        let val_temp = currentForm_temp.compareDates(dateRange, controlRef.value, dateValidator.msg, dateValidator.rule, iCount);
                        if (val_temp != "") {
                          if (!currentForm_temp.validationErrors.includes(val_temp)) {
                            currentForm_temp.validationErrors.push(val_temp);
                          }
                        }
                      }
                    }
                  });
                }
              }
            });
        }
        iCount++;
      });
    });

    //Looping the sub sections 
    section.SubSections.forEach(section_temp => {
      this.processValidation(currentForm_temp, section_temp);
    })
  }
  /*------------------compare start Date and endDate validations---------------------------------------------------*/
  compareDates(leftValue: string, rightValue: string, dateMsg: string, operationInString: string, position: number) {
    let dateValue: Boolean
    let msg = "";
    switch (operationInString) {
      case ">=":
        dateValue = Date.parse(leftValue) >= Date.parse(rightValue);
        if (dateValue == false) {
          msg = dateMsg;
        }
        break;
      case "<=":
        dateValue = Date.parse(leftValue) <= Date.parse(rightValue);
        if (dateValue == false) {
          msg = dateMsg;
        }
        break;
    }
    return msg;
  }
  populateBaseUrl(currentForm: DynamicFormReportsComponent) {
    this.reportService.records = [];
    this.reportService.columns = [];
    let currentForm_temp = currentForm == null ? this : currentForm;
    let msg1 = '';

    /*<------------------------------validation   MSG show in Toatsr--------------------------------->*/
    if (currentForm_temp.validationErrors.length > 0) {
      currentForm_temp.validationErrors.forEach(item => {
        msg1 += '<br/>' + item + '<br/>'
      });
      currentForm_temp.toastr.error(msg1, 'Validation Error', { timeOut: 2000, progressBar: true, enableHtml: true });
      this.validationErrors = [];
      return
    }

    if (currentForm_temp.validationErrors.length == 0) {
      let url = '';
      let baseUrl: any;
      let values = Object.values(currentForm_temp.reportInput); // GIVES VALUES OF  getReportData JOSN LIST

      //LOOPING OF VALUES
      values.forEach(value => {
        url += value + '/';
      });
      if(this.splittedStringV == "samplereport"){
        url +="2021-07-01/2021-07-16/"
     }
      // MERGE URL PAGE SIZR AND CURRENT PAGE   
      url += currentForm_temp.pageInfo1.pagesize;
      url += '/' + currentForm_temp.pageInfo1.currentPage;
      baseUrl = currentForm_temp.utilityService.getApiUrl(currentForm_temp.moduleName) + currentForm_temp.btnEvent.EndPoint.EndpointAddress + "/" + url;
      /*-----------------------------------populate GridData--------------------------------------*/
      currentForm_temp.reportService.populateGridDataPagewise(baseUrl, currentForm_temp.dataTemplateList, currentForm_temp.pageInfo1);
      this.pageInfo1 = currentForm_temp.pageInfo1;
    }
  }

  populateExcelBaseUrl(currentForm: DynamicFormReportsComponent) {
    this.reportService.records = [];
    this.reportService.columns = [];
    let currentForm_temp = currentForm == null ? this : currentForm;
    let msg1 = '';

    /*<------------------------------validation   MSG show in Toatsr--------------------------------->*/
    if (currentForm_temp.validationErrors.length > 0) {
      currentForm_temp.validationErrors.forEach(item => {
        msg1 += '<br/>' + item + '<br/>'
      });
      currentForm_temp.toastr.error(msg1, 'Validation Error', { timeOut: 2000, progressBar: true, enableHtml: true });
      this.validationErrors = [];
      return
    }

    if (currentForm_temp.validationErrors.length == 0) {
      let url = '';
      let baseUrl: any;
      let values = Object.values(currentForm_temp.reportInput); // GIVES VALUES OF  getReportData JOSN LIST

      //LOOPING OF VALUES
      values.forEach(value => {
        url += value + '/';
      });
      if(this.splittedStringV == "samplereport"){
        url +="2021-07-01/2021-07-16/"
     }
      // MERGE URL PAGE SIZR AND CURRENT PAGE   
      url += currentForm_temp.pageInfo1.pagesize;
      url += '/' + currentForm_temp.pageInfo1.currentPage;
      baseUrl = currentForm_temp.utilityService.getApiUrl(currentForm_temp.moduleName) + currentForm_temp.btnEvent.EndPoint.EndpointAddress + "/" + url;
      /*-----------------------------------populate GridData--------------------------------------*/
      currentForm_temp.reportService.populateExcelData(baseUrl);
      // this.pageInfo1 = currentForm_temp.pageInfo1;
    }
  }
  populateBaseUrlForChart(currentForm: DynamicFormReportsComponent) {
    this.reportService.records = [];
    this.reportService.columns = [];
    let currentForm_temp = currentForm == null ? this : currentForm;
    let msg1 = '';

    /*<------------------------------validation   MSG show in Toatsr--------------------------------->*/
    if (currentForm_temp.validationErrors.length > 0) {
      currentForm_temp.validationErrors.forEach(item => {
        msg1 += '<br/>' + item + '<br/>'
      });
      currentForm_temp.toastr.error(msg1, 'Validation Error', { timeOut: 2000, progressBar: true, enableHtml: true });
      this.validationErrors = [];
      return
    }

    if (currentForm_temp.validationErrors.length == 0) {
      let url = '';
      let baseUrl: any;
      let values = Object.values(currentForm_temp.reportInput); // GIVES VALUES OF  getReportData JOSN LIST

      //LOOPING OF VALUES
      values.forEach(value => {
        url += value + '/';
      });
      // MERGE URL PAGE SIZR AND CURRENT PAGE   
      url += 1000;
      url += '/' + currentForm_temp.pageInfo1.currentPage;
      baseUrl = currentForm_temp.utilityService.getApiUrl(currentForm_temp.moduleName) + currentForm_temp.btnEvent.EndPoint.EndpointAddress + "/" + url;
      /*-----------------------------------populate GridData--------------------------------------*/
      currentForm_temp.reportService.populateGridDataPagewiseForChart(baseUrl, currentForm_temp.dataTemplateList, currentForm_temp.pageInfo1);
      this.pageInfo1 = currentForm_temp.pageInfo1;
    }
  }
  /*<-------------------------------- THIS METHOD USE FOR EVENT BINDING LIKE CLICK,CHANGE AND BLUR EVENT TIME ------------------------->
  <--------------DynamicFormReportsComponent PARAMETER PROVIDES REFERENCE OF ALL METHODS IN DYNAMIC-FORM-REPORTS.COMPONENTS.COMPONENTS.TS FILE --------------------->
  <--------------------------------SectionAttribute PARAMETER PROVIDES LIST OF SECTION ATTRIBUTE DETAILS------------------------------------------------------------->*/
  bindEvents(currentForm: DynamicFormReportsComponent, sectionAttribute: SectionAttribute, parentControl?: HTMLElement, selectedValue?: any, currentModel?: any) {
    let currentForm_temp = currentForm == null ? this : currentForm; //CHECK NULL
    let path = window.location.pathname;
    let splittedValues = path.split('/');
    let splittedString = splittedValues[2].toLowerCase();
    /*-------------------Bind all refresh events----------------------------------*/
    if (sectionAttribute.ControlType == "select" || sectionAttribute.ControlType == "selectMultiple") {
      let refresh_control = document.getElementById("refresh_" + sectionAttribute.ControlName);
      if (refresh_control != null) {
        refresh_control.addEventListener('click', function () {
          if (sectionAttribute.EndPoint != null) {
            let module_temp = sectionAttribute.EndPoint.ModuleName != null ? sectionAttribute.EndPoint.ModuleName : currentForm_temp.moduleName;
            let endpoint = currentForm_temp.utilityService.getApiUrl(module_temp) + sectionAttribute.EndPoint.EndpointAddress;
            let dependentControl = document.getElementById(sectionAttribute.ControlName) as HTMLSelectElement;
            currentForm_temp.populateDropdown(dependentControl, null, endpoint, sectionAttribute.EndPoint, selectedValue, null, currentModel);
          }
        });
      }
    }
    /*------------------------------------Looping sectionAttribute GET EVENT DETAILS ----------------------------*/
    sectionAttribute.Events.forEach(
      event => {
        let contextualItemsWithClass = (parentControl != null) ? parentControl.getElementsByClassName(sectionAttribute.ControlName) : null;
        let contextualControl = ((parentControl != null && contextualItemsWithClass.length > 0) ? contextualItemsWithClass[0] : document.getElementById(sectionAttribute.ControlName)) as HTMLElement;

        /*-------------------------------    THIS SWITCH CASE USE FOR EVENT BINDING ---------------------------------*/
        switch (event.EventName) {
          // EVENT HIT IN CLICK TIME
          case "onclick": {
            event.Behaviour = event.Behaviour == null ? 'Normal' : event.Behaviour;

            if (contextualControl != null) {
              switch (event.Behaviour) {  //THIS SWITCH CASE USE FOR EVENT BINDING IN REPORT BEHAVOIUR TIME (NORMAL,REPORT,ReportSendDataChecked)
                case "Normal":   //EVENT HIT IN BEHAVIOUR "NORMAL" TIME
                  {
                    contextualControl.addEventListener('click', function () {
                      if (sectionAttribute.RouteEntry != null) {
                      }
                    });
                  }
                  break;
                case "Report": { //EVENT HIT IN BEHAVIOUR "Report" TIME
                  contextualControl.addEventListener('click', function () {
                    let model2 = {};
                    let inputs = event.ReportInputs;
                    currentForm_temp.processReports(currentForm_temp, inputs, (event.EndPoint != null) ? event.EndPoint.EndpointAddress : '', currentForm_temp.pageName1);
                    currentForm_temp.getReportData(currentForm_temp, model2, sectionAttribute);  //getReportData() METHOD PROVIDES GETREPORTDATA JSON LIST
                    currentForm_temp.reportInput = model2;
                    currentForm_temp.btnEvent = event;
                    currentForm_temp.dataTemplateList = currentForm_temp.formData.Sections[0].DataTemplates
                    currentForm_temp.formData.Sections.forEach(
                      section => {
                        currentForm_temp.processValidation(currentForm_temp, section);
                      });
                    currentForm_temp.populateBaseUrl(currentForm_temp);
                  });

                }
                  break;

                case "Export": { //EVENT HIT IN BEHAVIOUR "Report" TIME
                  contextualControl.addEventListener('click', function () {
                    let model2 = {};
                    let inputs = event.ReportInputs;
                    currentForm_temp.processReports(currentForm_temp, inputs, (event.EndPoint != null) ? event.EndPoint.EndpointAddress : '', currentForm_temp.pageName1);
                    currentForm_temp.getReportData(currentForm_temp, model2, sectionAttribute);  //getReportData() METHOD PROVIDES GETREPORTDATA JSON LIST
                    currentForm_temp.reportInput = model2;
                    currentForm_temp.btnEvent = event;
                    currentForm_temp.dataTemplateList = currentForm_temp.formData.Sections[0].DataTemplates
                    currentForm_temp.formData.Sections.forEach(
                      section => {
                        currentForm_temp.processValidation(currentForm_temp, section);
                      });
                    currentForm_temp.populateExcelBaseUrl(currentForm_temp);
                  });

                }
                  break;
                case "ReportSendDataChecked": {   //EVENT HIT IN BEHAVIOUR "Report" TIME
                  /*----Here u will pick all data from grid which are checked and based on ReportOutputColumns 
                  create array of object to send (mostly POST) ---------------*/
                  contextualControl.addEventListener('click', function () {
                    //Call a resuable method
                    document.getElementById('reportTable') as HTMLTableElement;
                    let collection = [];
                    $(function () {
                      let headers = [];
                      $("table.edit-table thead th").each(function () {
                        let totalClass = $(this)[0].className;
                        let getClass = totalClass.split(' ');
                        let column = getClass[0]; // HEADER COLUMN 
                        headers.push(column.replace(/ /g, ""));
                      });
                      /*set Report table data with controller*/
                      $("#reportTable tr").each(function () {
                        let tr = $(this)[0]; // HEADER COLUMN 
                        let iIndex = 0;
                        let obj = {};
                        headers.forEach(header => {
                          let dataTemplate_found_result = currentForm_temp.formData.Sections[0].DataTemplates.filter(item => item.ColumnName == header);
                          if (dataTemplate_found_result != null) {
                            let firstOfdataTemplate_found_result = dataTemplate_found_result[0];
                            let item = $(tr).find('.' + header);
                            let item1 = item.length > 1 ? item[1] : item[0];
                            if (firstOfdataTemplate_found_result.ColumnType != null) {
                              switch (firstOfdataTemplate_found_result.ColumnType) {
                                case "hidden":
                                  obj[header] = currentForm_temp.getObjectTypeCastedData($(item1).find('input').val(), null, firstOfdataTemplate_found_result.DataType);
                                  break;

                                case "checkbox":
                                  obj[header] = currentForm_temp.getObjectTypeCastedData($(item1).prop('checked'), null, firstOfdataTemplate_found_result.DataType);
                                  break;

                                case "selectbox":
                                  obj[header] = currentForm_temp.getObjectTypeCastedData($(item1).val(), null, firstOfdataTemplate_found_result.DataType);
                                  break;

                                case "date":

                                  let date = currentForm_temp.getObjectTypeCastedData($(item1).val(), null, firstOfdataTemplate_found_result.DataType);
                                  obj[header] = date; // new Date(date);
                                  break;

                                case "span":
                                case "hyperlink":

                                  obj[header] = currentForm_temp.getObjectTypeCastedData($(item1).html(), null, firstOfdataTemplate_found_result.DataType);
                                  break;

                                default:
                                  break;
                              }
                            }
                          }
                          iIndex++;
                        });
                        collection.push(obj);
                      });
                      let requestModel = {
                        DataCollection: collection
                      };
                      let postUrl = "";
                      let reportData = JSON.stringify(currentForm_temp.reportInput);

                      let headerValues_temp = [];
                      headerValues_temp.push({
                        Key: "ReportInput",
                        Value: reportData
                      });
                      var x = confirm("Are you sure you want to Submit"); // submit report Data
                      if (x) {
                        postUrl = currentForm_temp.utilityService.getApiUrl(currentForm_temp.module) + event.EndPoint.EndpointAddress
                        currentForm_temp.utilityService.postDataToService(postUrl, requestModel, headerValues_temp).subscribe(data => {
                          $(modalLoader()).hide();
                          if (data.DataCollection[0] == true) {
                            currentForm_temp.toastr.success('Data Submitted Successfully', 'Success',
                              { timeOut: 2000 });
                          } else {
                            currentForm_temp.toastr.error('Data Submission error', 'Error',
                              { timeOut: 2000 });
                          }
                        }, (error) => {
                          error.Messages
                          if (error.status == 500) {
                            currentForm_temp.toastr.error(error.message, 'Error',
                              { timeOut: 2000 });
                          } else if (error.status == 401) {
                            currentForm_temp.toastr.warning('Un-authorized', 'Warning',
                              { timeOut: 2000 });
                          } else if (error.status == 404) {
                            currentForm_temp.toastr.warning('No Records', 'Warning',
                              { timeOut: 2000 });
                          } else if (error.status == 400 || error.status == 409) {
                            currentForm_temp.toastr.warning(error.message, 'Warning',
                              { timeOut: 2000 });
                          }
                          throw error;
                        });
                      }
                    });
                  });

                }
                  break;
                case "TableAddNewRow":
                  /*TODO: add new Row based on 'SectionAttributes' saved within 'template' in 'Header'  */
                  contextualControl.addEventListener('click', function () {
                    /*ADD a NEW ROW TO THE MODEL
                    TODO: find a way to access the model which is a page level variable*/
                    let affectedTableControl = document.getElementById(event.affectedControlName) as HTMLTableElement;
                    /*TODO: we need to put checks for null*/
                    let sectionTemp: any;
                    sectionTemp = null;

                    if (affectedTableControl.tHead.getElementsByTagName('div').length > 0) {
                      let sectionDetails = affectedTableControl.tHead.getElementsByTagName('div')[0].innerText;
                      sectionTemp = JSON.parse(sectionDetails) as Section;
                    }
                  });

                  break;
                case "TableDeleteCurrentRow":
                  /*CURRENTLY THIS IS BEING HANDLED VIA STATIC METHOD, BASED ON PARAM PASSED as UUID*/
                  contextualControl.addEventListener('click', () => this.deleteCurrentTableRow(contextualControl, parentControl));
                  break;

                case "ReportChart":
                  /*TODO: add new Row based on 'SectionAttributes' saved within 'template' in 'Header'  */
                  contextualControl.addEventListener('click', function () {
                    var modal = document.getElementById("chart-modal");
                    modal.style.display = "block";
                    var span = document.getElementById("chart-close");
                    span.onclick = function () {
                      modal.style.display = "none";
                    }

                    let model2 = {};
                    let inputs = event.ReportInputs;
                    currentForm_temp.processReports(currentForm_temp, inputs, (event.EndPoint != null) ? event.EndPoint.EndpointAddress : '', currentForm_temp.pageName1);
                    currentForm_temp.getReportData(currentForm_temp, model2, sectionAttribute);  //getReportData() METHOD PROVIDES GETREPORTDATA JSON LIST
                    currentForm_temp.reportInput = model2;
                    currentForm_temp.btnEvent = event;
                    currentForm_temp.dataTemplateList = currentForm_temp.formData.Sections[0].DataTemplates
                    currentForm_temp.formData.Sections.forEach(
                      section => {
                        currentForm_temp.processValidation(currentForm_temp, section);
                      });
                    currentForm_temp.populateBaseUrlForChart(currentForm_temp);








                    // var reportData = JSON.parse(sessionStorage.getItem("IOTReportData"));



                  });
                  break;
              }

            }
          }
            break;
          case 'onchange': {  //EVENT HIT onchange TIME
            if (contextualControl != null) {
              contextualControl.addEventListener('change', function () {
                let select = contextualControl as HTMLSelectElement;

                if (sectionAttribute.ControlType == 'selectMultiple') {
                  let elem = document.getElementById(sectionAttribute.ControlName) as HTMLSelectElement;
                  let str = '';
                  let positiveCounter = 0;
                  for (let i = 0; i < elem.options.length; i++) {
                    if (elem.options[i].selected && elem.options[i].text.toLowerCase() != 'select') {
                      if (positiveCounter > 0) {
                        str += ',';
                      }
                      str += elem.options[i].value;
                      positiveCounter++;
                    }
                  }
                }
                /*For states like of dropdown u need to evaluate the countryid for {keyid} if {keyid} 
                is null pls remove that header */
                if (event.EndPoint != null) {
                  let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : currentForm_temp.moduleName;
                  let endpoint = currentForm_temp.utilityService.getApiUrl(module_temp) + event.EndPoint.EndpointAddress.replace('{keyId}', select.value);
                  let dependentControl = document.getElementById(event.affectedControlName) as HTMLSelectElement;
                  if (dependentControl != null && (select.value != "0")) {
                    currentForm_temp.populateDropdown(dependentControl, null, endpoint, event.EndPoint, selectedValue, null, currentModel);
                  }
                }
              });
            }
          }
            break;
          case "onblur": { //EVENT HIT onblur TIME
            if (contextualControl != null) {
              contextualControl.addEventListener('blur', function () {
              })
            }
          }
            break;
          default: {

          }
        }
      });
  }
  /*------------------------------------------ GET DROPDOWN VALUE--------------------------------------------------------------*/
  populateDropdown(x: HTMLElement, event: Event1, endpointUrl: string, endpoint: Endpoint, utilityService?: UtilityService,
    selectedValue?: any, arrayofDependentEvents?: Array<Event1>, currentModel?: any, parentElement?: HTMLElement) {

    let select = x as HTMLSelectElement;
    /*--------------------------Try to evvaluate the values from the current model --------------------------------------*/
    if (selectedValue == null) {
      selectedValue = (event != null && event.affectedControlModelName != null && currentModel != null) ?
        currentModel[event.affectedControlModelName] : 0;
    }
    /*------------------------THIS WILL EXECUTE ON INITIAL LOAD WHEN THERE IS NO EVENT-----------------------------*/
    if (event == null) {
      this.getDataForDropdownForChildGrid(endpointUrl, select.id, select,
        endpoint, selectedValue, arrayofDependentEvents, currentModel, parentElement);
    }
    else {

      if (endpointUrl != null) {
        this.getDataForDropdownForChildGrid(endpointUrl, event.affectedControlName, null,
          endpoint, selectedValue, arrayofDependentEvents, currentModel, parentElement);
      }
    }
  }

  getDataForDropdownForChildGrid(url: string, controlId: string, x: HTMLElement, endpoint: Endpoint,
    selectedValue?: any, arrayofDependentEvents?: Array<Event1>, currentModel?: any, parentElement?: HTMLElement) {
    let options = [];
    let moduleName = this.moduleName
    let arrayOfColumnString: Array<ColumnString>;
    arrayOfColumnString = new Array<ColumnString>();

    if (endpoint != null && endpoint.Headers != null) {

      endpoint.Headers.forEach(item => {
        arrayOfColumnString.push({
          Key: item.KeyName,
          Value: item.ValueName

        })
      });
    }

    //Clear the Dropdown & prepare for new Data
    let control: HTMLElement;

    /********** Where we are using parent element to find the element by class name, which is the case of controls within the grid, where every row is passed
     as parentReference */

    if (parentElement != null) {
      let elements = parentElement.getElementsByClassName(controlId);
      if (elements.length > 0) {
        control = (x == null) ? elements[0] as HTMLElement : x;
      }
    }
    else {
      control = (x == null) ? document.getElementById(controlId) as HTMLElement : x;
    }
    let responseDataTemp1_1 = this.utilityService.getDataFormService(url, arrayOfColumnString);

    responseDataTemp1_1.subscribe((data) => {
      if (control != null) {
        var affectedControl1 = control as HTMLSelectElement;
        /******** Removing the options ************* */
        if (affectedControl1 != null) {
          let length = affectedControl1.options.length;
          affectedControl1.options.length = 0;
          for (let i = length - 1; i >= 0; i--) {
            affectedControl1.options[i] = null;
          }
        }

        let dataCollection = data as Array<any>;
        let splittedValues = (typeof selectedValue == "string") ? selectedValue.split(',') : [];

        dataCollection.forEach(item => {

          let option1 = document.createElement('option') as HTMLOptionElement;
          option1.value = item.Key;
          option1.text = item.Value;
          /***************************check if its comma separated ids *****/

          if (splittedValues.includes(item.Key)) {
            option1.selected = true;
          }
          else {
            if (item.Key == selectedValue) {
              option1.selected = true;
            }
          }

          if (selectedValue != null) {

            if (splittedValues.length == 0 && selectedValue == item.Key) {
              option1.selected = true;

              //do bubbling
              if (selectedValue != 0) {
                /*Call the populate dropdown for the child elements*/
                if (arrayofDependentEvents != null && arrayofDependentEvents.length > 0) {
                  arrayofDependentEvents.forEach(event => {
                    let control_child = document.getElementById(event.affectedControlName) as HTMLSelectElement;
                    let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : moduleName;
                    let url_temp = event.EndPoint.EndpointAddress;
                    /*Scan the event to find array of 'ParamValueReferences'*/
                    if (event.ParamValueReferences != null) {
                      event.ParamValueReferences.forEach(paramValue => {
                        let ref_child_temp = document.getElementById(paramValue.ControlName) as HTMLSelectElement;
                        let keyIdToReplace = paramValue.Key;
                        if (ref_child_temp != null) {
                          let selectedItem = ref_child_temp.options[ref_child_temp.selectedIndex];
                          let valueToReplace = (paramValue.Value == "Value") ? selectedItem.value : selectedItem.text;
                          url_temp = url_temp.replace(keyIdToReplace, valueToReplace);
                        }
                      });
                    }
                    //BUILDING THE COMPLETE URL 
                    if (url_temp.includes('{keyId}')) {
                      url_temp = url_temp.replace('{keyId}', selectedValue);
                      url_temp = this.utilityService.getApiUrl(module_temp) + url_temp;
                    }
                    else {
                      url_temp = this.utilityService.getApiUrl(module_temp);
                    }

                    let seletedValueForDependentControl = event.affectedControlModelName != null && currentModel != null ?
                      currentModel[event.affectedControlModelName] : 0;
                    this.populateDropdown(control_child, event, url_temp, event.EndPoint, seletedValueForDependentControl, currentModel);
                  });
                }
                let event1 = new Event("change", { bubbles: true });
                affectedControl1.dispatchEvent(event1);
              }
            }
            else if (splittedValues.length > 0) {

            }
          }
          affectedControl1.options.add(option1);
        });
      }
    });
  }

  /*-----------------------------------DELETE ADD/EDIT TABLE DATA -------------------------------*/
  deleteCurrentTableRow(deleteElement: HTMLElement, parentControlRow?: HTMLElement) {
    if (parentControlRow != null) {
      let row = parentControlRow as HTMLTableRowElement;
      row.remove();
    }
  }

  getValuefromKeyValue(currentObject: any, keys: Array<string>, keyValues: Array<CustomKeyValueString>, valueName: string): string {

    let selectedKeyValues = keyValues.filter(t => t.Value == valueName);
    let temp_value = '';
    if (selectedKeyValues.length > 0) {
      temp_value = (keys.length == 0 || valueName == null) ? '' : Object.values(currentObject)[selectedKeyValues[0].Key].toString();
    }
    return temp_value;
  }

  /*--------------------------- Its populated covert typeof()  ----------------------------------------------*/
  getObjectTypeCastedData(input: any, sectionAttribute: SectionAttribute, dataType?: string) {
    let output: any;
    let typeTosearch = (dataType != null) ? dataType : sectionAttribute.ModelPropType;
    if (input != null) {
      switch (typeTosearch) {
        case "string":

          output = input.toString();
          break;
        case "number":
          if (typeof input === 'string') {
            output = Number(input); // parseInt(input.toString());
          }
          else {
            output = 0;
          }
          break;
        case "float":
          if (typeof input === 'number') {
            output = Number(input); //() parseFloat(input.toString());
          }
          else {
            output = 0;
          }
          break;

        case "date":
          if (Object.prototype.toString.call(input) === "[object String]") {
            output = input;
          }
          else {
            output = null;
          }
          break;
        case "boolean":
          let str: string;
          str = input.toString();
          output = str.toLocaleLowerCase() == "true" ? true : false;
          break;
        default:
          output = input.toString();
          break;
      }

      return output;
    }
  }

  processReports(currentForm: DynamicFormReportsComponent, reportInputs: Array<ReportInput>, apiUrl: string, pageName1: string) {

    this.pageInfo1 = currentForm.pageInfo1;
    let currentForm_temp = currentForm == null ? this : currentForm;
    let reportTable = document.getElementById('reportTable');
  }
  /* -----------------------------Print PopUpData -------------------------------*/
  printRecord() {
    var divToPrint = document.getElementById("currentDiv");
    let newWin = window.open("");
    newWin.document.write(divToPrint.outerHTML);
    newWin.print();
    newWin.close();
  }

  getFilterEvent(section: Section): Array<Event1> {
    let events: Array<Event1>;
    let selectedDataTemplates = section.SectionAttributes.filter(t => t.ControlName == "btnPopulateTable");
    if (selectedDataTemplates != null && selectedDataTemplates.length > 0) {
      events = selectedDataTemplates[0].Events;
    }

    /***************** Process SubSections ***************************** */
    section.SubSections.forEach(section => {
      /******** RECURSION TO PROCESS SUB SECTION WITHIN THE SECTIONS **************/
      this.getFilterEvent(section);
    });
    return events;
  }
  /*----------------- This Method Gives GETREPORT(All Conttollers) DATA IN JSON FORMAT-----------------------------------------------------*/
  getReportData(currentForm: DynamicFormReportsComponent, modelTemp1: any, sectionAttribute: SectionAttribute) {
    modelTemp1 = modelTemp1 == null ? {} : modelTemp1;

    let currentForm_temp = currentForm == null ? this : currentForm;
    sectionAttribute.Events.forEach(
      event => {
        event.ReportInputs.forEach(
          reportInput => {

            switch (reportInput.ControlType) {
              // TEXTBOX ADD/EDIT FORM DATA
              case "text": {
                let elem = document.getElementById(reportInput.ControlName) as HTMLInputElement;
                if (elem != null) {
                  if (reportInput.ModelName == "SearchString") {
                    let rawData = (elem.value == "" ? '-' : elem.value);
                    let processedModelData = currentForm_temp.getObjectTypeCastedData(rawData, sectionAttribute);
                    modelTemp1[reportInput.ModelName] = processedModelData;
                  }
                  else {
                    let rawData = elem.value;
                    let processedModelData = currentForm_temp.getObjectTypeCastedData(rawData, sectionAttribute);
                    modelTemp1[reportInput.ModelName] = processedModelData;
                  }
                }
              }
                break;

              case "checkbox": {
                let elem = document.getElementById(reportInput.ControlName) as HTMLInputElement;
                if (elem != null) {
                  let rawData = elem.checked;
                  let processedModelData = currentForm_temp.getObjectTypeCastedData(rawData, sectionAttribute);
                  modelTemp1[reportInput.ModelName] = processedModelData;
                }
              }
                break;

              case "number": {
                let elem = document.getElementById(reportInput.ControlName) as HTMLInputElement;
                if (elem != null) {
                  let rawData = elem.value;
                  let processedModelData = currentForm_temp.getObjectTypeCastedData(rawData, sectionAttribute);
                  modelTemp1[reportInput.ModelName] = processedModelData;

                }
              }
                break;
              case "hidden": {
                if (sectionAttribute.ControlName == "hiddenEntitystate") {

                  let elem = document.getElementById("hiddenId") as HTMLInputElement;

                  if (elem != null) {

                    if (elem.value == "0") {
                      let rawData = "1";
                      let processedModelData = currentForm_temp.getObjectTypeCastedData(rawData, sectionAttribute);

                      modelTemp1[reportInput.ModelName] = processedModelData;
                    } else {
                      let rawData = "2";
                      let processedModelData = currentForm_temp.getObjectTypeCastedData(rawData, sectionAttribute);

                      modelTemp1[reportInput.ModelName] = processedModelData;
                    }
                  }

                } else {
                  let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                  if (elem != null) {
                    let rawData = elem.value;
                    let processedModelData = currentForm_temp.getObjectTypeCastedData(rawData, sectionAttribute);

                    modelTemp1[reportInput.ModelName] = processedModelData;
                  }
                }
              }
                break;

              case "typoselect": {
                let elem = document.getElementById(reportInput.ControlName) as HTMLInputElement;
                if (elem != null) {
                  let rawData = elem.getAttribute('tag');
                  let processedModelData = currentForm_temp.getObjectTypeCastedData(rawData, sectionAttribute);
                  modelTemp1[reportInput.ModelName] = processedModelData;

                }
              }
                break;

              case "typomultiselect": {
                let elem = document.getElementById(reportInput.ControlName) as HTMLSelectElement;
                let str = '';
                let positiveCounter = 0;
                if (elem != null) {
                  let div_temp = $(elem).parent().find('.divContainer');
                  let nodes = $(div_temp).find('div');
                  for (let i = 0; i < nodes.length; i++) {
                    let div1_tag_value = nodes[i].getAttribute('tag');
                    if (positiveCounter > 0) {
                      str += ',';
                    }
                    str += div1_tag_value;
                    positiveCounter++;
                  }
                }
                modelTemp1[reportInput.ModelName] = (str == '') ? '0' : str;

              }
                break;
              case "select": {
                let elem = document.getElementById(reportInput.ControlName) as HTMLSelectElement;
                if (elem != null && elem.options.length > 0) {
                  let rawData = elem.options[elem.selectedIndex].value;
                  let processedModelData = currentForm_temp.getObjectTypeCastedData(rawData, sectionAttribute);

                  modelTemp1[reportInput.ModelName] = processedModelData;
                } else {
                  modelTemp1[reportInput.ModelName] = 0;
                }

              }
                break;
              case "selectMultiple": {
                let elem = document.getElementById(reportInput.ControlName) as HTMLSelectElement;
                let str = '';
                let positiveCounter = 0;
                for (let i = 0; i < elem.options.length; i++) {
                  if (elem.options[i].selected && elem.options[i].text.toLowerCase() != 'select') {
                    if (positiveCounter > 0) {
                      str += ',';
                    }
                    str += elem.options[i].value;
                    positiveCounter++;
                  }
                }
                modelTemp1[reportInput.ModelName] = (str == '') ? '0' : str;
              }
                break;
              case "date":
                let elem = document.getElementById(reportInput.ControlName) as HTMLSelectElement;
                let rawData = elem.value;
                let processedModelData = rawData;
                modelTemp1[reportInput.ModelName] = processedModelData;
                break;
            }
            return;
          })
      });
  }

  /*-----------------------Calculate AVG and RSD for print  option ----------------------------------------*/
  calculateAvgAndRsd() {
    $("#InstrumentCalibrationSetTables tr").each(function () {
      let tr = $(this)[0];
      let column = $(tr).children('td');
      if (column != null && column.length > 0) {
        for (let col = 1; col < column.length; col++) {
          let referenceContl = column[col].id.includes('Observed');
          if (referenceContl == true) {
            let tdControlId = column[col].id;
            //Calculate Avg Value

            let splitedValue = tdControlId.split('_');
            let currentRow = splitedValue[2];
            let currentCol = splitedValue[3];

            var patternToCheckNReplace = "td_Observed_{row}_" + currentCol;
            var table_element = document.getElementById("InstrumentCalibrationSetTables") as HTMLTableElement;
            let totalRow = table_element.rows.length - 4;
            let totalValue = 0;
            for (let row_num = 0; row_num < totalRow; row_num++) {
              let currentTd_id_observed = patternToCheckNReplace.replace('{row}', row_num.toString());
              let control_ref = document.getElementById(currentTd_id_observed) as HTMLTableCellElement;

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


            } else {
              conclusionCol.innerText = "Fail";


            }
            // CalculateRSD
            let splitedValue1 = tdControlId.split('_');
            let currentRow1 = splitedValue1[2];
            let currentCol1 = splitedValue1[3];

            var patternToCheckNReplace = "td_Observed_{row}_" + currentCol1;

            var table_element = document.getElementById("InstrumentCalibrationSetTables") as HTMLTableElement;
            let totalRow1 = table_element.rows.length - 4;
            let totalValue1 = 0;
            for (let row_num = 0; row_num < totalRow1; row_num++) {
              let currentTd_id_observed = patternToCheckNReplace.replace('{row}', row_num.toString());
              let control_ref = document.getElementById(currentTd_id_observed);

              let currentControlValue = control_ref.innerText;
              let validCurrentValue = currentControlValue.match(/[\d\.]+/);
              if (validCurrentValue != null) {
                let ObservedWeightValue = parseFloat(validCurrentValue[0]);
                totalValue1 = totalValue1 + ObservedWeightValue;
              }
            }
            let currentColumnInInteger1 = parseInt(currentCol1);
            let columnNumForAvg1 = currentColumnInInteger1; // + (currentColumnInInteger== 1 ? 0: 2);
            let rsdId = "td_Rsd_" + columnNumForAvg1.toString();
            let rsdCol = document.getElementById(rsdId);
            let rsdValue = (totalValue1 * 100) / 1;
            rsdCol.innerText = rsdValue.toString();

            let currentColForAcceptanceCriteria1 = parseInt(currentCol1) + 1;
            let control_id1 = 'td_Acceptance_' + currentRow1.toString() + '_' + currentColForAcceptanceCriteria1.toString();
            let control_ref1 = document.getElementById(control_id1)
            let currentValue1 = control_ref1.innerText;
            let splitedIdValue1 = currentValue1.split("-");
            let currentIdValue11 = parseFloat(splitedIdValue1[0]);
            let currentIdValue21 = parseFloat(splitedIdValue1[1]);


            let currentConclusionColumnInInteger1 = parseInt(currentCol1) + 2;
            let Conclusion_control_id1 = "td_Rsd_" + currentConclusionColumnInInteger1.toString();
            let conclusionCol1 = document.getElementById(Conclusion_control_id1);

            if (rsdValue >= currentIdValue11 && rsdValue <= currentIdValue21) {
              conclusionCol1.innerText = "Pass";


            } else {
              conclusionCol1.innerText = "Fail";


            }

          }
        }
      }

    });
  }
  getReportOutputData(currentForm: DynamicFormReportsComponent, modelTemp1: any, sectionAttribute: SectionAttribute) {
    modelTemp1 = modelTemp1 == null ? {} : modelTemp1;
    let currentForm_temp = currentForm == null ? this : currentForm;
    sectionAttribute.Events.forEach(
      event => {
        event.ReportOutputColumns.forEach(
          reportOutput => {
            switch (reportOutput.ControlType) {
              // TEXTBOX ADD/EDIT FORM DATA
              case "text": {
                let elem = document.getElementById(reportOutput.ControlName) as HTMLInputElement;
                if (elem != null) {
                  let rawData = elem.value;
                  let processedModelData = currentForm_temp.getObjectTypeCastedData(rawData, sectionAttribute);
                  modelTemp1[reportOutput.ModelName] = processedModelData;
                }
              }
                break;

              case "number": {
                let elem = document.getElementById(reportOutput.ControlName) as HTMLInputElement;
                if (elem != null) {
                  let rawData = elem.value;
                  let processedModelData = currentForm_temp.getObjectTypeCastedData(rawData, sectionAttribute);
                  modelTemp1[reportOutput.ModelName] = processedModelData;
                }
              }
                break;

              case "email": {
                let elem = document.getElementById(reportOutput.ControlName) as HTMLInputElement;
                if (elem != null) {
                  let rawData = elem.value;
                  let processedModelData = currentForm_temp.getObjectTypeCastedData(rawData, sectionAttribute);
                  modelTemp1[reportOutput.ModelName] = processedModelData;
                }
              }
                break;
              case "checkbox": {
                let elem = document.getElementById(reportOutput.ControlName) as HTMLInputElement;
                if (elem != null) {
                  let rawData = elem.checked;
                  let processedModelData = currentForm_temp.getObjectTypeCastedData(rawData, sectionAttribute);
                  modelTemp1[reportOutput.ModelName] = processedModelData;
                }
              }
                break;
              case "number": {
                let elem = document.getElementById(reportOutput.ControlName) as HTMLInputElement;
                if (elem != null) {
                  let rawData = elem.value;
                  let processedModelData = currentForm_temp.getObjectTypeCastedData(rawData, sectionAttribute);
                  modelTemp1[reportOutput.ModelName] = processedModelData;
                }
              }
                break;
              case "hidden": {
                if (sectionAttribute.ControlName == "hiddenEntitystate") {
                  let elem = document.getElementById("hiddenId") as HTMLInputElement;
                  if (elem != null) {
                    if (elem.value == "0") {
                      let rawData = "1";
                      let processedModelData = currentForm_temp.getObjectTypeCastedData(rawData, sectionAttribute);
                      modelTemp1[reportOutput.ModelName] = processedModelData;
                    } else {
                      let rawData = "2";
                      let processedModelData = currentForm_temp.getObjectTypeCastedData(rawData, sectionAttribute);
                      modelTemp1[reportOutput.ModelName] = processedModelData;
                    }
                  }

                } else {
                  let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;
                  if (elem != null) {
                    let rawData = elem.value;
                    let processedModelData = currentForm_temp.getObjectTypeCastedData(rawData, sectionAttribute);
                    modelTemp1[reportOutput.ModelName] = processedModelData;
                  }
                }
              }
                break;
              case "select": {
                let elem = document.getElementById(reportOutput.ControlName) as HTMLSelectElement;
                if (elem != null && elem.options.length > 0) {
                  let rawData = elem.options[elem.selectedIndex].value;
                  let processedModelData = currentForm_temp.getObjectTypeCastedData(rawData, sectionAttribute);
                  modelTemp1[reportOutput.ModelName] = processedModelData;
                }
              }
                break;
              case "selectMultiple": {
                let elem = document.getElementById(reportOutput.ControlName) as HTMLSelectElement;
                let str = "";
                if (elem != null && elem.options.length > 0) {
                  for (let i = 0; i < elem.options.length; i++) {
                    if (elem.options[i].selected) {
                      elem.options[i].value + ",";
                    }
                  }
                  if (str.charAt(str.length - 1) == ',') {
                    str = str.substr(0, str.length - 1);
                  }
                  modelTemp1[reportOutput.ModelName] = str;
                }
              }
                break;
              case "datebox":
                let x = 1;
                break;
              case "date":
                let elem = document.getElementById(reportOutput.ControlName) as HTMLSelectElement;
                let rawData = elem.value;
                let processedModelData = rawData;
                modelTemp1[reportOutput.ModelName] = processedModelData;
                break;
            }
            return;
          })
      });
  }


  ngOnDestroy() {
    // if (disconnectConnection != null) {

    let iotDeviceId = localStorage.getItem("iotDeviceId");
    let url = AppConstants.GENERAL.DISCONNECTSOCKETURL + "/" + iotDeviceId;
    disconnectConnection(url, 0);
    // }
  }
}
