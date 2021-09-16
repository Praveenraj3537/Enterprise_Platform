import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InjectorInstance } from '../app.module';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Routes, RouterModule, Router, ActivatedRoute } from '@angular/router';
import { IdService } from './id.service';
import { Form, Section, SectionAttribute, Event, Validator, Scripts, DataTemplate, CustomKeyValueString, GridColumn, ColumnString } from '../shared/interface/form-data-advanced';
import { UtilityService } from './utility.service';
import { TableColumn, TableData, TableRecord } from '../models/tableContent.model';
import * as $ from 'jquery';
import { AuthService } from './auth.service';
import { JsonPipe } from '@angular/common';
import { uniq } from 'underscore';
import {saveAs as importedSaveAs} from "file-saver";
import { AppConstants } from '../constants/AppConstants';
declare var processData: any;
declare var processDataAfterDelay: any;
declare var chartPopulate: any;
@Injectable({
  providedIn: 'root'
})
export class ReportService {

  responseData: any;
  tableContentHeaders: Array<TableColumn>;
  tableContents: Array<TableData>;
  tableContents1: Array<any>;
  headerToPublish: Array<string>;
  columns: Array<string>;
  public records: TableRecord[];
  indexArrayPositionForKeysToPublish: Array<number>;
  responseDataTemp: Observable<any>;
  pageName1: string;
  public pageInfo1: any;
  public formData: Form;
  dataTemplates: Array<DataTemplate>;
  summaryData: string;
  isSummaryData: boolean;
  private scripts: any = {};
  public module: string;
  public splittedStringV: string;
  public sampleTablecolumns = [];
  public sampleTableRecords = [];
  //TODO: Later this will come from API 
  // We will have to keep script library in our cloud and expose via URL 
  //** Currently we are just loading this from local library  */
  ScriptStore: Scripts[] = [
    { name: 'StaffAvailabilityReport_Script', src: '../../../assets/scripts/staff_availability.js' },
    { name: 'Common_Script', src: '../../../assets/scripts/common.js' }

  ];

