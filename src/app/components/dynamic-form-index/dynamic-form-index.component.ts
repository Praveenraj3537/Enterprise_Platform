import { Form, ColumnString, Event, GridColumn, Condition, RequestModel, Filter, SortCondition, Menu } from '../../shared/interface/form-data-advanced';
import { Component, ComponentFactoryResolver, AfterViewInit, ElementRef, ViewChild, ɵMethodFn } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { } from '../../shared/interface/form-data-advanced';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TableData, TableRecord } from '../../models/tableContent.model';
import { AuthService } from '../../services/auth.service';
import { UtilityService } from '../../services/utility.service';
import { BaseComponent } from 'src/app/shared/baseComponent/base.component';
import { environment } from 'src/environments/environment';
import * as $ from 'jquery';
import { ToastrService } from 'ngx-toastr';


declare var modalLoader: any;
@Component({
  selector: 'app-dynamic-form-index',
  templateUrl: './dynamic-form-index.component.html',
  styleUrls: ['./dynamic-form-index.component.css']
})
export class DynamicFormIndexComponent extends BaseComponent implements AfterViewInit {
  private isLastPage: boolean;
  submitted: boolean;
  @ViewChild('tableMain', { static: false }) tableMain: ElementRef;
  public headerToPublish: Array<string>;
  searchValue: string = '';
  baseUrl: string;
  public records: TableRecord[];
  public conditions: Array<Condition>;
  public sortconditions: Array<SortCondition>;
  public sortField: string;
  public isAscendingSorting: boolean;
  isHistory: boolean;
  menu: string;
  gridFormMsg: string;
  isGridFormMsg: boolean;
  public prevTh: any;
  private isRecordDeleted: boolean;
  excel = [];
  private sortableEvent: any;
  splittedStringV:string;

  constructor(private resolver: ComponentFactoryResolver,
    httpclient: HttpClient,
    activatedRoute: ActivatedRoute,
    router: Router,
    authService: AuthService,
    utilityService: UtilityService,
    toastr: ToastrService
  ) {

    super(httpclient, activatedRoute, router, authService, utilityService, toastr);

    this.headerToPublish = [];
    this.conditions = new Array<Condition>();
    this.sortconditions = new Array<SortCondition>();
    this.isAscendingSorting = false;
    this.isRecordDeleted = false;
    this.isLastPage = false;
  }


  /*---------------------------------------------populate excel sheet----------------------------------------------*/
  exportAsXLSX() {
    this.isLastPage = false;
    let data_array: any[] = [];
    var data_temp = this.populateDataRecursively(1, 100, data_array, null);
  }


  populateDataRecursively(currentPage: number, pageSize: number, jsonData: Array<any>, headerValues?: Array<ColumnString>, dynamicFormIndexComponent?: DynamicFormIndexComponent) {

    let formData_temp = dynamicFormIndexComponent == null ? this.formData : dynamicFormIndexComponent.formData;
    let utilityService_temp = dynamicFormIndexComponent == null ? this.utilityService : dynamicFormIndexComponent.utilityService;
    let urlToCall = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress + '/' + pageSize + '/' + currentPage;
    let headerValues_temp = headerValues == null ? [] : headerValues;
    if (formData_temp.EndPoint != null && formData_temp.EndPoint.Headers != null) {
      formData_temp.EndPoint.Headers.forEach(data => {
        headerValues_temp.push({
          Key: data.KeyName,
          Value: data.ValueName
        });
      })
    }

    let path = window.location.pathname;
    let splittedValues = path.split('/');
    let splittedName = splittedValues[2].slice(0, -1);

    let response = utilityService_temp.getDataFormService(urlToCall, headerValues_temp);
    response.subscribe(data => {
      let array_temp: Array<any> = data.DataCollection != null ? data.DataCollection as Array<any> : [];
      let jsonData1 = this.populateJsonGridata(array_temp, this.formData)
      jsonData1.forEach(item => {
        jsonData.push(item);
      });

      let currentPage1_forLastPage = Math.ceil(data.PageInfo.TotalRecords / pageSize);
      let currentPage1 = ((currentPage * pageSize) > (data.PageInfo.TotalRecords)) ? Math.round(data.PageInfo.TotalRecords / pageSize) : currentPage + 1;

      if (currentPage != currentPage1 && !this.isLastPage) { // ((currentPage1_forLastPage >= currentPage1)){
        this.isLastPage = currentPage1_forLastPage == currentPage1;
        if (currentPage1 != 0) {
          this.populateDataRecursively(currentPage1, pageSize, jsonData, null);
        } else {
          this.JSONToCSVConvertor(jsonData, splittedName, true);
        }
      }
      else {
        this.JSONToCSVConvertor(jsonData, splittedName, true);
      }
    });
  }

  JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    var CSV = '';
    //Set Report title in first row or line
    CSV += ReportTitle + '\r\n\n';
    //This condition will generate the Label/Header
    if (ShowLabel) {
      var row = "";
      //This loop will extract the label from 1st index of on array
      for (var index in arrData[0]) {
        //Now convert each value to string and comma-seprated
        row += index + ',';
      }
      row = row.slice(0, -1);
      //append Label row with line break
      CSV += row + '\r\n';
    }
    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
      var row = "";
      //2nd loop will extract each column and convert it in string comma-seprated
      for (var index in arrData[i]) {
        row += '"' + arrData[i][index] + '",';
      }
      row.slice(0, row.length - 1);
      //add a line break after each row
      CSV += row + '\r\n';
    }

    if (CSV == '') {
      //  alert("Invalid data");
      return;
    }

    //Generate a file name
    var fileName = "";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName = ReportTitle.replace(/ /g, "_");
    fileName += "_" + new Date().toString().slice(0, 25);
    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    var link = document.createElement("a");
    link.href = uri;
    //link.style = "visibility:hidden";
    link.download = fileName + ".csv";

    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  /*---------------------------------------------populate excel sheet End----------------------------------------------*/
  ngOnInit() {
    console.log($(window).height());
    let heightCal = $(window).height();
    console.log("dat"+$(window).width());
   // if($(window).width()<1500){
    let top = heightCal-70;
    $('.paginationResponsive').css("top",top);
    // }else{
    //   let top = 70;
    // $('.paginationResponsive').css("top",top);
    // }
    if($(window).width()<1500){
    let tblHeight = heightCal-200;
    $('.gridStyle tbody').css("height",tblHeight);
    }else{
      let tblHeight = heightCal-250;
      $('.gridStyle tbody').css("height",tblHeight);
    }
    super.ngOnInit();
    let formGroup = {};
    let height = $(window).height() - 700;
    let width = $(window).width() - 1000;
    $('#contentSizeForBody').css("overflow-y", "sroll");
    $('#contentSizeForBody').css("height", height);

    //$('#contentSize').css("width", width);
    //local storage use for get the data
    let lastUrl = localStorage.getItem('lastUrl');
    lastUrl = (lastUrl != null && lastUrl.length > 0) ? lastUrl : '' + this.pageName1;
    let contextualUrlSplittedItems = window.location.pathname.split('/');
   
    this.splittedStringV =contextualUrlSplittedItems[contextualUrlSplittedItems.length - 1].toLowerCase();
    let contextualItem = contextualUrlSplittedItems[contextualUrlSplittedItems.length - 1];
    //local storage use for set the data
    localStorage.setItem('lastUrl', window.location.pathname);
    //this url get index data
    let url = environment.templateUrl + '/' + this.module + '/' + contextualItem + '/index';
    /*-----------------------------call service  for  get the data-------------------------------------------------------*/
    let response = this.utilityService.getDataFormService(url);
    response.subscribe(
      data => {
        this.formData = data as Form; // this provide get data 

        if (this.formData != null && this.formData.Sections != null) {

           this.title = this.formData.FormName; // ITs shows title in  header 
           let headerCtrl = document.getElementById('headerTitle') as HTMLElement;
           if(headerCtrl != null){
             headerCtrl.innerHTML =  this.title; 
            }
          this.menu = this.formData.Menu;
          this.gridFormMsg = this.formData.FormMsg;
          this.isGridFormMsg = this.formData.IsFormMsg;
          this.isHistory = this.formData.IsHistory;
          if (this.formData.GridColumns != null) {
            this.formData.GridColumns.forEach(item => {
              if (item.ToPublish) {
                //let properString = this.utilityService.changePascalCaseToSpace(item.ColumnName);
                let properString = (item.ColumnHeader != null) ? item.ColumnHeader : item.ColumnName;
                properString = this.utilityService.changePascalCaseToSpace(properString);
                this.headerToPublish.push(properString);
              }
            });
          }
          this.form = new FormGroup(formGroup);
          this.formData.Sections.forEach(
            section => {
              section.SectionAttributes.forEach(sectionAttribute => {
                formGroup[sectionAttribute.ControlName] = new FormControl('');
              });

              this.generateControls(section, formGroup);
            });

          // this url provide list data
          let urlToCall = this.formData.EndPoint.EndpointAddress;
          let path = window.location.pathname;
          let search = path.search(/\d/);
          let resValue = path.substr(search);
          let splittedValues = path.split('/')
          let numericarray = [];
          for (let i = 0; i < splittedValues.length; i++) {

            let numericValue = parseInt(splittedValues[i]);
            if (Number.isInteger(numericValue) == true) {
              numericarray.push(numericValue);
            }
          }

          let icount = 0;
          let patternToMatch = /[^{\}]+(?=})/;

          while (urlToCall.match(patternToMatch)) {

            urlToCall = (urlToCall.replace(patternToMatch, numericarray[icount]));
            urlToCall = (urlToCall.replace('{' + numericarray[icount] + '}', numericarray[icount]));
            if (numericarray.length > 1) {
              urlToCall = urlToCall.slice(0, 9) + resValue;
            }
            icount++;
          }
          this.formData.EndPoint.EndpointAddress = urlToCall;
          let completeUrl = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress + '/' + this.pageInfo1.pagesize + '/' + this.pageInfo1.currentPage;
          //populate grid data page wise
          this.populateGridDataPagewise(this, completeUrl);
        }
      }, (error: HttpErrorResponse) => {
      });
  }

  ngDoCheck() { }

  ngOnDestroy() {
    localStorage.setItem('lastUrl', window.location.pathname);

  }

  getValueFromObject(objRef: object, keyName: string) {
    return objRef[keyName];
  }

  getPropFromObject(objRef: object, keyName: string) {
    let keys = Object.keys(objRef);
    return keys.includes(keyName);
  }

  /* -------------------------------------POPULATED GRID DATA ------------------------------------------------*/
  populateGridData(response: any, formData?: Form, records?: TableRecord[]) {

    //FINDING WHAT TO PUBLISH AND AT WHAT POSITION 
    let formdata_temp = formData == null ? this.formData : formData;
    let positionNumberToPublish = [];
    let columnsToPublish: Array<GridColumn>;
    columnsToPublish = new Array<GridColumn>();

    for (let i = 0; i < formdata_temp.GridColumns.length; i++) {
      if (this.formData.GridColumns[i].ToPublish) {
        columnsToPublish.push(this.formData.GridColumns[i]);
        positionNumberToPublish.push(i);
      }
    };

    //EMPTYING THE EXISTING ARRAY
    this.records = [];

    let iCount = 0;
    //LOOPING THE DATA
    if (response != null && response.DataCollection != null) {
      let keys = [];

      response.DataCollection.forEach(rowItem => {
        //Getting the Keys as per every row, as sometimes the column value will not be published from server
        keys = Object.keys(rowItem);
        let values = Object.values(rowItem)
        let tableRecord = new TableRecord();
        tableRecord.ColumnValues = new Array<TableData>();
        tableRecord.Record = rowItem;
        tableRecord.Id = rowItem.Id;
        let allobjects = [];
        let allArrays = [];
        let allobjectKeys = [];
        let allArrayKeys = [];

        for (let i = 0; i < values.length; i++) {
          if (values[i] instanceof Array) {
            allArrays.push(values[i]);
            allArrayKeys.push(keys[i]);
          }
          else if (typeof values[i] === 'object' && values[i] != null && !(values[i] instanceof Array) && !(values[i] instanceof Date)) {
            allobjects.push(values[i]);
            allobjectKeys.push(keys[i]);
          }
        }

        let positionNumber: number;
        let prevPosition: number;
        prevPosition = 0;
        positionNumber = 0;
        let fqdata = [];
        //Looping the columns that needs to be published 
        columnsToPublish.forEach(column => {
          fqdata.push(column.FQModelName);
          let fqNames = column.FQModelName.split('.');
          let value_temp: any;
          value_temp = '';
          let foundInKeys: Boolean;
          foundInKeys = false;
          for (let i = 0; i < keys.length; i++) {
            switch (fqNames.length) {
              case 1:
                if (fqNames[0] === column.ColumnName && column.ColumnName === keys[i]) //IF ITS PROP OF DIRECT PARENT
                {
                  value_temp = values[i]; // values[positionNumber];
                  tableRecord.ColumnValues.push({ ColumnName: column.ColumnName, ColumnData: value_temp, ColumnType: column.ColumnType });
                  i = keys.length;
                  foundInKeys = true;
                }
                break;
              case 2:
                if (fqNames[1] === column.ColumnName && fqNames[0] === keys[i]) {  //IF ITS PROP OF 1st Level OBJECT

                  value_temp = values[i][fqNames[1]]; //  values[positionNumber][fqNames[1]];
                  tableRecord.ColumnValues.push({ ColumnName: column.ColumnName, ColumnData: value_temp, ColumnType: column.ColumnType });
                  i = keys.length;
                  foundInKeys = true;
                }

                break;
              case 3:
                if (fqNames[2] === column.ColumnName && fqNames[0] === keys[i]) { // IF ITS PROP OF 2nd LEVEL OBJECT
                  value_temp = values[i][fqNames[1]][fqNames[2]];  //values[positionNumber][fqNames[1]][fqNames[2]];
                  //  positionNumber = i;
                  tableRecord.ColumnValues.push({ ColumnName: column.ColumnName, ColumnData: value_temp, ColumnType: column.ColumnType });
                  i = keys.length;
                  foundInKeys = true;
                }

                break;
              case 4:
                if (fqNames[3] === column.ColumnName && fqNames[0] === keys[i]) {  //IF ITS PROP OF 3rd LEVEL OBJECT
                  //  positionNumber = i;
                  value_temp = values[i][fqNames[1]][fqNames[2]][fqNames[3]];  //values[positionNumber][fqNames[1]][fqNames[2]][fqNames[3]];
                  tableRecord.ColumnValues.push({ ColumnName: column.ColumnName, ColumnData: value_temp, ColumnType: column.ColumnType });
                  i = keys.length;
                  foundInKeys = true;
                }

                break;
              default:
                break;

            }
            positionNumber++;
          }
          //If thers is no data from service, but we have that column in list of publishing columns
          if (!foundInKeys) {
            // we are pushing blank record
            tableRecord.ColumnValues.push({ ColumnName: column.ColumnName, ColumnData: '', ColumnType: column.ColumnType });
          }
          prevPosition = positionNumber;
        });
        sessionStorage.setItem('FQModel', JSON.stringify(fqdata));
        this.records.push(tableRecord);
        iCount++;
      });
    }
  }

  populateJsonGridata(dataCollection: Array<any>, formData?: Form): Array<any> {
    let formdata_temp = formData == null ? this.formData : formData;
    let positionNumberToPublish = [];
    let columnsToPublish: Array<GridColumn>;
    columnsToPublish = new Array<GridColumn>();
    let outputArray: Array<any> = new Array<any>();

    for (let i = 0; i < formdata_temp.GridColumns.length; i++) {
      if (this.formData.GridColumns[i].ToPublish) {
        columnsToPublish.push(this.formData.GridColumns[i]);
        positionNumberToPublish.push(i);
      }
    };

    let iCount = 0;
    //LOOPING THE DATA
    if (dataCollection != null) {
      let keys = [];
      dataCollection.forEach(rowItem => {

        let obj = {};

        //Getting the Keys as per every row, as sometimes the column value will not be published from server
        keys = Object.keys(rowItem);
        let values = Object.values(rowItem)
        let tableRecord = new TableRecord();
        tableRecord.ColumnValues = new Array<TableData>();
        tableRecord.Record = rowItem;
        tableRecord.Id = rowItem.Id;
        let allobjects = [];
        let allArrays = [];
        let allobjectKeys = [];
        let allArrayKeys = [];

        for (let i = 0; i < values.length; i++) {
          if (values[i] instanceof Array) {
            allArrays.push(values[i]);
            allArrayKeys.push(keys[i]);
          }
          else if (typeof values[i] === 'object' && values[i] != null && !(values[i] instanceof Array) && !(values[i] instanceof Date)) {
            allobjects.push(values[i]);
            allobjectKeys.push(keys[i]);
          }
        }

        let positionNumber: number;
        let prevPosition: number;
        prevPosition = 0;
        positionNumber = 0;
        let fqdata = [];

        //Looping the columns that needs to be published 
        columnsToPublish.forEach(column => {
          fqdata.push(column.FQModelName);
          let fqNames = column.FQModelName.split('.');
          let value_temp: any;
          value_temp = '';
          let foundInKeys: Boolean;
          foundInKeys = false;
          for (let i = 0; i < keys.length; i++) {
            switch (fqNames.length) {
              case 1:
                if (fqNames[0] === column.ColumnName && column.ColumnName === keys[i]) //IF ITS PROP OF DIRECT PARENT
                {

                  value_temp = values[i]; // values[positionNumber];
                  // tableRecord.ColumnValues.push({ ColumnName: column.ColumnName, ColumnData: value_temp });
                  obj[column.ColumnName] = value_temp;
                  i = keys.length;
                  foundInKeys = true;
                }
                break;
              case 2:
                if (fqNames[1] === column.ColumnName && fqNames[0] === keys[i]) {  //IF ITS PROP OF 1st Level OBJECT

                  value_temp = values[i][fqNames[1]]; //  values[positionNumber][fqNames[1]];
                  //tableRecord.ColumnValues.push({ ColumnName: column.ColumnName, ColumnData: value_temp });
                  obj[column.ColumnName] = value_temp;
                  i = keys.length;
                  foundInKeys = true;
                }

                break;
              case 3:
                if (fqNames[2] === column.ColumnName && fqNames[0] === keys[i]) { // IF ITS PROP OF 2nd LEVEL OBJECT
                  value_temp = values[i][fqNames[1]][fqNames[2]];  //values[positionNumber][fqNames[1]][fqNames[2]];
                  //  positionNumber = i;
                  // tableRecord.ColumnValues.push({ ColumnName: column.ColumnName, ColumnData: value_temp });
                  obj[column.ColumnName] = value_temp;
                  i = keys.length;
                  foundInKeys = true;
                }

                break;
              case 4:
                if (fqNames[3] === column.ColumnName && fqNames[0] === keys[i]) {  //IF ITS PROP OF 3rd LEVEL OBJECT
                  //  positionNumber = i;
                  value_temp = values[i][fqNames[1]][fqNames[2]][fqNames[3]];  //values[positionNumber][fqNames[1]][fqNames[2]][fqNames[3]];
                  //tableRecord.ColumnValues.push({ ColumnName: column.ColumnName, ColumnData: value_temp });
                  obj[column.ColumnName] = value_temp;
                  i = keys.length;
                  foundInKeys = true;
                }

                break;

              default:
                break;

            }
            positionNumber++;
          }
          //If thers is no data from service, but we have that column in list of publishing columns
          if (!foundInKeys) {
            // we are pushing blank record
            // tableRecord.ColumnValues.push({ ColumnName: column.ColumnName, ColumnData: '' });
            obj[column.ColumnName] = '';
          }
          prevPosition = positionNumber;
        });
        sessionStorage.setItem('FQModel', JSON.stringify(fqdata));
        outputArray.push(obj);
        iCount++;
      });
    }
    return outputArray;
  }

  deleteItem(id: any) {
    var x = confirm("Are you sure you want to delete?");
    if (x) {
      if (this.records.length == 1) {
        this.records = [];
      }


      let url = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress;
      this.utilityService.deleteDataToService(url, id).subscribe(data => {
        // this.populateGridDataPagewise(this, urlToCall);
        this.isRecordDeleted = true;
        let urlToCall = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress + '/' + this.pageInfo1.pagesize + '/' + this.pageInfo1.currentPage;
        this.populateGridDataPagewise(this, urlToCall);
        $(modalLoader()).hide();
        this.toastr.success('Data Deleted Successfully', 'Success', { timeOut: 2000 });

      });

    }
  };

  HistoryItem(id: any) {
    $("#accordionId").html('');
    let path = window.location.pathname;
    let splitedValue = path.split("/");

    //sample path : -> RouterPath: "/iotplus/internalCalibrations"
    // /v1/<your main page url>/Histories/<id of that row >
    //Evaluate History API Name from 'ApiName'
    //Pick the item from session, have a method that can find the 'apiName' for given path 
    //if API name is there use it else use splittedValue[2]
    let path_temp = '/' + this.module + '/' + splitedValue[2];

    let allMenu = JSON.parse(sessionStorage.getItem("MENU"));

    let menuWithApi = this.getAPIName(allMenu, path_temp);

    let path_value = menuWithApi != null ? menuWithApi.ApiName : splitedValue[2];


    let url = this.utilityService.getApiUrl(this.module) + '/' + 'v1/' + path_value + '/Histories';
    this.utilityService.getHistoryDataFormService(url, id).subscribe(data => {

      if (data.DataCollection != null && data.DataCollection.length > 0) {

        let panelDiv = document.createElement('div') as HTMLDivElement;
        panelDiv.className = 'panel panel-default';
        for (let i = 0; i <= data.DataCollection.length; i++) {
          let panelCtrl = this.utilityService.getHistoryPanelData(data.DataCollection[i], panelDiv);
          $("#accordionId").append(panelCtrl);

        }
      }

    });

  };


  getAPIName(startMenu: Menu, routeNameToSearch: string): Menu {
    let menuWithAPIName: Menu;
    if (startMenu != null && startMenu.Children != null && startMenu.Children.length > 0) {
      for (let i = 0; i < startMenu.Children.length; i++) {
        if (startMenu.Children[i].ApiName != null && startMenu.Children[i].RouterPath.toLowerCase() == routeNameToSearch.toLowerCase()) {
          menuWithAPIName = startMenu.Children[i];
          break;
        }
        else {
          menuWithAPIName = (menuWithAPIName == null) ? this.getAPIName(startMenu.Children[i], routeNameToSearch) : menuWithAPIName;
        }
      }
    };
    return menuWithAPIName;
  };


  /*----------------------------------------POPULATE GRID DATA -----------------------------------------------------*/
  populateGridDataPagewise(currentForm1: DynamicFormIndexComponent, urlToCall: string, isSearch?: boolean, headerValues?: Array<ColumnString>,
    dynamicFormIndexComponent?: DynamicFormIndexComponent) {

    //Evaluate the columns by checking 'toPublish'
    let formData_temp = dynamicFormIndexComponent == null ? this.formData : dynamicFormIndexComponent.formData;
    let utilityService_temp = dynamicFormIndexComponent == null ? this.utilityService : dynamicFormIndexComponent.utilityService;
    let currentForm = dynamicFormIndexComponent == null ? this : dynamicFormIndexComponent;

    let currentForm_temp = currentForm1 == null ? this : currentForm1;

    //updating the search value 
    let searchConf = document.getElementById("searchIndexData") as HTMLInputElement;
    let searchValue = searchConf.value.trim();
    //check the search box if blankc then remove all conditions, if not then add that search string to the conditrions 
    if (searchValue == null || (searchValue != null && searchValue.trim() == '')) {
      currentForm_temp.conditions = [];
    }
    else {


      let updateSearchValue: any
      let val = searchValue;
  
      let patternToMatch = /([0-9])*/g;
      let result = val.match(patternToMatch);
      if (val == "true" || val == "false") {
        updateSearchValue = isBoolean(val);
      } else if (result[0] != "") {
        let reslt = parseInt(result[0]);
        updateSearchValue = reslt
      }
      else {
        updateSearchValue = val;
      }
  
      function isBoolean(val) {
        return val === "false" || val === "true";
      }
      //read the search box
      //empty the conditions
      currentForm_temp.conditions = new Array<Condition>();
      //get the value frin getDocumentBy Id

      //Build the conditions
      currentForm_temp.formData.GridColumns.forEach(column => {
        if (column.IsSortable) {
          let condition = new Condition();
          condition.ConditionalSymbol = 1;
          condition.OperatorSymbol = 6;
          condition.FieldName = column.FQSortableField;
          condition.FieldValue = updateSearchValue;

          //add that css class
          currentForm_temp.conditions.push(condition);

        }
      });
      //Setting the Page to 1
      currentForm_temp.pageInfo1.currentPage = 1;
    }

    let headerValues_temp = headerValues == null ? [] : headerValues;
    if (formData_temp.EndPoint != null && formData_temp.EndPoint.Headers != null) {
      formData_temp.EndPoint.Headers.forEach(data => {
        headerValues_temp.push({
          Key: data.KeyName,
          Value: data.ValueName
        });
      })
    };

    let path = window.location.pathname;
    let splittedValues = path.split('/');
    let splittedName = splittedValues[2];
    /*---------------------Check the session page cache by calling getPageCacheMethod(pageName)
     if not null and value is there , de-serialize to RequestModel ------------------------------*/

    let cacheForPage = this.getPageCache(splittedName);
    //find the RequestModel header and then evaluate for search and sort
    let requestModel = headerValues_temp.filter(t => t.Key == 'RequestModel');

    //SETTING THE URL FROM CACHE IF TEHRE IN CACHE ELSE THE PASSED ONE
    urlToCall = isSearch == false && isSearch == undefined && cacheForPage.Url != null ? cacheForPage.Url : urlToCall;
    // urlToCall =  urlToCall;
    if (requestModel != null && requestModel.length > 0) {

      // if(currentForm_temp.conditions.length>0){

      // }

      let requestModel_temp = cacheForPage != null && cacheForPage.RequestModel != null && cacheForPage.RequestModel.Filter.Conditions.length > 0 ?
        cacheForPage.RequestModel : JSON.parse(requestModel[0].Value.toString().replace(/'/g, "\""));

      // let requestModel_temp =
      //       JSON.parse(requestModel[0].Value.toString().replace(/'/g, "\""));


      if (requestModel_temp != null) {

        requestModel_temp.Filter = requestModel_temp.Filter == null ? (new Filter()) : requestModel_temp.Filter;
        requestModel_temp.Filter.Conditions = (currentForm_temp.conditions.length == 0) && requestModel_temp.Filter != null && requestModel_temp.Filter.Conditions != null && requestModel_temp.Filter.Conditions.length > 0 ?
          requestModel_temp.Filter.Conditions : currentForm_temp.conditions;

        requestModel_temp.Filter.OrderByField = requestModel_temp.Filter != null && requestModel_temp.Filter.OrderByField != null ?
          requestModel_temp.Filter.OrderByField : currentForm_temp.sortField;
        requestModel_temp.Filter.IsOrderByFieldAsc = requestModel_temp.Filter != null && requestModel_temp.Filter.IsOrderByFieldAsc != null ?
          requestModel_temp.Filter.IsOrderByFieldAsc : currentForm_temp.isAscendingSorting;
        //setting the filter back 
        requestModel[0].Value = JSON.stringify(requestModel_temp);
      }

      /*Call the method to store in cache */
      this.setPageCache(urlToCall, splittedName, requestModel_temp);
    }
    else {
      let requestModel = cacheForPage != null && cacheForPage.RequestModel != null && cacheForPage.RequestModel.Filter.Conditions.length > 0 ? cacheForPage.RequestModel : new RequestModel();

      requestModel.Filter = requestModel.Filter != null ? requestModel.Filter : new Filter();
      requestModel.Filter.Conditions = (currentForm_temp.conditions.length == 0) && requestModel.Filter != null && requestModel.Filter.Conditions != null && requestModel.Filter.Conditions.length > 0 ?
        requestModel.Filter.Conditions : currentForm_temp.conditions;

      requestModel.Filter.OrderByField = requestModel.Filter != null && requestModel.Filter.OrderByField != null ?
        requestModel.Filter.OrderByField : currentForm_temp.sortField;

      requestModel.Filter.IsOrderByFieldAsc = requestModel.Filter != null && requestModel.Filter.IsOrderByFieldAsc != null ?
        requestModel.Filter.IsOrderByFieldAsc : currentForm_temp.isAscendingSorting;
      //set in session

      let columnString = {
        Key: 'RequestModel',
        Value: JSON.stringify(requestModel)
      }
      headerValues_temp.push(columnString);

      /*Call the method to store in cache */
      this.setPageCache(urlToCall, splittedName, requestModel);
    };





    //call the set method from base
    //find the page number and page from urlToCall


    let response = utilityService_temp.getDataFormService(urlToCall, headerValues_temp);

    response.subscribe(data => {

      currentForm.populateGridData(data);
      //set TotalRecords,CurrentPage and Page size 
      currentForm.pageInfo1.totalrecords = data.PageInfo.TotalRecords;
      currentForm.pageInfo1.currentPage = data.PageInfo.CurrentPage;
      currentForm.pageInfo1.pagesize = data.PageInfo.PageSize;
      if (data.Status.Code == "200") {
      };
    }, error => {
      console.log(error);
    },
      /*---------------------------------------Popualate total  Records-------------------------------------------*/
      function complete() {
        let lblRecordsInfo = document.getElementById('lblRecordsInfo') as HTMLLabelElement;
        if (lblRecordsInfo != null) {
          let fromRecord = (((currentForm.pageInfo1.currentPage * currentForm.pageInfo1.pagesize) - currentForm.pageInfo1.pagesize) + 1);
          let toRecord = (currentForm.pageInfo1.currentPage * currentForm.pageInfo1.pagesize);
          toRecord = toRecord > currentForm.pageInfo1.totalrecords ? currentForm.pageInfo1.totalrecords : toRecord;
          lblRecordsInfo.innerText = "Record(s) " + fromRecord + ' to ' + toRecord + ' of ' + currentForm.pageInfo1.totalrecords + '  ';
        };

        /********************* SET THE SEARCH TEXT BOX CONTENT  ********************************/
        if (cacheForPage != null && cacheForPage.SearchContent != null && cacheForPage.SearchContent.length > 0) {
          let searchControl = document.getElementById("searchIndexData") as HTMLInputElement;
          if (searchControl != null) {
            searchControl.value = cacheForPage.SearchContent;
          }
        }
      });
  }

  populatetblColumnData(columnData:any){
    if(columnData != null){
    let updatecolumnData =  columnData.length >20 ? columnData.slice(0, 20)+'...' : columnData
    return updatecolumnData;
    }
  }

  /*----------------------------Refreshing the page based on current values of pageInfo--------------------------------*/
  refresh() {
    let urlToCall = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress + '/' + this.pageInfo1.pagesize + '/' + this.pageInfo1.currentPage;

    this.populateGridDataPagewise(this, urlToCall);
  }

  /*-------------------------------pagination Functionality----------------------------------------------------*/
  first() {
    this.pageInfo1.currentPage = 1;
    let urlToCall = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress + '/' + this.pageInfo1.pagesize + '/' + this.pageInfo1.currentPage;

    //Reset the PAGE CACHE (page number to 1 ) inside cache 
    let cacheObject = this.getPageCache(null);
    if (cacheObject != null) {
      //cacheObject.RequestModel.Filter.
      cacheObject.Url = urlToCall;
      this.setPageCache(urlToCall, null, cacheObject.RequestModel);
    };

    this.populateGridDataPagewise(this, urlToCall);
  }

  prev() {
    this.pageInfo1.currentPage = this.pageInfo1.currentPage - 1;
    this.pageInfo1.currentPage = (this.pageInfo1.currentPage <= 0) ? 1 : this.pageInfo1.currentPage;
    let urlToCall = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress + '/' + this.pageInfo1.pagesize + '/' + this.pageInfo1.currentPage;

    //Reset the PAGE CACHE (page number to 1 ) inside cache 
    let cacheObject = this.getPageCache(null);
    if (cacheObject != null) {
      //cacheObject.RequestModel.Filter.
      cacheObject.Url = urlToCall;
      this.setPageCache(urlToCall, null, cacheObject.RequestModel);
    };

    this.populateGridDataPagewise(this, urlToCall);
  }

  next() {
    this.pageInfo1.currentPage =
      ((this.pageInfo1.currentPage * this.pageInfo1.pagesize) > (this.pageInfo1.totalrecords)) ?
        Math.round(this.pageInfo1.totalrecords / this.pageInfo1.pagesize) : this.pageInfo1.currentPage + 1;

    let urlToCall = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress + '/' + this.pageInfo1.pagesize + '/' + this.pageInfo1.currentPage;

    //Reset the PAGE CACHE (page number to 1 ) inside cache 
    let cacheObject = this.getPageCache(null);
    if (cacheObject != null) {
      cacheObject.Url = urlToCall;
      this.setPageCache(urlToCall, null, cacheObject.RequestModel);
    };

    this.populateGridDataPagewise(this, urlToCall);
  }
  last() {
    this.pageInfo1.currentPage = Math.ceil(this.pageInfo1.totalrecords / this.pageInfo1.pagesize);
    let urlToCall = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress + '/' + this.pageInfo1.pagesize + '/' + this.pageInfo1.currentPage;

    //Reset the PAGE CACHE (page number to 1 ) inside cache 
    let cacheObject = this.getPageCache(null);
    if (cacheObject != null) {
      cacheObject.Url = urlToCall;
      this.setPageCache(urlToCall, null, cacheObject.RequestModel);
    };

    this.populateGridDataPagewise(this, urlToCall);
  }
  /*-------------------------------pagination Functionality End----------------------------------------------------*/
  /*<---------------------------------------select option for  set page-size --------------------------------> */
  onPageSizeChanged() {
    let elem = document.getElementById('selectPage-size') as HTMLSelectElement;
    var value = elem.options[elem.selectedIndex].value;
    this.pageInfo1 = {
      currentPage: 1,
      pagesize: parseInt(value),
      totalrecords: 0
    };

    let urlToCall = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress + '/' + this.pageInfo1.pagesize + '/' + this.pageInfo1.currentPage;

    //Reset the PAGE CACHE (page number to 1 ) inside cache 
    let cacheObject = this.getPageCache(null);
    if (cacheObject != null) {
      //cacheObject.RequestModel.Filter.
      cacheObject.Url = urlToCall;
      this.setPageCache(urlToCall, null, cacheObject.RequestModel);
    };

    this.populateGridDataPagewise(this, urlToCall);
  }
  /* <------------------------ End Pagination ------------------------------------>  */

  /* <------------------------CLEAR FILTER RECORDS ------------------------------------>*/
  clearSearch() {
    this.conditions = new Array<Condition>();
    this.searchValue = '';
    let searchControl = document.getElementById('searchIndexData') as HTMLInputElement;
    $(searchControl).val('');//searchControl.innerText  ="";
    this.pageInfo1.currentPage = 1;
    let urlToCall = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress + '/' + this.pageInfo1.pagesize + '/' + this.pageInfo1.currentPage;
    let currentCacheObject = this.getPageCache(null);
    if (currentCacheObject != null) {
      currentCacheObject.SearchContent = '';
      currentCacheObject.RequestModel = currentCacheObject.RequestModel ?? new RequestModel();
      currentCacheObject.RequestModel.Filter = currentCacheObject.RequestModel.Filter ?? new Filter();
      currentCacheObject.RequestModel.Filter.Conditions = new Array<Condition>();
      this.setPageCache(currentCacheObject.Url, null, currentCacheObject.RequestModel, true);
    }
    else {
      //pick the cache data, remove the condition or make it blank []

      sessionStorage.removeItem("cacheData");/* remove session ctorage cache data */
      // searchControl.value = '';
    }
    this.populateGridDataPagewise(this, urlToCall, true);

  }
  /* <--------------------------------------Search Records------------------------------>*/
  searchRecords() {
    if (this.searchValue == null || (this.searchValue != null && this.searchValue.trim() == ''))
      return;

    let updateSearchValue: any
    let val = this.searchValue;

    let patternToMatch = /([0-9])*/g;
    let result = val.match(patternToMatch);
    result[0]
    if (val == "true" || val == "false") {
      updateSearchValue = isBoolean(val);
    } else if (result[0] != "") {
      let reslt = parseInt(result[0]);
      updateSearchValue = reslt
    }
    else {
      updateSearchValue = val;
    }

    function isBoolean(val) {
      return val === "false" || val === "true";
    }

    //empty the conditions
    this.conditions = new Array<Condition>();
    //Build the conditions
    this.formData.GridColumns.forEach(column => {
      if (column.IsSortable) {
        let condition = new Condition();
        condition.ConditionalSymbol = 1;
        condition.OperatorSymbol = 6;
        condition.FieldName = column.FQSortableField;
        condition.FieldValue = updateSearchValue;
        this.conditions.push(condition);

      }
    });
    //Setting the Page to 1
    this.pageInfo1.currentPage = 1;
    let urlToCall = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress + '/' + this.pageInfo1.pagesize + '/' + this.pageInfo1.currentPage;
    this.populateGridDataPagewise(this, urlToCall);
  };

  ngAfterViewInit() {
    console.log($(window).height());
    let height = $(window).height();
    let top = height-70;
    $('.paginationResponsive').css("top",top);
    let utilityService = this.utilityService;
    let module1 = this.module;
    let endpointAddress = this.formData.EndPoint.EndpointAddress;
    let populateGridDataPagewise = this.populateGridDataPagewise;
    let refresh1: ɵMethodFn;
    refresh1 = this.refresh;
    let currentObject = this;
    //This method call refresh button call times
    function refresh() {
      let hiddenPageSize = document.getElementById('hiddenPagesize') as HTMLInputElement;
      let hiddenCurrentPage = document.getElementById('hiddenCurrentPage') as HTMLInputElement;
      let urlToCall = utilityService.getApiUrl(module1) + '/' + endpointAddress + '/' + hiddenPageSize.value + '/' + hiddenCurrentPage.value;
      currentObject.populateGridDataPagewise(currentObject, urlToCall);
    }

    function populateSelectOnInitialLoad(x: HTMLElement, event: Event) {
      var select = x as HTMLSelectElement;
      var endpoint = (event.EndPoint.EndpointAddress.includes('{keyId}')) ?
        event.EndPoint.EndpointAddress.replace('{keyId}', "1") :
        event.EndPoint.EndpointAddress;
      let options = [];

      var affectedControl = document.getElementById(event.affectedControlName) as HTMLElement;
      if (affectedControl != null) {
        var affectedControl1 = affectedControl as HTMLSelectElement;
        for (let i = affectedControl1.options.length - 1; i >= 0; i--) {
          affectedControl1.remove(i);
        }

        options.forEach(item => {
          let option1 = document.createElement('option') as HTMLOptionElement;
          option1.value = item.Key;
          option1.text = item.Value;
          affectedControl1.options.add(option1);

        });

      }
    }

    /* ------------------------DYNAMIC EVENT  FIRING ON BUTTON CLICK,CHANGE  TIME --------------------------*/
    function navigateAddEdit(routeEntry: string, id: number) {
      utilityService.navigateAddEdit(routeEntry, id);

    }
    this.formData.Sections.forEach(
      section => {
        /* ----Looping each Section Attributes in Given Section (* Section Attributes are the one that we need to show as control) ------*/
        section.SectionAttributes.forEach(
          sectionAttribute => {
            if (sectionAttribute.ControlType == "button") {
              let x1 = document.getElementById(sectionAttribute.ControlName) as HTMLElement;
              if (x1 != null)
                x1.addEventListener('click', function () {
                  if (sectionAttribute.RouteEntry != null) {
                    let lastUrl = localStorage.getItem('lastUrl');
                    if (lastUrl != null) {
                      let tempUrl = lastUrl + '/0';
                      utilityService.navigateAddEditDirect(tempUrl); /*----------This Method Navigate Another Page Using Routing  ------------*/
                    }
                    else {
                      utilityService.navigateAddEdit(sectionAttribute.RouteEntry, 0);  /*----------This Method Navigate ANother Page Using Routing  ------------*/
                    }
                  }
                  /*-----------------handling refresh here for refresh buttons Using refresh  button----------------------------------*/
                  else if (sectionAttribute.ControlName == 'btnRefresh') {
                    refresh();
                  }
                });
            }
            /*----------------------------------  EVENT BINDING DYNAMICALLY  IN EDITBUTTON CLICK-------------------------------*/
            sectionAttribute.Events.forEach(
              event => {
                let x = document.getElementById(sectionAttribute.ControlName) as HTMLElement;
                switch (event.EventName) {
                  case "onclick": {
                    if (x != null) {
                      x.addEventListener('click', function () {
                        if (sectionAttribute.RouteEntry != null) {
                          /*---------------------------------------- create a new url for GET data  using localStorage --------------------------------------*/
                          let lastUrl = localStorage.getItem('lastUrl');
                          if (lastUrl != null) {
                            let newUrl = lastUrl + sectionAttribute.RouteEntry;
                            let tempUrl = newUrl + '/:id';

                            utilityService.navigateAddEdit(tempUrl, 0);  /*----------This Method Navigate ANother Page Using Routing  ------------*/

                          }
                          else {
                            navigateAddEdit(sectionAttribute.RouteEntry, 0);  /*----------This Method Navigate ANother Page Using Routing  ------------*/

                          }
                        }
                      });
                    }
                  }break;

                  case 'onchange': {

                    if (x != null) {
                      //if its a select please do the intitial binding as per the events associated for first time
                      populateSelectOnInitialLoad(x, event);
                      x.addEventListener('change', function () {
                        var select = x as HTMLSelectElement;
                        var endpoint = event.EndPoint.EndpointAddress.replace('{keyId}', select.value);
                        let options = [];
                        var affectedControl = document.getElementById(event.affectedControlName) as HTMLElement;
                        if (affectedControl != null) {
                          var affectedControl1 = affectedControl as HTMLSelectElement;
                          for (let i = affectedControl1.options.length - 1; i >= 0; i--) {
                            affectedControl1.remove(i);
                          }
                          options.forEach(item => {
                            let option1 = document.createElement('option') as HTMLOptionElement;
                            option1.value = item.Key;
                            option1.text = item.Value;
                            affectedControl1.options.add(option1);
                          });
                        }
                      });

                    }
                  }break;
                  default: {
                  }
                }
              });
          });
      });
  }

  /* -----------------------------------------sorting Record-----------------------------------------*/
  sortRecords(eventTarget: any, column: any) {
    //reset other's CSS to make them normal and only change the css of current TH
    if (column != null && column != '') {
      this.sortableEvent = column;
    }

    if (column == null || column == '') {
      column = this.sortableEvent;
    }
    let col = column;
    //let col = eventTarget.innerText;
    let isAsc: boolean = true;
    let isFound = false;

    for (let i = 0; i < this.sortconditions.length; i++) {
      if (this.sortconditions[i].ColumnName == col.trim()) {
        this.sortconditions[i].IsAsc = (!this.sortconditions[i].IsAsc);
        isAsc = this.sortconditions[i].IsAsc;
        isFound = true;
        break;
      }
    }

    if (!isFound) {
      this.sortconditions.push({ ColumnName: col, IsAsc: true });
      isAsc = true;
    }

    let icon_up = document.createElement("i") as HTMLElement;
    let icon_down = document.createElement("i") as HTMLElement;
    icon_up.className = 'fa fa-caret-up';
    icon_down.className = 'fa fa-caret-down';

    if (this.prevTh != null) {
      //u need to clear all controls in this TH
      this.prevTh.innerHTML = this.prevTh.innerHTML.replace('<i class="fa fa-caret-down"></i>', '')
      this.prevTh.innerHTML = this.prevTh.innerHTML.replace('<i class="fa fa-caret-up"></i>', '')
      this.prevTh.innerHTML = this.prevTh.innerHTML.replace('<i></i>', '')
    }

    let columnNameToSearch = col.replace(/ /g, '');
    let isSortable = false;

    let sortableColumns = this.formData.GridColumns.filter(t => t.IsSortable
      && (t.ColumnName == columnNameToSearch || (t.ColumnHeader != null && t.ColumnHeader == columnNameToSearch)));

    if (sortableColumns != null && sortableColumns.length > 0) {
      this.sortField = sortableColumns[0].FQSortableField;
      this.isAscendingSorting = isAsc;

      eventTarget.appendChild(isAsc ? icon_up : icon_down);
      //setting it to prevTh so that next sorting we will clear the icon for this.
      this.prevTh = eventTarget;
      isSortable = true;
    }
    //set the css for that TH
    if (isSortable) {
      let urlToCall = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress + '/' + this.pageInfo1.pagesize + '/' + this.pageInfo1.currentPage;
      /*-------------Reset the PAGE CACHE (page number to 1 ) inside cache 
          -------------------------Get Index Data IN Catch FOr Index Page--------------------------------------*/
      let cacheObject = this.getPageCache(null);
      if (cacheObject != null) {
        cacheObject.RequestModel = cacheObject.RequestModel ?? new RequestModel();
        cacheObject.RequestModel.Filter = cacheObject.RequestModel.Filter ?? new Filter();

        cacheObject.RequestModel.Filter.OrderByField = this.sortField;
        cacheObject.RequestModel.Filter.IsOrderByFieldAsc = this.isAscendingSorting;

        cacheObject.Url = urlToCall;
        /*----------------------    set ndex Data In catch  For Index Page   ---------------------------------*/
        this.setPageCache(urlToCall, null, cacheObject.RequestModel);
      }
      this.populateGridDataPagewise(this, urlToCall);
    }
    else {
      this.toastr.warning('Not a sortable column');
    }
  }
  /* -----------------------------------------sortingRecord End-----------------------------------------*/

  submitForm() {
    this.submitted = true;
  }
  changePascalCaseToSpace(str) {
    return str.split(/(?=[A-Z])/).join(' ')
  }
  populateDataTitle(controlName:string){
   var data_column_text = this.changePascalCaseToSpace(controlName);
    return data_column_text;
  }
  submitToServer(url: string, method: string, postedData: any) {
    let stringData = postedData != null && postedData.length > 0 ? JSON.stringify(postedData) : 'none';
    alert('you submitted ' + stringData + ' on url :' + url + ' method:' + method);
  }
}