  constructor(private idService: IdService,
    private utilityService: UtilityService,
    private httpClient: HttpClient,
    private authService: AuthService,
    protected activatedRoute: ActivatedRoute,) {
    this.module = activatedRoute.data['value'].module;
    //INITIALING THE SCRIPTS 
    this.ScriptStore.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src
      };
    });
    //blank initialization
    this.dataTemplates = [];

  }
  /*-------------------------------------- this method use for show form data ------------------------------------------------*/
  updateFormData(form: Form) {
    this.formData = form;
  }

  updateDataTemplates(dataTemplates: Array<DataTemplate>) {
    this.dataTemplates = dataTemplates;
  }
  /*-------------------------------------- those method use for load JavaScript File ------------------------------------------------*/
  loadScript(name: string) {
    return new Promise((resolve, reject) => {
      //resolve if already loaded
      if (this.scripts[name].loaded) {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      }
      else {
        let script = document.createElement('script') as HTMLScriptElement;
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;

        script.onload = () => {
          this.scripts[name].loaded = true;
          resolve({ script: name, loaded: true, status: 'Loaded' });
        };
        script.onerror = (error: any) => resolve({ script: name, loaded: false, status: 'Loaded' });
        document.getElementsByTagName('head')[0].appendChild(script);
      }
    });
  }

  load(...scripts: string[]) {
    var promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
  }
  /*-------------------------------------- those method use for load JavaScript File ------------------------------------------------*/

  getDataFromService(url: string): Observable<any> {

    let headers1 = this.appendHeaders(null);
    let headers = { headers: headers1 }

    var serviceData = this.httpClient.get(url, headers);
    return serviceData;
  }

  appendHeaders(additionalHeaders?: Array<ColumnString>): HttpHeaders {

    let headers1 = new HttpHeaders();
    let token = this.authService.getAuthorizationHeaderValue();

    headers1 = headers1.set('Content-Type', 'application/json');
    if (token != null) {
      headers1 = headers1.set('Authorization', token);
    }
    if (additionalHeaders != null) {
      additionalHeaders.forEach(item => {
        headers1 = headers1.set(item.Key, item.Value);
      });
    }

    return headers1;
  }


  getDataFromApiAsPromise(url: string): Promise<any> {
    return this.httpClient.get(url).toPromise();

  }

  async getDataFormServiceWithDelegate(url: string, formDataRef: Form) {
    var serviceData = this.httpClient.get(url);
    serviceData.subscribe(data => {
      formDataRef = data as Form;
    });

  }

  setCssClass(col) {
    //check if col exists in columnsToPublish, then visible else hidden
    let result = this.headerToPublish.includes(col);
    return result ? 'colShow' : 'colHide';
    //return 
  }
  //<-- changePascalCaseToSpace method Add Space in ColumnName -->
  changePascalCaseToSpace(str) {
    return str.split(/(?=[A-Z])/).join(' ')
  }

  populateHeader(controlName:string, controlHeader:string) {

    var data_column_text = (controlHeader != null) ? controlHeader : controlName;
    data_column_text = this.changePascalCaseToSpace(data_column_text);
    return data_column_text;
  }
  populateGridData(response: any, dataTemplates: Array<DataTemplate>) {
    this.records = [];
    let columnsToPublish = this.formData.GridColumns.filter(t => t.ToPublish);
    let columnToPublishArray = [];
    let columnsArray = [];
    columnsToPublish.forEach(item => {
      columnToPublishArray.push(item.ColumnName);
    });
    this.formData.GridColumns.forEach(item => {
      columnsArray.push({ ColumnName: item.ColumnName, ColumnHeader: item.ColumnHeader });
    });
    // this.formData.GridColumns.forEach(item => {
    //   columnsArray.push(item.ColumnName);
    // });

    this.headerToPublish = columnToPublishArray; // response.ColumnsToPublish;
    this.columns = columnsArray;
    this.tableContents1 = response.DataCollection;
    //  set  summary data in a div Dynamically
    $('#summary').html('');
    this.isSummaryData = this.formData.IsSummaryData;
    this.summaryData = response.SummaryData;
    if (this.summaryData != null && this.isSummaryData == true) {
      var summary = JSON.parse(this.summaryData);
      var mainUl = $("<ul class='list-inline summaryData'></ul>");
      for (let i = 0; i <= summary.length; i++) {
        for (let n in summary[i]) {
          var temp = $('<li>' + n.split(/(?=[A-Z])/).join(' ') + ' <span class="badge">' + summary[i][n] + '</span></li>');
          $(mainUl).append(temp);
        }
      }
    }
    $("#summary").append(mainUl);

    this.indexArrayPositionForKeysToPublish = new Array<number>();
    // Looping once to evaluate the columns that re requried to be scanned next
    for (var index in this.tableContents1) {
      var keys = Object.keys(this.tableContents1[index]);
      let iCount = 0;
      for (var key in keys) {
        let tableContentHeaders = this.columns.find(function (col) { return col['ColumnName'].toLowerCase() == keys[key].toLowerCase() });
        if (!(tableContentHeaders == null || tableContentHeaders == undefined)) {
          this.indexArrayPositionForKeysToPublish.push(iCount);
        }
        iCount++;
      }
      break;
    }
    this.records = new Array<TableRecord>();
    for (var index in this.tableContents1) {
      var keys = Object.keys(this.tableContents1[index]);
      var tableRecord = new TableRecord();
      tableRecord.ColumnValues = new Array<TableData>();
      tableRecord.Record = index;
      tableRecord.Id = this.tableContents1[index].Id;
      for (var i = 0; i < this.indexArrayPositionForKeysToPublish.length; i++) {
        let values_temp = Object.values(this.tableContents1[index])[this.indexArrayPositionForKeysToPublish[i]];
        //let keyValues_temp: Array<CustomKeyValueString>;
        let columnTypeArray = dataTemplates.filter(item1 => {
          return item1.ColumnName == keys[this.indexArrayPositionForKeysToPublish[i]];
          //return item1.ColumnName == keys[i];
        });

        let keyValues_temp = columnTypeArray != null && columnTypeArray.length > 0 ? columnTypeArray[0].KeyValues : null;


        //Check on custom attribute if not null then use this
        let custom_attribute_index_number = -1;
        //let customAttributes =  keys.filter(t=>t=='CustomAttributes',); // [this.indexArrayPositionForKeysToPublish[i]]
        let customAttributes_index = keys.filter( (x, index_temp)=> {

          if (x == AppConstants.COMMON.CUSTOMATTRIBUTES) {
            custom_attribute_index_number = index_temp;

            return custom_attribute_index_number;
          }else{
            return null;    
          }  

        });

        if (customAttributes_index != null && customAttributes_index.length > 0) {
          //based on index of customattribute
          var custom_attribute_index_value = parseInt(customAttributes_index[0]);

          if (custom_attribute_index_number > -1) {
            // let currentIndex = this.indexArrayPositionForKeysToPublish.indexOf(custom_attribute_index_number);
            let currentValue = keys[custom_attribute_index_number];
            let values_temp_custom_attribute = this.tableContents1[index][currentValue];
            // let values_temp_custom_attribute = Object.values(this.tableContents1[index])[this.indexArrayPositionForKeysToPublish[custom_attribute_index_number]];
            keyValues_temp = values_temp_custom_attribute[0] != undefined && values_temp_custom_attribute.length > 0 ? JSON.parse(values_temp_custom_attribute[0]['AttributeData']) : keyValues_temp;
          }
        };



        let column_type = columnTypeArray != null && columnTypeArray.length > 0 ? columnTypeArray[0].ColumnType : 'span';
        tableRecord.ColumnValues.push({
          ColumnName: keys[this.indexArrayPositionForKeysToPublish[i]], // keys[index],
          ColumnData: (values_temp == undefined && values_temp == null) ? null : values_temp,
          ColumnType: column_type,
          CssClassName: columnTypeArray[0].CssClassName,
          KeyValues: keyValues_temp
        });

      }
      if (tableRecord.ColumnValues.filter(t => t.ColumnName == 'Id').length == 0) {
        tableRecord.ColumnValues.push({
          ColumnData: tableRecord.Id,
          ColumnName: "Id",
          ColumnType: "hidden",
          KeyValues: undefined
        });
      }

      let path = window.location.pathname;
      let splittedValues = path.split('/');
      let splittedName = splittedValues[2];
      if (splittedName == "instrumentCalibrationSetReports" || splittedName == "balanceRecordReports" || splittedName == "internalCalibrationReports") {
        tableRecord.ColumnValues.push({
          ColumnName: "Print", // keys[index],
          ColumnData: "",
          ColumnType: "button",
          CssClassName: "btn btn-primary",
          KeyValues: undefined
        });
      }
      else if (splittedName == "logReport") {
        tableRecord.ColumnValues.push({
          ColumnName: "Object", // keys[index],
          ColumnData: this.tableContents1[index],
          ColumnType: "mainObject",
          CssClassName: "colHide",
          KeyValues: undefined
        });
      }
      this.records.push(tableRecord);
      console.log(this.records);
    }
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  // Populate Grid Data PageWise 
  //first parameter provide Url,second parameter provides dataTemplates List and Third paremeter provides totalRecods,currentPage and PageSize
  populateGridDataPagewise(urlToCall: string, dataTemplates: Array<DataTemplate>, pageInfo1: any) {

    this.responseDataTemp = this.getDataFromService(urlToCall);

    this.responseDataTemp.subscribe(
      data => {
       // $("#reportTable").html('');
        let path = window.location.pathname;
        let splittedValues = path.split('/');
        this.splittedStringV = splittedValues[2].toLowerCase();
        if (this.splittedStringV == "samplereport") {

          this.sampleTablecolumns = [];
          this.sampleTableRecords = [];

          let sampleReportData = data.DataCollection[0];
          let allKeys = Object.keys(sampleReportData[0]);

          for (let i = 0; i < allKeys.length; i++) {
            this.sampleTablecolumns.push(allKeys[i]);
          }
          let allValues = Object.values(sampleReportData[0]);
          for (let j = 0; j < allValues.length; j++) {
            this.sampleTableRecords.push(allValues[j]);
          }



        } else {
          sessionStorage.setItem("IOTReportData", JSON.stringify(data.DataCollection))
          this.populateGridData(data, dataTemplates);
          //THIS IS A JAVASCRIPT METHOD CALL
          processDataAfterDelay();
          if (this.pageInfo1 == null) {
            this.pageInfo1 = {};
          }
          this.pageInfo1.totalrecords = data.PageInfo.TotalRecords;
          this.pageInfo1.currentPage = data.PageInfo.CurrentPage;
          this.pageInfo1.pagesize = data.PageInfo.PageSize

          pageInfo1.totalrecords = data.PageInfo.TotalRecords;
          pageInfo1.currentPage = data.PageInfo.CurrentPage;
          pageInfo1.pagesize = data.PageInfo.PageSize;
          //  show total table record in a div
          let lblRecordsInfo = document.getElementById('lblRecordsInfo') as HTMLLabelElement;
          if (lblRecordsInfo != null) {
            let fromRecord = (((this.pageInfo1.currentPage * this.pageInfo1.pagesize) - this.pageInfo1.pagesize) + 1);
            let toRecord = (this.pageInfo1.currentPage * this.pageInfo1.pagesize);
            toRecord = toRecord > this.pageInfo1.totalrecords ? this.pageInfo1.totalrecords : toRecord;
            lblRecordsInfo.innerText = "Record(s) " + fromRecord + ' to ' + toRecord + ' of ' + this.pageInfo1.totalrecords + '  ';
          }
        }
      }, error => { });
  }

  populateExcelData(urlToCall: string) {


     let responseDataExcelTemp =this.utilityService.exportExcelData(urlToCall) ;
  
      responseDataExcelTemp.subscribe(
     data => {
      var fileName = 'report.xlsx';
        importedSaveAs(data, fileName)
      }, (error) => {
        error
      });

    
  }
  populateGridDataPagewiseForChart(urlToCall: string, dataTemplates: Array<DataTemplate>, pageInfo1: any) {

    this.responseDataTemp = this.getDataFromService(urlToCall);

    this.responseDataTemp.subscribe(
      data => {


        let reportData = data.DataCollection;
        const unique = [...new Set(reportData.map(item => item.SensorName))];

        var update_chart_arr = [];
        var suffix = [];
        for (var x = 0; x < unique.length; x++) {
          suffix.push(unique[x].toString().charAt(0));
          var selectedKeyValues = reportData.filter(t => t.SensorName == unique[x])
          var arr = [];
          for (var i = 0; i < selectedKeyValues.length; i++) {
            var obj = {};

            var d = new Date(selectedKeyValues[i].SensorAdditionalData);
            var update_date_time = d.getTime();
            obj['x'] = selectedKeyValues[i].SensorAdditionalData;
            obj['y'] = selectedKeyValues[i].SensorDataValue;
            arr.push(obj);
          }
          update_chart_arr.push(arr);
        }
        //create json populate Chart
        var data_temp_obj = {};
        data_temp_obj['ReportTitle'] = 'Clients with Projects',
          data_temp_obj['Titles'] = unique;
        data_temp_obj['Name'] = unique;
        data_temp_obj['Suffix'] = suffix;
        data_temp_obj['ReportData'] = (update_chart_arr != null && update_chart_arr.length > 0) ? update_chart_arr : null;

        chartPopulate(data_temp_obj, unique.length);
        //THIS IS A JAVASCRIPT METHOD CALL
        // processDataAfterDelay();
        if (this.pageInfo1 == null) {
          this.pageInfo1 = {};
        }

      }, error => { });
  }
  setPageName(pageName: string) {
    this.pageName1 = pageName;
  }

  setPageInfo(pageInfo: any) {
    this.pageInfo1 = pageInfo;
  }

  getTableRecords() {
    return this.records;
  }
  //AddressGUID Generate
  getUUID() {
    return this.idService.generate();
  }

}

