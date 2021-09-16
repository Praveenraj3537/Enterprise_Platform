
import { HttpClient as HttpClient2, HttpHeaders, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { InjectorInstance } from '../app.module';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, UrlHandlingStrategy } from '@angular/router';
import { IdService } from './id.service';
import { Form, ColumnString, CustomKeyValueString, Section, SectionAttribute, Scripts, RequestModel, Filter as Filter1, Endpoint, Event as Event1, Condition, Header, UpdateValue, TypoConfirmationHelper, ControlCollectionNValue, PageCache, RunningNumber } from '../shared/interface/form-data-advanced';
import { map, catchError, finalize } from 'rxjs/operators'
import { throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';
import * as $ from 'jquery';
//import *  as  data from '../../assets/jsons/timeSheet.json';
import { GeneratedFile } from '@angular/compiler';
//import *  as  filter from '../../assets/jsons/filter.json';
import { AppConstants } from '../constants/AppConstants';
//import { truncate } from 'fs';
const headerOption = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
}
/* declare javascript function thats function use in index.html */
declare var setDivValueAfterServerCall: any;
declare var sendtoSocket: any;
declare var liveReportSocket: any;
declare var disconnectLiveWebSocket: any;
declare var onClickForTd: any;
declare var disconnectWebSocket: any;
declare var setInputValue: any;
declare var getInputValue: any;
declare var modalLoader: any;
declare var sendConnectToSocket: any;
declare var doDirectSerialConnection: any;
declare var disconnectDirectSerial: any;
declare var addEventListenerForBarcCodeScanner: any;

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  private httpClient: HttpClient2;
  private model: any;
  public updateTr: any;
  private moduleName: string;
  public currentId: any;
  public ids: string[] = [];
  public isAddCase: boolean;
  validationMsg: string;
  datacollection1: any;
  public conditions = [];
  public allSearchData: Object[];
  public isPageLoaded: boolean;
  private scripts: any = {};
  private isHelpDataFound: boolean;
  public tableRow;

  public isBarcodeScanned: boolean;
  isfunctionAssignedForAutoDeleteOfLocationStorage:boolean = false;
  arrayOfFetchData: Array<UpdateValue>;
  section: Section;
  balanceRecordSection: Section;
  pageInfo2: any;
  typoConfirmationHelpers: Array<TypoConfirmationHelper>;
  assignmentStatusHeader: Array<any>;
  taskBoardResponseData: [];
  ScriptStore: Scripts[] = (this.checkIfPageRequireMqttDirectSerial()) ? [
    { name: 'Mqttws_Script', src: '../../../assets/scripts/mqttws31.js' },
 { name: 'livews_Script', src: '../../../assets/scripts/reportSocket.js' }

  ] : [];
  constructor(private idService: IdService,
    private http: HttpClient2,
    private authService: AuthService,
    public router: Router,
    private toastr: ToastrService) {
    this.httpClient = InjectorInstance.get<HttpClient2>(HttpClient2);
    this.arrayOfFetchData = new Array<UpdateValue>();

    /* INITIALING THE SCRIPTS */

    this.ScriptStore.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src
      };
    });
    this.isDataPopulated = false;

    this.isBarcodeScanned = false;
  }
  private firstDay: Date;
  private lastDay: Date;
  private isDataPopulated: boolean;

  updateModule(moduleTemp: string) {
    this.moduleName = moduleTemp;
  }

  loadScript(name: string) {
    return new Promise((resolve, reject) => {
      /* resolve if already loaded */
      if (this.scripts[name].loaded) {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      }
      else {
        /* ----------------------------load script Url ----------------------------*/
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

  initializeDataArray() {
    this.arrayOfFetchData = new Array<UpdateValue>();
  }

  initializeSearchVariables() {
    this.typoConfirmationHelpers = new Array<TypoConfirmationHelper>();
  }

  updateTypeOfCase(isAdd: boolean) {
    this.isAddCase = isAdd;
  }

  getInputValue(controlId): string {
    let controlRef = document.getElementById(controlId) as HTMLInputElement;
    return controlRef != null ? controlRef.value : '';
  }

  setInputValue(currentId, valueToSet) {
    let controlRef = document.getElementById(currentId) as HTMLInputElement;
    if (controlRef != null)
      controlRef.value = valueToSet;
  }
  updateIdService(idService: IdService) {
    this.idService = idService;
  }
  getIdService() {
    return this.idService;
  }
  //recursive
  findSectionAttributesRecursively(section: Section, controlId: string): SectionAttribute {
    let sectionAttribute_temp: SectionAttribute;
    let found = false;
    section.SectionAttributes.forEach(sectionAttribute => {
      if (sectionAttribute.ControlName == controlId) {
        sectionAttribute_temp = sectionAttribute;
        found = true;
        return;
      }

    });

    section.SubSections.forEach(section => {
      sectionAttribute_temp = this.findSectionAttributesRecursively(section, controlId);
    });

    return sectionAttribute_temp;
  }


  checkIfPageRequireMqttDirectSerial(): boolean {
    let status: boolean
    status = (window.location.pathname.search('home') >= 0 || window.location.pathname.search('Dashboard') >= 0 || window.location.pathname.search('sampleMethodStageReadings2') >= 0 || window.location.pathname.search('instrumentCalibrationSets') >= 0 || window.location.pathname.search('internalCalibrations') >= 0 || window.location.pathname.search('balanceRecords') >= 0 || window.location.pathname.search('liveprojectreport') >= 0);
    return status;
  }

  // checkIfPageRequireMqttDirectSerial():boolean{
  //   let status:boolean
  //   status = false;
  //     if(window.location.pathname.search('sampleMethodStageReadings2')){
  //       status=true;
  //     }else if(window.location.pathname.search('instrumentCalibrationSets')){
  //       status=true;
  //     }else if(window.location.pathname.search('internalCalibrations')){
  //       status=true;
  //     }else if(window.location.pathname.search('balanceRecords')){
  //       status=true;
  //     }
  //   status = true;
  //   return status;
  // }


  //Add new heders in data fetching times
  appendHeaders(additionalHeaders?: Array<ColumnString>): HttpHeaders {
    let headers1 = new HttpHeaders();
    headers1 = headers1.set('Content-Type', 'application/json');
    //Setting authorization Headers 
    var currentUser = this.authService.getCurrentUser();
    if (currentUser != null) {
      headers1 = headers1.set(`Authorization`, this.authService.getAuthorizationHeaderValue());
    }
    if (additionalHeaders != null && additionalHeaders.length > 0) {
      for (let i = 0; i < additionalHeaders.length; i++) {
        headers1 = headers1.set(additionalHeaders[i].Key, additionalHeaders[i].Value);
      }
    }
    return headers1;
  }

  appendHeadersForExcel(additionalHeaders?: Array<ColumnString>): HttpHeaders {
    let headers1 = new HttpHeaders();
    // headers1 = headers1.set('Content-Type', 'application/vnd.ms-excel');
    // headers1 = headers1.set('responseType', 'ResponseContentType.Blob');
    headers1 = headers1.set('Content-Type', 'text/html; charset=utf-8');
    //Setting authorization Headers 
    var currentUser = this.authService.getCurrentUser();
    if (currentUser != null) {
      headers1 = headers1.set(`Authorization`, this.authService.getAuthorizationHeaderValue());
    }
    if (additionalHeaders != null && additionalHeaders.length > 0) {
      for (let i = 0; i < additionalHeaders.length; i++) {
        headers1 = headers1.set(additionalHeaders[i].Key, additionalHeaders[i].Value);
      }
    }
    return headers1;
  }


  autoComplete(url: string, additionalHeader: Array<ColumnString>, search: string): Observable<any> {

    let headers1 = this.appendHeaders(additionalHeader);
    let headers = { headers: headers1 }

    return this.httpClient
      .get(url + "/" + search, headers)
      .pipe(
        catchError((err) => {
          return throwError(err);
        }),
        finalize(() => { }))
  }
  /*--------------------------------- get History data---------------*/
  getHistoryDataFormService(url: string, id: any): Observable<any> {
    let headers1 = this.appendHeaders(null);
    let headers = { headers: headers1 }

    return this.httpClient
      .get(url + '/' + id, headers)
      .pipe(
        catchError((err) => {
          return throwError(err);
        }),
        finalize(() => { }))
  }
  /*--------------------------get data for server call--------------------------------*/
  getDataFormService(url: string, additionalHeader?: Array<ColumnString>): Observable<any> {

    let headers1 = this.appendHeaders(additionalHeader);

    let headers = { headers: headers1 }
    return this.httpClient
      .get(url, headers)
      .pipe(
        catchError((err) => {
          return throwError(err);
        }),
        finalize(() => { }))
  }


  /*--------------------------get data for server call--------------------------------*/
  getDataFormStageReading2Service(url: string, pageNumber: any, pageSize: any): Observable<any> {
    let headers1 = new HttpHeaders();
    headers1 = headers1.set(`Authorization`, this.authService.getAuthorizationHeaderValue());
    headers1 = headers1.set('page_number', pageNumber.toString());
    headers1 = headers1.set('page_size', pageSize.toString());
    let headers = { headers: headers1 }
    return this.httpClient
      .get(url, headers)
      .pipe(
        catchError((err) => {
          return throwError(err);
        }),
        finalize(() => { }))
  }

  /*--------------------------get excel for server call--------------------------------*/


  exportExcelData(url: any) {
    const headers = new HttpHeaders({ 'Authorization': this.authService.getAuthorizationHeaderValue() });
    return this.httpClient.get(url, { headers, responseType: 'blob' });
  }

  /*--------------------------get data for server call--------------------------------*/
  getDataFormService1(url: string): Observable<any> {
    let headers1 = this.appendHeaders(null);
    let headers = { headers: headers1 }

    return this.httpClient
      .get(url, headers)
      .pipe(
        catchError((err) => {
          return throwError(err);
        }),
        finalize(() => { }))
  }

  /*--------------------------get TextData for server call--------------------------------*/
  getTextDataFormService(url: string): Observable<any> {
    let headers1 = new HttpHeaders();
    headers1 = headers1.set('Content-Type', 'text/plain; charset=utf-8');
    headers1 = headers1.set(`Authorization`, this.authService.getAuthorizationHeaderValue());
    headers1 = headers1.set('Accept', 'text/plain');
    return this.httpClient
      .get(url, { headers: headers1, responseType: 'text' })
      .pipe(
        catchError(err => {
          return throwError(err);
        }),
        finalize(() => { }))
  }
  updateCurrentModel(model: any) {
    this.model = model;
  }

  getCurrentModel() {
    return this.model;
  }
  /*-------------------------post data using Observable ---------------------------*/
  postDataToService(url: string, data: any, additionalHeader?: Array<ColumnString>): Observable<any> {
    let headers1 = this.appendHeaders(additionalHeader);
    let headers = { headers: headers1 }
    $(modalLoader()).show();
    var serviceData = this.http.post(url, data, headers).pipe(
      catchError((err) => {
        $(modalLoader()).hide();
        return throwError(err);
      })
    );
    return serviceData;
  }
  /*-------------------------postFile data To services ---------------------------*/
  fileDataToService(url: string, data: any, id: string, operation: string,
    sectionAttributeEvent: Event1, downloadId, deleteId): Observable<any> {
    let headers1 = new HttpHeaders();
    if (operation == 'PUT') {
      return this.http.put(url, data, { headers: headers1 }).pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
    }
    else {
      return this.http.post<any>(url, data, {
        headers: headers1,
        reportProgress: true,
        observe: 'events'
      }).pipe(map((event) => {

        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round(100 * event.loaded / event.total);
            return { status: 'progress', message: progress };
          case HttpEventType.Response:
            let fileControl = document.getElementById(id);
            if (fileControl != null) {
              fileControl.setAttribute('tag', event.body.DataCollection[0].FileGuid);
              let element = document.getElementById(downloadId) as HTMLAnchorElement;
              let elementDel = document.getElementById(deleteId) as HTMLAnchorElement;
              let url_for_download = this.getApiUrl(sectionAttributeEvent.EndPoint.ModuleName) + sectionAttributeEvent.EndPoint.EndpointAddress + "/" + event.body.DataCollection[0].FileGuid;
              if (event.body.DataCollection[0].FileGuid != null && event.body.DataCollection[0].FileGuid != '' && event.body.DataCollection[0].FileGuid != AppConstants.GENERAL.DEFAULT_GUID) {
                $(element).show();
                /*Download  Files*/
                element.style.display = 'inline-block';
                element.setAttribute('href', url_for_download);
                elementDel.style.display = 'inline-block';
                element.setAttribute('tag', event.body.DataCollection[0].FileGuid);

              }
              else {
                element.style.display = 'none';

              }
            }
            return event.body;
          default:
            return `Unhandled event: ${event.type}`;
        }
      })
      );
    }
  }
  /*-------------------------put data For Server call ---------------------------*/
  putDataToService(url: string, id: number, data: any): Observable<any> {

    let headers = {
      headers: this.appendHeaders(null)
    };
    $(modalLoader()).show();
    return this.http.put(url + '/' + id, data, headers).pipe(
      catchError((err) => {
        $(modalLoader()).hide();
        return throwError(err);
      })

    );

  }

  putDataToServiceForInputData(url: string, data: any): Observable<any> {

    let headers = {
      headers: this.appendHeaders(null)
    };
    $(modalLoader()).show();
    return this.http.put(url, data, headers).pipe(
      catchError((err) => {
        $(modalLoader()).hide();
        return throwError(err);
      })

    );

  }
  deleteDataToService(url: string, id: any): Observable<any> {

    /*Adding the header for Authorization */
    let headers1 = new HttpHeaders();
    headers1 = headers1.set('Content-Type', 'application/json');

    //Setting authorization Headers if any 
    var currentUser = this.authService.getCurrentUser();
    if (currentUser != null) {
      headers1 = headers1.set(`Authorization`, this.authService.getAuthorizationHeaderValue());
    }
    let headers = { headers: headers1 }
    $(modalLoader()).show();
    return this.http.delete(url + '/' + id, headers).pipe(
      catchError((err) => {
        $(modalLoader()).hide();
        return throwError(err);
      })
    );
  }
  ////Show existing record data
  getValuefromKeyValue(currentObject: any, keys: Array<string>, keyValues: Array<CustomKeyValueString>, valueName: string): string {
    let selectedKeyValues = keyValues.filter(t => t.Value == valueName);
    let temp_value = '';
    if (selectedKeyValues.length > 0) {
      temp_value = (keys.length == 0 || valueName == null) ? '' : Object.values(currentObject)[selectedKeyValues[0].Key].toString();
    }
    return temp_value;
  }
  getTagValue(currentObject: any, keys: Array<string>, keyValues: Array<CustomKeyValueString>, sectionAttribute: SectionAttribute) {
    let affectedModelName = sectionAttribute.Events.filter(t => t.affectedControlModelName != null);
    let selectedKeyValues = keyValues.filter(t => t.Value == affectedModelName[0].affectedControlModelName);
    let temp_value = '';
    if (selectedKeyValues.length > 0) {
      temp_value = (keys.length == 0 || affectedModelName[0].affectedControlModelName == null) ? '' : Object.values(currentObject)[selectedKeyValues[0].Key].toString();
    }
    return temp_value
  }

  updateLocalCache(url: any, data: any, utilityService: UtilityService) {

    let existingData = this.arrayOfFetchData.filter(t => t.key == url);
    //UPDATION CODE
    if (existingData != null && existingData.length > 0) {
      for (let i = 0; i < utilityService.arrayOfFetchData.length; i++) {
        if (utilityService.arrayOfFetchData[i].key === url) {
          utilityService.arrayOfFetchData[i].value = data;
          break;
        }
      };
    }
    else {
      utilityService.arrayOfFetchData.push({
        key: url,
        value: data
      });
    }


  }

  //--------Multiselect data show edit time------------------------
  getDivContainerValue(currentObject: any, valueName: string): Array<HTMLElement> {
    let arrayOfDivs: Array<HTMLElement>;
    arrayOfDivs = new Array<HTMLElement>();
    if (valueName != null && valueName != undefined) {
      for (let x in currentObject) {
        if (typeof currentObject[x] === 'object' && Array.isArray(currentObject[x])) {
          if (currentObject[x] != null) {
            currentObject[x].forEach(element => {
              var div = document.createElement('div') as HTMLDivElement;
              div.className = "multiDiv";
              div.setAttribute('tag', element.Key);
              div.innerHTML = element.Value + '<span class="closeSkills" onclick="removeChildDiv(this);">&times</span>';
              arrayOfDivs.push(div);
            });
          }
        }
      }
    }
    return arrayOfDivs;
  }
  //get data using promises
  getDataFromApiAsPromise(url: string, additionalHeader?: Array<ColumnString>): Promise<any> {
    let headers1 = this.appendHeaders(additionalHeader);
    let headers = { headers: headers1 }
    let serviceData = this.httpClient.get(url, headers).toPromise();
    return serviceData;
  }

  // async getDataFormServiceWithDelegate(url: string, formDataRef: Form) {
  //   var serviceData = this.httpClient.get(url);
  //   serviceData.subscribe(data => {
  //     formDataRef = data as Form;
  //     //this.getAllFetchData(url, data);
  //   }, err => {
  //   });
  // }

  /*------------------GET URL which types ---------------------------------------*/
  getApiUrl(module1: string) {
    module1 = module1 == null ? this.moduleName : module1;
    let baseUrl = ''
    if (module1.toLocaleLowerCase() == 'platform') {
      baseUrl = environment.platformBaseUrl;
    } else if (module1.toLocaleLowerCase() == 'projectplus') {
      baseUrl = environment.projectPlusBaseUrl
    }
    else if (module1.toLocaleLowerCase() == 'iotplus') {
      baseUrl = environment.iotPlusBaseUrl
    }
    else if (module1.toLocaleLowerCase() == 'salescrmplus') {
      baseUrl = environment.salesCRMPlusBaseUrl
    }
    return (baseUrl);
  }

  navigateAddEditDirect(routeEntry: string) {
    this.router.navigate([routeEntry]);
  }
  /*-------------------------Navigate Add/Edit Page ------------------------*/
  navigateAddEdit(routeEntry: string, id: number) {
    this.router.navigate([routeEntry, id]);
  }
  /*-------------------------Navigate Index ------------------------*/
  navigateIndex(routeEntry: string) {
    this.router.navigate([routeEntry]);
  }
  /*-------------------------generate AddressGuid ------------------------*/
  getUUID() {
    return this.idService.generate();
  }

  isDate(x) {
    return (null != x) && !isNaN(x) && ("undefined" !== typeof x.getDate);
  }


  handleError(error: HttpErrorResponse) {
    return throwError(error);
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  createRowForGivenTable(htmlTableRef: HTMLTableElement, section: Section, currentObject?: any, utilityServiceTemp?: UtilityService) {
    let htmlTableRow: HTMLTableRowElement = htmlTableRef.insertRow();
    let utilityService = utilityServiceTemp == null ? this : utilityServiceTemp;
    /* TODO: add code to generate table row as per Section and Section Attributes, please use re-usable methods */
    let isHiddenUUIDPopulated = false;

    let keys = (currentObject == null) ? [] : Object.keys(currentObject);
    let keyValues: Array<CustomKeyValueString>;
    keyValues = new Array<CustomKeyValueString>();

    let iCount = 0;
    keys.forEach(key => {
      keyValues.push({
        Key: iCount,
        Value: key
      })
      iCount++;
    });

    let index = 0
    section.SectionAttributes.forEach(sectionAttribute => {
      /*populating the hidden UUID initially */
      if (!isHiddenUUIDPopulated) {
        /*********** QUICK CONTROL REFERENCE ************ */

        let htmlTdForHiddenControls = htmlTableRow.insertCell();
        htmlTdForHiddenControls.className = 'tdHide';
        htmlTdForHiddenControls.style.display = 'none';

        /*1st Hidden Control for UUID*/
        let hiddenControl = document.createElement('input') as HTMLInputElement;
        hiddenControl.type = "hidden";
        hiddenControl.value = utilityService.getUUID();
        hiddenControl.className = "hiddenUUID";
        htmlTdForHiddenControls.appendChild(hiddenControl);

        /*FINDING ALL HIDDEN CONTROL AND PUBLISHING THEM AS PER DEFINATION IN MOCK/STR FOR TABLE*/
        let allHiddenControls = section.SectionAttributes.filter(t => t.ControlType == "tblhidden");

        for (let i = 0; i < allHiddenControls.length; i++) {
          let hiddenControl2 = document.createElement('input') as HTMLInputElement;
          hiddenControl2.type = "hidden";
          hiddenControl2.className = allHiddenControls[i].ControlName; //  "hiddenId";
          /*Show existing record data*/
          let value_temp = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, allHiddenControls[i].ModelPropName);
          if (value_temp != null) {
            hiddenControl2.value = value_temp.toString(); // "";
            htmlTdForHiddenControls.appendChild(hiddenControl2);
          }
        }

        isHiddenUUIDPopulated = true;
      }

      let htmlTd = htmlTableRow.insertCell();
      let isControlAvailable = false;
      /*Show existing record data*/
      let value_contextual = this.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
      switch (sectionAttribute.ControlType) {
        /*APPEND SELECT BOX IN ADD/EDIT TABLE  */
        case "tbldate":
          let dateControl = document.createElement('input') as HTMLInputElement;
          dateControl.type = "date";
          dateControl.className = sectionAttribute.ControlName;
          dateControl.value = value_contextual;
          htmlTd.appendChild(dateControl);
          isControlAvailable = true;
          break;

        case "tbltext":
          /*APPEND TEXT BOX IN ADD/EDIT TABLE  */
          let textControl = document.createElement('input') as HTMLInputElement;
          textControl.className = sectionAttribute.ControlName;
          textControl.type = "text";
          textControl.autocomplete = "off";
          let value_temp1 = value_contextual; //this.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
          textControl.value = value_temp1;
          textControl.id = sectionAttribute.ControlName + "_" + index;
          htmlTd.appendChild(textControl);
          isControlAvailable = true;
          break;

        case "tblselect":
          /*---------APPEND TEXT BOX IN ADD/EDIT TABLE ---------------------*/
          let selectControl = document.createElement('select') as HTMLSelectElement;
          selectControl.className = sectionAttribute.ControlName;
          let value_temp3 = value_contextual;

          if (selectControl.options.length > 0) {
            for (let i = 0; i < selectControl.options.length; i++) {
              if (selectControl.options[i].value == value_temp3) {
                selectControl.selectedIndex = i;
                break;
              }
            }
          }
          htmlTd.appendChild(selectControl);
          isControlAvailable = true;
          break;
        case "tblcheckbox":
          /*-------------------------APPEND CHECK BOX IN ADD/EDIT TABLE  ---------------------------*/
          isControlAvailable = true;
          let checkBoxControl = document.createElement('input') as HTMLInputElement;
          checkBoxControl.type = "checkBox";
          checkBoxControl.className = sectionAttribute.ControlName;
          let value_temp2 = value_contextual;
          let checkBoxValue = Boolean(value_temp2);
          checkBoxControl.checked = checkBoxValue as boolean;
          htmlTd.appendChild(checkBoxControl);
          break;

        case "tblbutton":
          /*-----------------------APPEND BUTTON IN ADD/EDIT TABLE -------------------------------*/
          isControlAvailable = true;
          let buttonControl = document.createElement('input') as HTMLInputElement;
          buttonControl.className = sectionAttribute.ControlName;
          checkBoxControl.type = "button";
          htmlTd.appendChild(buttonControl);

          break;

        case "tblbuttonRowDelete":
          /*------------------APPEND DELETE BUTTON IN ADD/EDIT TABLE----------------------------*/
          isControlAvailable = true;
          let buttonControl1 = document.createElement('input') as HTMLInputElement;
          buttonControl1.type = "button";
          buttonControl1.className = sectionAttribute.ControlName;
          htmlTd.appendChild(buttonControl1);

          break;

      }

      if (!isControlAvailable) {
        htmlTd.style.display = 'none';
      }
      else if (isControlAvailable) {
        this.processSectionAttributes(section, sectionAttribute, currentObject, htmlTableRow, value_contextual, false);
        htmlTableRow.appendChild(htmlTd);
      }

      index++;
    });

    return htmlTableRow;
  }


  /*----------------------Used for setting the date as per validator----------------------*/
  setDateValidators(sectionAttribute: SectionAttribute, dateControl: HTMLInputElement) {
    /*----------------------Check for validator range---------------------------------*/
    if (sectionAttribute.Validators != null) {
      let minRanges = sectionAttribute.Validators.filter(t => t.MinRange != null);
      let minRange = minRanges != null && minRanges.length > 0 ? minRanges[0].MinRange : 0;

      let maxRanges = sectionAttribute.Validators.filter(t => t.MaxRange != null);
      let maxRange = maxRanges != null && maxRanges.length > 0 ? maxRanges[0].MaxRange : 0;

      if (minRange > 0 && maxRange > 0) {
        let minDate = new Date();
        let maxDate = new Date();

        minDate.setDate(minDate.getDate() + (365 * minRange * -1));
        maxDate.setDate(maxDate.getDate() + (365 * maxRange * -1));

        dateControl.setAttribute('max', minDate.toISOString().slice(0, 10));
        dateControl.setAttribute('min', maxDate.toISOString().slice(0, 10));
      }

    }
  }

  /* ------------------------Genarate Row for Given Table In Add/Edit Time ------------------------------------------*/
  generateRowForGivenSampleInitialization2Table(htmlTableRef: HTMLTableElement, sampleData: Array<any>,
    utilityServiceTemp?: UtilityService, rowIndex?: number) {
    let htmlTableRow: HTMLTableRowElement = htmlTableRef.insertRow();
    let isHiddenUUIDPopulated = false;
    let utilityService = utilityServiceTemp == null ? this : utilityServiceTemp;
    let index = 0;
    let path = window.location.pathname;
    let splittedValues = path.split('/');
    let splittedName = splittedValues[2].toLowerCase();
    sampleData.forEach((SD, columnIndex) => {
      let htmlTd = htmlTableRow.insertCell();
      let isControlAvailable = false;
      let isTdCase = false;
      // if (SD.MethodStageGridColumnForPopulation.IsText == true) {
      /*-------------------------------APPEND TEXT BOX IN ADD/EDIT TABLE ----------------------------------*/
      let textControl = document.createElement('input') as HTMLInputElement;
      // textControl.addEventListener('change', function (event) {
      // alert(event.target['value']);
      // });
      let rowVersion = (SD.RowVersion != null) ? SD.RowVersion : "";
      let id = (SD.Id != null) ? SD.Id : 0;
      let sampleMethodId = (SD.SampleMethodStageReadings.length == 0) ? 0 : SD.SampleMethodStageReadings[0].Id;
      let methodStagepopulationId = (SD.MethodStageGridColumnForPopulation != null) ? SD.MethodStageGridColumnForPopulation.Id : 0;
      textControl.setAttribute(AppConstants.COMMON.COMMON_ROWVERSION, rowVersion);
      textControl.setAttribute(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID, id);
      textControl.setAttribute('currentId', sampleMethodId);
      textControl.setAttribute(AppConstants.COMMON.COMMON_METHOD_STAGE_GRID_COLUMN_ID, methodStagepopulationId);
      textControl.className = SD.MethodStageGridColumnForPopulation.ColumnName + " form-control";
      /*----------------------------Show existing record data----------------------------------------------*/
      textControl.id = SD.MethodStageGridColumnForPopulation.ColumnName + "_" + rowIndex + "_" + columnIndex;
      htmlTd.appendChild(textControl);
      isControlAvailable = true;

      index++;


      if (!isControlAvailable) {
        htmlTd.style.display = 'none';
      }
      else if (isControlAvailable && isTdCase) {

      }
      else if (isControlAvailable && !isTdCase) {

        // let temp_value = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
        // utilityService.processSectionAttributes(section, sectionAttribute, currentObject, htmlTableRow, temp_value, true, null, utilityService);
        htmlTableRow.appendChild(htmlTd);
      }
    });


    let htmlTd2 = htmlTableRow.insertCell();
    let buttonControl3 = document.createElement('BUTTON') as HTMLButtonElement;
    buttonControl3.addEventListener('click', () =>
      this.aboveCurrentTableRow(buttonControl3, htmlTableRow));
    // buttonControl2.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
    buttonControl3.type = "button";
    buttonControl3.innerHTML = "&#8593";
    buttonControl3.title = "Above";
    buttonControl3.style.fontSize = "15px";
    buttonControl3.style.color = "blue";
    buttonControl3.style.borderColor = "blue";
    buttonControl3.style.borderBottomLeftRadius = "5px";
    buttonControl3.style.borderBottomRightRadius = "5px";
    buttonControl3.style.borderTopLeftRadius = "5px";
    buttonControl3.style.borderTopRightRadius = "5px";
    htmlTd2.appendChild(buttonControl3);

    let htmlTd3 = htmlTableRow.insertCell();
    let buttonControl4 = document.createElement('BUTTON') as HTMLButtonElement;
    buttonControl4.addEventListener('click', () =>
      this.downCurrentTableRow(buttonControl4, htmlTableRow));
    // buttonControl2.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
    buttonControl4.type = "button";
    buttonControl4.innerHTML = "&#8595";
    buttonControl4.style.fontSize = "15px";
    buttonControl4.style.color = "blue";
    buttonControl4.style.borderColor = "blue";
    buttonControl4.title = "Down";
    buttonControl4.style.borderBottomLeftRadius = "5px";
    buttonControl4.style.borderBottomRightRadius = "5px";
    buttonControl4.style.borderTopLeftRadius = "5px";
    buttonControl4.style.borderTopRightRadius = "5px";
    htmlTd3.appendChild(buttonControl4);

    let htmlTd4 = htmlTableRow.insertCell();
    let buttonControl5 = document.createElement('BUTTON') as HTMLButtonElement;
    buttonControl5.addEventListener('click', () =>
      this.runningCurrentTableRow(buttonControl5, htmlTableRow));
    // buttonControl2.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
    buttonControl5.type = "button";
    buttonControl5.innerHTML = "RN";
    buttonControl5.title = "RN";
    buttonControl5.id = "RN_" + rowIndex;
    htmlTd4.appendChild(buttonControl5);

    let htmlTd5 = htmlTableRow.insertCell();
    let buttonControl6 = document.createElement('BUTTON') as HTMLButtonElement;
    buttonControl6.addEventListener('click', () =>
      this.repeatTableRow(buttonControl5, htmlTableRow));
    // buttonControl2.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
    buttonControl6.type = "button";
    buttonControl6.innerHTML = "RP";
    buttonControl6.title = "RP";
    buttonControl6.id = "RP_" + rowIndex;
    htmlTd5.appendChild(buttonControl6);


    let htmlTd1 = htmlTableRow.insertCell();
    let buttonControl2 = document.createElement('BUTTON') as HTMLButtonElement;
    buttonControl2.addEventListener('click', () =>
      this.deleteCurrentTableRow(buttonControl2, htmlTableRow));
    // buttonControl2.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
    buttonControl2.type = "button";
    buttonControl2.innerHTML = "&#215;";
    buttonControl2.title = "Delete";
    buttonControl2.style.fontSize = "20px";
    buttonControl2.style.color = "red";
    buttonControl2.style.borderColor = "red";
    buttonControl2.style.borderBottomLeftRadius = "5px";
    buttonControl2.style.borderBottomRightRadius = "5px";
    buttonControl2.style.borderTopLeftRadius = "5px";
    buttonControl2.style.borderTopRightRadius = "5px";
    // buttonControl2.className = sectionAttribute.ControlName;
    htmlTd1.appendChild(buttonControl2);
    return htmlTableRow;
  }

  generateRowForGivenSampleInitialization2TablePrevious(htmlTableRef: HTMLTableElement, sampleData: Array<any>,
    utilityServiceTemp?: UtilityService, rowIndex?: number) {
    let htmlTableRow: HTMLTableRowElement = htmlTableRef.insertRow();
    let isHiddenUUIDPopulated = false;
    let utilityService = utilityServiceTemp == null ? this : utilityServiceTemp;
    let index = 0;
    let path = window.location.pathname;
    let splittedValues = path.split('/');
    let splittedName = splittedValues[2].toLowerCase();
    sampleData.forEach((SD, columnIndex) => {
      let htmlTd = htmlTableRow.insertCell();
      let isControlAvailable = false;
      let isTdCase = false;
      // if (SD.MethodStageGridColumnForPopulation.IsText == true) {
      /*-------------------------------APPEND TEXT BOX IN ADD/EDIT TABLE ----------------------------------*/
      let textControl = document.createElement('input') as HTMLInputElement;
      // textControl.addEventListener('change', function (event) {
      // alert(event.target['value']);
      // });
      let rowVersion = (SD.RowVersion != null) ? SD.RowVersion : "";
      let sampleMethodStageId = (SD.SampleMethodStageId != null) ? SD.SampleMethodStageId : 0;
      let cellId = (SD.Id != null) ? SD.Id : 0;
      //let sampleMethodId = (SD.SampleMethodStageReadings.length == 0) ? 0 : SD.SampleMethodStageReadings[0].Id;
      // let methodStagepopulationId = (SD.MethodStageGridColumnForPopulation != null) ? SD.MethodStageGridColumnForPopulation.Id : 0;
      textControl.setAttribute(AppConstants.COMMON.COMMON_ROWVERSION, rowVersion);
      textControl.setAttribute(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID, sampleMethodStageId);
      textControl.setAttribute(AppConstants.COMMON.COMMON_TABLE_ID, cellId);
      //textControl.setAttribute('currentId', sampleMethodId);
      // textControl.setAttribute(AppConstants.COMMON.COMMON_METHOD_STAGE_GRID_COLUMN_ID, methodStagepopulationId);
      textControl.className = SD.ColumnName + " form-control";
      /*----------------------------Show existing record data----------------------------------------------*/
      textControl.id = SD.ColumnName + "_" + rowIndex + "_" + columnIndex;
      htmlTd.appendChild(textControl);
      isControlAvailable = true;

      index++;


      if (!isControlAvailable) {
        htmlTd.style.display = 'none';
      }
      else if (isControlAvailable && isTdCase) {

      }
      else if (isControlAvailable && !isTdCase) {

        // let temp_value = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
        // utilityService.processSectionAttributes(section, sectionAttribute, currentObject, htmlTableRow, temp_value, true, null, utilityService);
        htmlTableRow.appendChild(htmlTd);
      }
    });


    let htmlTd2 = htmlTableRow.insertCell();
    let buttonControl3 = document.createElement('BUTTON') as HTMLButtonElement;
    buttonControl3.addEventListener('click', () =>
      this.aboveCurrentTableRow(buttonControl3, htmlTableRow));
    // buttonControl2.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
    buttonControl3.type = "button";
    buttonControl3.innerHTML = "&#8593";
    buttonControl3.title = "Above";
    buttonControl3.style.fontSize = "20px";
    buttonControl3.style.color = "blue";
    buttonControl3.style.borderColor = "blue";
    buttonControl3.style.borderBottomLeftRadius = "5px";
    buttonControl3.style.borderBottomRightRadius = "5px";
    buttonControl3.style.borderTopLeftRadius = "5px";
    buttonControl3.style.borderTopRightRadius = "5px";
    htmlTd2.appendChild(buttonControl3);

    let htmlTd3 = htmlTableRow.insertCell();
    let buttonControl4 = document.createElement('BUTTON') as HTMLButtonElement;
    buttonControl4.addEventListener('click', () =>
      this.downCurrentTableRow(buttonControl4, htmlTableRow));
    // buttonControl2.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
    buttonControl4.type = "button";
    buttonControl4.innerHTML = "&#8595";
    buttonControl4.title = "Down";
    buttonControl4.style.fontSize = "20px";
    buttonControl4.style.color = "blue";
    buttonControl4.style.borderColor = "blue";
    buttonControl4.style.borderBottomLeftRadius = "5px";
    buttonControl4.style.borderBottomRightRadius = "5px";
    buttonControl4.style.borderTopLeftRadius = "5px";
    buttonControl4.style.borderTopRightRadius = "5px";
    htmlTd3.appendChild(buttonControl4);

    let htmlTd4 = htmlTableRow.insertCell();
    let buttonControl5 = document.createElement('BUTTON') as HTMLButtonElement;
    buttonControl5.addEventListener('click', () =>
      this.runningCurrentTableRow(buttonControl5, htmlTableRow));
    // buttonControl2.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
    buttonControl5.type = "button";
    buttonControl5.innerHTML = "RN";
    buttonControl5.title = "RN";
    buttonControl5.id = "RN_" + rowIndex;
    htmlTd4.appendChild(buttonControl5);

    let htmlTd5 = htmlTableRow.insertCell();
    let buttonControl6 = document.createElement('BUTTON') as HTMLButtonElement;
    buttonControl6.addEventListener('click', () =>
      this.repeatTableRow(buttonControl5, htmlTableRow));
    // buttonControl2.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
    buttonControl6.type = "button";
    buttonControl6.innerHTML = "RP";
    buttonControl6.title = "RP";
    buttonControl6.id = "RP_" + rowIndex;
    htmlTd5.appendChild(buttonControl6);

    let htmlTd1 = htmlTableRow.insertCell();
    let buttonControl2 = document.createElement('BUTTON') as HTMLButtonElement;
    buttonControl2.addEventListener('click', () =>
      this.deleteCurrentTableRow(buttonControl2, htmlTableRow));
    // buttonControl2.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
    buttonControl2.type = "button";
    buttonControl2.innerHTML = "&#215;";
    buttonControl2.title = "Delete";
    buttonControl2.style.fontSize = "20px";
    buttonControl2.style.color = "red";
    buttonControl2.style.borderColor = "red";
    buttonControl2.style.borderBottomLeftRadius = "5px";
    buttonControl2.style.borderBottomRightRadius = "5px";
    buttonControl2.style.borderTopLeftRadius = "5px";
    buttonControl2.style.borderTopRightRadius = "5px";
    // buttonControl2.className = sectionAttribute.ControlName;
    htmlTd1.appendChild(buttonControl2);
    return htmlTableRow;
  }
  /* ------------------------Genarate Row for Given Table In Add/Edit Time ------------------------------------------*/
  generateRowForGivenSamplemethodstagereadings2Table(htmlTableRef: HTMLTableElement, sampleData: Array<any>,
    utilityServiceTemp?: UtilityService, rowIndex?: number) {

    let htmlTableRow: HTMLTableRowElement = htmlTableRef.insertRow();
    let isHiddenUUIDPopulated = false;
    let utilityService = utilityServiceTemp == null ? this : utilityServiceTemp;
    let index = 0;
    let path = window.location.pathname;
    let splittedValues = path.split('/');
    let splittedName = splittedValues[2].toLowerCase();
    // sampleData.sort(function (a, b) {
    //   return a.MethodStageGridColumnForPopulation.Sequence - b.MethodStageGridColumnForPopulation.Sequence;
    // });
    sampleData.forEach((SD, i) => {
      let htmlTd = htmlTableRow.insertCell();
      let isControlAvailable = false;
      let isTdCase = false;
      if (SD.MethodStageGridColumnForPopulation.IsText == true) {
        let sampleMethodStageReadingId = (SD.SampleMethodStageReadings != undefined) ? SD.SampleMethodStageReadings.Id : 0

        /*-------------------------------APPEND TEXT BOX IN ADD/EDIT TABLE ----------------------------------*/
        let textControl = document.createElement('input') as HTMLInputElement;
        textControl.setAttribute(AppConstants.COMMON.COMMON_ROWVERSION, SD.RowVersion);
        textControl.setAttribute(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID, SD.Id);
        textControl.setAttribute('Id', sampleMethodStageReadingId);
        textControl.setAttribute(AppConstants.COMMON.COMMON_METHOD_STAGE_GRID_COLUMN_ID, SD.MethodStageGridColumnForPopulation.Id);
        textControl.className = SD.MethodStageGridColumnForPopulation.ColumnName + " form-control";
        let setId = SD.MethodStageGridColumnForPopulation.ColumnName.replace(" ", '_');
        let updateId = setId + "_" + rowIndex.toString() + "_" + i;
        /*----------------------------Show existing record data----------------------------------------------*/
        textControl.id = updateId;
        htmlTd.appendChild(textControl);
        isControlAvailable = true;
      }
      else {
        htmlTd.innerText = "";
        let setId = SD.MethodStageGridColumnForPopulation.ColumnName.replace(" ", '_');
        let sampleMethodStageReadingId = (SD.SampleMethodStageReadings != undefined) ? SD.SampleMethodStageReadings.Id : 0
        let updateId = setId + "_" + rowIndex.toString() + "_" + i;
        htmlTd.id = updateId;
        htmlTd.setAttribute(AppConstants.COMMON.COMMON_ROWVERSION, SD.RowVersion);
        htmlTd.setAttribute(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID, SD.Id);
        htmlTd.setAttribute('Id', sampleMethodStageReadingId);
        htmlTd.setAttribute(AppConstants.COMMON.COMMON_METHOD_STAGE_GRID_COLUMN_ID, SD.MethodStageGridColumnForPopulation.Id);
        htmlTd.className = SD.MethodStageGridColumnForPopulation.ColumnName + ' tdDynamic ';
        htmlTd.id = updateId;
        if (SD.MethodStageGridColumnForPopulation.IsInput == true && SD.MethodStageGridColumnForPopulation.IsText == false) {
          htmlTd.addEventListener('click', function () {
            onClickForTd(updateId, splittedName, null);
          });
        }
        isTdCase = true;
        isControlAvailable = true;
      }

      index++;


      if (!isControlAvailable) {
        htmlTd.style.display = 'none';
      }
      else if (isControlAvailable && isTdCase) {

      }
      else if (isControlAvailable && !isTdCase) {

        // let temp_value = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
        // utilityService.processSectionAttributes(section, sectionAttribute, currentObject, htmlTableRow, temp_value, true, null, utilityService);
        htmlTableRow.appendChild(htmlTd);
      }
    });

    return htmlTableRow;
  }
  setRunningNoForGivenSampleInitialization2Table(htmlTableRef: HTMLTableElement, sampleData: Array<any>,
    utilityServiceTemp?: UtilityService, rowIndex?: number) {

    let htmlTableRow: HTMLTableRowElement = htmlTableRef.insertRow();
    let isHiddenUUIDPopulated = false;
    let utilityService = utilityServiceTemp == null ? this : utilityServiceTemp;
    let index = 0;
    let path = window.location.pathname;
    let splittedValues = path.split('/');
    let splittedName = splittedValues[2].toLowerCase();
    sampleData.forEach(SD => {

      let htmlTd = htmlTableRow.insertCell();
      let isControlAvailable = false;
      let isTdCase = false;
      /*-------------------------------APPEND TEXT BOX IN ADD/EDIT TABLE ----------------------------------*/
      let textControl = document.createElement('input') as HTMLInputElement;
      textControl.className = SD.MethodStageGridColumnForPopulation.ColumnName + " form-control";
      /*----------------------------Show existing record data----------------------------------------------*/
      textControl.id = SD.MethodStageGridColumnForPopulation.ColumnName + "_" + utilityService.getUUID();
      htmlTd.appendChild(textControl);
      // isControlAvailable = true;


      let buttonControl2 = document.createElement('BUTTON') as HTMLButtonElement;
      // buttonControl2.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
      buttonControl2.type = "button";
      buttonControl2.innerHTML = "&#215;";
      buttonControl2.title = "Delete";
      buttonControl2.style.fontSize = "20px";
      buttonControl2.style.color = "red";
      buttonControl2.style.borderColor = "red";
      buttonControl2.style.borderBottomLeftRadius = "5px";
      buttonControl2.style.borderBottomRightRadius = "5px";
      buttonControl2.style.borderTopLeftRadius = "5px";
      buttonControl2.style.borderTopRightRadius = "5px";
      // buttonControl2.className = sectionAttribute.ControlName;
      htmlTd.appendChild(buttonControl2);

      index++;
      if (!isControlAvailable) {
        htmlTd.style.display = 'none';
      }
      else if (isControlAvailable && isTdCase) {

      }
      else if (isControlAvailable && !isTdCase) {
        htmlTableRow.appendChild(htmlTd);
      }
    });
    return htmlTableRow;
  }

  /* ------------------------Genarate Row for Given Table In Add/Edit Time ------------------------------------------*/
  generateSamplentiRowForGivenTable(htmlTableRef: HTMLTableElement, section: Section, currentObject?: any,
    utilityServiceTemp?: UtilityService, inputModel?: any, selectedValue?: any, rowIndex?: number) {


    let htmlTableRow: HTMLTableRowElement = htmlTableRef.insertRow();
    let isHiddenUUIDPopulated = false;

    let keys = (currentObject == null) ? [] : Object.keys(currentObject);
    let keyValues: Array<CustomKeyValueString>;
    keyValues = new Array<CustomKeyValueString>();
    let utilityService = utilityServiceTemp == null ? this : utilityServiceTemp;
    let iCount = 0;
    keys.forEach(key => {
      keyValues.push({
        Key: iCount,
        Value: key
      })
      iCount++;
    });

    let index = 0;
    let path = window.location.pathname;
    let splittedValues = path.split('/');
    let splittedName = splittedValues[2].toLowerCase();
    section.SectionAttributes.forEach(sectionAttribute => {

      selectedValue = currentObject != null ? currentObject[sectionAttribute.ModelPropName] :
        (sectionAttribute.ModelPropType == "number" ? 0 : "");

      /*--------------------------populating the hidden UUID initially---------------------------*/
      if (!isHiddenUUIDPopulated) {
        /********** QUICK CONTROL REFERENCE *********** */

        let htmlTdForHiddenControls = htmlTableRow.insertCell();
        htmlTdForHiddenControls.className = 'tdHide';
        htmlTdForHiddenControls.style.display = 'none';

        /*---------------------------1st Hidden Control for UUID-------------------------*/
        let hiddenControl = document.createElement('input') as HTMLInputElement;
        hiddenControl.type = "hidden";
        hiddenControl.value = utilityService.getUUID(); //.getIdService().generate();
        hiddenControl.className = "hiddenUUID";
        htmlTdForHiddenControls.appendChild(hiddenControl);


        /*--------------FINDING ALL HIDDEN CONTROL AND PUBLISHING THEM AS PER DEFINATION IN MOCK/STR FOR TABLE--------------------------*/
        let allHiddenControls = section.SectionAttributes.filter(t => t.ControlType == "tblhidden");
        for (let i = 0; i < allHiddenControls.length; i++) {
          let hiddenControl2 = document.createElement('input') as HTMLInputElement;
          hiddenControl2.type = "hidden";
          hiddenControl2.className = allHiddenControls[i].ControlName;
          /*----------------------------Show existing record data -----------------------------------------------------*/
          let value_temp = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, allHiddenControls[i].ModelPropName);
          value_temp = utilityService.getObjectTypeCastedData(value_temp, allHiddenControls[i]);
          hiddenControl2.value = value_temp;
          htmlTdForHiddenControls.appendChild(hiddenControl2);
        }
        isHiddenUUIDPopulated = true;
      }

      let htmlTd = htmlTableRow.insertCell();
      let isControlAvailable = false;
      let isTdCase = false;

      switch (sectionAttribute.ControlType) {
        case "tbltd":

          htmlTd.innerText = sectionAttribute.CurrentValue ?? "";
          let currentId = (sectionAttribute.HelpText != null && rowIndex != null) ?
            sectionAttribute.HelpText.replace('{row}', rowIndex.toString()) : "";
          htmlTd.className = sectionAttribute.ControlName + ' tdDynamic ' + sectionAttribute.CssClassName;
          if (currentObject != null) {
            let tdValue = utilityService.getValueforTd(currentObject, keys, keyValues, currentId);
            htmlTd.innerText = tdValue;
          };
          /* ----------------------------only for balance record table ---------------------------------------*/
          if (section.ModelCollectionName == "BalanceRecordDetailWeighs") {
            let value_temp0 = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
            htmlTd.innerText = value_temp0;
          }
          let current_balance_Id = sectionAttribute.ModelPropName + "_" + rowIndex.toString();
          let updateId = section.ModelCollectionName == "BalanceRecordDetailWeighs" ? current_balance_Id : currentId
          htmlTd.id = updateId;

          //****************** END OF SPECIAL CASE ENTRIES *************************** */
          htmlTd.addEventListener('click', function () {
            //get selected instrument Id Using hard code Id
            let selectControl = document.getElementById('selectInstrument') as HTMLSelectElement;
            if (selectControl.options != null && selectControl.options.length > 0) {
              let instrumentValue = selectControl.options[selectControl.selectedIndex].value;
              if (instrumentValue != null) {
                if (section.ModelCollectionName == "BalanceRecordDetailWeighs") {
                  onClickForTd(updateId, splittedName, instrumentValue);
                } else {
                  onClickForTd(currentId, section.SectionName, instrumentValue);
                }
              }
            }

          });

          let splitedValues = sectionAttribute.ControlName.split("_");
          let setAttributeValue = splitedValues[1] == undefined ? "" : splitedValues[1];
          htmlTd.setAttribute('tag', setAttributeValue);

          isTdCase = true;
          isControlAvailable = true;
          break;
        /*-----------------------------------APPEND DATE BOX IN ADD/EDIT TABLE ------------------------------*/
        case "tbldate":

          let dateControl = document.createElement('input') as HTMLInputElement; // CREATE INPUTBOX and INPUT BOX TYPE IS DATE
          dateControl.type = "date";
          dateControl.className = sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          dateControl.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          /*-------------------------------------Show existing record data --------------------------------*/
          let value_temp = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
          let date = value_temp.substr(0, 10);
          dateControl.value = date;
          dateControl.id = sectionAttribute.ControlName + "_" + utilityService.getUUID();
          utilityService.setDateValidators(sectionAttribute, dateControl);

          htmlTd.appendChild(dateControl);
          isControlAvailable = true;
          break;
        case "tbldatetime-local":

          let tblDateTimeControl = document.createElement('input') as HTMLInputElement; // CREATE INPUTBOX and INPUT BOX TYPE IS DATE
          tblDateTimeControl.type = "datetime-local";
          tblDateTimeControl.className = sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          tblDateTimeControl.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          /*-------------------------------------Show existing record data --------------------------------*/
          let value_date_time_temp = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
          let tblDateTime = value_date_time_temp.substr(0, 10);
          tblDateTimeControl.value = tblDateTime;
          tblDateTimeControl.id = sectionAttribute.ControlName + "_" + utilityService.getUUID();
          utilityService.setDateValidators(sectionAttribute, tblDateTimeControl);

          htmlTd.appendChild(tblDateTimeControl);
          isControlAvailable = true;
          break;
        case "tbltextbtn": // CREATE INPUTBOX and INPUT BOX TYPE IS TEXT
          /*-------------------------APPEND TEXT BOX IN ADD/EDIT TABLE---------------------------------------------*/
          let textControl9 = document.createElement('input') as HTMLInputElement;
          textControl9.className = sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          textControl9.type = "text";
          textControl9.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          /*------------------------ Show existing record data(edit button)---------------------------*/
          let value_temp9 = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
          textControl9.value = value_temp9;
          textControl9.id = sectionAttribute.ControlName + "_" + utilityService.getUUID();
          htmlTd.appendChild(textControl9);
          isControlAvailable = true;
          break;
        case "tbltext":// CREATE INPUTBOX 
          /*-------------------------------APPEND TEXT BOX IN ADD/EDIT TABLE ----------------------------------*/
          let textControl = document.createElement('input') as HTMLInputElement;
          let helepTextControl = document.createElement('i') as HTMLInputElement;
          helepTextControl.className = 'fa fa-info-circle';
          helepTextControl.title = (sectionAttribute.HelpText != null) ? sectionAttribute.HelpText : '';
          textControl.className = sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          textControl.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          /*----------------------------Show existing record data----------------------------------------------*/
          let value_temp1 = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
          textControl.value = value_temp1;

          textControl.id = sectionAttribute.ControlName + "_" + utilityService.getUUID();
          htmlTd.appendChild(textControl);
          htmlTd.appendChild(helepTextControl);

          isControlAvailable = true;
          break;

        case "tblnumber":// CREATE INPUTBOX 
          /*-------------------------APPEND TEXT BOX IN ADD/EDIT TABLE ------------------------------------*/
          let numberControl = document.createElement('input') as HTMLInputElement;
          numberControl.className = sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          numberControl.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          numberControl.type = "number";
          /*----------------------------- Show existing record data --------------------------------------*/
          let value_temp12 = currentObject.Sequence;
          numberControl.value = value_temp12;
          numberControl.id = sectionAttribute.ControlName + "_" + utilityService.getUUID();
          htmlTd.appendChild(numberControl);
          isControlAvailable = true;
          break;

        case "tblselect":
          /*--------------------------- CREATE INPUTBOX and INPUT BOX TYPE IS TEXTAREA-------------------------------*/
          //APPEND SELECT BOX IN ADD/EDIT TABLE  
          let selectControl = document.createElement('select') as HTMLSelectElement;
          let helepTextControlSelect = document.createElement('i') as HTMLInputElement;
          helepTextControlSelect.className = 'fa fa-info-circle';
          helepTextControlSelect.title = (sectionAttribute.HelpText != null) ? sectionAttribute.HelpText : '';
          selectControl.className = sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          selectControl.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;

          //Show existing record data
          let value_temp5 = currentObject.Id;
          selectControl.value = value_temp5;

          htmlTd.appendChild(selectControl);
          htmlTd.appendChild(helepTextControlSelect);
          isControlAvailable = true;
          if (sectionAttribute.EndPoint != null) {
            let module_temp = sectionAttribute.EndPoint.ModuleName != null ? sectionAttribute.EndPoint.ModuleName : this.moduleName;
            let url = utilityService.getApiUrl(module_temp) + sectionAttribute.EndPoint.EndpointAddress;
            utilityService.populateDropdown(section, selectControl, null, url, false, sectionAttribute.EndPoint, utilityService, value_temp5,
              sectionAttribute.Events, inputModel, selectControl.parentElement.parentElement);
          }
          isControlAvailable = true;
          /*create I tag for refresh icon*/
          let refreshControl = document.createElement('i') as HTMLElement;
          refreshControl.className = "fa fa-refresh"
          refreshControl.style.fontSize = "10px";
          refreshControl.style.float = "left";
          refreshControl.style.cursor = "pointer";
          if (sectionAttribute.IncludeRefresh != null && sectionAttribute.IncludeRefresh) {
            if (sectionAttribute.EndPoint != null) {

              /*-------------refresh button click time dropdown urls call and populate dropdown data.--------------------------*/
              refreshControl.addEventListener('click', function () {
                let module_temp = sectionAttribute.EndPoint.ModuleName != null ? sectionAttribute.EndPoint.ModuleName : utilityService.moduleName;
                let endpoint = utilityService.getApiUrl(module_temp) + sectionAttribute.EndPoint.EndpointAddress;
                let dependentControls = htmlTd.getElementsByClassName(sectionAttribute.ControlName + " form-control");
                let firstControl = dependentControls.length > 0 ? dependentControls[0] as HTMLSelectElement : null;
                utilityService.populateDropdown(section, firstControl, null, endpoint, true, sectionAttribute.EndPoint, utilityService, selectedValue,
                  null, null);
              });
            }
            htmlTd.appendChild(refreshControl);
          }

          if (sectionAttribute.Events != null && sectionAttribute.Events.length > 0) {
            /*----------------------------------add the events for the dependent control ------------------------*/
            sectionAttribute.Events.forEach(event => {
              if (event != null) {
                /*-----------------this will fire later as event raises---------------------------------------------*/
                selectControl.addEventListener('change', function (event1) {
                  if (event1.target != null && event1.target['parentElement'] != null && event1.target['parentElement']['parentElement'] != null) {
                    let affectedControls = event1.target['parentElement']['parentElement'].getElementsByClassName(event.affectedControlName);
                    let affectedControls_temp = affectedControls.length > 0 ? affectedControls[0] : null;

                    let gridUrl = '';
                    let header = {};
                    let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : utilityService.moduleName;
                    /*------------------------ populate dependency  dropdown by replace keyid and valuename------------------------*/
                    gridUrl = utilityService.getApiUrl(module_temp) +
                      (event.EndPoint.EndpointAddress.includes('{valueName}') ?
                        event.EndPoint.EndpointAddress.replace('{valueName}', selectControl.options[selectControl.options.selectedIndex].text) :
                        event.EndPoint.EndpointAddress.replace('{keyId}', selectControl.value)

                      );
                    //************************* Check AdditionalParams Array data generate URL ************************/
                    if (event.EndPoint.AdditionalParams != null && event.EndPoint.AdditionalParams.length > 0) {

                      for (let i = 0; i < event.EndPoint.AdditionalParams.length; i++) {
                        /*----------EVALUATE THE VALUE/KEY FROM THE RELATED CONTROL ------------------*/
                        if (event.EndPoint.AdditionalParams[i].KeyName != null && gridUrl.includes(event.EndPoint.AdditionalParams[i].KeyName)) {
                          let control_temp = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLSelectElement;

                          let control_value = control_temp.options[control_temp.options.selectedIndex].value;
                          gridUrl = gridUrl.replace(event.EndPoint.AdditionalParams[i].KeyName, control_value);
                        }
                        else if (event.EndPoint.AdditionalParams[i].ValueName != null && gridUrl.includes(event.EndPoint.AdditionalParams[i].ValueName)) {
                          let control_temp = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLSelectElement;

                          let control_value = control_temp.options[control_temp.options.selectedIndex].text;
                          gridUrl = gridUrl.replace(event.EndPoint.AdditionalParams[i].ValueName, control_value);
                        }
                      }
                    };

                    if (sectionAttribute.IncludeAdditionalInfo == true) {
                      let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : utilityServiceTemp.moduleName;
                      gridUrl = utilityServiceTemp.getApiUrl(module_temp) + event.EndPoint.EndpointAddress + '/' + parseInt(selectControl.value)
                      utilityServiceTemp.getTextDataFormService(gridUrl).subscribe(response => {

                        let additionalInfo_div_reference = 'divAdditionalInfo_' + sectionAttribute.ControlName;
                        let divData = document.getElementById(additionalInfo_div_reference) as HTMLDivElement;
                        divData.innerHTML = response;
                      }, (error) => {
                        error
                      });
                    }

                    if (event.EndPoint != null) {
                      let endpoint = gridUrl;
                      if (affectedControls_temp != null && (selectControl.value != "0")) {
                        utilityService.populateDropdown(section, affectedControls_temp, null,
                          endpoint, false, event.EndPoint, utilityService, selectControl.value, null, inputModel,
                          selectControl.parentElement.parentElement);

                      }
                    }
                  }
                });
              }
            });
          }
          break;

        case "tblcheckbox":
          /*------------------------ CREATE INPUTBOX and INPUT BOX TYPE IS CHECKBOX-------------------------------*/
          /*---------------------------APPEND CHECK BOX IN ADD/EDIT TABLE -------------------------------------*/
          let checkBoxControl = document.createElement('input') as HTMLInputElement;
          checkBoxControl.className = sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          checkBoxControl.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          checkBoxControl.type = "checkbox";
          /*-------------------------------Show existing record data------------------------------------------*/
          let value_temp2 = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
          let checkBoxValue = Boolean(value_temp2);
          checkBoxControl.checked = checkBoxValue as boolean;
          checkBoxControl.id = sectionAttribute.ControlName + "_" + utilityService.getUUID();

          htmlTd.appendChild(checkBoxControl);
          isControlAvailable = true;
          break;

        case "tblbutton": // CREATE INPUTBOX and INPUT BOX TYPE IS BUTTON
          //APPEND BUTTON IN ADD/EDIT TABLE 
          isControlAvailable = true;
          let buttonControl = document.createElement('input') as HTMLInputElement;
          buttonControl.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          buttonControl.className = sectionAttribute.ControlName;
          buttonControl.value = sectionAttribute.ControlName;
          buttonControl.type = "button";
          buttonControl.id = sectionAttribute.ControlName + "_" + utilityService.getUUID();

          htmlTd.appendChild(buttonControl);
          break;
        case "tblbuttonRowDelete": // CREATE INPUTBOX and INPUT BOX TYPE IS BUTTON FOR DELETE
          //APPEND DELETE BUTTON IN ADD/EDIT TABLE
          isControlAvailable = true;
          let buttonControl2 = document.createElement('BUTTON') as HTMLButtonElement;

          buttonControl2.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          buttonControl2.type = "button";
          buttonControl2.id = currentObject.Id;
          buttonControl2.innerHTML = "&#215;";
          buttonControl2.title = "Delete";
          buttonControl2.style.fontSize = "20px";
          buttonControl2.style.color = "red";
          buttonControl2.style.borderColor = "red";
          buttonControl2.style.borderBottomLeftRadius = "5px";
          buttonControl2.style.borderBottomRightRadius = "5px";
          buttonControl2.style.borderTopLeftRadius = "5px";
          buttonControl2.style.borderTopRightRadius = "5px";
          buttonControl2.className = sectionAttribute.ControlName;
          buttonControl2.addEventListener('click', () =>
            this.deleteCurrentTableRow(buttonControl2, htmlTableRow));
          htmlTd.appendChild(buttonControl2);

          break;
      }
      index++;
      if (!isControlAvailable) {
        htmlTd.style.display = 'none';
      }
      else if (isControlAvailable && isTdCase) {

      }
      else if (isControlAvailable && !isTdCase) {

        let temp_value = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
        utilityService.processSectionAttributes(section, sectionAttribute, currentObject, htmlTableRow, temp_value, true, null, utilityService);
        htmlTableRow.appendChild(htmlTd);
      }
    });
    return htmlTableRow;
  }
  /* ------------------------Genarate Row for Given Table In Add/Edit Time ------------------------------------------*/
  generateRowForGivenTable(htmlTableRef: HTMLTableSectionElement, section: Section, currentObject?: any,
    utilityServiceTemp?: UtilityService, inputModel?: any, selectedValue?: any, rowIndex?: number) {


    let htmlTableRow: HTMLTableRowElement = htmlTableRef.insertRow();
    let isHiddenUUIDPopulated = false;

    let keys = (currentObject == null) ? [] : Object.keys(currentObject);
    let keyValues: Array<CustomKeyValueString>;
    keyValues = new Array<CustomKeyValueString>();
    let utilityService = utilityServiceTemp == null ? this : utilityServiceTemp;
    let iCount = 0;
    keys.forEach(key => {
      keyValues.push({
        Key: iCount,
        Value: key
      })
      iCount++;
    });

    let index = 0;
    let path = window.location.pathname;
    let splittedValues = path.split('/');
    let splittedName = splittedValues[2].toLowerCase();
    section.SectionAttributes.forEach(sectionAttribute => {

      selectedValue = currentObject != null ? currentObject[sectionAttribute.ModelPropName] :
        (sectionAttribute.ModelPropType == "number" ? 0 : "");

      /*--------------------------populating the hidden UUID initially---------------------------*/
      if (!isHiddenUUIDPopulated) {
        /********** QUICK CONTROL REFERENCE *********** */

        let htmlTdForHiddenControls = htmlTableRow.insertCell();
        htmlTdForHiddenControls.className = 'tdHide';
        htmlTdForHiddenControls.style.display = 'none';

        /*---------------------------1st Hidden Control for UUID-------------------------*/
        let hiddenControl = document.createElement('input') as HTMLInputElement;
        hiddenControl.type = "hidden";
        hiddenControl.value = utilityService.getUUID(); //.getIdService().generate();
        hiddenControl.className = "hiddenUUID";
        htmlTdForHiddenControls.appendChild(hiddenControl);


        /*--------------FINDING ALL HIDDEN CONTROL AND PUBLISHING THEM AS PER DEFINATION IN MOCK/STR FOR TABLE--------------------------*/
        let allHiddenControls = section.SectionAttributes.filter(t => t.ControlType == "tblhidden");
        for (let i = 0; i < allHiddenControls.length; i++) {
          let hiddenControl2 = document.createElement('input') as HTMLInputElement;
          hiddenControl2.type = "hidden";
          hiddenControl2.className = allHiddenControls[i].ControlName;
          /*----------------------------Show existing record data -----------------------------------------------------*/
          let value_temp = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, allHiddenControls[i].ModelPropName);
          value_temp = utilityService.getObjectTypeCastedData(value_temp, allHiddenControls[i]);
          hiddenControl2.value = value_temp;
          htmlTdForHiddenControls.appendChild(hiddenControl2);
        }
        isHiddenUUIDPopulated = true;
      }

      let htmlTd = htmlTableRow.insertCell();
      let isControlAvailable = false;
      let isTdCase = false;

      switch (sectionAttribute.ControlType) {
        case "tbltd":

          htmlTd.innerText = sectionAttribute.CurrentValue ?? "";
          let currentId = (sectionAttribute.HelpText != null && rowIndex != null) ?
            sectionAttribute.HelpText.replace('{row}', rowIndex.toString()) : "";
          htmlTd.className = sectionAttribute.ControlName + ' tdDynamic ' + sectionAttribute.CssClassName;
          if (currentObject != null) {
            let tdValue = utilityService.getValueforTd(currentObject, keys, keyValues, currentId);
            htmlTd.innerText = tdValue;
          };
          /* ----------------------------only for balance record table ---------------------------------------*/
          if (section.ModelCollectionName == "BalanceRecordDetailWeighs") {
            let value_temp0 = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
            htmlTd.innerText = value_temp0;
          }
          let current_balance_Id = sectionAttribute.ModelPropName + "_" + rowIndex.toString();
          let updateId = section.ModelCollectionName == "BalanceRecordDetailWeighs" ? current_balance_Id : currentId
          htmlTd.id = updateId;

          //****************** END OF SPECIAL CASE ENTRIES *************************** */
          htmlTd.addEventListener('click', function () {
            //get selected instrument Id Using hard code Id
            let selectControl = document.getElementById('selectInstrument') as HTMLSelectElement;
            if (selectControl.options != null && selectControl.options.length > 0) {
              let instrumentValue = selectControl.options[selectControl.selectedIndex].value;
              if (instrumentValue != null) {
                if (section.ModelCollectionName == "BalanceRecordDetailWeighs") {
                  onClickForTd(updateId, splittedName, instrumentValue);
                } else {
                  onClickForTd(currentId, section.SectionName, instrumentValue);
                }
              }
            }

          });

          let splitedValues = sectionAttribute.ControlName.split("_");
          let setAttributeValue = splitedValues[1] == undefined ? "" : splitedValues[1];
          htmlTd.setAttribute('tag', setAttributeValue);
          htmlTd.setAttribute('data-title',utilityService.populatetblHeaderData(sectionAttribute.LabelName));
          isTdCase = true;
          isControlAvailable = true;
          break;
        /*-----------------------------------APPEND DATE BOX IN ADD/EDIT TABLE ------------------------------*/
        case "tbldate":

          let dateControl = document.createElement('input') as HTMLInputElement; // CREATE INPUTBOX and INPUT BOX TYPE IS DATE
          dateControl.type = "date";
          dateControl.className = sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          dateControl.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          /*-------------------------------------Show existing record data --------------------------------*/
          let value_temp = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
          let date = value_temp.substr(0, 10);
          dateControl.value = date;
          dateControl.id = sectionAttribute.ControlName + "_" + utilityService.getUUID();
          utilityService.setDateValidators(sectionAttribute, dateControl);
          htmlTd.setAttribute('data-title',utilityService.populatetblHeaderData(sectionAttribute.LabelName));
          htmlTd.appendChild(dateControl);
          isControlAvailable = true;
          break;
        case "tbldatetime-local":

          let tblDateTimeControl = document.createElement('input') as HTMLInputElement; // CREATE INPUTBOX and INPUT BOX TYPE IS DATE
          tblDateTimeControl.type = "datetime-local";
          tblDateTimeControl.className = sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          tblDateTimeControl.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          /*-------------------------------------Show existing record data --------------------------------*/
          let value_date_time_temp = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
          let tblDateTime = value_date_time_temp.substr(0, 10);
          tblDateTimeControl.value = tblDateTime;
          tblDateTimeControl.id = sectionAttribute.ControlName + "_" + utilityService.getUUID();
          utilityService.setDateValidators(sectionAttribute, tblDateTimeControl);
          htmlTd.setAttribute('data-title',utilityService.populatetblHeaderData(sectionAttribute.LabelName));
          htmlTd.appendChild(tblDateTimeControl);
          isControlAvailable = true;
          break;
        case "tbltextbtn": // CREATE INPUTBOX and INPUT BOX TYPE IS TEXT
          /*-------------------------APPEND TEXT BOX IN ADD/EDIT TABLE---------------------------------------------*/
          let textControl9 = document.createElement('input') as HTMLInputElement;
          textControl9.className = sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          textControl9.type = "text";
          textControl9.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          /*------------------------ Show existing record data(edit button)---------------------------*/
          let value_temp9 = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
          textControl9.value = value_temp9;
          textControl9.id = sectionAttribute.ControlName + "_" + utilityService.getUUID();
          htmlTd.setAttribute('data-title',utilityService.populatetblHeaderData(sectionAttribute.LabelName));
          htmlTd.appendChild(textControl9);
          isControlAvailable = true;
          break;
        case "tbltext":// CREATE INPUTBOX 
          /*-------------------------------APPEND TEXT BOX IN ADD/EDIT TABLE ----------------------------------*/
          let textControl = document.createElement('input') as HTMLInputElement;
          let helepTextControl = document.createElement('i') as HTMLInputElement;
          helepTextControl.className = 'fa fa-info-circle';
          helepTextControl.title = (sectionAttribute.HelpText != null) ? sectionAttribute.HelpText : '';
          textControl.className = sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          textControl.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          /*----------------------------Show existing record data----------------------------------------------*/
          let value_temp1 = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
          textControl.value = value_temp1;

          textControl.id = sectionAttribute.ControlName + "_" + utilityService.getUUID();
          htmlTd.setAttribute('data-title',utilityService.populatetblHeaderData(sectionAttribute.LabelName));
          htmlTd.appendChild(textControl);
          htmlTd.appendChild(helepTextControl);
          isControlAvailable = true;
          break;

        case "tblnumber":// CREATE INPUTBOX 
          /*-------------------------APPEND TEXT BOX IN ADD/EDIT TABLE ------------------------------------*/
          let numberControl = document.createElement('input') as HTMLInputElement;
          numberControl.className = sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          numberControl.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          numberControl.type = "number";
          /*----------------------------- Show existing record data --------------------------------------*/
          let value_temp12 = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
          numberControl.value = value_temp12;
          numberControl.id = sectionAttribute.ControlName + "_" + utilityService.getUUID();
          htmlTd.setAttribute('data-title',utilityService.populatetblHeaderData(sectionAttribute.LabelName));
          htmlTd.appendChild(numberControl);
          isControlAvailable = true;
          break;

        case "tbltyposelect":
          /*----- CREATE INPUTBOX and INPUT BOX TYPE IS SELECT //CRETAE AUTOCOMPLETE OPTION CUSTOMLY USING UNORDER LIST HTML ELEMNTS.--------*/
          /*-----APPEND TEXT BOX IN ADD/EDIT TABLE -------------*/
          let typoSelectControl = document.createElement('input') as HTMLInputElement;
          typoSelectControl.className = sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          typoSelectControl.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          /*-----------------------------Show existing record data ----------------------------*/
          let value_temp_typoControl = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
          typoSelectControl.value = value_temp_typoControl;
          typoSelectControl.id = sectionAttribute.ControlName + "_" + utilityService.getUUID();
          let tagValue = utilityService.getTagValue(currentObject, keys, keyValues, sectionAttribute);
          typoSelectControl.setAttribute('tag', tagValue);
          htmlTd.setAttribute('data-title',utilityService.populatetblHeaderData(sectionAttribute.LabelName));
          htmlTd.appendChild(typoSelectControl);

          /*--------------------Adding the UL Section  FOR AUTOCOMPLETE PARTS--------------------------------*/
          let typoSelectControl_ulHelper = document.createElement('ul') as HTMLUListElement;
          typoSelectControl_ulHelper.style.display = "none";
          typoSelectControl_ulHelper.className = sectionAttribute.ControlName + "_UlHelper ulHelper list-group";
          typoSelectControl_ulHelper.id = sectionAttribute.ControlName + "_UlHelper_" + utilityService.getUUID();
          htmlTd.appendChild(typoSelectControl_ulHelper);

          isControlAvailable = true;
          break;

        case "tbltypomultiselect":
          /*----------------- CREATE INPUTBOX and INPUT BOX TYPE IS MULTISELECT //CRETAE AUTOCOMPLETE OPTION CUSTOMLY USING UNORDER LIST HTML ELEMNTS.------------------------*/
          /*--------------------------APPEND TEXT BOX IN ADD/EDIT TABLE  ------------*/
          let typoMultiSelectControl = document.createElement('input') as HTMLInputElement;
          typoMultiSelectControl.className = sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          typoMultiSelectControl.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          typoMultiSelectControl.id = sectionAttribute.ControlName + "_" + utilityService.getUUID();
          htmlTd.setAttribute('data-title',utilityService.populatetblHeaderData(sectionAttribute.LabelName));
          htmlTd.appendChild(typoMultiSelectControl);

          /*--------------------Adding The div  FOR CHOOSE SKILLS--------------------------*/
          let typoMultiSelectControl_divContainer = document.createElement('div') as HTMLDivElement;
          let value_temp_typoMultiSelectControl_divContainer = utilityService.getDivContainerValue(currentObject, sectionAttribute.ModelPropName2);
          for (let i = 0; i < value_temp_typoMultiSelectControl_divContainer.length; i++) {  //div array data append dynamically in  parent DIV
            typoMultiSelectControl_divContainer.appendChild(value_temp_typoMultiSelectControl_divContainer[i]);
          }
          typoMultiSelectControl_divContainer.className = sectionAttribute.ControlName + "_DivContainer divContainer";
          htmlTd.appendChild(typoMultiSelectControl_divContainer);

          /*---------------------------Adding the UL Section FOR AUTOCOMPLETE PART----------------------------*/
          let typoMultiSelectControl_ulHelper = document.createElement('ul') as HTMLUListElement;
          typoMultiSelectControl_ulHelper.style.display = "none";
          typoMultiSelectControl_ulHelper.className = sectionAttribute.ControlName + "_UlHelper ulHelper list-group";
          typoMultiSelectControl_ulHelper.id = sectionAttribute.ControlName + "_UlHelper_" + utilityService.getUUID();
          htmlTd.appendChild(typoMultiSelectControl_ulHelper);
          isControlAvailable = true;
          break;

        case "tbltextarea": // CREATE INPUTBOX and INPUT BOX TYPE IS TEXTAREA
          /*--------------------------------------APPEND TEXT BOX IN ADD/EDIT TABLE-------------------------------*/
          let textControl11 = document.createElement('TextArea') as HTMLInputElement;
          textControl11.className = sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          textControl11.min = "1";
          textControl11.max = "5";
          textControl11.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          /*------------------------Show existing record data--------------------------------*/
          let value_temp11 = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
          textControl11.value = value_temp11;
          textControl11.id = sectionAttribute.ControlName + "_" + utilityService.getUUID();
          htmlTd.setAttribute('data-title',utilityService.populatetblHeaderData(sectionAttribute.LabelName));
          htmlTd.appendChild(textControl11);
          isControlAvailable = true;
          break;

        case "tblrange":
          /*---------------------- CREATE INPUTBOX and INPUT BOX TYPE IS RANGE-------------------------------*/
          /*-------------------APPEND TEXT BOX IN ADD/EDIT TABLE  ------------------------*/
          let rangeControl = document.createElement('input') as HTMLInputElement;
          rangeControl.className = "slider " + sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          rangeControl.type = "range";
          rangeControl.min = "1";
          rangeControl.max = "5";
          /*-----------------------Show existing record data---------------------------------*/
          let value_temp7 = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
          rangeControl.value = value_temp7;
          rangeControl.id = sectionAttribute.ControlName + "_" + utilityService.getUUID();
          rangeControl.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          sectionAttribute.Events.forEach(event => {
            if (event != null) {
              /*----------------------------This will fire later as event raises ---------------------*/
              rangeControl.addEventListener('change', function (event1) {
                if (event1.target != null && event1.target['parentElement'] != null && event1.target['parentElement']['parentElement'] != null) {
                  let affectedControls_temp = event1.target['parentElement']['parentElement'].getElementsByClassName(event.affectedControlName);
                  if (affectedControls_temp != null && affectedControls_temp.length > 0) {
                    let input = affectedControls_temp[0] as HTMLInputElement;
                    if (input != null) {
                      input.value = event1.target['value'];
                    }
                  }
                }
              })
            }
          });
          htmlTd.setAttribute('data-title',utilityService.populatetblHeaderData(sectionAttribute.LabelName));
          htmlTd.appendChild(rangeControl);
          isControlAvailable = true;
          break;
        case "tblselect":
          /*--------------------------- CREATE INPUTBOX and INPUT BOX TYPE IS TEXTAREA-------------------------------*/
          //APPEND SELECT BOX IN ADD/EDIT TABLE  
          let selectControl = document.createElement('select') as HTMLSelectElement;
          let helepTextControlSelect = document.createElement('i') as HTMLInputElement;
          helepTextControlSelect.className = 'fa fa-info-circle';
          helepTextControlSelect.title = (sectionAttribute.HelpText != null) ? sectionAttribute.HelpText : '';
          selectControl.className = sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          selectControl.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;

          //Show existing record data
          let value_temp5 = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
          selectControl.value = value_temp5;
          htmlTd.setAttribute('data-title',utilityService.populatetblHeaderData(sectionAttribute.LabelName));
          htmlTd.appendChild(selectControl);
          htmlTd.appendChild(helepTextControlSelect);
          isControlAvailable = true;
          if (sectionAttribute.EndPoint != null) {
            let module_temp = sectionAttribute.EndPoint.ModuleName != null ? sectionAttribute.EndPoint.ModuleName : this.moduleName;
            let url = utilityService.getApiUrl(module_temp) + sectionAttribute.EndPoint.EndpointAddress;
            utilityService.populateDropdown(section, selectControl, null, url, false, sectionAttribute.EndPoint, utilityService, selectedValue,
              sectionAttribute.Events, inputModel, selectControl.parentElement.parentElement);
          }
          isControlAvailable = true;
          /*create I tag for refresh icon*/
          let refreshControl = document.createElement('i') as HTMLElement;
          refreshControl.className = "fa fa-refresh"
          refreshControl.style.fontSize = "10px";
          refreshControl.style.float = "left";
          refreshControl.style.cursor = "pointer";
          if (sectionAttribute.IncludeRefresh != null && sectionAttribute.IncludeRefresh) {
            if (sectionAttribute.EndPoint != null) {

              /*-------------refresh button click time dropdown urls call and populate dropdown data.--------------------------*/
              refreshControl.addEventListener('click', function () {
                let module_temp = sectionAttribute.EndPoint.ModuleName != null ? sectionAttribute.EndPoint.ModuleName : utilityService.moduleName;
                let endpoint = utilityService.getApiUrl(module_temp) + sectionAttribute.EndPoint.EndpointAddress;
                let dependentControls = htmlTd.getElementsByClassName(sectionAttribute.ControlName + " form-control");
                let firstControl = dependentControls.length > 0 ? dependentControls[0] as HTMLSelectElement : null;
                utilityService.populateDropdown(section, firstControl, null, endpoint, true, sectionAttribute.EndPoint, utilityService, selectedValue,
                  null, null);
              });
            }
            htmlTd.appendChild(refreshControl);
          }

          if (sectionAttribute.Events != null && sectionAttribute.Events.length > 0) {
            /*----------------------------------add the events for the dependent control ------------------------*/
            sectionAttribute.Events.forEach(event => {
              if (event != null) {
                /*-----------------this will fire later as event raises---------------------------------------------*/
                selectControl.addEventListener('change', function (event1) {
                  if (event1.target != null && event1.target['parentElement'] != null && event1.target['parentElement']['parentElement'] != null) {
                    let affectedControls = event1.target['parentElement']['parentElement'].getElementsByClassName(event.affectedControlName);
                    let affectedControls_temp = affectedControls.length > 0 ? affectedControls[0] : null;

                    let gridUrl = '';
                    let header = {};
                    let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : utilityService.moduleName;
                    /*------------------------ populate dependency  dropdown by replace keyid and valuename------------------------*/
                    gridUrl = utilityService.getApiUrl(module_temp) +
                      (event.EndPoint.EndpointAddress.includes('{valueName}') ?
                        event.EndPoint.EndpointAddress.replace('{valueName}', selectControl.options[selectControl.options.selectedIndex].text) :
                        event.EndPoint.EndpointAddress.replace('{keyId}', selectControl.value)

                      );
                    //************************* Check AdditionalParams Array data generate URL ************************/
                    if (event.EndPoint.AdditionalParams != null && event.EndPoint.AdditionalParams.length > 0) {

                      for (let i = 0; i < event.EndPoint.AdditionalParams.length; i++) {
                        /*----------EVALUATE THE VALUE/KEY FROM THE RELATED CONTROL ------------------*/
                        if (event.EndPoint.AdditionalParams[i].KeyName != null && gridUrl.includes(event.EndPoint.AdditionalParams[i].KeyName)) {
                          let control_temp = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLSelectElement;

                          let control_value = control_temp.options[control_temp.options.selectedIndex].value;
                          gridUrl = gridUrl.replace(event.EndPoint.AdditionalParams[i].KeyName, control_value);
                        }
                        else if (event.EndPoint.AdditionalParams[i].ValueName != null && gridUrl.includes(event.EndPoint.AdditionalParams[i].ValueName)) {
                          let control_temp = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLSelectElement;

                          let control_value = control_temp.options[control_temp.options.selectedIndex].text;
                          gridUrl = gridUrl.replace(event.EndPoint.AdditionalParams[i].ValueName, control_value);
                        }
                      }
                    };

                    if (sectionAttribute.IncludeAdditionalInfo == true) {
                      let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : utilityServiceTemp.moduleName;
                      gridUrl = utilityServiceTemp.getApiUrl(module_temp) + event.EndPoint.EndpointAddress + '/' + parseInt(selectControl.value)
                      utilityServiceTemp.getTextDataFormService(gridUrl).subscribe(response => {

                        let additionalInfo_div_reference = 'divAdditionalInfo_' + sectionAttribute.ControlName;
                        let divData = document.getElementById(additionalInfo_div_reference) as HTMLDivElement;
                        divData.innerHTML = response;
                      }, (error) => {
                        error
                      });
                    }

                    if (event.EndPoint != null) {
                      let endpoint = gridUrl;
                      if (affectedControls_temp != null && (selectControl.value != "0")) {
                        utilityService.populateDropdown(section, affectedControls_temp, null,
                          endpoint, false, event.EndPoint, utilityService, selectControl.value, null, inputModel,
                          selectControl.parentElement.parentElement);

                      }
                    }
                  }
                });
              }
            });
          }
          break;

        case "tblcheckbox":
          /*------------------------ CREATE INPUTBOX and INPUT BOX TYPE IS CHECKBOX-------------------------------*/
          /*---------------------------APPEND CHECK BOX IN ADD/EDIT TABLE -------------------------------------*/
          let checkBoxControl = document.createElement('input') as HTMLInputElement;
          checkBoxControl.className = sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          checkBoxControl.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          checkBoxControl.type = "checkbox";
          /*-------------------------------Show existing record data------------------------------------------*/
          let value_temp2 = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
          let checkBoxValue = Boolean(value_temp2);
          checkBoxControl.checked = checkBoxValue as boolean;
          checkBoxControl.id = sectionAttribute.ControlName + "_" + utilityService.getUUID();
          htmlTd.setAttribute('data-title',utilityService.populatetblHeaderData(sectionAttribute.LabelName));
          htmlTd.appendChild(checkBoxControl);
          isControlAvailable = true;
          break;
        
        case "tblfile":
          /*------------------------------ CREATE INPUTBOX and INPUT BOX TYPE IS FILE--------------------------------------*/

          let generated_guid = utilityService.getUUID();
          let divContainer = document.createElement('div') as HTMLDivElement;
          let fileControl = document.createElement('input') as HTMLInputElement;
          let fileControl_label = document.createElement('label') as HTMLLabelElement;
          let fileControl_anchor = document.createElement('a') as HTMLAnchorElement;
          let fileControl_deleteAnchor = document.createElement('a') as HTMLAnchorElement;
          fileControl.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          fileControl.type = "file";
          fileControl.className = sectionAttribute.ControlName + " form-control " + sectionAttribute.CssClassName;
          if($(window).width()<1500){
          fileControl.accept="image/*" ;
          fileControl.setAttribute('capture','camera');
          }
          fileControl_anchor.id = 'download_' + sectionAttribute.ControlName + "_" + generated_guid;
          fileControl_anchor.className = "downloadArrowClass";
          fileControl_anchor.textContent = "↓";
          fileControl_anchor.style.display = "none";

          fileControl_deleteAnchor.id = 'delete_' + sectionAttribute.ControlName + "_" + generated_guid;
          fileControl_deleteAnchor.className = "deleteClass";
          fileControl_deleteAnchor.textContent = "X";
          fileControl_deleteAnchor.style.display = "none";


          /*---------------------------------------------Show existing record(grid) data-------------------------------------------*/
          let value_temp_file = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
          let value_temp_file_label = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.SecondaryEntity.ModelPropName);

          /********** Do not call  utilityService.getUUID(); as this will create a separate guid, 
           * so we are utilizing the already generated guid for the label  */

          let labelId = sectionAttribute.ControlName + "_" + generated_guid;

          fileControl.id = "file_" + sectionAttribute.ControlName + "_" + generated_guid;

          fileControl_label.id = "label_" + labelId;

          fileControl_label.textContent = value_temp_file_label;

          fileControl.setAttribute('tag', value_temp_file);
          /*------------------------------adding the file and label to div container ----------------------------------*/

          let validTagValue = fileControl.getAttribute('tag');
          if (validTagValue != null && validTagValue != '' && validTagValue != AppConstants.GENERAL.DEFAULT_GUID) {
            let url_for_download = "";

            sectionAttribute.Events.forEach(fileEvent => {
              url_for_download = utilityService.getApiUrl(fileEvent.EndPoint.ModuleName) + fileEvent.EndPoint.EndpointAddress + "/" + validTagValue;
            });
            fileControl_anchor.style.display = 'inline-block';
            fileControl_deleteAnchor.style.display = 'inline-block';
            fileControl_anchor.setAttribute('href', url_for_download);
          }
          /* --------------------------Delete The Files ---------------------------*/
          fileControl_deleteAnchor.addEventListener('click', function () {
            var x = confirm("Are you sure you want to delete this file?");
            if (x) {
              let tagValue = fileControl.getAttribute('tag');
              sectionAttribute.Events.forEach(event => {
                let url = utilityService.getApiUrl(event.EndPoint.ModuleName) + event.EndPoint.EndpointAddress;
                utilityService.deleteDataToService(url, tagValue).subscribe(data => {
                  if (data == true) {
                    if (fileControl_label != null) {
                      $(fileControl_label).html('');
                    }
                    fileControl.setAttribute('tag', AppConstants.GENERAL.DEFAULT_GUID);
                    $(fileControl).val('');

                    if (fileControl_anchor != null && fileControl_deleteAnchor != null) {
                      $(fileControl_anchor).hide();
                      $(fileControl_deleteAnchor).hide();
                    }

                  }
                });
              })
            };
          });
          divContainer.appendChild(fileControl);
          divContainer.appendChild(fileControl_label);
          divContainer.appendChild(fileControl_anchor);
          divContainer.appendChild(fileControl_deleteAnchor);
          htmlTd.setAttribute('data-title',utilityService.populatetblHeaderData(sectionAttribute.LabelName));
          htmlTd.appendChild(divContainer);
          isControlAvailable = true;

          break;
        case "tblbutton": // CREATE INPUTBOX and INPUT BOX TYPE IS BUTTON
          //APPEND BUTTON IN ADD/EDIT TABLE 
          isControlAvailable = true;
          let buttonControl = document.createElement('input') as HTMLInputElement;
          buttonControl.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          buttonControl.className = sectionAttribute.ControlName;
          buttonControl.value = sectionAttribute.ControlName;
          buttonControl.type = "button";
          buttonControl.id = sectionAttribute.ControlName + "_" + utilityService.getUUID();

          htmlTd.appendChild(buttonControl);
          break;
        case "tblbuttonRowDelete": // CREATE INPUTBOX and INPUT BOX TYPE IS BUTTON FOR DELETE
          //APPEND DELETE BUTTON IN ADD/EDIT TABLE
          isControlAvailable = true;
          let buttonControl2 = document.createElement('BUTTON') as HTMLButtonElement;
          buttonControl2.disabled = sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled ? true : false;
          buttonControl2.type = "button";
          buttonControl2.innerHTML = "&#215;";
          buttonControl2.title = "Delete";
          buttonControl2.style.fontSize = "20px";
          buttonControl2.style.color = "red";
          buttonControl2.style.borderColor = "red";
          buttonControl2.style.borderBottomLeftRadius = "5px";
          buttonControl2.style.borderBottomRightRadius = "5px";
          buttonControl2.style.borderTopLeftRadius = "5px";
          buttonControl2.style.borderTopRightRadius = "5px";
          buttonControl2.className = sectionAttribute.ControlName;
        
          if (splittedName == "balancerecords") {
            buttonControl2.id = sectionAttribute.ControlName + "_row_" + rowIndex.toString();
            buttonControl2.addEventListener('click', function (event1) {
              if (event1.target != null && event1.target['parentElement']['parentElement'] != null) {
                let className = "txtWeightValue";
                utilityService.populateCellId(event1.target['parentElement']['parentElement'], sectionAttribute.ControlName, buttonControl2.id, className, section.SectionName, splittedName, utilityService);

              }
            });
          }
          htmlTd.setAttribute('data-title','Action');
          htmlTd.appendChild(buttonControl2);

          break;
      }
      index++;
      if (!isControlAvailable) {
        htmlTd.style.display = 'none';
      }
      else if (isControlAvailable && isTdCase) {

      }
      else if (isControlAvailable && !isTdCase) {

        let temp_value = utilityService.getValuefromKeyValue(currentObject, keys, keyValues, sectionAttribute.ModelPropName);
        utilityService.processSectionAttributes(section, sectionAttribute, currentObject, htmlTableRow, temp_value, true, null, utilityService);
        htmlTableRow.appendChild(htmlTd);
      }
    });
    return htmlTableRow;
  }
  getValueforTd(currentObject: any, keys: Array<string>, keyValues: Array<CustomKeyValueString>, currentId: string): string {
    let temp_value = '';
    if (currentId != null) {

      let splitedValue = currentId.split('_');
      let currentValue = splitedValue[1];

      for (let i = 0; i < keys.length; i++) {
        let currentkey = keys[i].includes(currentValue);
        if (currentkey == true) {
          temp_value = (keys.length == 0) ? '' : Object.values(currentObject)[i].toString();
        }
      }
    }

    return temp_value;
  }
  /*--------------------------------------------------------SECTION FOR HANDLING FORMS, SECTIONS, SECTION ATTRIBUTES ------------------------------------------------*/
  processSection(section: Section, model: any, utilityService?: UtilityService, bindEvents?: boolean, isPageLoaded?: boolean, addUrl?: string, url?: string, totalRows?: number, pagesize?: number) {
    //******************** Checking for 'table' type of 'SECTION' **************************/
    let utilityService_temp = utilityService == null ? this : utilityService;
    if (section.SectionTypeName != null && section.SectionTypeName != 'table' && !bindEvents) {
      if (section.SectionAttributes != null && section.SectionAttributes != undefined) {
        section.SectionAttributes.forEach(sectionAttribute => {
          if (sectionAttribute.ControlType == "date") {
            let dateControl = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;
            utilityService_temp.setDateValidators(sectionAttribute, dateControl);
          }
        });
      }
    };

    /*-----------------------------------------EVALUATING THE PAGE -----------------------------------------*/
    let path = window.location.pathname;
    let splittedValues = path.split('/');
    let splittedName = splittedValues[2].toLowerCase();

    //************** END OF EVALUATION  *******************************/

    if (section.SectionTypeName != null && section.SectionTypeName == 'table' && (!bindEvents)) {
      let tempTable = document.getElementById(section.SectionName) as HTMLTableElement;

      if (tempTable != null) {
        // PLEASE DO NOT KEEP COLUMN NULL, WHEN ITS OF TYPE 'table' in mock or from API, atleast assign []
        if (section.Columns == null)
          section.Columns = [];


        switch (splittedName) {
          /*-----------------------populate instrumentcalibrationsets addEdit Table data---------------------------*/
          case "instrumentcalibrationsets":

            let affectedTableControl = document.getElementById(AppConstants.COMMON.COMMON_INSTRUMENT_CALIBRATION_SET_DETAILS) as HTMLTableElement;
            $(affectedTableControl).html('');
            /*---------------Storing the Section as JSON inside 'TableTemplateSection' within the TABLE ------------*/
            let sectionAttributesJSON1 = JSON.stringify(section);
            /*--------TableTemplate section which is hidden, will store the Entire Section in JSON Format-----------------*/
            let columnHeader_section1 = {
              HeaderName: 'Section',
              CssClassName: 'theadHide',
              HeaderData: sectionAttributesJSON1
            };

            section.Columns.push(columnHeader_section1);
            section.SectionAttributes.forEach(sa => {
              let classTemp = (sa.IsHidden != null && sa.IsHidden == true) ? 'theadHide' : 'theadShow instrtblWidth';
              let columnHeader = {
                HeaderName: sa.LabelName != null ? sa.LabelName : "",
                CssClassName: classTemp
              };
              section.Columns.push(columnHeader);
            });

            /******************** PRINTIMG THE HEADERS  **********************************/
            let thead_temp = $('<thead></thead>');
            let tr_temp = $('<tr></tr>');
            section.Columns.forEach(column => {
              let th_temp = $('<th  class="' + column.CssClassName + '">' + column.HeaderName + '</th>');
              $(tr_temp).append(th_temp);
              $(thead_temp).append(tr_temp);

            });
            $(tempTable).append(thead_temp);

            break;

          case "sampleinitialization2":

            if (model != undefined)
              utilityService_temp.populatesampleInitialization2Table(model.SampleMethodStages, tempTable, utilityService_temp);
            break;
          case "samplemethodstagereadings2":

            if (model != undefined) {
              let contextualControl = tempTable.parentElement;

              let sampleId = document.getElementById(AppConstants.GENERAL.HIDDEN_SAMPLE_ID) as HTMLInputElement;
              if (sampleId == null) {
                let sampleId = document.createElement('input') as HTMLInputElement;
                sampleId.type = 'hidden';
                sampleId.id = AppConstants.GENERAL.HIDDEN_SAMPLE_ID;
                sampleId.value = model.SampleId;
                $(contextualControl).append(sampleId);
              }

              let methodId = document.getElementById(AppConstants.GENERAL.HIDDEN_METHOD_ID) as HTMLInputElement;
              if (methodId == null) {
                let methodId = document.createElement('input') as HTMLInputElement;
                methodId.type = 'hidden';
                methodId.id = AppConstants.GENERAL.HIDDEN_METHOD_ID;
                methodId.value = model.MethodId;
                $(contextualControl).append(methodId);
              }

              let stageId = document.getElementById(AppConstants.GENERAL.HIDDEN_STAGE_ID) as HTMLInputElement;
              if (stageId == null) {
                let stageId = document.createElement('input') as HTMLInputElement;
                stageId.type = 'hidden';
                stageId.id = AppConstants.GENERAL.HIDDEN_STAGE_ID;
                stageId.value = model.StageId;
                $(contextualControl).append(stageId);
              }
              model.SampleMethodStages.sort(function (a, b) {
                return a.MethodStageGridColumnForPopulation.Sequence - b.MethodStageGridColumnForPopulation.Sequence;
              });

              model.SampleMethodStages.forEach((SM, i) => {
                if (SM.MethodStageGridColumnForPopulation.IsInput == true && SM.MethodStageGridColumnForPopulation.IsText == false) {



                  /*-------------------------create hidden Field for Edit Time------------------------------------*/
                  let temp_hidden_manually_set = document.getElementById(AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID) as HTMLInputElement;
                  if (temp_hidden_manually_set == null) {
                    let temp_hidden_manually_set_control = document.createElement('input') as HTMLInputElement;
                    temp_hidden_manually_set_control.type = 'hidden';
                    temp_hidden_manually_set_control.id = AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID;
                    $(contextualControl).append(temp_hidden_manually_set_control);

                  }
                  let temp_hidden_last_td_id = document.getElementById(AppConstants.GENERAL.HIDDEN_LAST_TD_ID) as HTMLInputElement;
                  if (temp_hidden_last_td_id == null) {
                    let temp_hidden_last_td_id_control = document.createElement('input') as HTMLInputElement;
                    temp_hidden_last_td_id_control.type = 'hidden';
                    temp_hidden_last_td_id_control.id = AppConstants.GENERAL.HIDDEN_LAST_TD_ID;
                    $(contextualControl).append(temp_hidden_last_td_id_control);
                  }

                  let temp_hidden_barcode_id = document.getElementById(AppConstants.GENERAL.HIDDEN_BARCODE_ID) as HTMLInputElement;
                  if (temp_hidden_barcode_id == null) {
                    let temp_hidden_barcode_id_control = document.createElement('input') as HTMLInputElement;
                    temp_hidden_barcode_id_control.type = 'hidden';
                    temp_hidden_barcode_id_control.id = AppConstants.GENERAL.HIDDEN_BARCODE_ID;
                    $(contextualControl).append(temp_hidden_barcode_id_control);
                  }
                  let updateId = SM.MethodStageGridColumnForPopulation.ColumnName.replace(" ", '_');
                  let firstPageValue = sessionStorage.getItem("firstRecord");
                  firstPageValue = (firstPageValue == null) ? "_0" : "_" + (parseInt(firstPageValue) - 1).toString();
                  setInputValue(AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID, 'false');
                  setInputValue(AppConstants.GENERAL.HIDDEN_LAST_TD_ID, updateId + firstPageValue + "_" + i);

                }
                if (SM.MethodStageGridColumnForPopulation.IsInput == true) {
                  let temp_hidden_manually_set1 = document.getElementById(AppConstants.GENERAL.HIDDEN_INPUT_MANUALY_SET_ID) as HTMLInputElement;
                  if (temp_hidden_manually_set1 == null) {
                    let temp_hidden_manually_set_control1 = document.createElement('input') as HTMLInputElement;
                    temp_hidden_manually_set_control1.type = 'hidden';
                    temp_hidden_manually_set_control1.id = AppConstants.GENERAL.HIDDEN_INPUT_MANUALY_SET_ID;
                    $(contextualControl).append(temp_hidden_manually_set_control1);

                  }
                  let temp_hidden_last_td_id1 = document.getElementById(AppConstants.GENERAL.HIDDEN_LAST_INPUT_DATA_TD_ID) as HTMLInputElement;
                  if (temp_hidden_last_td_id1 == null) {
                    let temp_hidden_last_td_id_control1 = document.createElement('input') as HTMLInputElement;
                    temp_hidden_last_td_id_control1.type = 'hidden';
                    temp_hidden_last_td_id_control1.id = AppConstants.GENERAL.HIDDEN_LAST_INPUT_DATA_TD_ID;
                    $(contextualControl).append(temp_hidden_last_td_id_control1);
                  }
                  let updateId1 = SM.MethodStageGridColumnForPopulation.ColumnName.replace(" ", '_');
                  let firstPageValue1 = sessionStorage.getItem("firstRecord");
                  firstPageValue1 = (firstPageValue1 == null) ? "_0" : "_" + (parseInt(firstPageValue1) - 1).toString();
                  setInputValue(AppConstants.GENERAL.HIDDEN_INPUT_MANUALY_SET_ID, 'false');
                  setInputValue(AppConstants.GENERAL.HIDDEN_LAST_INPUT_DATA_TD_ID, updateId1 + firstPageValue1 + "_" + i);
                }
              })
              utilityService_temp.populatesamplemethodstagereadings2Table(model.SampleMethodStages, tempTable, utilityService_temp, pagesize);
              sessionStorage.setItem(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGES, JSON.stringify(model.SampleMethodStages));

            }
            break;
          default:
            //Storing the Section as JSON inside 'TableTemplateSection' within the TABLE 
            let sectionAttributesJSON = JSON.stringify(section);
            //TableTemplate section which is hidden, will store the Entire Section in JSON Format
            let columnHeader_section = {
              HeaderName: 'Section',
              CssClassName: 'theadHide',
              HeaderData: sectionAttributesJSON
            };

            section.Columns.push(columnHeader_section);
            section.SectionAttributes.forEach(sa => {
              let classTemp = (sa.IsHidden != null && sa.IsHidden == true) ? 'theadHide' : 'theadShow ' + sa.CssHeaderClassName;
              let columnHeader = {
                HeaderName: sa.LabelName,
                CssClassName: classTemp
              };
              if (sa.IsHidden != null && sa.IsHidden == false && !section.Columns.includes(columnHeader)) {
                section.Columns.push(columnHeader);
              }
            });
            break;
        }

        /******************check the Model and Populate the Data if model is not Null *************************/
        if (splittedName == "balancerecords") {
          if (model != null && section.ModelCollectionName != null) {
            /*------------------------Get the DataCollection for Table Types ------------------------------*/
            let dataCollection = model[section.ModelCollectionName];
            /* ---------------------------PROCESSING CODE 
            CHECK FOR THE PAGE AND APPLY PROCESSING -------------------------------------*/
            if (dataCollection != null && Array.isArray(dataCollection)) {
              dataCollection = dataCollection as Array<any>;
              if (dataCollection != null) {
                 let tbody_temp3 = $(tempTable).find('tbody');
                for (let i = 0; i < dataCollection.length; i++) {
                  let tbody_temp4 = tbody_temp3[0] as HTMLTableSectionElement;
                  utilityService_temp.generateRowForGivenTable(tbody_temp4, section, dataCollection[i], utilityService_temp, model, null, i);
                };

                let contextualControl = tempTable.parentElement;
                /*-------------------------create hidden Field for Edit Time------------------------------------*/
                let temp_hidden_manually_set = document.getElementById(AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID) as HTMLInputElement;
                if (temp_hidden_manually_set == null) {
                  let temp_hidden_manually_set_control = document.createElement('input') as HTMLInputElement;
                  temp_hidden_manually_set_control.type = 'hidden';
                  temp_hidden_manually_set_control.id = AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID;
                  $(contextualControl).append(temp_hidden_manually_set_control);

                }
                let temp_hidden_last_td_id = document.getElementById(AppConstants.GENERAL.HIDDEN_LAST_TD_ID) as HTMLInputElement;
                if (temp_hidden_last_td_id == null) {
                  let temp_hidden_last_td_id_control = document.createElement('input') as HTMLInputElement;
                  temp_hidden_last_td_id_control.type = 'hidden';
                  temp_hidden_last_td_id_control.id = AppConstants.GENERAL.HIDDEN_LAST_TD_ID;
                  $(contextualControl).append(temp_hidden_last_td_id_control);
                }

                setInputValue(AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID, 'false');
                setInputValue(AppConstants.GENERAL.HIDDEN_LAST_TD_ID, "WeightValue_0");
              }
            };
          };
        } else if (splittedName == "instrumentcalibrationsets") {

          let responseForAddJson = utilityService_temp.getDataFormService(addUrl);
          responseForAddJson.subscribe(
            data => {
              if (data != null) {
                let tbody_temp = $(tempTable).find('tbody');
                /*-----------------populate Instrument Calibration Table  data  in Edit time. -------------------------------*/
                for (let i = 0; i < totalRows; i++) {
                  let tbody_temp1 = tbody_temp[0] as HTMLTableSectionElement;
                  utilityService_temp.generateRowForGivenTable(tbody_temp1, data, null, utilityService_temp, model, null, i);
                }
                /*-----------------------get InstrumentCalibrationsets page data in edit time ------------------------------*/
                let response = utilityService_temp.getDataFormService(url);
                response.subscribe(
                  data => {
                    if (data != null) {

                      data.SectionAttributes.forEach(SA => {
                        let currentTdId = document.getElementById(SA.HelpText) as HTMLTableCellElement;
                        if (currentTdId != null && currentTdId != undefined) {
                          currentTdId.innerText = SA.CurrentValue != undefined ? SA.CurrentValue : "";
                          let currentRowVersion = SA.RowVersion != undefined ? SA.RowVersion : "";
                          let specialId = SA.EndPointId != undefined ? SA.EndPointId : "";
                          currentTdId.setAttribute(AppConstants.COMMON.COMMON_SPECIAL_ID, specialId.toString());
                          currentTdId.setAttribute(AppConstants.COMMON.COMMON_SPECIAL_ROWVERSION, currentRowVersion);

                        }
                      });

                      let contextualControl = tempTable.parentElement;
                      /*-------------------------create hidden Field for Edit Time -------------------------------------*/
                      let temp_hidden_manually_set = document.getElementById(AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID) as HTMLInputElement;
                      if (temp_hidden_manually_set == null) {
                        let temp_hidden_manually_set_control = document.createElement('input') as HTMLInputElement;
                        temp_hidden_manually_set_control.type = 'hidden';
                        temp_hidden_manually_set_control.id = AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID;
                        $(contextualControl).append(temp_hidden_manually_set_control);

                      }

                      /*-------------------------create hidden Field for Edit Time -------------------------------------*/
                      let temp_hidden_last_td_id = document.getElementById(AppConstants.GENERAL.HIDDEN_LAST_TD_ID) as HTMLInputElement;
                      if (temp_hidden_last_td_id == null) {
                        let temp_hidden_last_td_id_control = document.createElement('input') as HTMLInputElement;
                        temp_hidden_last_td_id_control.type = 'hidden';
                        temp_hidden_last_td_id_control.id = AppConstants.GENERAL.HIDDEN_LAST_TD_ID;
                        $(contextualControl).append(temp_hidden_last_td_id_control);
                      }

                      setInputValue(AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID, 'false');
                      setInputValue(AppConstants.GENERAL.HIDDEN_LAST_TD_ID, 'td_Observed_0_1');

                      let totalTableRows = tempTable.rows.length;
                      let totalColumns = tempTable.rows[1].cells.length - 1;

                      var row = tempTable.insertRow(totalTableRows);
                      /*-----------------------Adding the word Avg---------------------------------*/
                      let td_temp = row.insertCell();
                      td_temp.id = 'td_Avg_' + '_0';
                      td_temp.innerText = 'Avg';

                      /*--------------------loop the number of columns-----------------------------*/
                      for (let i = 1; i < totalColumns; i++) {
                        let id = 'td_Avg_' + i.toString();
                        let td_temp = row.insertCell();
                        td_temp.id = id;

                      }

                      var row1 = tempTable.insertRow(totalTableRows + 1);

                      /*-----------------------Adding the word RSD------------------------------------*/
                      let td_temp1 = row1.insertCell();
                      td_temp1.id = 'td_Rsd_' + '_0';
                      td_temp1.innerText = 'Rsd';
                      /*---------------------------loop the number of columns---------------------------*/
                      for (let i = 1; i < totalColumns; i++) {
                        let id = 'td_Rsd_' + i.toString();
                        let td_temp = row1.insertCell();
                        td_temp.id = id;
                      }
                      $("#InstrumentCalibrationSetDetails tr").each(function () {
                        let tr = $(this)[0];
                        let column = $(tr).children('td');
                        if (column != null && column.length > 0) {
                          for (let col = 1; col < column.length; col++) {
                            let referenceContl = column[col].id.includes('Observed');
                            if (referenceContl == true) {
                              let tdControlId = column[col].id;
                              /*----------------Calculate Avg Value-------------------------------*/
                              utilityService_temp.calculateAverage(tdControlId);
                              /*--------------------- CalculateRSD----------------------------------*/
                              utilityService_temp.calculateRSD(tdControlId);
                            }
                          }
                        }

                      });
                    }
                  });
              }
            });
        } else {
          if (model != null && section.ModelCollectionName != null) {
            /*----------------------------------------Get the DataCollection for Table Types ---------------------------------*/
            let dataCollection = model[section.ModelCollectionName];
            /*PROCESSING CODE 
            //CHECK FOR THE PAGE AND APPLY PROCESSING */
            if (dataCollection != null && Array.isArray(dataCollection)) {
              dataCollection = dataCollection as Array<any>;
              if (dataCollection != null) {
                 let tbody_temp3 = $(tempTable).find('tbody');
                for (let i = 0; i < dataCollection.length; i++) {
                  let tbody_temp1 = tbody_temp3[0] as HTMLTableSectionElement;
                  utilityService_temp.generateRowForGivenTable(tbody_temp1, section, dataCollection[i], utilityService_temp, model, null, i);
                };
              }
            };
          };
        }

      }
    }

    let parentControl = document.getElementById(section.SectionName) as HTMLElement;
    //******************* Process SectionAttributes *******************  */
    if (section.SectionAttributes != null && section.SectionAttributes != undefined) {
      section.SectionAttributes.forEach(sectionAttribute => {
        utilityService_temp.populateSectionAttributesInterim(sectionAttribute, parentControl, section, model, bindEvents, isPageLoaded, utilityService_temp);

      });
    }
    //***************** Process SubSections ***************************** */
    section.SubSections.forEach(section => {
      //******** RECURSION TO PROCESS SUB SECTION WITHIN THE SECTIONS */
      utilityService_temp.processSection(section, model, utilityService, bindEvents);
    });
  }
  /*--------------------create Id in  balance record table record deleted-------------------------*/
  populateCellId(tr: HTMLElement, controlName: String, cellId: string, dynamicClassName: string,
    tblId: string, currentPage: string, utilityService?: UtilityService) {
    let utilityService_temp = utilityService == null ? this : utilityService;
    $(tr).each(function () {
      let td = $(this)[0];
      if (td != null) {
        if (cellId != null && cellId != "") {
          let splitedValue = cellId.split('_');
          let deleteRow = splitedValue[2];

          let deleteRowPosition = parseInt(deleteRow);
          let tblControl = document.getElementById(tblId) as HTMLTableElement;
          let totalRows = tblControl.rows.length;
          for (let i = deleteRowPosition; i < totalRows; i++) {
            let tr = tblControl.rows[i + 1];
            $(tr).each(function () {
              let tr = $(this)[0];
              let td = $(tr).find('.txtWeightValue');
              let td1 = td[0] as HTMLTableCellElement ;
              if (td1 != null) {
                //manupulate the idbased on row num
                //row ke baad replce that with the param rownum
                //....row- /regex replace
                let patternToMatch = /WeightValue_[0-9_]*/g;
                let result = td1['id'].match(patternToMatch);
                if (result != null) {
                  let splitedValue = result[0].split('_');
                  let currentId = parseInt(splitedValue[1]) - 1;
                 // td.setAttribute("Id", "WeightValue_" + currentId);
                  $(td).attr(AppConstants.COMMON.ID, "WeightValue_" + currentId);

                }
              }
            });

          }
        }
      }

    });

  }
  /* ------------------------Show select box data,Date Controller and 
  Datetime-local Controller Data  automatically in  edit time--------------------------------------*/
  populateSectionAttributesInterim(sectionAttribute: SectionAttribute, parentControl: HTMLElement, section: Section, inputModel: any,
    bindEvents?: boolean,
    isPageLoaded?: boolean, utilityService?: UtilityService) {

    let currentcontrolValue = 0;
    let input_temp_model: any;
    input_temp_model = inputModel;
    let utilityService_temp = utilityService == null ? this : utilityService;
    /********** We are finding the value only when its not a bind event, i.e its starting point when we need to populate data */
    if (section.SectionTypeName != 'object' && section.SectionTypeName != undefined && inputModel != null && sectionAttribute.ModelPropName != null) {
      currentcontrolValue = inputModel[sectionAttribute.ModelPropName];
      /* ----------------populate date controller data in edit time.----------------------*/
      if (sectionAttribute.ControlType == "date") {
        let dateControl = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

        if (sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled) {
          dateControl.setAttribute('disabled', 'disabled');
        }

        currentcontrolValue = inputModel[sectionAttribute.ModelPropName];
        if (currentcontrolValue != null) {
          let updateDate = currentcontrolValue.toString().slice(0, 10);
          dateControl.value = updateDate;
        }
      }
      else if (sectionAttribute.ControlType == "selectMultiple") {
        currentcontrolValue = inputModel[sectionAttribute.ModelPropName];
      }
      else if (sectionAttribute.ControlType == "datetime-local") {
        let dateTimeControl = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

        if (sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled) {
          dateTimeControl.setAttribute('disabled', 'disabled');
        }

        currentcontrolValue = inputModel[sectionAttribute.ModelPropName];
        if (currentcontrolValue != null) {
          let updateDate = currentcontrolValue.toString().slice(0, 19);
          dateTimeControl.value = updateDate;
        }
      }

    }
    else if ((sectionAttribute.ControlType == 'select' || sectionAttribute.ControlType == 'selectMultiple') || (sectionAttribute.ControlType == 'tblselect' || sectionAttribute.ControlType == 'tblselectMultiple')) {

      if (sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled) {
        if (parentControl != null) {  //grid

          let controlRefs = parentControl.getElementsByClassName(sectionAttribute.ControlName);
          if (controlRefs != null && controlRefs.length > 0) {
            let controlRef = controlRefs[0] as HTMLElement;
            if (controlRef != null)
              controlRef.setAttribute('disabled', 'disabled');


          }
        }
        else {
          var controlRef = document.getElementById(sectionAttribute.ControlName) as HTMLElement;
          if (controlRef != null)
            controlRef.setAttribute('disabled', 'disabled');
        }

      }

      if (section.SectionTypeName != null && section.SectionTypeName == 'object' && section.ModelObjectName != null && inputModel != null) {
        currentcontrolValue = inputModel[section.ModelObjectName][sectionAttribute.ModelPropName];
        //************ In this case its evaluating the mdel from the object inside */
        input_temp_model = inputModel[section.ModelObjectName];
      }
    }
    else if ((sectionAttribute.ControlType == 'select' || sectionAttribute.ControlType == 'selectMultiple') && !bindEvents) {

      if (sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled) {
        var controlRef = document.getElementById(sectionAttribute.ControlName) as HTMLElement;
        if (controlRef != null)
          controlRef.setAttribute('disabled', 'disabled');
      }

      if (section.SectionTypeName != null && section.SectionTypeName == 'object' && section.ModelObjectName != null && inputModel != null) {
        currentcontrolValue = inputModel[section.ModelObjectName][sectionAttribute.ModelPropName];
        //************ In this case its evaluating the mdel from the object inside */
        input_temp_model = inputModel[section.ModelObjectName];
      }

      else if (inputModel != null) {
        //Assigning the default value
        currentcontrolValue = inputModel[sectionAttribute.ModelPropName];
        currentcontrolValue = sectionAttribute.ModelPropName != null && (sectionAttribute.ControlType == 'select' || sectionAttribute.ControlType == 'selectMultiple') ? inputModel[sectionAttribute.ModelPropName] : null;

        //************ here its a plain simple case of using the parent model */
      }

    }

    else if ((sectionAttribute.ControlType == 'tblselect' || sectionAttribute.ControlType == 'tblselectMultiple') && !bindEvents) {

      if (sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled && parentControl != null) {
        let controlRefs = parentControl.getElementsByClassName(sectionAttribute.ControlName);
        if (controlRefs != null && controlRefs.length > 0) {
          let controlRef = controlRefs[0] as HTMLElement;
          if (controlRef != null)
            controlRef.setAttribute('disabled', 'disabled');
        }

      }

      if (section.SectionTypeName != null && section.SectionTypeName == 'object' && section.ModelObjectName != null && inputModel != null) {
        currentcontrolValue = inputModel[section.ModelObjectName][sectionAttribute.ModelPropName];
        //************ In this case its evaluating the mdel from the object inside */

        input_temp_model = inputModel[section.ModelObjectName];
      }

      else if (inputModel != null) {
        //Assigning the default value

        currentcontrolValue = inputModel[sectionAttribute.ModelPropName];
        currentcontrolValue = sectionAttribute.ModelPropName != null && (sectionAttribute.ControlType == 'tblselect' || sectionAttribute.ControlType == 'tblselectMultiple') ? inputModel[sectionAttribute.ModelPropName] : null;

        //************ here its a plain simple case of using the parent model */
      }

    }
    else if ((sectionAttribute.ControlType == 'json')) {
      if (section.SectionTypeName != null && section.SectionTypeName == 'object' && section.ModelObjectName != null && inputModel != null) {
        currentcontrolValue = inputModel[section.ModelObjectName][sectionAttribute.ModelPropName];
        if (JSON.stringify(currentcontrolValue) != "[]") {
          $("#" + sectionAttribute.ControlName).val(JSON.stringify(currentcontrolValue));
        }
      }
    }

    else {
      if (parentControl == null) { //direct {
        if (sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled) {
          var controlRef = document.getElementById(sectionAttribute.ControlName) as HTMLElement;
          if (controlRef != null)
            controlRef.setAttribute('disabled', 'disabled');
        }

      }
      else {
        if (sectionAttribute.IsDisabled != null && sectionAttribute.IsDisabled) {
          var controlRef = document.getElementById(sectionAttribute.ControlName) as HTMLElement;
          if (controlRef != null)
            controlRef.setAttribute('disabled', 'disabled');
        }
      }
    }

    utilityService_temp.processSectionAttributes(section, sectionAttribute, input_temp_model, parentControl, currentcontrolValue,
      bindEvents, isPageLoaded, utilityService_temp);
  }

  /*--------------------- Its populated covert typeof() -----------------------------------------*/
  getObjectTypeCastedData(input: any, sectionAttribute: SectionAttribute, typeName = null) {
    let output: any;
    let typeName_temp = (typeName == null) ? sectionAttribute.ModelPropType : typeName;
    if (input != null) {
      switch (typeName_temp) {
        case "string":
          output = input.toString();
          break;
        case "number":
          if (typeof input === 'string') {
            output = Number(input); /* parseInt(input.toString());*/
          }
          else {
            output = 0;
          }

          break;
        case "float":
          if (typeof input === 'number') {
            output = Number(input); /* parseFloat(input.toString());*/
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
    }
    return output;
  }

  deleteCurrentTableRow(deleteElement: HTMLElement, parentControlRow?: HTMLElement) {

    if (parentControlRow != null) {

      let row = parentControlRow as HTMLTableRowElement;
      row.remove();

      let path = window.location.pathname;
      let splittedValues = path.split('/');
      let splittedString = splittedValues[2].toLowerCase();
      if (splittedString == "sampleinitialization2") {
        let currentId = parentControlRow.children[0].children[0].id;
        let splitedvalue = currentId.split("_");
        let splitfirstValue = splitedvalue[splitedvalue.length - 1]
        let split2ndValue = parseInt(splitedvalue[splitedvalue.length - 2]);
        //row delete time set id 

        this.decrementTrValue(split2ndValue);
        this.populateRepeatData(null);
        this.populateRunningNumberData(true, null);
      }
      else if (splittedString == "sampleinitializations") {
        let currentId = parseInt(deleteElement.id);
        let initializationValue = JSON.parse(sessionStorage.getItem(AppConstants.COMMON.COMMON_INITIALIZATION));
        var lists = initializationValue.filter(x => {
          return x.Id != currentId;
        })
        console.log(lists);
        let initializationValue_update = JSON.stringify(lists);
        sessionStorage.setItem("Initialization", initializationValue_update);
      }
    }

    var rowCount = $("#sampleInitialization2Table > tbody").children().length;
    let inputCtrl = document.getElementById("txtNoOfRows") as HTMLInputElement;
    if (rowCount > 0) {
      inputCtrl.value = rowCount.toString();
    }
  }

  getDataForDropdownForChildGrid(currentSection: Section, url: string, controlId: string, x: HTMLElement, endpoint: Endpoint, isRefresh: boolean,
    utilityService?: UtilityService, selectedValue?: any, arrayofDependentEvents?: Array<Event1>, currentModel?: any, parentElement?: HTMLElement) {
    let utilityService_temp = utilityService == null ? this : utilityService;
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

    let selectedValues = this.arrayOfFetchData.filter(item => item.key == url);
    if ((selectedValue != "0" && selectedValue != 0 && selectedValue != "") || !url.includes('keyId')) {
      if (isRefresh || (endpoint.UseCache != null && !endpoint.UseCache)) {
        let responseDataTemp1_promise = utilityService_temp.getDataFromApiAsPromise(url, arrayOfColumnString);
        responseDataTemp1_promise.then((data) => {
          if (endpoint.IsUniqueness && endpoint.IsUniqueness != null) {
            data = Array.from(new Set(data.map(s => s.Key)))
              .map(Key => {
                return {
                  Key: Key,
                  Value: data.find(s => s.Key === Key).Value
                };
              });
          }
          if (!(endpoint.UseCache != null && !endpoint.UseCache))
            utilityService_temp.updateLocalCache(url, data, utilityService_temp);
          /*----------------------Change the below to a method ------------------*/
          utilityService_temp.getDropDownControl(currentSection, control, data, selectedValue, utilityService_temp, arrayofDependentEvents, currentModel);
        }).catch(error => {
          utilityService_temp.handleError(error);
        });
      }
      else if (this.arrayOfFetchData.length > 0 && selectedValues.length > 0) {
        //************ IF FOUND FROM THE LOCAL ARRAY ************** */
        //check if the control has to use catch if yes read from array if no read server call
        if (selectedValues.length > 0) {
          let firstOrDefaultDataSet = selectedValues[0].value;
          //Call the new method that generates the dropdown as below.

          utilityService_temp.getDropDownControl(currentSection, control, firstOrDefaultDataSet, selectedValue, utilityService_temp, arrayofDependentEvents, currentModel);
        }
      }
      else {
        /*********************** IF FIRST TIME WHEN GETTING DATA FROM API ********************* */
        let responseDataTemp1_promise = utilityService_temp.getDataFromApiAsPromise(url, arrayOfColumnString);
        responseDataTemp1_promise.then((data) => {
          if (!(endpoint.UseCache != null && !endpoint.UseCache))
            utilityService_temp.updateLocalCache(url, data, utilityService_temp);
          /*-------------------------Change the below to a method---------------------*/
          utilityService_temp.getDropDownControl(currentSection, control, data, selectedValue, utilityService_temp, arrayofDependentEvents, currentModel);
        }).catch(error => {
          utilityService_temp.handleError(error);
        });
      }
    }
  }

  /*--------------------------------------HISTORY---------------------------------------------------*/

  getHistoryPanelData(currenthistoryObject: any, panelDiv: HTMLDivElement): HTMLDivElement {

    var maindiv = $("<div class='panel-heading' role='tab' id='" + currenthistoryObject.Id + "'></div>");
    var mainheding = $("<h4 class='panel-title'></h4>");
    let operation = currenthistoryObject.Operation == 1 ? "Create" : currenthistoryObject.Operation == 2 ? "Update" : currenthistoryObject.Operation == 3 ? "Delete" : "";
    if (currenthistoryObject.Email != null && currenthistoryObject.Email != undefined) {
      var temp = $("<a data-toggle='collapse' data-parent='#accordion' href='#collapse" + currenthistoryObject.Id + "' aria-expanded='false' aria-controls='collapse" + currenthistoryObject.Id + "'>" + " [ " + currenthistoryObject.Email + "] " + operation + "d this on " + currenthistoryObject.AffectedDate + "</a>");
      $(mainheding).append(temp);
    }
    $(maindiv).append(mainheding);

    var innerdiv = $("<div id='collapse" + currenthistoryObject.Id + "' class='panel-collapse collapse in' role='tabpanel'aria-labelledby='" + currenthistoryObject.Id + "'></div>");
    let currentDiv = document.createElement('div') as HTMLDivElement;
    currentDiv.className = 'panel-body';
    currentDiv.id = 'divHistoryInfo';
    let outputDiv = this.getDivDataByTypeCasting(currenthistoryObject, currentDiv);

    $(innerdiv).append(outputDiv);
    $(panelDiv).append(maindiv);
    $(panelDiv).append(innerdiv);

    return panelDiv;
  }

  getLogData(currentLogObject: any, panelDiv: HTMLDivElement): HTMLDivElement {


    var innerdiv = $("<div></div>");
    let currentDiv = document.createElement('div') as HTMLDivElement;
    currentDiv.className = 'panel-body1';
    currentDiv.id = 'divHistoryInfo';
    let outputDiv = this.getDivDataByTypeCasting(currentLogObject, currentDiv);
    $(innerdiv).append(outputDiv);
    $(panelDiv).append(innerdiv);
    return panelDiv;
  }
  /*------------------------------------------------------HistoryDiv Data-----------------------------------------------------*/
  getDivDataByTypeCasting(objectData: any, divElement: HTMLDivElement): HTMLDivElement {

    if (objectData != null) {
      let keys = Object.keys(objectData);
      let values = Object.values(objectData);

      let hrLine = $('<hr></hr>');

      for (let a = 0; a < keys.length; a++) {

        /*check object type*/
        if (typeof values[a] == 'object' && !Array.isArray(values[a])) {
          let hrLine = $('<p>------------------------------------------------------------------------------------------------------------------------------------------</p>');
          let divtemp = this.getDivDataByTypeCasting(values[a], divElement);

          $(divElement).append(divtemp);
          $(divElement).append(hrLine);
        }
        else if (Array.isArray(values[a])) {

          if (values[a] != null && values[a]['length'] > 0) {

            let paragraph = $('<p><b>' + keys[a] + '</b></p>');
            let hrLine = $('<p>------------------------------------------------------------------------------------------------------------------------------------------</p>');
            $(divElement).append(hrLine);
            $(divElement).append(paragraph);
            $(divElement).append(hrLine);

            for (let j = 0; j < values[a]['length']; j++) {
              let currentObject = values[a][j];

              let divElement_temp = this.getDivDataByTypeCasting(currentObject, divElement);
              $(divElement).append(divElement_temp);
              $(divElement).append(hrLine);
            }

          }
        }
        /*-------------------------- Normal condition-----------------------------*/

        else {
          if (keys[a] != AppConstants.COMMON.COMMON_ROWVERSION && keys[a] != "AffectedDate") {

            let result = keys[a].includes(AppConstants.COMMON.ID);
            if (!result) {
              var parentiv = $('<div class="col-sm-12"></div>');
              /*---------------------- Set Data               --------------------------*/
              if (typeof (values) == "object" && values.length == 2) {
                let afterRegEx = values[a].toString().replace("/", "").match(/\d+/).toString();
                let int_afterRegEx = parseInt(afterRegEx);
                let new_date = new Date((int_afterRegEx / 10000) - Math.abs(new Date(0, 0, 1).setFullYear(1)));

                var temp = $('<span class="col-sm-3"><b>' + keys[a] + '</b></span>');
                var span = $('<span class="col-sm-9">' + new_date.toLocaleString() + '</span>');
              }
              else {
                var temp = $('<span class="col-sm-3"><b>' + keys[a] + '</b></span>');
                var span = $('<span class="col-sm-9">' + values[a] + '</span>');
              }

              $(parentiv).append(temp);
              $(parentiv).append(span);
              $(divElement).append(parentiv);
            }
          }
        }
      }
    }
    return divElement;
  }

  /**********************END HISTORY****************************/

  /*---------------------set dropdown data in View Page---------------------------*/
  getDropDownControl(currentSection: Section, control: HTMLElement, data: any, selectedValue?: any, utilityService_temp?: UtilityService, arrayofDependentEvents?: Array<Event1>, currentModel?: any) {
    let moduleName = this.moduleName
    if (control != null) {
      let affectedControl1 = control as HTMLSelectElement;

      //******** Removing the options ************* */
      if (affectedControl1 != null) {

        let length = affectedControl1.options.length;
        affectedControl1.options.length = 0;
        for (let i = length - 1; i >= 0; i--) {
          affectedControl1.options[i] = null;
        }
      }

      let dataCollection = data as Array<any>;
      let currentsplittedValues = (typeof selectedValue == "string") ? selectedValue.split(',') : [];

      let splittedValues = [];
      if (currentsplittedValues != null) {
        for (let i = 0; i < currentsplittedValues.length; i++) {
          if (isNaN(parseInt(currentsplittedValues[i])) == true) {

            splittedValues.push(currentsplittedValues[i]);
          } else {
            splittedValues.push(parseInt(currentsplittedValues[i]));
          }


        }
      }
      dataCollection.forEach(item => {
        let option1 = document.createElement('option') as HTMLOptionElement;
        option1.value = item.Key;
        option1.text = item.Value;
        /*----------------check if its comma separated ids --------------------------*/
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
              /***Call the populate dropdown for the child elements ************/
              if (arrayofDependentEvents != null && arrayofDependentEvents.length > 0) {
                arrayofDependentEvents.forEach(event => {
                  let control_child = document.getElementById(event.affectedControlName) as HTMLSelectElement;

                  let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : moduleName;
                  let url_temp = event.EndPoint.EndpointAddress;

                  /*----------------------BUILDING THE COMPLETE URL -------------------------*/
                  if (url_temp.includes('{keyId}')) {
                    url_temp = url_temp.replace('{keyId}', selectedValue);
                    url_temp = utilityService_temp.getApiUrl(module_temp) + url_temp;

                    //************************* Check AdditionalParams Array data generate URL ************************
                    if (event.EndPoint.AdditionalParams != null && event.EndPoint.AdditionalParams.length > 0) {

                      for (let i = 0; i < event.EndPoint.AdditionalParams.length; i++) {

                        /*---------------EVALUATE THE VALUE/KEY FROM THE RELATED CONTROL --------------------*/
                        if (event.EndPoint.AdditionalParams[i].KeyName != null && url_temp.includes(event.EndPoint.AdditionalParams[i].KeyName)) {

                          let control_value = currentModel[event.EndPoint.AdditionalParams[i].ModelPropName];

                          url_temp = url_temp.replace(event.EndPoint.AdditionalParams[i].KeyName, control_value);

                        }
                        else if (event.EndPoint.AdditionalParams[i].ValueName != null && url_temp.includes(event.EndPoint.AdditionalParams[i].ValueName)) {

                          let control_value = currentModel[event.EndPoint.AdditionalParams[i].ModelPropName];
                          url_temp = url_temp.replace(event.EndPoint.AdditionalParams[i].ValueName, control_value);
                        }
                      }
                    }
                  }
                  else {
                    url_temp = utilityService_temp.getApiUrl(module_temp);
                  }

                  let parentseletedValueForDependentControl = event.affectedControlModelName != null && currentModel != null ? currentModel[event.affectedControlModelName] : 0;
                  utilityService_temp.populateDropdown(currentSection, control_child, event, url_temp, false, event.EndPoint, utilityService_temp, parentseletedValueForDependentControl, currentModel);

                  console.log("FOR CHILD" + control_child.id);
                  let section_attribute_temp = utilityService_temp.findSectionAttributesRecursively(currentSection, control_child.id);
                  //****************** LOOPING FOR CHILD EVENTS *************************** */
                  if (section_attribute_temp.Events != null) {
                    for (let i = 0; i < section_attribute_temp.Events.length; i++) {
                      let control_child1 = document.getElementById(section_attribute_temp.Events[i].affectedControlName) as HTMLSelectElement;

                      let module_temp = section_attribute_temp.Events[i].EndPoint.ModuleName != null ? section_attribute_temp.Events[i].EndPoint.ModuleName : moduleName;
                      let url_temp = section_attribute_temp.Events[i].EndPoint.EndpointAddress;

                      /******************************BUILDING THE COMPLETE URL *****************************************/
                      if (url_temp.includes('{keyId}')) {
                        url_temp = url_temp.replace('{keyId}', parentseletedValueForDependentControl);
                        url_temp = utilityService_temp.getApiUrl(module_temp) + url_temp;
                      } else if (url_temp.includes('{valueName}')) {
                        let parentseletedValueForDependentControl1 = event.affectedControlModelName1 != null && currentModel != null ? currentModel[event.affectedControlModelName1] : "";
                        url_temp = url_temp.replace('{valueName}', parentseletedValueForDependentControl1);
                        url_temp = utilityService_temp.getApiUrl(module_temp) + url_temp;
                      }
                      else {
                        url_temp = utilityService_temp.getApiUrl(module_temp);
                      }
                      let childseletedValueForDependentControl_value = section_attribute_temp.Events[i].affectedControlModelName != null && currentModel != null ? currentModel[section_attribute_temp.Events[i].affectedControlModelName] : 0;
                      let currentSectionAttribute = utilityService_temp.findSectionAttributesRecursively(currentSection, control_child1.id);
                      utilityService_temp.populateDropdown(currentSection, control_child1, section_attribute_temp.Events[i], url_temp, false, section_attribute_temp.Events[i].EndPoint, utilityService_temp, childseletedValueForDependentControl_value, currentSectionAttribute.Events, currentModel);

                    }
                  }

                });
              }

            }
          }
          else if (splittedValues.length > 0) {
          }
        }
        affectedControl1.options.add(option1);
      });
    }
  }
  selectedLocalCatchController(controlName: string, section: Section): SectionAttribute {
    let sectionAttribute_temp: SectionAttribute;
    let dataFound = false;

    section.SectionAttributes.forEach(sectionAttribute => {

      if (sectionAttribute.ControlName == controlName) {
        sectionAttribute_temp = sectionAttribute;
        dataFound = true;
        return;
      }

    });

    //***************** Process SubSections ***************************** */
    if (!dataFound)
      section.SubSections.forEach(section => {
        //******** RECURSION TO PROCESS SUB SECTION WITHIN THE SECTIONS /
        this.selectedLocalCatchController(controlName, section);
      });

    return sectionAttribute_temp;
  }

  /*----------------------populate DropDown ----------------------------------------*/
  populateDropdown(currentSection: Section, x: HTMLElement, event: Event1, endpointUrl: string, isRefresh: boolean, endpoint: Endpoint, utilityService?: UtilityService,
    selectedValue?: any, arrayofDependentEvents?: Array<Event1>, currentModel?: any, parentElement?: HTMLElement) {
    let select = x as HTMLSelectElement;
    let utilityService_temp = utilityService == null ? this : utilityService;
    /*-------------------Try to evvaluate the values from the current model ------------------*/
    if (selectedValue == null) {
      selectedValue = (event != null && event.affectedControlModelName != null && currentModel != null) ?
        currentModel[event.affectedControlModelName] : 0;
    }
    /*THIS WILL EXECUTE ON INITIAL LOAD WHEN THERE IS NO EVENT*/
    if (event == null) {
      utilityService_temp.getDataForDropdownForChildGrid(currentSection, endpointUrl, (select != null ? select.id || select.className : "0"), select,
        endpoint, isRefresh, utilityService_temp, selectedValue, arrayofDependentEvents, currentModel, parentElement);
    }
    else {
      if (endpointUrl != null) {
        utilityService_temp.getDataForDropdownForChildGrid(currentSection, endpointUrl, event.affectedControlName, null,
          endpoint, isRefresh, utilityService_temp, selectedValue, arrayofDependentEvents, currentModel, parentElement);
      }
    }

    /*-----------------------Check if the control needs to be disabled -----------------------------*/
    let selectedSectionAttribute = currentSection.SectionAttributes.filter(t => t.ControlName == x.id);
    if (selectedSectionAttribute != null && selectedSectionAttribute.length > 0) {
      var isDisabled = selectedSectionAttribute[0].IsDisabled;
      if (isDisabled != null && isDisabled) {
        select.setAttribute('disabled', 'disabled');
      }
    }

  };




  /*------------ This Event Provides Bind Events Mecanism----------------------------*/
  bindEvents(currentSection: Section, sectionAttribute: SectionAttribute, parentControl?: HTMLElement, selectedValue?: any, currentModel?: any) {
    let navigateAddEdit = this.navigateAddEdit;
    let navigateIndex = this.navigateIndex;
    let generateRowForGivenTable = this.generateRowForGivenTable;
    let deleteCurrentTableRow = this.deleteCurrentTableRow;
    let getApiUrl = this.getApiUrl;
    let pageInfo2 = this.pageInfo2;
    let generateSamplentiRowForGivenTable = this.generateSamplentiRowForGivenTable;
    let populateDropdown = this.populateDropdown;
    let recursivelyEvaluateSequentialEvents = this.recursivelyEvaluateSequentialEvents;
    let processFiles = this.processFiles;
    let getDataForDropdownForChildGrid = this.getDataForDropdownForChildGrid;
    let getUrlForGenerateTable = this.getUrlForGenerateTable;
    let incrementTableId = this.incrementTableId;
    let incrementTableIdForDuplicate = this.incrementTableIdForDuplicate;
    let setValueofNewTr = this.setValueofNewTr;
    let populateRunningNumberData = this.populateRunningNumberData;
    let populateRepeatData = this.populateRepeatData;
    let populateBarcodeValue = this.populateBarcodeValue;
    let populateInputDataSampleMethodStageTable = this.populateInputDataSampleMethodStageTable;
    // let PullDataFormGridMethodStageReading2 = this.PullDataFormGridMethodStageReading2;
    let generateRowForGivenSampleInitialization2Table = this.generateRowForGivenSampleInitialization2Table;
    let getUrlForsampleinitializationTable = this.getUrlForsampleinitializationTable;
    let setpopulateDropDownDataForMethodStageColumnName = this.setpopulateDropDownDataForMethodStageColumnName;
    let toastr = this.toastr;
    let utilityService_temp = this;
    let moduleName = this.moduleName;
    let serverVisited: boolean;
    let charSetForNoGivenData: number;
    serverVisited = false;
    charSetForNoGivenData = 0;

    /*find refresh is any then bind the event*/
    if (sectionAttribute.ControlType == "select" || "selectMultiple") {
      let refresh_control = document.getElementById("refresh_" + sectionAttribute.ControlName);
      if (refresh_control != null) {
        refresh_control.addEventListener('click', function () {
          if (sectionAttribute.EndPoint != null) {
            let module_temp = sectionAttribute.EndPoint.ModuleName != null ? sectionAttribute.EndPoint.ModuleName : moduleName;
            let endpoint = getApiUrl(module_temp) + sectionAttribute.EndPoint.EndpointAddress;
            let dependentControl = document.getElementById(sectionAttribute.ControlName) as HTMLSelectElement;

            populateDropdown(currentSection, dependentControl, null, endpoint, true, sectionAttribute.EndPoint, utilityService_temp, selectedValue, null, currentModel);

          }
        });
      }
    }


    let non_sequentialEvents = sectionAttribute.Events.filter(t => t.IsSequential == null
      || (t.IsSequential != null && !t.IsSequential));


    non_sequentialEvents.forEach(
      event => {
        let contextualItemsWithClass = (parentControl != null) ? parentControl.getElementsByClassName(sectionAttribute.ControlName) : null;

        let contextualControl = ((parentControl != null && contextualItemsWithClass.length > 0) ?
          contextualItemsWithClass[0] : document.getElementById(sectionAttribute.ControlName)) as HTMLElement;

        switch (event.EventName) {
          case "onclick": {  //method call click times
            event.Behaviour = event.Behaviour == null ? 'Normal' : event.Behaviour;
            if (contextualControl != null) {
              //Check the behavior (//--> Normal, TableAddNewRow, )
              switch (event.Behaviour) {
                //conddition check event behaviour  NORMAL
                case "Normal":
                  {
                    contextualControl.addEventListener('click', function () {
                      if (sectionAttribute.RouteEntry != null) {
                        utilityService_temp.navigateAddEdit(sectionAttribute.RouteEntry, 2);
                      }
                      else if (event.RouteEntry != null) {
                        //CASE : If its a Navigation from Add-Edit to Index
                        if (event.ParentControlId != null) {
                          let lastUrl = sessionStorage.getItem('lastUrl');
                          let newUrl = lastUrl + event.RouteEntry;
                          utilityService_temp.navigateIndex(newUrl);
                        }
                      }
                    });
                    break;
                  }

                case "TableAddNewRow":
                  contextualControl.addEventListener('click', function () {
                    if (document.activeElement.id != contextualControl.id)
                      return;

                    /*-------------ADD a NEW ROW TO THE MODEL--------------------------*/
                    let affectedTableControl = document.getElementById(event.affectedControlName) as HTMLTableElement;
                    let sectionTemp: any;
                    sectionTemp = null;

                    if (affectedTableControl.tHead.getElementsByTagName('div').length > 0) {
                      let sectionDetails = affectedTableControl.tHead.getElementsByTagName('div')[0].innerText;
                      sectionTemp = JSON.parse(sectionDetails) as Section;
                    }
                    let path = window.location.pathname;
                    let splittedValues = path.split('/');
                    let splittedName = splittedValues[2].toLowerCase();

                    //This method create Url For get GenerateTable Data
                    let url = getUrlForGenerateTable(splittedName, event, utilityService_temp);
                    // let url = "http://localhost:8080/templates/iotplus/sampleinitializationtables/addEdit"; 
                    switch (splittedName) {
                      /* populate instrumentcalibrationsets addEdit Table data*/
                      case "instrumentcalibrationsets":
                        $(affectedTableControl).html('');
                        let response = utilityService_temp.getDataFormService(url);
                        response.subscribe(
                          data => {
                            if (data != null) {
                              utilityService_temp.section = data;
                              sessionStorage.setItem('dynamicSection_' + data.SectionName, JSON.stringify(data));
                              let controlName_temp = (event.EndPoint.RelatedParams != null && event.EndPoint.RelatedParams.length > 0) ?
                                event.EndPoint.RelatedParams[0].ControlName : null;
                              var controlValue = controlName_temp != null ? document.getElementById(controlName_temp) as HTMLInputElement : null;
                              var control_value_in_int = controlValue != null ? parseInt(controlValue.value) : 0;
                              data.Columns = [];
                              /*Storing the Section as JSON inside 'TableTemplateSection' within the TABLE 
                              TableTemplate section which is hidden, will store the Entire Section in JSON Format*/
                              let columnHeader_section = {
                                HeaderName: 'Section',
                                CssClassName: 'theadHide'

                              };

                              data.Columns.push(columnHeader_section);
                              data.SectionAttributes.forEach(sa => {
                                let classTemp = (sa.IsHidden != null && sa.IsHidden == true) ? 'theadHide' : 'theadShow';
                                let columnHeader = {
                                  HeaderName: sa.LabelName != undefined ? sa.LabelName : "",
                                  CssClassName: classTemp
                                };
                                data.Columns.push(columnHeader);
                              });


                              //******************** PRINTIMG THE HEADERS  *************************/
                              let thead_temp = $('<thead></thead>');
                              let tr_temp = $('<tr></tr>');
                              data.Columns.forEach(column => {
                                let th_temp = $('<th class="' + column.CssClassName + '">' + column.HeaderName + '</th>');
                                $(tr_temp).append(th_temp);
                                $(thead_temp).append(tr_temp);

                              });
                              $(affectedTableControl).append(thead_temp);
                              let tbody_temp3 = $(affectedTableControl).find('tbody');
                              /*-----------------ROW GENRATEION -----------------*/
                              for (let i = 0; i < control_value_in_int; i++) {
                                let tbody_temp4 = tbody_temp3[0] as HTMLTableSectionElement;
                               generateRowForGivenTable(tbody_temp4, utilityService_temp.section, null, utilityService_temp, currentModel, null, i);
                              }

                              /*------------GENERATE AVG & RSD GENARTION ---------------*/
                              let totalRows = affectedTableControl.rows.length;
                              let totalColumns = affectedTableControl.rows[1].cells.length - 1;

                              var row = affectedTableControl.insertRow(totalRows);
                              /*------------------Adding the word Avg --------------------*/
                              let td_temp = row.insertCell();
                              td_temp.id = 'td_Avg_' + '_0';
                              td_temp.innerText = 'Avg';

                              /*-------------------loop the number of columns -------------------------*/
                              for (let i = 1; i < totalColumns; i++) {
                                let id = 'td_Avg_' + i.toString();
                                let td_temp = row.insertCell();
                                td_temp.id = id;

                              }

                              var row1 = affectedTableControl.insertRow(totalRows + 1);
                              /*--------------Adding the word RSD -----------------------*/
                              let td_temp1 = row1.insertCell();
                              td_temp1.id = 'td_Rsd_' + '_0';
                              td_temp1.innerText = 'Rsd';
                              /*-----------------loop the number of columns---------------------*/
                              for (let i = 1; i < totalColumns; i++) {
                                let id = 'td_Rsd_' + i.toString();
                                let td_temp = row1.insertCell();
                                td_temp.id = id;
                              }


                              /*--------------------create hidden Field-----------------------*/
                              let temp_hidden_manually_set = document.getElementById(AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID) as HTMLInputElement;
                              if (temp_hidden_manually_set == null) {
                                let temp_hidden_manually_set_control = document.createElement('input') as HTMLInputElement;
                                temp_hidden_manually_set_control.type = 'hidden';
                                temp_hidden_manually_set_control.id = AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID;
                                $(contextualControl).append(temp_hidden_manually_set_control);

                              }

                              let temp_hidden_last_td_id = document.getElementById(AppConstants.GENERAL.HIDDEN_LAST_TD_ID) as HTMLInputElement;
                              if (temp_hidden_last_td_id == null) {
                                let temp_hidden_last_td_id_control = document.createElement('input') as HTMLInputElement;
                                temp_hidden_last_td_id_control.type = 'hidden';
                                temp_hidden_last_td_id_control.id = AppConstants.GENERAL.HIDDEN_LAST_TD_ID;
                                $(contextualControl).append(temp_hidden_last_td_id_control);
                              }

                              setInputValue(AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID, 'false');
                              setInputValue(AppConstants.GENERAL.HIDDEN_LAST_TD_ID, 'td_Observed_0_1');
                            }
                          });
                        break;
                      case "sampleinitialization2":
                        $(affectedTableControl).html('');
                        let columns = [];
                        let initializations_url = getUrlForsampleinitializationTable(splittedName, event, utilityService_temp);
                        let response_sample_initializations = utilityService_temp.getDataFormService(initializations_url);
                        response_sample_initializations.subscribe(
                          data => {
                            if (data != null) {
                              let currentData = data.DataCollection;
                              for (let x in currentData) {
                                columns.push(currentData[x].ColumnName);
                              }

                              let obj = {};
                              for (let i of columns) {
                                obj[i] = true;
                              }
                              let header = Object.keys(obj);

                              //******************** PRINTIMG THE HEADERS  *************************/
                              let thead_temp = $('<thead></thead>');
                              let tr_temp = $('<tr></tr>');
                              for (let i = 0; i < header.length; i++) {
                                let th_temp = $('<th class="theadShow">' + header[i] + '</th>');
                                $(tr_temp).append(th_temp);
                                $(thead_temp).append(tr_temp);
                              }
                              $(affectedTableControl).append(thead_temp);

                              /*-----------------ROW GENRATEION -----------------*/
                              let tbody_temp = $('<tbody></tbody>');

                              for (let i = 0; i < 2; i++) {
                                let tr_temp = $('<tr></tr>');
                                for (let j = 0; j < header.length; j++) {
                                  let td_temp = $('<td id=sample_' + i + "_" + j + '><input type="text" value="" ></td>');
                                  $(tr_temp).append(td_temp);
                                }
                                $(tbody_temp).append(tr_temp);
                                // generateRowForGivenSampleInitialization2Table(affectedTableControl, currentData, null, utilityService_temp, currentModel, null, i);
                              }
                              $(affectedTableControl).append(tbody_temp);

                              var rows = $('#sampleInitialization2Table tbody tr');
                              for (var i = 0; i < rows.length; ++i) {
                                for (var j = 0; j < rows[i]['cells'].length; j++) {
                                  console.log("row" + i, "coll" + j);
                                  for (let x in currentData) {
                                    if (currentData[x].Row == i && currentData[x].Column == j) {
                                      let currentId = "sample_" + i + "_" + j;
                                      let currentCell = document.getElementById(currentId) as HTMLTableCellElement;
                                      let currentElement = currentCell.children[0] as HTMLInputElement;
                                      currentElement.value = currentId;

                                      //  currentCell.setAttribute('ColumnPattern',);
                                    }
                                  }
                                }
                              }
                            }
                          });


                        break;
                      case "samplemethodstagereadings":
                        let tbody_temp3 = $(affectedTableControl).find('tbody');
                        let tbody_temp5 = tbody_temp3[0] as HTMLTableSectionElement;
                        generateRowForGivenTable(tbody_temp5, sectionTemp, null, utilityService_temp, currentModel, null);
                        break;
                      case "balancerecords":
                        $(affectedTableControl).html('');
                        let balanceRecordUrl = environment.templateUrl + "/iotplus/samplebalancerecords/addEdit";
                        let balanceRecordResponse = utilityService_temp.getDataFormService(balanceRecordUrl);
                        balanceRecordResponse.subscribe(
                          data => {
                            if (data != null) {
                              sessionStorage.setItem('dynamicSection_' + data["Sections"][0].SectionName, JSON.stringify(data["Sections"][0]));
                              /*------------------populate Header ---------------------*/
                              data["Sections"][0].Columns = [];
                              /*Storing the Section as JSON inside 'TableTemplateSection' within the TABLE 
                              //TableTemplate section which is hidden, will store the Entire Section in JSON Format */
                              let columnHeader_section = {
                                HeaderName: 'Section',
                                CssClassName: 'theadHide'
                              };
                              data["Sections"][0].Columns.push(columnHeader_section);
                              data["Sections"][0].SectionAttributes.forEach(sa => {
                                let classTemp = (sa.IsHidden != null && sa.IsHidden == true) ? 'theadHide' : 'theadShow';
                                let columnHeader = {
                                  HeaderName: sa.LabelName != undefined ? sa.LabelName : "",
                                  CssClassName: classTemp
                                };
                                if (sa.IsHidden != null && sa.IsHidden == false && !data["Sections"][0].Columns.includes(columnHeader)) {
                                  data["Sections"][0].Columns.push(columnHeader);
                                }
                              });

                              //******************** PRINTIMG THE HEADERS  **********************/
                              let thead_temp = $('<thead></thead>');
                              let tr_temp = $('<tr></tr>');
                              let th_temp1 = $('<th>Delete</th>');
                              if (data["Sections"][0].Columns != null) {
                                data["Sections"][0].Columns.forEach(column => {
                                  let th_temp = $('<th class="' + column.CssClassName + '">' + column.HeaderName + '</th>');
                                  $(tr_temp).append(th_temp);
                                  $(tr_temp).append(th_temp1);
                                  $(thead_temp).append(tr_temp);
                                });
                              }
                              $(affectedTableControl).append(thead_temp);
                        
                              utilityService_temp.balanceRecordSection = data["Sections"][0];
                              sessionStorage.setItem('dynamicSection_' + data.SectionName, JSON.stringify(data["Sections"][0]));
                              let tblRowCount = 0;
                              let tbody_temp01 = $(affectedTableControl).find('tbody');
                              let tbody_temp1 = tbody_temp01[0] as HTMLTableSectionElement;
                              generateRowForGivenTable(tbody_temp1, utilityService_temp.balanceRecordSection, null, utilityService_temp, currentModel, null, tblRowCount);
                              /*----------------------create hidden Field------------------------*/
                              let temp_hidden_manually_set = document.getElementById(AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID) as HTMLInputElement;
                              if (temp_hidden_manually_set == null) {
                                let temp_hidden_manually_set_control = document.createElement('input') as HTMLInputElement;
                                temp_hidden_manually_set_control.type = 'hidden';
                                temp_hidden_manually_set_control.id = AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID;
                                $(contextualControl).append(temp_hidden_manually_set_control);

                              }


                              let temp_hidden_last_td_id = document.getElementById(AppConstants.GENERAL.HIDDEN_LAST_TD_ID) as HTMLInputElement;
                              if (temp_hidden_last_td_id == null) {
                                let temp_hidden_last_td_id_control = document.createElement('input') as HTMLInputElement;
                                temp_hidden_last_td_id_control.type = 'hidden';
                                temp_hidden_last_td_id_control.id = AppConstants.GENERAL.HIDDEN_LAST_TD_ID;
                                $(contextualControl).append(temp_hidden_last_td_id_control);
                              }

                              setInputValue(AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID, 'false');
                              setInputValue(AppConstants.GENERAL.HIDDEN_LAST_TD_ID, "WeightValue_0");
                            }
                          });

                        break;

                      default:
                        let tbody_temp1 = $(affectedTableControl).find('tbody');
                          let tbody_temp4 = tbody_temp1[0] as HTMLTableSectionElement;
                        let row = generateRowForGivenTable(tbody_temp4, sectionTemp, null, utilityService_temp, currentModel, null);
                        break;
                    }
                  });
                  break;

                case "PopulateIsRunningNumber":
                  contextualControl.addEventListener('click', function () {
                    populateRunningNumberData(false, null);
                  });
                  break;
                case "RepeatTableData":
                  contextualControl.addEventListener('click', function () {
                    populateRepeatData(null);
                  });
                  break;
                // case "inputData":
                //   contextualControl.addEventListener('click', function () {
                //     let inputControl = document.getElementById(event.affectedControlName) as HTMLInputElement;
                //     if (inputControl != null) {

                //       populateInputDataSampleMethodStageTable(inputControl.value,utilityService_temp);
                //     }
                //   });
                //   break;
                case "DuplicateTableData":
                  contextualControl.addEventListener('click', function () {

                    let currentContrl = document.getElementById("txtMultipleRowNumberToBeDuplicate") as HTMLInputElement;
                    var row: any;
                    if (parseInt(currentContrl.value) != 0) {
                      row = parseInt(currentContrl.value);
                    }
                    let repeatColumnNumbers = [];
                    var rowIds = [];
                    var count = 0;
                    $("#sampleInitialization2Table tr:gt(0)").each(function (index) {
                      let currentRow = index + 1;

                      if (row <= currentRow && currentRow % row == 0) {
                        currentRow = currentRow + count
                        rowIds.push(index);
                        //rows to affect = currentRow + 1


                        let tr = $(this)[0];
                        let UpdateId: any;
                        let iputValue: any;
                        for (let i = 0; i < tr.children.length; i++) {
                          let currentTd = tr.children[0];
                          iputValue = currentTd.children[0]['value'];
                          let inputId = currentTd.children[0].id;
                          let splitedvalue = inputId.split("_");
                          let splitfirstValue = splitedvalue[splitedvalue.length - 1]
                          let split2ndValue = parseInt(splitedvalue[splitedvalue.length - 2]) + 1;
                          let split3rdValue = splitedvalue[splitedvalue.length - 3]
                          UpdateId = split3rdValue + "_" + split2ndValue + "_" + splitfirstValue;

                        }
                        count = count + 1;

                        $("<tr>" + tr.innerHTML + "</tr>").insertAfter($('#sampleInitialization2Table > tbody tr').eq(currentRow - 1));


                        //call a function that will rename all controls by incrementing their id value 
                        //$(someCopntrol).attr('id','new id valiue')
                        incrementTableIdForDuplicate(currentRow - 1);
                      }
                      else {

                      }
                    });

                    //set Value of new Tr
                    setValueofNewTr(rowIds, utilityService_temp);
                  });
                  break;
                case "GenerateRow":
                  contextualControl.addEventListener('click', function () {
                    let methodStageColIds = [];
                    let affectedTableControl = document.getElementById("SampleMethodStages") as HTMLTableElement;
                    let headerValues_temp = [];
                    if (event.EndPoint.Headers != null) {
                      event.EndPoint.Headers.forEach(data => {
                        headerValues_temp.push({
                          Key: data.KeyName,
                          Value: data.ValueName
                        });
                      })
                    }

                    let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : moduleName;
                    /* populate dependency  dropdown by replace keyid and valuename*/
                    let url = getApiUrl(module_temp) + event.EndPoint.EndpointAddress;
                    //************************* Check AdditionalParams Array data generate URL ************************/
                    if (event.EndPoint.AdditionalParams != null && event.EndPoint.AdditionalParams.length > 0) {
                      for (let i = 0; i < event.EndPoint.AdditionalParams.length; i++) {

                        /*EVALUATE THE VALUEKEY FROM THE RELATED CONTROL*/
                        if (event.EndPoint.AdditionalParams[i].KeyName != null && url.includes(event.EndPoint.AdditionalParams[i].KeyName)) {
                          if (event.EndPoint.AdditionalParams[i].ControlType == "selectMultiple") {

                            let elem = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLSelectElement;
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
                            url = url.replace(event.EndPoint.AdditionalParams[i].KeyName, str);
                          } else if (event.EndPoint.AdditionalParams[i].ControlType == "number") {
                            let control_temp = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLInputElement;
                            if (control_temp.value != "")
                              var parsingValue = parseInt(control_temp.value);
                            url = url.replace(event.EndPoint.AdditionalParams[i].KeyName, control_temp.value);
                          }
                        }
                      }

                      let response = utilityService_temp.getDataFormService(url, headerValues_temp);
                      response.subscribe(data => {
                        if (data != null) {
                          var Current_url = environment.templateUrl + "/iotplus/sampleInitializations/addEdit";
                          let responseValue = utilityService_temp.getDataFormService(Current_url);
                          responseValue.subscribe(
                            temp_data => {

                              temp_data.Sections.forEach(section => {

                                if (section.SectionTypeName == "table") {

                                  $("#SampleMethodStages tr:gt(0)").each(function (index1) {
                                    let currentTr = $(this)[0];
                                    let contextualselect = $(currentTr).find('select');
                                    let updateValue = $(contextualselect[0]).children("option:selected").val()
                                    methodStageColIds.push(updateValue);
                                  });
                                  var filterValue = [];

                                  data.DataCollection.forEach(t => {
                                    var value = methodStageColIds.includes(t.Id.toString());
                                    if (value == false) {
                                      filterValue.push(t);
                                    }
                                  });
                                  let initializationValue = JSON.stringify(filterValue);
                                  sessionStorage.setItem("Initialization", initializationValue);
                                  for (let a = 0; a < filterValue.length; a++) {
                                    currentSection = section.SubSections[1];
                                    generateSamplentiRowForGivenTable(affectedTableControl, currentSection, filterValue[a], utilityService_temp, currentModel, null, null);
                                  }

                                }

                              });
                            });
                        }
                      });
                    };
                  });
                  break;


                case "ClearLiveProjButton":
                  contextualControl.addEventListener('click', function () {
                    $("#reportTable").html('');
                  });
                  break;


                case "GenerateFromSelectedSample":
                  contextualControl.addEventListener('click', function () {
                    let methodStageColIds = [];
                    let affectedTableControl = document.getElementById("SampleMethodStages") as HTMLTableElement;
                    let headerValues_temp = [];
                    if (event.EndPoint.Headers != null) {
                      event.EndPoint.Headers.forEach(data => {
                        headerValues_temp.push({
                          Key: data.KeyName,
                          Value: data.ValueName
                        });
                      })
                    }

                    let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : moduleName;
                    /* populate dependency  dropdown by replace keyid and valuename*/
                    let url = getApiUrl(module_temp) + event.EndPoint.EndpointAddress;
                    //************************* Check AdditionalParams Array data generate URL ************************/
                    if (event.EndPoint.AdditionalParams != null && event.EndPoint.AdditionalParams.length > 0) {
                      for (let i = 0; i < event.EndPoint.AdditionalParams.length; i++) {

                        /*EVALUATE THE VALUEKEY FROM THE RELATED CONTROL*/
                        if (event.EndPoint.AdditionalParams[i].KeyName != null && url.includes(event.EndPoint.AdditionalParams[i].KeyName)) {
                          if (event.EndPoint.AdditionalParams[i].ControlType == "typoselect") {
                            let control_temp = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLInputElement;
                            let key = control_temp.getAttribute('tag');
                            if (key != "")
                              url = url.replace(event.EndPoint.AdditionalParams[i].KeyName, key);
                          } else if (event.EndPoint.AdditionalParams[i].ControlType == "number") {
                            let control_temp = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLInputElement;
                            if (control_temp.value != "")
                              var parsingValue = parseInt(control_temp.value);
                            url = url.replace(event.EndPoint.AdditionalParams[i].KeyName, control_temp.value);
                          }
                        }
                      }

                      let response = utilityService_temp.getDataFormService(url, headerValues_temp);
                      response.subscribe(data => {
                        if (data != null) {
                          var Current_url = environment.templateUrl + "/iotplus/sampleInitializations/addEdit"
                          let responseValue = utilityService_temp.getDataFormService(Current_url);
                          responseValue.subscribe(
                            temp_data => {

                              temp_data.Sections.forEach(section => {

                                if (section.SectionTypeName == "table") {

                                  $("#SampleMethodStages tr:gt(0)").each(function (index1) {
                                    let currentTr = $(this)[0];
                                    let contextualselect = $(currentTr).find('select');
                                    let updateValue = $(contextualselect[0]).children("option:selected").val()
                                    methodStageColIds.push(updateValue);
                                  });
                                  var filterValue = [];

                                  data.DataCollection.forEach(t => {
                                    var value = methodStageColIds.includes(t.Id.toString());
                                    if (value == false) {
                                      filterValue.push(t);
                                    }
                                  });
                                  let initializationValue = JSON.stringify(filterValue);
                                  sessionStorage.setItem("Initialization", initializationValue);
                                  for (let a = 0; a < filterValue.length; a++) {
                                    currentSection = section.SubSections[1];
                                    generateSamplentiRowForGivenTable(affectedTableControl, currentSection, filterValue[a], utilityService_temp, currentModel, null, null);
                                  }

                                }

                              });
                            });
                        }
                      });
                    };
                  });
                  break;
                /*---------------------------- Set Socket For Connect And Dis-Connect----------------------*/
                case "ConnectTable":

                  contextualControl.addEventListener('click', function () {

                    sessionStorage.setItem('baseUrl', environment.iotPlusBaseUrl);
                    let path = window.location.pathname;
                    let splittedValues = path.split('/');
                    let splittedName = splittedValues[2].toLowerCase();
                    if (splittedName == "liveprojectreport") {

                      var btn = document.getElementById(sectionAttribute.ControlName) as HTMLButtonElement;
                      if (btn.value == "Connect") {
                        let selectControl = document.getElementById(event.affectedControlName) as HTMLSelectElement;
                        if (selectControl != null) {
                          var selectValue = selectControl.options[selectControl.selectedIndex].value;
                          let module_temp = event.EndPoint.ModuleName != null ? sectionAttribute.EndPoint.ModuleName : moduleName;
                          let url = utilityService_temp.getApiUrl(module_temp) + event.EndPoint.EndpointAddress.replace('{keyId}', selectValue);
                          /*----------------call a JS Funciton to Connect the Web Socket-------------------------*/
                          localStorage.setItem("iotDeviceId", selectValue);
                          liveReportSocket(url);
                        }
                      }
                      else {
                       if (disconnectLiveWebSocket != null) {
				                        disconnectLiveWebSocket();
                        
                          }
                        
                      }

                    } else {
                      var btn = document.getElementById(sectionAttribute.ControlName) as HTMLButtonElement;
                      if (btn.innerHTML == "Connect") {
                        let selectControl = document.getElementById(event.affectedControlName) as HTMLSelectElement;
                        if (selectControl != null) {
                          var selectValue = selectControl.options[selectControl.selectedIndex].value;
                          let module_temp = event.EndPoint.ModuleName != null ? sectionAttribute.EndPoint.ModuleName : moduleName;
                          event.EndPoint.EndpointAddress.replace('{keyId}', selectValue)
                          let url = utilityService_temp.getApiUrl(module_temp) + event.EndPoint.EndpointAddress.replace('{keyId}', selectValue);
                          /*----------------call a JS Funciton to Connect the Web Socket-------------------------*/
                          sendtoSocket(url);
                          //doDirectSerialConnection();
                        }
                      }
                      else {
                        /*----------------call a JS Funciton to Disconnect the Web Socket-------------------------*/
                        if (disconnectWebSocket != null) {
                          disconnectWebSocket();
                          //disconnectDirectSerial();
                        }
                      }
                    }

                  });

                  break;
                case "Connect2Table":
                  contextualControl.addEventListener('click', function () {
                    sessionStorage.setItem('baseUrl', environment.iotPlusBaseUrl);
                    var btn = document.getElementById(sectionAttribute.ControlName) as HTMLButtonElement;
                    if (btn.innerText == "Connect2") {

                      let selectControl = document.getElementById(event.affectedControlName) as HTMLSelectElement;
                      if (selectControl != null) {
                        var selectValue = selectControl.options[selectControl.selectedIndex].value;
                        let module_temp = event.EndPoint.ModuleName != null ? sectionAttribute.EndPoint.ModuleName : moduleName;
                        let url = event.EndPoint.EndpointAddress.replace('{keyId}', selectValue);
                        url = getApiUrl(module_temp) + url;

                        let response = utilityService_temp.getDataFormService(url, null);
                        response.subscribe(
                          data => {
                            sessionStorage.setItem("connectToData", data.DataCollection[0].ComParameterDeviceInJson);
                            doDirectSerialConnection();
                          });
                      }




                    }
                    else {
                      /*----------------call a JS Funciton to Disconnect the Web Socket-------------------------*/
                      //   if (disconnectWebSocket != null) {
                      // disconnectWebSocket();
                      disconnectDirectSerial();
                      // }
                    }

                  });
                  break;

                case "PullFromPreviousStageTableData":
                  contextualControl.addEventListener('click', function () {


                    $("#sampleInitialization2Table").html('');
                    $("#sampleInitialization2Table tbody").remove();
                    let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : moduleName;
                    // /* populate dependency  dropdown by replace keyid and valuename*/
                    let url = getApiUrl(module_temp) + event.EndPoint.EndpointAddress;
                    if (event.EndPoint.AdditionalParams != null && event.EndPoint.AdditionalParams.length > 0) {

                      for (let i = 0; i < event.EndPoint.AdditionalParams.length; i++) {

                        /*EVALUATE THE VALUEKEY FROM THE RELATED CONTROL*/
                        if (event.EndPoint.AdditionalParams[i].KeyName != null && url.includes(event.EndPoint.AdditionalParams[i].KeyName)) {


                          if (event.EndPoint.AdditionalParams[i].ControlType == "hidden") {
                            let control_temp = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLInputElement;
                            url = url.replace(event.EndPoint.AdditionalParams[i].KeyName, control_temp.value);
                          }
                          else if (event.EndPoint.AdditionalParams[i].ControlType == "select") {
                            let control_temp = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLSelectElement;
                            let control_value = control_temp.options[control_temp.options.selectedIndex].value;
                            url = url.replace(event.EndPoint.AdditionalParams[i].KeyName, control_value);
                          }
                        }
                      }
                    };


                    let balanceRecordResponse = utilityService_temp.getDataFormService(url);
                    balanceRecordResponse.subscribe(
                      data => {
                        if (data != null) {

                          function getUniqueListBy(arr, key) {
                            return [...new Map(arr.map(item => [item[key], item])).values()]
                          }
                          let totalRecords: Number;
                          const dataForpullPreviousColumn = getUniqueListBy(data, AppConstants.COMMON.COMMON_COLUMN_NAME);

                          dataForpullPreviousColumn.sort(function (a, b) {
                            return a[AppConstants.COMMON.COMMON_COLUMN] - b[AppConstants.COMMON.COMMON_COLUMN];
                          });

                          let sampleInitialization2Ctrl = document.getElementById("sampleInitialization2Table") as HTMLTableElement;

                          let sampleStageData = JSON.parse(localStorage.getItem('sampleInitialization2'));

                          let thead_temp = $('<thead></thead>');
                          let tr_temp = $('<tr></tr>');
                          let th_temp0 = $('<th style="font-size:20px;" class="theadShow">&#8593;</th>');
                          let th_temp1 = $('<th style="font-size:20px;" class="theadShow">&#8595;</th>');
                          let th_temp3 = $('<th class="theadShow">RN</th>');
                          let th_temp4 = $('<th class="theadShow">RP</th>');
                          let th_temp2 = $('<th class="theadShow">Delete</th>');
                          sampleStageData.forEach(SD => {
                            totalRecords = SD.NoOfRows;
                            let th_temp = $('<th class="theadShow">' + SD.MethodStageGridColumnForPopulation.ColumnName + '</th>');
                            $(th_temp).attr(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID, SD.Id);
                            $(th_temp).attr(AppConstants.COMMON.COMMON_ROWVERSION, SD.RowVersion);
                            $(th_temp).attr(AppConstants.COMMON.COMMON_TOTAL_RECORDS, totalRecords.toString());
                            $(th_temp).attr(AppConstants.COMMON.COMMON_STAGE_ID, SD.StageId);
                            $(th_temp).attr(AppConstants.COMMON.COMMON_METHOD_ID, SD.MethodId);
                            $(th_temp).attr(AppConstants.COMMON.COMMON_METHOD_STAGE_GRID_COLUMN_ID, SD.MethodStageGridColumnForPopulation.Id);
                            $(th_temp).attr(AppConstants.COMMON.COMMON_IS_REPEAT, SD.MethodStageGridColumnForPopulation.IsRepeat);
                            $(th_temp).attr(AppConstants.COMMON.COMMON_MAINTAIN_REPEAT, SD.MethodStageGridColumnForPopulation.MaintainRepeat);
                            $(th_temp).attr(AppConstants.COMMON.COMMON_IS_INPUT, SD.MethodStageGridColumnForPopulation.IsInput);
                            $(th_temp).attr(AppConstants.COMMON.COMMON_IS_RUNNING_NUMBER, SD.MethodStageGridColumnForPopulation.IsRunningNumber);
                            $(th_temp).attr(AppConstants.COMMON.COMMON_IS_TEXT, SD.MethodStageGridColumnForPopulation.IsText);
                            $(tr_temp).append(th_temp);
                            $(tr_temp).append(th_temp0);
                            $(tr_temp).append(th_temp1);
                            $(tr_temp).append(th_temp3);
                            $(tr_temp).append(th_temp4);
                            $(tr_temp).append(th_temp2);
                            $(thead_temp).append(tr_temp);
                          });

                          let tbody_temp = $('<tbody></tbody>');
                          $(sampleInitialization2Ctrl).append(thead_temp);
                          $(sampleInitialization2Ctrl).append(tbody_temp);
                          $(sampleInitialization2Ctrl).append(tbody_temp);

                          let no_Of_Rows = data.length;
                          let no_Of_Columns = data[data.length - 1].Column + 1;
                          let totalRows = no_Of_Rows / no_Of_Columns;

                          /*-----------------ROW GENRATEION -----------------*/
                          for (let i = 0; i < totalRows; i++) {
                            let tbody_temp1 = tbody_temp[0] as HTMLTableElement;
                            utilityService_temp.generateRowForGivenSampleInitialization2TablePrevious(tbody_temp1, dataForpullPreviousColumn, utilityService_temp, i);
                          }
                          if (data != null)
                            utilityService_temp.generateDataForGivenSampleInitialization2ForPreviousTable(data);

                        }

                        var rowCount = $("#sampleInitialization2Table > tbody").children().length;
                        let inputCtrl = document.getElementById("txtNoOfRows") as HTMLInputElement;
                        if (rowCount > 0) {
                          inputCtrl.value = rowCount.toString();
                        }
                      });

                  });
                  break;
                case "PullFromPreviousMethodTableData":
                  contextualControl.addEventListener('click', function () {

                    alert("data");
                    $("#sampleInitialization2Table").html('');
                    $("#sampleInitialization2Table tbody").remove();
                    let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : moduleName;
                    // /* populate dependency  dropdown by replace keyid and valuename*/
                    let url = getApiUrl(module_temp) + event.EndPoint.EndpointAddress;
                    if (event.EndPoint.AdditionalParams != null && event.EndPoint.AdditionalParams.length > 0) {

                      for (let i = 0; i < event.EndPoint.AdditionalParams.length; i++) {

                        /*EVALUATE THE VALUEKEY FROM THE RELATED CONTROL*/
                        if (event.EndPoint.AdditionalParams[i].KeyName != null && url.includes(event.EndPoint.AdditionalParams[i].KeyName)) {

                          if (event.EndPoint.AdditionalParams[i].ControlType == "select") {
                            let control_temp = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLSelectElement;
                            let control_value = control_temp.options[control_temp.options.selectedIndex].value;
                            url = url.replace(event.EndPoint.AdditionalParams[i].KeyName, control_value);
                          }
                        }
                      }
                    };


                    // let balanceRecordUrl = environment.templateUrl + "/iotplus/sampleinitializationtables/addEdit";
                    let balanceRecordResponse = utilityService_temp.getDataFormService(url);
                    balanceRecordResponse.subscribe(
                      data => {
                        if (data != null) {

                          function getUniqueListBy(arr, key) {
                            return [...new Map(arr.map(item => [item[key], item])).values()]
                          }
                          let totalRecords: Number;
                          const dataForpullPreviousColumn = getUniqueListBy(data, AppConstants.COMMON.COMMON_COLUMN_NAME);

                          dataForpullPreviousColumn.sort(function (a, b) {
                            return a[AppConstants.COMMON.COMMON_COLUMN] - b[AppConstants.COMMON.COMMON_COLUMN];
                          });

                          let sampleInitialization2Ctrl = document.getElementById("sampleInitialization2Table") as HTMLTableElement;

                          let sampleStageData = JSON.parse(localStorage.getItem('sampleInitialization2'));

                          let thead_temp = $('<thead></thead>');
                          let tr_temp = $('<tr></tr>');
                          let th_temp0 = $('<th style="font-size:20px;" class="theadShow">&#8593;</th>');
                          let th_temp1 = $('<th style="font-size:20px;" class="theadShow">&#8595;</th>');
                          let th_temp3 = $('<th class="theadShow">RN</th>');
                          let th_temp4 = $('<th class="theadShow">RP</th>');
                          let th_temp2 = $('<th class="theadShow">Delete</th>');
                          sampleStageData.forEach(SD => {
                            totalRecords = SD.NoOfRows;
                            let th_temp = $('<th class="theadShow">' + SD.MethodStageGridColumnForPopulation.ColumnName + '</th>');
                            $(th_temp).attr(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID, SD.Id);
                            $(th_temp).attr(AppConstants.COMMON.COMMON_ROWVERSION, SD.RowVersion);
                            $(th_temp).attr(AppConstants.COMMON.COMMON_TOTAL_RECORDS, totalRecords.toString());
                            $(th_temp).attr(AppConstants.COMMON.COMMON_STAGE_ID, SD.StageId);
                            $(th_temp).attr(AppConstants.COMMON.COMMON_METHOD_ID, SD.MethodId);
                            $(th_temp).attr(AppConstants.COMMON.COMMON_METHOD_STAGE_GRID_COLUMN_ID, SD.MethodStageGridColumnForPopulation.Id);
                            $(th_temp).attr(AppConstants.COMMON.COMMON_IS_REPEAT, SD.MethodStageGridColumnForPopulation.IsRepeat);
                            $(th_temp).attr(AppConstants.COMMON.COMMON_MAINTAIN_REPEAT, SD.MethodStageGridColumnForPopulation.MaintainRepeat);
                            $(th_temp).attr(AppConstants.COMMON.COMMON_IS_INPUT, SD.MethodStageGridColumnForPopulation.IsInput);
                            $(th_temp).attr(AppConstants.COMMON.COMMON_IS_RUNNING_NUMBER, SD.MethodStageGridColumnForPopulation.IsRunningNumber);
                            $(th_temp).attr(AppConstants.COMMON.COMMON_IS_TEXT, SD.MethodStageGridColumnForPopulation.IsText);
                            $(tr_temp).append(th_temp);
                            $(tr_temp).append(th_temp0);
                            $(tr_temp).append(th_temp1);
                            $(tr_temp).append(th_temp3);
                            $(tr_temp).append(th_temp4);
                            $(tr_temp).append(th_temp2);
                            $(thead_temp).append(tr_temp);
                          });

                          // $(tr_temp).append(th_temp2);
                          // $(thead_temp).append(tr_temp);
                          let tbody_temp = $('<tbody></tbody>');
                          $(sampleInitialization2Ctrl).append(thead_temp);
                          $(sampleInitialization2Ctrl).append(tbody_temp);
                          $(sampleInitialization2Ctrl).append(tbody_temp);

                          /*-----------------ROW GENRATEION -----------------*/
                          for (let i = 0; i < totalRecords; i++) {
                            let tbody_temp1 = tbody_temp[0] as HTMLTableElement;
                            utilityService_temp.generateRowForGivenSampleInitialization2TablePrevious(tbody_temp1, dataForpullPreviousColumn, utilityService_temp, i);
                          }
                          if (data != null)
                            utilityService_temp.generateDataForGivenSampleInitialization2ForPreviousTable(data);

                        }
                      });
                    //json
                    //   let arr = filter["DataCollection"];


                  });
                  break;
                case "PullDataFormGrid":
                  contextualControl.addEventListener('click', function () {
                    pageInfo2 = { currentPage: 1, pageSize: 10, totalrecords: 0 };
                    utilityService_temp.PullDataFormGridMethodStageReading2(event, pageInfo2.currentPage, pageInfo2.pageSize, utilityService_temp)

                  });
                  break;
                //populate New Row in add button click time for balance record page
                case "TableAddBalanceRecordRow":
                  contextualControl.addEventListener('click', function () {
                    let balanceRecordUrl = environment.templateUrl + "/iotplus/samplebalancerecords/addEdit";
                    let balanceRecordResponse = utilityService_temp.getDataFormService(balanceRecordUrl);
                    balanceRecordResponse.subscribe(
                      data => {
                        if (data != null) {

                          let affectedTableControl = document.getElementById(event.affectedControlName) as HTMLTableElement;
                          let tbody_temp3 = $(affectedTableControl).find('tbody');
                          let tbody_temp4 = tbody_temp3[0] as HTMLTableSectionElement;
                          let tblControl = document.getElementById("BalanceRecordDetailWeighs") as HTMLTableElement;
                          let totalRows = tblControl.rows.length - 1;
                          let tblRowCount = totalRows;
                          generateRowForGivenTable(tbody_temp4, data["Sections"][0], null, utilityService_temp, currentModel, null, tblRowCount);
                        }
                        //create hidden Field
                        let temp_hidden_manually_set = document.getElementById(AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID) as HTMLInputElement;
                        if (temp_hidden_manually_set == null) {
                          let temp_hidden_manually_set_control = document.createElement('input') as HTMLInputElement;
                          temp_hidden_manually_set_control.type = 'hidden';
                          temp_hidden_manually_set_control.id = AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID;
                          $(contextualControl).append(temp_hidden_manually_set_control);

                        }


                        let temp_hidden_last_td_id = document.getElementById(AppConstants.GENERAL.HIDDEN_LAST_TD_ID) as HTMLInputElement;
                        if (temp_hidden_last_td_id == null) {
                          let temp_hidden_last_td_id_control = document.createElement('input') as HTMLInputElement;
                          temp_hidden_last_td_id_control.type = 'hidden';
                          temp_hidden_last_td_id_control.id = AppConstants.GENERAL.HIDDEN_LAST_TD_ID;
                          $(contextualControl).append(temp_hidden_last_td_id_control);
                        }

                        setInputValue(AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID, 'false');
                        setInputValue(AppConstants.GENERAL.HIDDEN_LAST_TD_ID, "WeightValue_0");
                      });

                  });
                  break;
                case "PopulatePage":
                  contextualControl.addEventListener('click', function () {

                    let tempUrl = "/projectplus/assignments/0";
                    utilityService_temp.navigateAddEditDirect(tempUrl);
                  });
                  break;


                case "TimeSheetPage":
                  contextualControl.addEventListener('click', function () {

                    let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : moduleName;
                    /* populate dependency  dropdown by replace keyid and valuename*/
                    let url = getApiUrl(module_temp) + event.EndPoint.EndpointAddress;
                    //************************* Check AdditionalParams Array data generate URL ************************/
                    if (event.EndPoint.AdditionalParams != null && event.EndPoint.AdditionalParams.length > 0) {

                      for (let i = 0; i < event.EndPoint.AdditionalParams.length; i++) {

                        /*EVALUATE THE VALUEKEY FROM THE RELATED CONTROL*/
                        if (event.EndPoint.AdditionalParams[i].KeyName != null && url.includes(event.EndPoint.AdditionalParams[i].KeyName)) {
                          if (event.EndPoint.AdditionalParams[i].ControlType == "select") {
                            let control_temp = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLSelectElement;
                            let control_value = control_temp.options[control_temp.options.selectedIndex].value;
                            url = url.replace(event.EndPoint.AdditionalParams[i].KeyName, control_value);
                          } else if (event.EndPoint.AdditionalParams[i].ControlType == "date") {
                            let control_temp = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLInputElement;
                            url = url.replace(event.EndPoint.AdditionalParams[i].KeyName, control_temp.value);
                          }
                        }
                      }
                    };
                  });
                  break;
                /*--------------------For TaskBoard Page server  call */
                case "populateTaskboard":
                  contextualControl.addEventListener('click', function () {
                    utilityService_temp.taskBoardResponseData = [];
                    let path = window.location.pathname;
                    let splittedValues = path.split('/');
                    let splittedName = splittedValues[2];
                    let controlCollectionNValue = new Array<ControlCollectionNValue>();
                    /*store controller data in session for cache*/
                    currentSection.SectionAttributes.forEach(sectionAttribute => {
                      switch (sectionAttribute.ControlType) {
                        /*APPEND SELECT BOX IN ADD/EDIT TABLE  */
                        case "select":
                          let select = document.getElementById(sectionAttribute.ControlName) as HTMLSelectElement;
                          if (select != null) {
                            controlCollectionNValue.push({ "ControlId": sectionAttribute.ModelPropName, "ControlKeyValue": select.options[select.options.selectedIndex].value });
                          }
                          break;
                        case "text":
                          let text = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;
                          if (text != null) {
                            controlCollectionNValue.push({ "ControlId": sectionAttribute.ModelPropName, "ControlKeyValue": text.value });
                          }
                          break;
                      }

                    });

                    //TO Do dynamically using recursion get Id
                    let conRef = document.getElementById("populateTaskBoardDiv") as HTMLDivElement;
                    conRef.style.display = "block";

                    let header_temp = new Array<Header>();
                    /*--------------get AssignMent Statuses---------------------*/
                    let module_temp = event.EndPoint.ModuleName != null ? sectionAttribute.EndPoint.ModuleName : moduleName;
                    let assignmentStatusUrl = utilityService_temp.getApiUrl(module_temp) + "/v1/common/enums/AssignmentStatuses";
                    utilityService_temp.populateAssignmentStatus(assignmentStatusUrl, utilityService_temp);

                    //------------------------------------------Another server call for AssignMent--------------------------------------------
                    if (event.EndPoint.RequestParams != null && event.EndPoint.RequestParams.length > 0) {
                      for (let i = 0; i < event.EndPoint.RequestParams.length; i++) {
                        /*---------------------EVALUATE THE VALUE/KEY FROM THE RELATED CONTROL -------------------------------*/
                        if (event.EndPoint.RequestParams[i].KeyName != null) {
                          let control_temp = document.getElementById(event.EndPoint.RequestParams[i].ControlName) as HTMLSelectElement;

                          let control_value = control_temp.options[control_temp.options.selectedIndex].value;
                          if (control_value != null) {

                            if (event.EndPoint.Headers != null && event.EndPoint.Headers.length > 0) {
                              let existingRequestModel = event.EndPoint.Headers.filter(t => t.KeyName == 'RequestModel');
                              if (existingRequestModel != null && existingRequestModel.length > 0) {
                                let existingRequestModel_temp = JSON.parse(existingRequestModel[0].ValueName) as RequestModel;
                                existingRequestModel_temp.Filter = existingRequestModel_temp.Filter ?? new Filter1();  // ?? it check  null value
                                existingRequestModel_temp.Filter.Conditions = existingRequestModel_temp.Filter.Conditions ?? new Array<Condition>();

                                /*Remove all header conditions which existing by the given field name */
                                for (let i = 0; i < existingRequestModel_temp.Filter.Conditions.length; i++) {
                                  var condition_temp = existingRequestModel_temp.Filter.Conditions[i] as Condition;
                                  if (condition_temp != null && condition_temp.FieldValue == "{keyId}") {
                                    let currentFieldValue = condition_temp.FieldValue.replace('{keyId}', control_value);
                                    let parsingFieldValue = parseInt(currentFieldValue);
                                    existingRequestModel_temp.Filter.Conditions.push({ FieldName: condition_temp.FieldName, FieldValue: parsingFieldValue });
                                  }
                                }
                                existingRequestModel_temp.Filter.Conditions.shift();
                                header_temp.push({ KeyName: 'RequestModel', ValueName: JSON.stringify(existingRequestModel_temp) });
                              }

                            }
                            let headerValues_temp = [];
                            if (header_temp != null) {
                              header_temp.forEach(data => {
                                headerValues_temp.push({
                                  Key: data.KeyName,
                                  Value: data.ValueName
                                });
                              })
                            }
                            let module_temp = event.EndPoint.ModuleName != null ? sectionAttribute.EndPoint.ModuleName : moduleName;
                            let endpointUrl = utilityService_temp.getApiUrl(module_temp) + event.EndPoint.EndpointAddress;
                            /*------------------set cache data For TaskBoard -----------*/
                            utilityService_temp.setPageCache(endpointUrl, controlCollectionNValue, headerValues_temp, utilityService_temp.assignmentStatusHeader, splittedName);

                            utilityService_temp.populateTaskBoardData(endpointUrl, headerValues_temp, utilityService_temp)

                          }
                        }
                      }
                    }

                  });
                  break;
                case "SaveTableInLocalStorage":
                  contextualControl.addEventListener('click', function () {
                    let tblControl = document.getElementById(event.affectedControlName) as HTMLTableElement;
                    if (tblControl != null) {

                      let selectControl = document.getElementById('selectInstrument') as HTMLSelectElement;
                      if (selectControl.options != null && selectControl.options.length > 0) {
                        let instrumentValue = selectControl.options[selectControl.selectedIndex].value;
                        localStorage.setItem("Instrument_" + instrumentValue, tblControl.innerHTML);
                      }

                    }
                  });
                  break;
                case "LoadFormDraft":
                  contextualControl.addEventListener('click', function () {
                    /*------------------------get selected instrument Id Using hard code Id------------------------------*/
                    let selectControl = document.getElementById('selectInstrument') as HTMLSelectElement;
                    if (selectControl.options != null && selectControl.options.length > 0) {
                      let instrumentValue = selectControl.options[selectControl.selectedIndex].value;
                      let tblLocalStorageValue = localStorage.getItem("Instrument_" + instrumentValue);
                      if (tblLocalStorageValue != null) {
                        $('table').html(tblLocalStorageValue);

                        $('table tr td').each(function () {
                          let htmlTd = $(this)[0];
                          if (htmlTd != null) {

                            /*--------------------create hidden Field-------------------------------*/
                            let temp_hidden_manually_set = document.getElementById(AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID) as HTMLInputElement;
                            if (temp_hidden_manually_set == null) {
                              let temp_hidden_manually_set_control = document.createElement('input') as HTMLInputElement;
                              temp_hidden_manually_set_control.type = 'hidden';
                              temp_hidden_manually_set_control.id = AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID;
                              $(contextualControl).append(temp_hidden_manually_set_control);

                            }

                            let temp_hidden_last_td_id = document.getElementById(AppConstants.GENERAL.HIDDEN_LAST_TD_ID) as HTMLInputElement;
                            if (temp_hidden_last_td_id == null) {
                              let temp_hidden_last_td_id_control = document.createElement('input') as HTMLInputElement;
                              temp_hidden_last_td_id_control.type = 'hidden';
                              temp_hidden_last_td_id_control.id = AppConstants.GENERAL.HIDDEN_LAST_TD_ID;
                              $(contextualControl).append(temp_hidden_last_td_id_control);
                            }

                            setInputValue(AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID, 'false');
                            setInputValue(AppConstants.GENERAL.HIDDEN_LAST_TD_ID, 'td_Observed_0_1');

                            htmlTd.addEventListener('click', function () {
                              onClickForTd(htmlTd.id, event.affectedControlName, instrumentValue);
                            });
                          }
                        });


                      } else {
                        toastr.error('There are no record in local storage', 'Error', { timeOut: 4000 });
                      }
                    }
                  });
                  break;
                case "populateGoogleMap":
                  contextualControl.addEventListener('click', function () {
                    var modal = document.getElementById("mapModal");
                    modal.style.display = "block";
                    var span = document.getElementById("map-close");
                    span.onclick = function () {
                      modal.style.display = "none";
                    }
                  });
                  break;
                case "TableDeleteCurrentRow":
                  contextualControl.addEventListener('click', () => this.deleteCurrentTableRow(contextualControl, parentControl));
                  break;
              }

              if (event.NavigationFrom == 'Filter') {
                contextualControl.addEventListener('click', function () {
                  var modal = document.getElementById("myModal")
                  modal.style.display = "block";
                  var span = document.getElementById("close");
                  span.onclick = function () {
                    modal.style.display = "none";
                  }
                });
              }

            }
          } break;
          /*-----------------Methods call events Change times------------------------------------*/
          case 'onchange': {

            if (contextualControl != null) {

              if (contextualControl.id == 'txtBarcodeScanner') {
                this.currentId = contextualControl.id;
                contextualControl.addEventListener('keypress', function (event1) {
                  if (event1.keyCode === 13) {
                    console.log("data");
                    utilityService_temp.isBarcodeScanned = true;
                    let patternToMatch = '^\\d.+$';
                    let patternToMatch1 = '^\\d+$';
                    let result1 = contextualControl['value'].match(patternToMatch1);
                    let result = contextualControl['value'].match(patternToMatch);
                    // let validCurrentValue = contextualControl['value'].match(/[\d\.]+/);
                    if ((result != null || result1 != null) && contextualControl['value'].length < 6) {
                      populateInputDataSampleMethodStageTable(contextualControl['value'], utilityService_temp);
                    } else {
                      populateBarcodeValue(contextualControl['value'], utilityService_temp);
                    }
                    //utilityService_temp.isBarcodeScanned=true;
                    //call another async method , that will set the above variable to 'false' after 2 seconds of barcode scanning
                    //utilityService_temp.resetBarcodeflag();
                    contextualControl['value'] = '';
                  }
                });
              };
              contextualControl.addEventListener('change', function (event1) {

                let url = '';
                let header = {};

                let select = contextualControl as HTMLSelectElement;
                if (sectionAttribute.ControlType == 'selectMultiple') {
                  let selectControl = document.getElementById(sectionAttribute.ControlName) as HTMLSelectElement;
                  let requestModel = new RequestModel();
                  requestModel.Filter = new Filter1();
                  requestModel.Filter.Conditions = new Array<Condition>();
                  let fieldName = event.EndPoint != null ? //get field name like DivisionsId
                    event.EndPoint.EndpointAddress.substr(event.EndPoint.EndpointAddress.indexOf('?') + 1,
                      event.EndPoint.EndpointAddress.indexOf('=') - event.EndPoint.EndpointAddress.indexOf('?') - 1) : '';

                  let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : moduleName;
                  /*------------------------ create url ---------------------------*/
                  url = getApiUrl(module_temp) + event.EndPoint.EndpointAddress.substr(0, event.EndPoint.EndpointAddress.indexOf('?'));

                  for (var i = 0; i < selectControl.options.length; i++) {
                    if (selectControl.options[i].selected) {
                      let condition = new Condition();
                      condition.ConditionalSymbol = 1;
                      condition.FieldName = fieldName;
                      condition.FieldValue = (Number(selectControl.options[i].value) != NaN) ? parseInt(selectControl.options[i].value) : selectControl.options[i].value; // check number value                          
                      condition.OperatorSymbol = 0;
                      requestModel.Filter.Conditions.push(condition);
                    }
                  }
                  /*----------------------replace Requestmodel value in  header ---------------------------*/
                  let header_temp = new Array<Header>();
                  header_temp.push({ KeyName: 'RequestModel', ValueName: JSON.stringify(requestModel) });
                  if (event.EndPoint.Headers != null && event.EndPoint.Headers.length > 0) {
                    let existingRequestModel = event.EndPoint.Headers.filter(t => t.KeyName == 'RequestModel');
                    if (existingRequestModel != null && existingRequestModel.length > 0) {
                      let existingRequestModel_temp = JSON.parse(existingRequestModel[0].ValueName) as RequestModel;

                      existingRequestModel_temp.Filter = existingRequestModel_temp.Filter ?? new Filter1();  // ?? it check  null value
                      existingRequestModel_temp.Filter.Conditions = existingRequestModel_temp.Filter.Conditions ?? new Array<Condition>();

                      /*Remove all header conditions which existing by the given field name */
                      for (let i = 0; i < existingRequestModel_temp.Filter.Conditions.length; i++) {
                        var condition_temp = existingRequestModel_temp.Filter.Conditions[i] as Condition;
                        if (condition_temp != null && condition_temp.FieldName == fieldName) {
                          existingRequestModel_temp.Filter.Conditions.splice(i, 1);
                          i--;
                          /*remove existing header */
                        }
                      }
                      requestModel.Filter.Conditions.forEach(condition => {
                        existingRequestModel_temp.Filter.Conditions.push(condition);
                      });
                      /* push request model header*/
                      header_temp = new Array<Header>();
                      header_temp.push({ KeyName: 'RequestModel', ValueName: JSON.stringify(existingRequestModel_temp) });
                    }

                  }
                  header_temp.forEach(item => {
                    event.EndPoint.Headers.push(item);
                  });
                  /*set existing files data.*/
                } else if (sectionAttribute.ControlType == 'file' || sectionAttribute.ControlType == 'tblfile') {
                  if (event1.target['files'].length > 0) {
                    const file = event1.target['files'][0];
                    const formData = new FormData();
                    formData.append(file.name, file, file.name);
                    let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : moduleName;
                    let url_for_download = getApiUrl(module_temp) + event.EndPoint.EndpointAddress;
                    //TODO: this needs to be refactored when inside grid

                    let labelControl_Forfile = document.getElementById('label_' + sectionAttribute.ControlName);
                    if (labelControl_Forfile != null) {

                      let labelControl_Forfile_temp = labelControl_Forfile as HTMLLabelElement;
                      labelControl_Forfile_temp.textContent = file.name;
                    }
                    let id_for_main_control = event1.target['id'];
                    let main_control = document.getElementById(id_for_main_control);
                    let download_id = '';
                    let delete_id = '';
                    let label_id = '';
                    if (main_control != null) {
                      for (let i = 0; i < main_control.parentElement.childNodes.length; i++) {
                        let temp_htmlelement = main_control.parentElement.childNodes[i] as HTMLDivElement;
                        if (temp_htmlelement != null && temp_htmlelement.id.includes('download')) {
                          download_id = temp_htmlelement.id;
                        }
                        if (temp_htmlelement != null && temp_htmlelement.id.includes('delete')) {
                          delete_id = temp_htmlelement.id;
                        }
                        if (temp_htmlelement != null && temp_htmlelement.id.includes('label')) {
                          label_id = temp_htmlelement.id;
                          let labelControl_Forfile = document.getElementById(label_id);
                          labelControl_Forfile.style.display = "none";
                        }
                      }

                      processFiles(getApiUrl(module_temp) + event.EndPoint.EndpointAddress, formData,
                        utilityService_temp, event1.target['id'], event, download_id, delete_id);
                    }


                  }
                }
                else {
                  let select = contextualControl as HTMLSelectElement;

                  let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : moduleName;
                  /* populate dependency  dropdown by replace keyid and valuename */
                  url = getApiUrl(module_temp) +
                    (event.EndPoint.EndpointAddress.includes('{valueName}') ?
                      event.EndPoint.EndpointAddress.replace('{valueName}', select.options[select.options.selectedIndex].text) :
                      event.EndPoint.EndpointAddress.replace('{keyId}', select.value)

                    );

                  /************************* Check AdditionalParams Array data generate URL ************************/
                  if (event.EndPoint.AdditionalParams != null && event.EndPoint.AdditionalParams.length > 0) {

                    for (let i = 0; i < event.EndPoint.AdditionalParams.length; i++) {

                      if (event.EndPoint.AdditionalParams[i].KeyName != null && url.includes(event.EndPoint.AdditionalParams[i].KeyName)) {
                        let control_temp = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLSelectElement;

                        let control_value = control_temp.options[control_temp.options.selectedIndex].value;
                        url = url.replace(event.EndPoint.AdditionalParams[i].KeyName, control_value);
                      }
                      else if (event.EndPoint.AdditionalParams[i].ValueName != null && url.includes(event.EndPoint.AdditionalParams[i].ValueName)) {
                        let control_temp = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLSelectElement;

                        let control_value = control_temp.options[control_temp.options.selectedIndex].text;
                        url = url.replace(event.EndPoint.AdditionalParams[i].ValueName, control_value);
                      }
                    }
                  };

                  if (sectionAttribute.IncludeAdditionalInfo == true) {
                    let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : moduleName;
                    url = getApiUrl(module_temp) + event.EndPoint.EndpointAddress + '/' + parseInt(select.value)
                    utilityService_temp.getTextDataFormService(url).subscribe(response => {

                      let additionalInfo_div_reference = 'divAdditionalInfo_' + sectionAttribute.ControlName;
                      let divData = document.getElementById(additionalInfo_div_reference) as HTMLDivElement;
                      divData.innerHTML = response;
                    }, (error) => {
                      error
                    });
                  }
                }
                if (event != null) {
                  //event.forEach(data => {});
                  /*------------------------populate text data in onchange select box  -----------------------------*/
                  let section_attribute_temp = utilityService_temp.findSectionAttributesRecursively(currentSection, event.affectedControlName);
                  if (section_attribute_temp.ControlType == "text" || section_attribute_temp.ControlType == "tbltext" || section_attribute_temp.ControlType == "tblnumber"  || section_attribute_temp.ControlType == "tbltextarea" && (event.IsSequential == null || !event.IsSequential)) {

                    let headerValues_temp = [];
                    if (event.EndPoint != null && event.EndPoint.Headers != null) {
                      event.EndPoint.Headers.forEach(data => {
                        headerValues_temp.push({
                          Key: data.KeyName,
                          Value: data.ValueName
                        });
                      })
                    }


                    let dependentControl = document.getElementById(event.affectedControlName) as HTMLInputElement;
                    let response = utilityService_temp.getDataFormService(url, headerValues_temp);
                    response.subscribe(
                      data => {
                        for (let i = 0; i <= data.length; i++) {
                          dependentControl.value = data[i].Value;
                        }
                      });
                      
                      //Use th eimmediate parent, in case pof controls sittingoutside grid, the parent will  be the div that contacts or document or window
                    //for controls inside the grid the parent shud always be the TR .
                    if(section_attribute_temp.ControlType == "tbltextarea"){
                      let dependentControlTextArea = $(parentControl).find('.txtProductsDescription');
                      let textAreaEle = dependentControlTextArea[0] as HTMLElement;
                     // let dependentControl = document.getElementById(event.affectedControlName) as HTMLInputElement;
                      let response = utilityService_temp.getDataFormService(url, headerValues_temp);
                      response.subscribe(
                        data => {
                          if(data !=undefined){
                          for (let i = 0; i <= data.length; i++) {
                            textAreaEle['value'] = data[i].Value;
                           }
                         }
                        });
                      }else if(section_attribute_temp.ControlType == "tblnumber"){
                      let dependentControlTextArea = $(parentControl).find('.txtPriceApplicable');
                      let textAreaEle = dependentControlTextArea[0] as HTMLElement;
                     // let dependentControl = document.getElementById(event.affectedControlName) as HTMLInputElement;
                      let response = utilityService_temp.getDataFormService(url, headerValues_temp);
                      response.subscribe(
                        data => {
                          if(data !=undefined){
                          for (let i = 0; i <= data.length; i++) {
                            textAreaEle['value'] = data[i].Value;
                           }
                         }
                        });
                    }

                  }
                  else {
                    if (event.EndPoint != null) {
                      let endpoint = url;
                      let dependentControl = document.getElementById(event.affectedControlName) as HTMLSelectElement;
                      if (dependentControl != null && (select.value != "0")) {
                        populateDropdown(currentSection, dependentControl, event, endpoint, false, event.EndPoint, utilityService_temp,
                          selectedValue, null, currentModel);

                      }
                    }
                  }

                }
              });
            }
          } break;
          case "onblur": { // Method calls Onblur times
            if (contextualControl != null) {
              contextualControl.addEventListener('blur', function (event1) {

                // let ulElements = $(event1.target['parentElement']).find('ul');
                // let ulElement = ulElements.length > 0 ? ulElements[0] : null;
                // if (ulElement != null) {
                //   $(ulElement).hide();
                // }
                //check unique value(Login Name,Emails)
                if (sectionAttribute.ModelPropName == "LoginName") {
                  if (event.EndPoint != null) {
                    let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : moduleName;
                    let endpoint = getApiUrl(module_temp) + event.EndPoint.EndpointAddress;
                    sectionAttribute.Validators.forEach(validation => {
                      validation.AdditionalValidator.forEach(additionalValidator => {

                        let patternToMatch = /[^{\}]+(?=})/;
                        if (endpoint.match(patternToMatch)) {
                          switch (additionalValidator.ValueTakenFrom) {

                            case 'Model':
                              endpoint = endpoint.replace(additionalValidator.TagToReplace, sectionAttribute.ModelPropName);
                              break;

                            case 'Control':
                              endpoint = endpoint.replace(additionalValidator.TagToReplace, contextualControl['value']);
                              break;

                            default:
                              break;
                          }
                        }
                      });
                    });
                    let response = utilityService_temp.getDataFormService(endpoint);
                    response.subscribe(
                      data => {
                        sectionAttribute.Validators.forEach(validation => {
                          if (validation.ServiceValidationToReact == data) {
                            toastr.error(validation.ValidationMsg, 'Error', { timeOut: 4000 });
                          } else {

                          }
                        });
                      });
                  }
                  let elems_temp = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;
                  let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                  let emailData = "";
                  if (reg.test(elems_temp.value) == false) {
                    emailData = 'Please enter valid ' + sectionAttribute.LabelName;
                    toastr.error(emailData, 'Error', { timeOut: 4000 });
                  }
                }
                else {
                  switch (sectionAttribute.ControlType) {

                    case 'email':
                      let elems_temp = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;
                      let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                      let emailData = "";
                      if (reg.test(elems_temp.value) == false) {
                        emailData = 'Please enter valid ' + sectionAttribute.LabelName;
                        toastr.error(emailData, 'Error', { timeOut: 4000 });
                      }
                      break;
                    case 'default':
                      break;
                  }
                }
              })
            }
          } break;
          case "onkeyup":
            if (contextualControl != null) {
              if (event.Behaviour == "inputData") {
                contextualControl.addEventListener('keyup', function (event1) {
                  event1.preventDefault();
                  event1.stopPropagation();
                  if (event1.keyCode == 16) {
                    let search = event1.target['value'];
                    populateInputDataSampleMethodStageTable(search, utilityService_temp);

                  }

                });

              }
              let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : moduleName;
              let endpoint = getApiUrl(module_temp) + event.EndPoint.EndpointAddress;
              let headerValues = [];
              event.EndPoint.Headers.forEach(data => {
                headerValues.push({
                  Key: data.KeyName,
                  Value: data.ValueName
                });
              });
              //***** for every control that has keyup shud have on focus event to resent all variables  */
              contextualControl.addEventListener('onfocus', function (event1) {
                //reset the variable 
                utilityService_temp.setTypoConfirmationHelper(utilityService_temp, contextualControl.id, false);

              });
              //********************************************************************************************* */

              contextualControl.addEventListener('keyup', function (event1) {
                /*populate AutoComplete data using server call both select and MultiSelect  options*/
                let search = event1.target['value'];
                if (event1.keyCode == 13) {
                  // ADD THE EVENT HANDLER 
                  utilityService_temp.focusNextElement();
                  return;
                }
                if (search.length > 2) {
                  if (((sectionAttribute.ControlType == "tbltypomultiselect" || sectionAttribute.ControlType == "typomultiselect") || (sectionAttribute.ControlType == "tbltyposelect" || sectionAttribute.ControlType == "typoselect")) || (!serverVisited || (search.length < charSetForNoGivenData && serverVisited))) {
                    let ulElements = $(event1.target['parentElement']).find('ul');
                    let ulElement = ulElements.length > 0 ? ulElements[0] : null;
                    if (ulElement != null) {
                      $(ulElement).html('');
                      $(ulElement).hide();
                      /*------------------Server Call for populate AutoComplete data -------------------------*/
                      utilityService_temp.autoComplete(endpoint, headerValues, search).subscribe(response => {
                        if (response != null && response.length > 0) {
                          let count = 0;
                          let array_temp = response as Array<any>;
                          let liText = '';

                          charSetForNoGivenData = search.length;
                          serverVisited = true;
                          utilityService_temp.isHelpDataFound = true;
                          switch (sectionAttribute.ControlType) {

                            case 'tbltyposelect':
                            case 'typoselect':
                              array_temp.forEach(item => {
                                /*JavaScript  function call select times*/
                                liText += "<li class='list-group-item listautocomplete' onclick=\"setValueForControl('" + event1.target['id'] + "','" + item['Value'] + "','" + item['Key'] + "','" + event.affectedControlModelName + "',this,'" + contextualControl.id + "')\" class='liStyle'>" + item['Value'] + "</li>";
                                count++;
                              });
                              break;
                            /*JavaScript  function call Multiselect times*/
                            case 'tbltypomultiselect':
                            case 'typomultiselect':
                              array_temp.forEach(item => {
                                liText += "<li class='list-group-item listautocomplete' onclick=\"setValueForDivControl('" + event1.target['id'] + "','" + item['Value'] + "','" + item['Key'] + "','" + event.affectedControlModelName + "',this,'" + contextualControl.id + "')\" class='liStyle'>" + item['Value'] + "</li>";
                                count++;
                              });
                              break;

                          }

                          if (array_temp.length == 0) {
                            $(ulElement).hide();
                          }
                          else {
                            $(ulElement).html(liText);
                            $(ulElement).show();
                          }
                        } else {
                          utilityService_temp.isHelpDataFound = false;
                          /*-------------------if undefined then set to false-------------------------------*/
                          let value_temp_getdependent_event = utilityService_temp.getTypoConfirmationHelper(utilityService_temp, contextualControl.id);

                          if (value_temp_getdependent_event == null || !value_temp_getdependent_event) {
                            contextualControl.addEventListener('focusout', function (event1) {

                              let contextualControl_temp = contextualControl as HTMLInputElement;

                              utilityService_temp.onFocusoutDataNotFoundInServer(event, event1, utilityService_temp, moduleName, contextualControl_temp);
                            });
                            utilityService_temp.setTypoConfirmationHelper(utilityService_temp, contextualControl.id, true);

                          };

                        }
                      });
                    }
                  }
                }
                else {
                  /*----------------------------------Hide Unorder lists---------------------------------------*/
                  let ulElements = $(event1.target['parentElement']).find('ul');
                  let ulElement = ulElements.length > 0 ? ulElements[0] : null;
                  $(ulElement).hide();
                }
              });
            }

            break;

          case "onkeypress": {
            /*------------------------------Function call onkeypress event calls ----------------------------------*/
            if (contextualControl != null) {
              contextualControl.addEventListener('keypress', function (event1) {
                //********* Doing for barcode scanner  /


                var charCode = (event1.which) ? event1.which : event1.keyCode
                if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                  event1.returnValue = false;
                  return false;
                }
                return true;
              })
            }
          } break;
          default: {
          }
        }
      });

    let sequentialEvents = sectionAttribute.Events.filter(t => t.IsSequential != null && t.IsSequential);

    let contextualItemsWithClass = (parentControl != null) ? parentControl.getElementsByClassName(sectionAttribute.ControlName) : null;
    let contextualControl = ((parentControl != null && contextualItemsWithClass.length > 0) ?
      contextualItemsWithClass[0] : document.getElementById(sectionAttribute.ControlName)) as HTMLElement;

    if (contextualControl != null) {
      contextualControl.addEventListener('change', function (event1) {
        recursivelyEvaluateSequentialEvents(currentSection, sequentialEvents, 0, sectionAttribute, parentControl, null, selectedValue, currentModel, utilityService_temp);

      });
    }

  }

  recursivelyEvaluateSequentialEvents(currentSection: Section, sequentialEvents: Array<Event1>, indexPosition: number, sectionAttribute: SectionAttribute, parentControl?: HTMLElement, inputValuefromPreviousServiceCall?: any,
    selectedValue?: any, currentModel?: any, utilityService_temp?: UtilityService) {
    let url = "";
    let headerValues_temp = [];
    let currentSequentialEvent = sequentialEvents[indexPosition];

    // switch (currentSequentialEvent.EventName) {
    // case 'onchange': {

    let currentControl = (currentSequentialEvent.affectedControlName == "") ? sectionAttribute.ControlName : currentSequentialEvent.affectedControlName;
    let selectControl = document.getElementById(currentControl) as HTMLSelectElement;

    let control_value = (selectControl.value != "") ? selectControl.options[selectControl.options.selectedIndex].value : "";
    let previousValue = (inputValuefromPreviousServiceCall == null) ? control_value : inputValuefromPreviousServiceCall;

    if (previousValue != null) {

      let module_temp = currentSequentialEvent.EndPoint.ModuleName != null ? currentSequentialEvent.EndPoint.ModuleName : utilityService_temp.moduleName;
      url = utilityService_temp.getApiUrl(module_temp) + currentSequentialEvent.EndPoint.EndpointAddress
      let updateUrl = url.replace('{keyId}', previousValue);
      //Header 
      if (currentSequentialEvent.EndPoint != null && currentSequentialEvent.EndPoint.Headers != null) {
        currentSequentialEvent.EndPoint.Headers.forEach(data => {
          headerValues_temp.push({
            Key: data.KeyName,
            Value: data.ValueName
          });
        })
      }
      /*Server call */
      let response = utilityService_temp.getDataFormService(updateUrl, headerValues_temp);
      response.subscribe(data => {
        if (data != null) {
          let eventValue = data[0].Key;
          if ((sequentialEvents.length - 1) - 1 > indexPosition) {
            indexPosition = indexPosition + 1;
            utilityService_temp.recursivelyEvaluateSequentialEvents(currentSection, sequentialEvents, indexPosition, sectionAttribute, parentControl, eventValue, selectedValue, currentModel, utilityService_temp);
          } else {
            indexPosition = indexPosition + 1;
            let currentSequentialEvent = sequentialEvents[indexPosition];
            let module_temp = currentSequentialEvent.EndPoint.ModuleName != null ? currentSequentialEvent.EndPoint.ModuleName : utilityService_temp.moduleName;
            let sequentialUrl = utilityService_temp.getApiUrl(module_temp) + currentSequentialEvent.EndPoint.EndpointAddress
            sequentialUrl = sequentialUrl.replace('{keyId}', eventValue);
            utilityService_temp.populateDropdown(currentSection, selectControl, currentSequentialEvent, sequentialUrl, false, currentSequentialEvent.EndPoint, utilityService_temp,
              selectedValue, null, currentModel);

          }

        }
      });

    }


    //   });
    // }
    // }
    // }
  }

  setTypoConfirmationHelper(utilityService: UtilityService, controlName: string, getDependantEventValue: boolean) {

    let found = false;
    for (let i = 0; i < utilityService.typoConfirmationHelpers.length; i++) {
      if (utilityService.typoConfirmationHelpers[i].key == controlName) {
        utilityService.typoConfirmationHelpers[i].value = getDependantEventValue;
        found = true;
        break;
      }
    }

    if (!found) {
      utilityService.typoConfirmationHelpers.push({
        key: controlName,
        value: getDependantEventValue
      })
    }


  }
  getTypoConfirmationHelper(utilityService: UtilityService, controlName: string) {
    let existing = utilityService.typoConfirmationHelpers.filter(t => t.key == controlName);
    if (existing != null && existing.length > 0) {
      return existing[0].value;
    }
    return null;
  }
  /* this mehod use for file controllers */
  processFiles(url: any, formData: any, utilityServiceTemp: UtilityService, id: any, event: Event1, downloadId?: any, deleteId?: any) {
    let utilityService = utilityServiceTemp == null ? this : utilityServiceTemp;
    let operation = 'POST';
    let controlId = document.getElementById(id);
    if (controlId != null) {
      let tagValue = controlId.getAttribute('tag');


      let patternToMatch = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/; /*this Regex pattern check AddressGuid*/
      if (tagValue.match(patternToMatch) != null && tagValue != '00000000-0000-0000-0000-000000000000') { /* If address guid pattern  match then 'PUT' operation work neither POST operation work*/
        if (!(tagValue == null || tagValue.length < 25)) {
          url += '/' + tagValue;  // url  concat with tag value.
          operation = 'PUT'
        }
      }

    }

    let baseUrl = url;
    /* create Url
    //this function fetch post and put data for files */
    utilityService.fileDataToService(baseUrl, formData, id, operation, event, downloadId, deleteId).subscribe(data => {
    }, (error) => {
      if (error.status == 500) {
        this.toastr.error(error.message, 'Error',
          { timeOut: 2000 });
      } else if (error.status == 401) {
        this.toastr.warning('Un-authorized', 'Warning',
          { timeOut: 2000 });
      } else if (error.status == 404) {
        this.toastr.warning('No Records', 'Warning',
          { timeOut: 2000 });
      } else if (error.status == 400) {
        this.toastr.warning(error.message, 'Warning',
          { timeOut: 2000 });
      }
      throw error;
    });
  }

  focusNextElement() {
    /*--------------add all elements we want to include in our selection------------------------*/
    var focussableElements = 'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
    if (document.activeElement && document.activeElement) {
      var focussable = Array.prototype.filter.call(document.activeElement.querySelectorAll(focussableElements),
        function (element) {
          /*----------------check for visibility while always include the current activeElement ---------------------------*/
          return element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
        });
      var index = focussable.indexOf(document.activeElement);
      if (index > -1) {
        var nextElement = focussable[index + 1] || focussable[0];
        nextElement.focus();
      }
    }
  }

  onFocusoutDataNotFoundInServer(event: Event1, event1: Event, utilityService: UtilityService, moduleName: string, contextualControl: HTMLInputElement) {

    if (event.DataNotFoundEvents == null || utilityService.isHelpDataFound) return;
    event.DataNotFoundEvents.forEach(dataNotFound => {
      switch (dataNotFound.EventName) {
        case 'onfocusout':
          if (contextualControl.value.length < 3) return;

          var x = confirm("Are you sure you want to add " + dataNotFound.affectedControlModelName);
          if (x) {
            let value_temp = contextualControl.value;
            let module_temp = dataNotFound.EndPoint.ModuleName != null ? dataNotFound.EndPoint.ModuleName : moduleName;
            let endpoint = utilityService.getApiUrl(module_temp) + dataNotFound.EndPoint.EndpointAddress;
            let requestModel = {
              DataCollection: [
                {
                  AutoOffset: new Date().getTimezoneOffset(),
                  EntityState: 1,
                  RowVersion: "",
                  Id: 0
                }
              ]
            };
            contextualControl.removeEventListener('focusout', function (event2) {
              //utilityService.onFocusoutDataNotFoundInServer(event, event2, utilityService, moduleName, contextualControl);
            });
            requestModel.DataCollection[0][dataNotFound.affectedControlModelName] = value_temp;
            //************ Once we show the config box and data is pushed to server we are  */
            utilityService.postDataToService(endpoint, requestModel).subscribe(data => {
              /*-----------------populate the list with newly saved  Item--------------------------*/
              if (data != null && data.DataCollection.length > 0) {
                $(modalLoader()).hide();
                let id = data.DataCollection[0].Id;
                let value_temp2 = data.DataCollection[0][dataNotFound.affectedControlModelName];

                /*---------------Set the focus back to the control, so that user can select the entries -------------------------*/
                contextualControl.value = '';
                /*-------------------show a toaster to re-type --------------------------------*/
                utilityService.toastr.success('Data has been added', 'success', { timeOut: 4000 });
                setDivValueAfterServerCall(id, value_temp2, contextualControl);
              }
            });

          } else {
            contextualControl.value = '';
            contextualControl.focus();
            contextualControl.removeEventListener('focusout', function (event2) {

              utilityService.onFocusoutDataNotFoundInServer(event, event2, utilityService, moduleName, contextualControl);
            });
          }
      }
    });
  }
  processSectionAttributes(currentSection: Section, sectionAttribute: SectionAttribute, inputModel: any, parentControl?: HTMLElement,
    selectedValue?: any, bindEvents?: boolean, isPageLoaded?: boolean, utilityService?: UtilityService, section?: Section) {

    let utilityService_temp = utilityService == null ? this : utilityService;
    if (bindEvents != null && bindEvents) {

      utilityService_temp.bindEvents(currentSection, sectionAttribute, parentControl, selectedValue, inputModel);   //Binding the Events for given Section Attributes
    }
    /******** INITIAL DATA POPULATION FOR 'SELECT' & OTHER CONTROLS WHICH NEEDS TO GET DATA FROM API */
    if (sectionAttribute.EndPoint != null && !bindEvents && (sectionAttribute.ControlType == 'select' || sectionAttribute.ControlType == 'selectMultiple')) {
      let selectControl = document.getElementById(sectionAttribute.ControlName) as HTMLSelectElement;
      let module_temp = sectionAttribute.EndPoint.ModuleName != null ? sectionAttribute.EndPoint.ModuleName : this.moduleName;
      if (sectionAttribute.EndPoint.EndpointAddress != "" && sectionAttribute.EndPoint.EndpointAddress != undefined) {
        let url = this.getApiUrl(module_temp) + sectionAttribute.EndPoint.EndpointAddress; // create url
        if (!(url.includes('keyId1'))) {

          //get parentSectionId for Form
          if (sectionAttribute.EndPoint.ModuleName != null && sectionAttribute.EndPoint.ModuleName == "ParentSection") {


            url = utilityService_temp.getApiUrl(this.moduleName) + url
            let path = window.location.pathname;
            let splittedValues = path.split('/');
            let splittedRow = splittedValues[3];

            let patternToMatch = /forms[/0-9/]*/g;
            let result = path.match(patternToMatch);
            if (splittedRow != null && result != null) {
              let updateUrl = url.replace('{keyId}', splittedRow);
              utilityService_temp.populateDropdown(currentSection, selectControl, null, updateUrl, false, sectionAttribute.EndPoint, this, selectedValue, sectionAttribute.Events, inputModel);
            }
          } else {
            utilityService_temp.populateDropdown(currentSection, selectControl, null, url, false, sectionAttribute.EndPoint, this, selectedValue, sectionAttribute.Events, inputModel);
          }
        } else if (url.includes('keyId1')) {

          url = utilityService_temp.getApiUrl(this.moduleName) + url
          let path = window.location.pathname;
          let splittedValues = path.split('/');
          let splittedRow = splittedValues[3];

          let patternToMatch = /forms[/0-9/]*/g;
          let result = path.match(patternToMatch);
          if (splittedRow != null && result != null) {
            let updateUrl = url.replace('{keyId}', splittedRow);

            if (sectionAttribute.EndPoint.AdditionalParams != null && sectionAttribute.EndPoint.AdditionalParams.length > 0) {

              for (let i = 0; i < sectionAttribute.EndPoint.AdditionalParams.length; i++) {

                if (sectionAttribute.EndPoint.AdditionalParams[i].KeyName != null && updateUrl.includes(sectionAttribute.EndPoint.AdditionalParams[i].KeyName)) {
                  if (selectedValue != null) {
                    if (sectionAttribute != null && sectionAttribute.EndPoint != null) {
                      updateUrl = updateUrl.replace(sectionAttribute.EndPoint.AdditionalParams[i].KeyName, selectedValue);
                    }
                  }
                  else {
                    let control_temp = document.getElementById(sectionAttribute.EndPoint.AdditionalParams[i].ControlName) as HTMLSelectElement;
                    let control_value = control_temp.options[control_temp.options.selectedIndex].value;
                    updateUrl = updateUrl.replace(sectionAttribute.EndPoint.AdditionalParams[i].KeyName, control_value);
                  }
                  break;
                }

              }
            }
            utilityService_temp.populateDropdown(currentSection, selectControl, null, updateUrl, false, sectionAttribute.EndPoint, this, selectedValue, sectionAttribute.Events, inputModel);
          }
        }
      }
    }
    /*----------------------Check for events and then formthe URL for next lecl dropdown population---------------------------*/
    else if (sectionAttribute.Events != null && sectionAttribute.Events.length > 0 && !bindEvents && (selectedValue != 0 || selectedValue != "")) {
      sectionAttribute.Events.forEach(event => {
        if (event.EndPoint == null)
          return;

        let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : this.moduleName;
        if (event.EndPoint.EndpointAddress != "" && (selectedValue != 0 || selectedValue != "0")) {
          if (isPageLoaded != null && isPageLoaded) {
            if (bindEvents != null && (bindEvents || (!bindEvents && event.IsLevel3 != null && event.IsLevel3))) {
              let url = this.getApiUrl(module_temp) + event.EndPoint.EndpointAddress;
              let url_temp = url.replace('{keyId}', selectedValue);
              selectedValue = inputModel[event.affectedControlModelName];
              let selectControl = document.getElementById(event.affectedControlName) as HTMLSelectElement;
            }
          }
        }
      });
    };
  }
  setPageCache(url: string, controlCollectionNValue: Array<ControlCollectionNValue>, headerValues_temp: Array<Header>, assignmentStatusHeaderData: Array<any>, pageName: string) {
    let pageCache = new PageCache();
    pageCache.Url = url;
    pageCache.Page = pageName;
    pageCache.AssignmentStatusHeaderData = assignmentStatusHeaderData;
    pageCache.CacheHeader = headerValues_temp
    pageCache.ControlCollectionNValues = controlCollectionNValue;

    sessionStorage.setItem("cacheData", JSON.stringify(pageCache));
  }
  /*--------------------Generate Url  for  get InstrumentCalibrationsets Report Data------------------------------*/
  getUrlForGenerateTable(splittedName, event, utilityServiceTemp?: UtilityService, controlId?: string, controlValue?: any): string {

    let utilityService = utilityServiceTemp == null ? this : utilityServiceTemp;

    let isSpecialCaseForDynamicTables = (splittedName == "instrumentcalibrationsets" || splittedName == "instrumentcalibrationsetreports");
    let module_temp = isSpecialCaseForDynamicTables && event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : utilityService.moduleName;
    let url = (isSpecialCaseForDynamicTables) ? utilityService.getApiUrl(module_temp) + event.EndPoint.EndpointAddress : null;

    if (splittedName == "instrumentcalibrationsets" || splittedName == "samplemethodstagereadings" || splittedName == "instrumentcalibrationsetreports") {
      /*---------------create URL for dynamic Template ----------------------------------*/

      if (event.EndPoint.AdditionalParams != null && event.EndPoint.AdditionalParams.length > 0) {

        for (let i = 0; i < event.EndPoint.AdditionalParams.length; i++) {

          if (event.EndPoint.AdditionalParams[i].KeyName != null && url.includes(event.EndPoint.AdditionalParams[i].KeyName)) {
            if (controlId != null && controlValue != null) {
              if (event != null && event.EndPoint != null) {
                url = url.replace(event.EndPoint.AdditionalParams[i].KeyName, controlValue);
              }
            }
            else {
              let control_temp = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLSelectElement;
              let control_value = control_temp.options[control_temp.options.selectedIndex].value;
              url = url.replace(event.EndPoint.AdditionalParams[i].KeyName, control_value);
            }
            break;
          }

        }
      }
    }
    return url;
  }

  getUrlForsampleinitializationTable(splittedName, event, utilityServiceTemp?: UtilityService, controlId?: string, controlValue?: any): string {

    let utilityService = utilityServiceTemp == null ? this : utilityServiceTemp;
    let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : utilityService.moduleName;
    let url = utilityService.getApiUrl(module_temp) + event.EndPoint.EndpointAddress;

    if (event.EndPoint.AdditionalParams != null && event.EndPoint.AdditionalParams.length > 0) {
      for (let i = 0; i < event.EndPoint.AdditionalParams.length; i++) {

        if (event.EndPoint.AdditionalParams[i].KeyName != null && url.includes(event.EndPoint.AdditionalParams[i].KeyName)) {
          if (event.EndPoint.AdditionalParams[i].ControlType != null && event.EndPoint.AdditionalParams[i].ControlType == "text") {
            let control_temp = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLInputElement;
            let control_value = control_temp.value;
            url = url.replace(event.EndPoint.AdditionalParams[i].KeyName, control_value);
          }
          else if (event.EndPoint.AdditionalParams[i].ControlType != null && event.EndPoint.AdditionalParams[i].ControlType == "select") {
            let control_temp = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLSelectElement;
            let control_value = control_temp.options[control_temp.options.selectedIndex].value;
            url = url.replace(event.EndPoint.AdditionalParams[i].KeyName, control_value);
          }
        }

      }
    }
    return url;

  }


  /*---------------------Calculate Average value--------------------------------------*/
  calculateAverage(tdControlId) {

    let splitedValue = tdControlId.split('_');
    let currentRow = splitedValue[2];
    let currentCol = splitedValue[3];

    var patternToCheckNReplace = "td_Observed_{row}_" + currentCol;
    var table_element = document.getElementById(AppConstants.COMMON.COMMON_INSTRUMENT_CALIBRATION_SET_DETAILS) as HTMLTableElement;
    let totalRow = table_element.rows.length - 3;
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
    /*----------------------------------------calculate Avg-------------------------------------*/
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
  }
  /*-------------------- CalculateRSD-------------------------------*/
  calculateRSD(tdControlId) {

    let splitedValue = tdControlId.split('_');
    let currentRow = splitedValue[2];
    let currentCol = splitedValue[3];

    var patternToCheckNReplace = "td_Observed_{row}_" + currentCol;

    var table_element = document.getElementById(AppConstants.COMMON.COMMON_INSTRUMENT_CALIBRATION_SET_DETAILS) as HTMLTableElement;
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

  }
  //********************** STRING UTILITY FUNCTIONS ***************************** */
  /**
   * "Safer" String.toLowerCase()
   */
  lowerCase(str) {
    return str.toLowerCase();
  }

  /**
   * "Safer" String.toUpperCase()
   */
  upperCase(str) {
    return str.toUpperCase();
  }

  /**
   * Convert string to camelCase text.
   */
  camelCase(str) {
    str = this.replaceAccents(str);
    str = this.removeNonWord(str)
      .replace(/\-/g, " ") //convert all hyphens to spaces
      .replace(/\s[a-z]/g, this.upperCase) //convert first char of each word to UPPERCASE
      .replace(/\s+/g, "") //remove spaces
      .replace(/^[A-Z]/g, this.lowerCase); //convert first char to lowercase
    return str;
  }

  /**
   * Add space between camelCase text.
   */
  unCamelCase(str) {
    str = str.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, "$1 $2");
    str = str.toLowerCase(); //add space between camelCase text
    return str;
  }

  /**
   * UPPERCASE first char of each word.
   */
  properCase(str) {
    return this.lowerCase(str).replace(/^\w|\s\w/g, this.upperCase);
  }

  /**
   * camelCase + UPPERCASE first char
   */
  pascalCase(str) {
    return this.camelCase(str).replace(/^[a-z]/, this.upperCase);
  }

  changePascalCaseToSpace(str) {
    return str.split(/(?=[A-Z])/).join(' ')
  }

  normalizeLineBreaks(str, lineEnd) {
    lineEnd = lineEnd || "n";

    return str
      .replace(/rn/g, lineEnd) // DOS
      .replace(/r/g, lineEnd) // Mac
      .replace(/n/g, lineEnd); // Unix
  }

  /**
   * UPPERCASE first char of each sentence and lowercase other chars.
   */
  sentenceCase(str) {
    // Replace first char of each sentence (new line or after '.\s+') to
    // UPPERCASE
    return this.lowerCase(str).replace(/(^\w)|\.\s+(\w)/gm, this.upperCase);
  }

  /**
   * Convert to lower case, remove accents, remove non-word chars and
   * replace spaces with the specified delimeter.
   * Does not split camelCase text.
   */
  slugify(str, delimeter) {
    if (delimeter == null) {
      delimeter = "-";
    }

    str = this.replaceAccents(str);
    str = this.removeNonWord(str);
    str = str.trim().replace(/ +/g, delimeter) //replace spaces with delimeter
      .toLowerCase();

    return str;
  }

  /**
   * Replaces spaces with hyphens, split camelCase text, remove non-word chars, remove accents and convert to lower case.
   */
  hyphenate(str) {
    str = this.unCamelCase(str);
    return this.slugify(str, "-");
  }

  /**
   * Replaces hyphens with spaces. (only hyphens between word chars)
   */
  unhyphenate(str) {
    return str.replace(/(\w)(-)(\w)/g, "$1 $3");
  }

  /**
   * Replaces spaces with underscores, split camelCase text, remove
   * non-word chars, remove accents and convert to lower case.
   */
  underscore(str) {
    str = this.unCamelCase(str);
    return this.slugify(str, "_");
  }

  /**
   * Remove non-word chars.
   */
  removeNonWord(str) {
    return str.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, "");
  }
  replaceAccents(str) {
    // verifies if the String has accents and replace them
    if (str.search(/[\xC0-\xFF]/g) > -1) {
      str = str
        .replace(/[\xC0-\xC5]/g, "A")
        .replace(/[\xC6]/g, "AE")
        .replace(/[\xC7]/g, "C")
        .replace(/[\xC8-\xCB]/g, "E")
        .replace(/[\xCC-\xCF]/g, "I")
        .replace(/[\xD0]/g, "D")
        .replace(/[\xD1]/g, "N")
        .replace(/[\xD2-\xD6\xD8]/g, "O")
        .replace(/[\xD9-\xDC]/g, "U")
        .replace(/[\xDD]/g, "Y")
        .replace(/[\xDE]/g, "P")
        .replace(/[\xE0-\xE5]/g, "a")
        .replace(/[\xE6]/g, "ae")
        .replace(/[\xE7]/g, "c")
        .replace(/[\xE8-\xEB]/g, "e")
        .replace(/[\xEC-\xEF]/g, "i")
        .replace(/[\xF1]/g, "n")
        .replace(/[\xF2-\xF6\xF8]/g, "o")
        .replace(/[\xF9-\xFC]/g, "u")
        .replace(/[\xFE]/g, "p")
        .replace(/[\xFD\xFF]/g, "y");
    }

    return str;
  }

  /**
   * Searches for a given substring
   */
  contains(str, substring, fromIndex) {
    return str.indexOf(substring, fromIndex) !== -1;
  }

  /**
   * Truncate string at full words.
   */
  crop(str, maxChars, append) {
    return this.truncate(str, maxChars, append, true);
  }

  /**
   * Escape RegExp string chars.
   */
  escapeRegExp(str) {
    var ESCAPE_CHARS = /[\\.+*?\^$\[\](){}\/'#]/g;
    return str.replace(ESCAPE_CHARS, "\\$&");
  }

  /**
   * Escapes a string for insertion into HTML.
   */
  escapeHtml(str) {
    str = str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/'/g, "&#39;")
      .replace(/"/g, "&quot;");

    return str;
  }

  /**
   * Unescapes HTML special chars
   */
  unescapeHtml(str) {
    str = str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"');
    return str;
  }

  /**
   * Escape string into unicode sequences
   */
  escapeUnicode(str, shouldEscapePrintable) {
    return str.replace(/[\s\S]/g, function (ch) {
      // skip printable ASCII chars if we should not escape them
      if (!shouldEscapePrintable && /[\x20-\x7E]/.test(ch)) {
        return ch;
      }
      // we use "000" and slice(-4) for brevity, need to pad zeros,
      // unicode escape always have 4 chars after "\u"
      return "\\u" + ("000" + ch.charCodeAt(0).toString(16)).slice(-4);
    });
  }

  /**
   * Remove HTML tags from string.
   */
  stripHtmlTags(str) {
    return str.replace(/<[^>]*>/g, "");
  }

  /**
   * Remove non-printable ASCII chars
   */
  removeNonASCII(str) {
    // Matches non-printable ASCII chars -
    // http://en.wikipedia.org/wiki/ASCII#ASCII_printable_characters
    return str.replace(/[^\x20-\x7E]/g, "");
  }

  /**
   * String interpolation
   */
  interpolate(template, replacements, syntax) {
    var stache = /\{\{(\w+)\}\}/g; //mustache-like

    var replaceFn = function (match, prop) {
      return prop in replacements ? replacements[prop] : "";
    };

    return template.replace(syntax || stache, replaceFn);
  }

  /**
   * Pad string with `char` if its' length is smaller than `minLen`
   */
  rpad(str, minLen, ch) {
    ch = ch || " ";
    return str.length < minLen ? str + this.repeat(ch, minLen - str.length) : str;
  }

  /**
   * Pad string with `char` if its' length is smaller than `minLen`
   */
  lpad(str, minLen, ch) {
    ch = ch || " ";

    return str.length < minLen ? this.repeat(ch, minLen - str.length) + str : str;
  }

  /**
   * Repeat string n times
   */
  repeat(str, n) {
    return new Array(n + 1).join(str);
  }

  /**
   * Limit number of chars.
   */
  truncate(str, maxChars, append, onlyFullWords) {
    append = append || "...";
    maxChars = onlyFullWords ? maxChars + 1 : maxChars;

    str = str.trim();
    if (str.length <= maxChars) {
      return str;
    }
    str = str.substr(0, maxChars - append.length);
    //crop at last space or remove trailing whitespace
    str = onlyFullWords ? str.substr(0, str.lastIndexOf(" ")) : str.trim();
    return str + append;
  }

  WHITE_SPACES: Array<string> = [
    " ",
    "\n",
    "\r",
    "\t",
    "\f",
    "\v",
    "\u00A0",
    "\u1680",
    "\u180E",
    "\u2000",
    "\u2001",
    "\u2002",
    "\u2003",
    "\u2004",
    "\u2005",
    "\u2006",
    "\u2007",
    "\u2008",
    "\u2009",
    "\u200A",
    "\u2028",
    "\u2029",
    "\u202F",
    "\u205F",
    "\u3000"
  ];

  /**
   * Remove chars from beginning of string.
   */
  ltrim(str, chars) {
    chars = chars || this.WHITE_SPACES;

    var start = 0,
      len = str.length,
      charLen = chars.length,
      found = true,
      i,
      c;

    while (found && start < len) {
      found = false;
      i = -1;
      c = str.charAt(start);

      while (++i < charLen) {
        if (c === chars[i]) {
          found = true;
          start++;
          break;
        }
      }
    }

    return start >= len ? "" : str.substr(start, len);
  }

  /**
   * Remove chars from end of string.
   */
  rtrim(str, chars) {
    chars = chars || this.WHITE_SPACES;
    var end = str.length - 1,
      charLen = chars.length,
      found = true,
      i,
      c;

    while (found && end >= 0) {
      found = false;
      i = -1;
      c = str.charAt(end);

      while (++i < charLen) {
        if (c === chars[i]) {
          found = true;
          end--;
          break;
        }
      }
    }

    return end >= 0 ? str.substring(0, end + 1) : "";
  }

  /**
   * Remove white-spaces from beginning and end of string.
   */
  trim(str, chars) {
    chars = chars || this.WHITE_SPACES;
    return this.ltrim(this.rtrim(str, chars), chars);
  }

  /**
   * Capture all capital letters following a word boundary (in case the
   * input is in all caps)
   */
  abbreviate(str) {
    return str.match(/\b([A-Z])/g).join("");
  }
  populateAssignmentStatus(url: string, utilityServiceTemp: UtilityService) {
    let utilityService = utilityServiceTemp == null ? this : utilityServiceTemp;
    let assignmentStatusResponse = utilityService.getDataFormService(url);

    assignmentStatusResponse.subscribe(
      data => {
        if (data != null) {
          //popule teh html 
          utilityService.assignmentStatusHeader = data;
        }
      });
  }

  populateTaskBoardData(url: string, headerValues_temp: Array<any>, utilityServiceTemp?: UtilityService) {
    let utilityService_temp = utilityServiceTemp == null ? this : utilityServiceTemp;
    let taskBoardResponse = utilityService_temp.getDataFormService(url, headerValues_temp);
    taskBoardResponse.subscribe(
      data => {
        if (data != null) {
          utilityService_temp.taskBoardResponseData = data.DataCollection;
        }
      });
  }
  /* -------------------------populate Drag Drop Cache Data FOr TaskBoard------------------------*/
  populateTaskBoardDragDropCacheData(cacheData: PageCache, utilityService?: UtilityService) {

    let utilityService_temp = utilityService == null ? this : utilityService;
    utilityService_temp.assignmentStatusHeader = cacheData.AssignmentStatusHeaderData
    utilityService_temp.populateTaskBoardData(cacheData.Url, cacheData.CacheHeader, utilityService_temp);
  }
  populatesampleInitialization2Table(sampleStageData: Array<any>, affectedTableControl: HTMLTableElement, utilityService_temp: UtilityService) {
    $(affectedTableControl).html('');
    $("#sampleInitialization2Table tbody").remove();
    sampleStageData.sort(function (a, b) {
      return a.MethodStageGridColumnForPopulation.Sequence - b.MethodStageGridColumnForPopulation.Sequence;
    });

    let totalRecords: number;
    localStorage.setItem('sampleInitialization2', JSON.stringify(sampleStageData))
    //******************** PRINTIMG THE HEADERS  *************************/
    let thead_temp = $('<thead></thead>');
    let tr_temp = $('<tr></tr>');
    let th_temp0 = $('<th style="font-size:20px;" class="theadShow">&#8593;</th>');
    let th_temp1 = $('<th style="font-size:20px;" class="theadShow">&#8595;</th>');
    let th_temp3 = $('<th class="theadShow">RN</th>');
    let th_temp4 = $('<th class="theadShow">RP</th>');
    let th_temp2 = $('<th class="theadShow">Delete</th>');
    sampleStageData.forEach(SD => {
      totalRecords = SD.NoOfRows;
      let th_temp = $('<th class="theadShow">' + SD.MethodStageGridColumnForPopulation.ColumnName + '</th>');
      $(th_temp).attr(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID, SD.Id);
      $(th_temp).attr(AppConstants.COMMON.COMMON_ROWVERSION, SD.RowVersion);
      $(th_temp).attr(AppConstants.COMMON.COMMON_TOTAL_RECORDS, totalRecords);
      $(th_temp).attr(AppConstants.COMMON.COMMON_STAGE_ID, SD.StageId);
      $(th_temp).attr(AppConstants.COMMON.COMMON_METHOD_ID, SD.MethodId);
      $(th_temp).attr(AppConstants.COMMON.COMMON_METHOD_STAGE_GRID_COLUMN_ID, SD.MethodStageGridColumnForPopulation.Id);
      $(th_temp).attr(AppConstants.COMMON.COMMON_IS_REPEAT, SD.MethodStageGridColumnForPopulation.IsRepeat);
      $(th_temp).attr(AppConstants.COMMON.COMMON_MAINTAIN_REPEAT, SD.MethodStageGridColumnForPopulation.MaintainRepeat);
      $(th_temp).attr(AppConstants.COMMON.COMMON_IS_INPUT, SD.MethodStageGridColumnForPopulation.IsInput);
      $(th_temp).attr(AppConstants.COMMON.COMMON_IS_RUNNING_NUMBER, SD.MethodStageGridColumnForPopulation.IsRunningNumber);
      $(th_temp).attr(AppConstants.COMMON.COMMON_IS_TEXT, SD.MethodStageGridColumnForPopulation.IsText);
      $(tr_temp).append(th_temp);
      $(tr_temp).append(th_temp0);
      $(tr_temp).append(th_temp1);
      $(tr_temp).append(th_temp3);
      $(tr_temp).append(th_temp4);
      $(tr_temp).append(th_temp2);
      $(thead_temp).append(tr_temp);
    });
    let tbody_temp = $('<tbody></tbody>');
    $(affectedTableControl).append(thead_temp);
    $(affectedTableControl).append(tbody_temp);

    /*-----------------ROW GENRATEION -----------------*/

    for (let i = 0; i < totalRecords; i++) {
      let tbody_temp1= tbody_temp[0] as HTMLTableElement
      utilityService_temp.generateRowForGivenSampleInitialization2Table(tbody_temp1, sampleStageData, utilityService_temp, i);
    }
    if (sampleStageData != null)
      utilityService_temp.generateDataForGivenSampleInitialization2Table(sampleStageData);


  }

  populatesamplemethodstagereadings2Table(sampleStageData: Array<any>, affectedTableControl: HTMLTableElement, utilityService_temp: UtilityService, pagesize: number) {
    $(affectedTableControl).html('');
    $("#SampleMethodStageReadings2 tbody tr").remove();
    sampleStageData.sort(function (a, b) {
      return a.MethodStageGridColumnForPopulation.Sequence - b.MethodStageGridColumnForPopulation.Sequence;
    });

    let totalRecords: number;
    //******************** PRINTIMG THE HEADERS  *************************/
    let thead_temp = $('<thead></thead>');
    let tr_temp = $('<tr></tr>');
    sampleStageData.forEach(SD => {
      totalRecords = SD.NoOfRows;
      let th_temp = $('<th class="theadShow">' + SD.MethodStageGridColumnForPopulation.ColumnName + '</th>');
      $(th_temp).attr(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID, SD.Id);
      $(th_temp).attr(AppConstants.COMMON.COMMON_ROWVERSION, SD.RowVersion);
      $(th_temp).attr(AppConstants.COMMON.COMMON_METHOD_STAGE_GRID_COLUMN_ID, SD.MethodStageGridColumnForPopulation.Id);
      $(th_temp).attr(AppConstants.COMMON.COMMON_IS_REPEAT, SD.MethodStageGridColumnForPopulation.IsRepeat);
      $(th_temp).attr(AppConstants.COMMON.COMMON_IS_SCAN, SD.MethodStageGridColumnForPopulation.IsScanField);
      $(th_temp).attr(AppConstants.COMMON.COMMON_IS_INPUT, SD.MethodStageGridColumnForPopulation.IsInput);
      $(th_temp).attr(AppConstants.COMMON.COMMON_IS_RUNNING_NUMBER, SD.MethodStageGridColumnForPopulation.IsRunningNumber);
      $(th_temp).attr(AppConstants.COMMON.COMMON_IS_TEXT, SD.MethodStageGridColumnForPopulation.IsText);
      if (SD.MethodStageGridColumnForPopulation.Formulae != " " || SD.MethodStageGridColumnForPopulation.Formulae != "     ") {
        $(th_temp).attr(AppConstants.COMMON.COMMON_FORMULAE, SD.MethodStageGridColumnForPopulation.Formulae.trim());
      }
      $(tr_temp).append(th_temp);
      $(thead_temp).append(tr_temp);
    });
    $(affectedTableControl).append(thead_temp);

    let contextualControl = affectedTableControl.parentElement;
    let temp_hidden_manually_set_control = document.createElement('hiddenSampleMethodStageId') as HTMLInputElement;
    temp_hidden_manually_set_control.type = 'hidden';
    temp_hidden_manually_set_control.id = "24vv";
    $(contextualControl).append(temp_hidden_manually_set_control);
    /*-----------------ROW GENRATEION -----------------*/

    let firstRecord = sessionStorage.getItem("firstRecord");
    let firstrow = firstRecord != null ? parseInt(firstRecord) - 1 : 0;
    let lastRecord = sessionStorage.getItem(AppConstants.COMMON.COMMON_LAST_RECORD);
    let totalRows: number = lastRecord != null ? parseInt(lastRecord) : 10;


    for (let i = firstrow; i < totalRows; i++) {
      utilityService_temp.generateRowForGivenSamplemethodstagereadings2Table(affectedTableControl, sampleStageData, utilityService_temp, i);
    }
    if (sampleStageData != null) {
      utilityService_temp.generateDataForGivenSampleMethodStageReadings2Table(sampleStageData, affectedTableControl);
    }

    utilityService_temp.setMethodStageReading2TableData();

  }
  setMethodStageReading2TableData() {
    // Store sampleMethodStageReding2 Table data 
    let sampleElement = document.getElementById("hidden_sampleId") as HTMLInputElement;
    let methodElement = document.getElementById("hidden_methodId") as HTMLInputElement;
    let stageElement = document.getElementById("hidden_stageId") as HTMLInputElement;
    let currentPage = sessionStorage.getItem("currentPage");
    let sampleId = sampleElement.value;
    let methodId = methodElement.value;
    let stageId = stageElement.value;

    let StorageData = JSON.parse(localStorage.getItem(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_READING2));
    if (StorageData != null) {

      let splitedvalue = StorageData.keyId.split("_");
      let prvcurrentPage = splitedvalue[splitedvalue.length - 1];
      let prvstageId = splitedvalue[splitedvalue.length - 2];
      let prvMethodId = splitedvalue[splitedvalue.length - 3];
      let prvSampleId = splitedvalue[splitedvalue.length - 4];
      if ((sampleId == prvSampleId) && (methodId == prvMethodId) && (stageId == prvstageId) && (currentPage == prvcurrentPage)) {
        var x = confirm("You have a pending data in this 'Sample' ,You want to load it?");
        if (x) {
           $("#SampleMethodStageReadings2").html('');
          $('#SampleMethodStageReadings2').append(StorageData.data);
        } else {

        }
      }
    }
  }

  generateDataForGivenSampleInitialization2Table(sampleStageData: Array<any>) {
    sampleStageData.forEach(SSD => {
      let columnName = SSD.MethodStageGridColumnForPopulation.ColumnName;
      SSD.SampleMethodStageReadings.forEach(SMSR => {
        let currentId = columnName + "_" + SMSR.Row + "_" + SMSR.Column;
        let refCtrl = document.getElementById(currentId) as HTMLInputElement;
        refCtrl.value = SMSR.SampleMethodStageColumnValue;
        let id = (SMSR != null) ? SMSR.Id : 0;
        refCtrl.setAttribute(AppConstants.COMMON.COMMON_TABLE_ID, id);
      })
    });
  }



  generateDataForGivenSampleInitialization2ForPreviousTable(sampleStageData: Array<any>) {
    sampleStageData.forEach(SSD => {
      let currentId = SSD.ColumnName + "_" + SSD.Row + "_" + SSD.Column;
      let refCtrl = document.getElementById(currentId) as HTMLInputElement;
      refCtrl.value = SSD.SampleMethodStageColumnValue;
      let id = (SSD != null) ? SSD.Id : 0;
      refCtrl.setAttribute(AppConstants.COMMON.COMMON_TABLE_ID, id);
    });
  }

  generateDataForGivenSampleMethodStageReadings2Table(sampleStageData: Array<any>, affectedTableControl: HTMLTableElement) {
    sampleStageData.forEach(SSD => {
      let columnName = SSD.MethodStageGridColumnForPopulation.ColumnName;
      columnName = columnName.replace(" ", "_");
      let columnType = SSD.MethodStageGridColumnForPopulation.IsText;
      if (SSD.SampleMethodStageReadings != undefined) {
        SSD.SampleMethodStageReadings.forEach(SMSR => {

          // let temp_hidden_manually_set_control = document.createElement('hiddenSampleMethodStageId') as HTMLInputElement;
          // temp_hidden_manually_set_control.type = 'hidden';
          // temp_hidden_manually_set_control.value = SMSR.SampleMethodStageId;
          // $(affectedTableControl).append(temp_hidden_manually_set_control);

          let currentId = columnName + "_" + SMSR.Row + "_" + SMSR.Column;
          if (columnType == true) {
            let refCtrl = document.getElementById(currentId) as HTMLInputElement;
            refCtrl.value = SMSR.SampleMethodStageColumnValue;
            refCtrl.setAttribute(AppConstants.COMMON.COMMON_TABLE_ID, SMSR.Id);
          } else {
            let refCtrl = document.getElementById(currentId) as HTMLTableCellElement;
            refCtrl.innerText = SMSR.SampleMethodStageColumnValue;
            refCtrl.setAttribute(AppConstants.COMMON.COMMON_TABLE_ID, SMSR.Id);
          }
        })
      }
    });
  }
  calculateFormulaeForSampleMethodStageReadings2(sampleStageData: Array<any>) {
    let allColumns = [];
    sampleStageData.forEach((SSD, rowIndex) => {
      let formulaeName = SSD.MethodStageGridColumnForPopulation.Formulae;
      let columnName = SSD.MethodStageGridColumnForPopulation.ColumnName;
      if (formulaeName != " ") {
        let patternToMatch = /COL_[0-9]*/g;
        let result = formulaeName.match(patternToMatch);
        if (result != null) {
          for (let i = 0; i < result.length; i++) {
            let splitedValue = result[i].split("_");

            allColumns.push(splitedValue[splitedValue.length - 1]);
          }
          for (let j = 0; j < allColumns.length; j++) {

            let selectRow = $("#SampleMethodStageReadings2").find('tr:eq(' + rowIndex + ')').children();
            let currentCellValue = selectRow[(parseInt(allColumns[j]) - 1)].innerText;
            let UpdateValue = parseInt(currentCellValue);
          }

        }
      }
    });
  }

  setpopulateDropDownDataForMethodStageColumnName() {

    let control: HTMLElement;

    /********** Where we are using parent element to find the element by class name, which is the case of controls within the grid, where every row is passed
     as parentReference */

    // if (parentElement != null) {
    //   let elements = parentElement.getElementsByClassName(controlId);
    //   if (elements.length > 0) {
    //     control = (x == null) ? elements[0] as HTMLElement : x;
    //   }
    // }

    let url = "https://iotplus.antronsys.com/v1/MethodStageGridColumns/getlist"
    let selectedValues = this.arrayOfFetchData.filter(item => item.key == url);

    if (selectedValues.length > 0) {
      let firstOrDefaultDataSet = selectedValues[0].value;

    }
  }
  incrementTableIdForDuplicate(row: number) {
    $("#sampleInitialization2Table tr:gt(0)").each(function (index) {
      if (index > row) {
        let tr = $(this)[0];
        for (let i = 0; i < tr.children.length; i++) {
          let tdCtrl = tr.children[i];
          let currentInputCtrlId = tr.children[i].children[0].id;
          let splitedvalue = currentInputCtrlId.split("_");
          let splitfirstValue = splitedvalue[splitedvalue.length - 1]
          let split2ndValue = parseInt(splitedvalue[splitedvalue.length - 2]) + 1;
          let split3rdValue = splitedvalue[splitedvalue.length - 3]
          let UpdateId = split3rdValue + "_" + split2ndValue + "_" + splitfirstValue;
          let inputCtrl = tdCtrl.children[0]
          $(inputCtrl).attr(AppConstants.COMMON.COMMON_ID, UpdateId);
        }
      }

    });
  }
  incrementTableId(row: number) {
    $("#sampleInitialization2Table tr:gt(0)").each(function (index) {
      if (index > row) {
        let tr = $(this)[0];
        for (let i = 0; i < tr.children.length; i++) {
          let tdCtrl = tr.children[i];
          let currentInputCtrlId = tr.children[i].children[0].id;
          let splitedvalue = currentInputCtrlId.split("_");
          let splitfirstValue = splitedvalue[splitedvalue.length - 1]
          let split2ndValue = parseInt(splitedvalue[splitedvalue.length - 2]) + 1;
          let split3rdValue = splitedvalue[splitedvalue.length - 3]

          let inputCtrl = tdCtrl.children[0]
          if (tr.children[i]['innerText'] == "RN") {
            let id = tr.children[i]['innerText'] + "_" + (parseInt(splitfirstValue) + 1).toString()
            $(inputCtrl).attr(AppConstants.COMMON.COMMON_ID, id);
          } else if (tr.children[i]['innerText'] == "RP") {
            let id = tr.children[i]['innerText'] + "_" + (parseInt(splitfirstValue) + 1).toString()
            $(inputCtrl).attr(AppConstants.COMMON.COMMON_ID, id);
          } else {
            let UpdateId = split3rdValue + "_" + split2ndValue + "_" + splitfirstValue;
            $(inputCtrl).attr(AppConstants.COMMON.COMMON_ID, UpdateId);
          }
        }
      }

    });
  }

  decrementTableId(row: number) {
    $("#sampleInitialization2Table tr:gt(0)").each(function (index) {
      if (index > row) {
        let tr = $(this)[0];
        for (let i = 0; i < tr.children.length; i++) {
          let tdCtrl = tr.children[i];
          let currentInputCtrlId = tr.children[i].children[0].id;
          let splitedvalue = currentInputCtrlId.split("_");
          let splitfirstValue = splitedvalue[splitedvalue.length - 1]
          let split2ndValue = parseInt(splitedvalue[splitedvalue.length - 2]) + 1;
          let split3rdValue = splitedvalue[splitedvalue.length - 3]
          // let UpdateId = split3rdValue + "_" + split2ndValue + "_" + splitfirstValue;
          let inputCtrl = tdCtrl.children[0]
          if (tr.children[i]['innerText'] == "RN") {
            let id = tr.children[i]['innerText'] + "_" + (parseInt(splitfirstValue) + 1).toString()
            $(inputCtrl).attr(AppConstants.COMMON.COMMON_ID, id);
          } else if (tr.children[i]['innerText'] == "RP") {
            let id = tr.children[i]['innerText'] + "_" + (parseInt(splitfirstValue) + 1).toString()
            $(inputCtrl).attr(AppConstants.COMMON.COMMON_ID, id);
          } else {
            let UpdateId = split3rdValue + "_" + split2ndValue + "_" + splitfirstValue;
            $(inputCtrl).attr(AppConstants.COMMON.COMMON_ID, UpdateId);
          }
        }
      }
    });
  }

  decrementTrValue(deleteId: number) {
    $("#sampleInitialization2Table tr:gt(0)").each(function (index) {
      if (index >= deleteId) {
        let tr = $(this)[0];
        for (let i = 0; i < tr.children.length; i++) {
          let tdCtrl = tr.children[i];
          let currentInputCtrlId = tr.children[i].children[0].id;
          let splitedvalue = currentInputCtrlId.split("_");
          let splitfirstValue = splitedvalue[splitedvalue.length - 1]
          let split2ndValue = parseInt(splitedvalue[splitedvalue.length - 2]) - 1;
          let split3rdValue = splitedvalue[splitedvalue.length - 3]
          // let UpdateId = split3rdValue + "_" + split2ndValue + "_" + splitfirstValue;
          // let inputCtrl = tdCtrl.children[0]
          // $(inputCtrl).attr("id", UpdateId);

          let inputCtrl = tdCtrl.children[0]
          if (tr.children[i]['innerText'] == "RN") {
            let id = tr.children[i]['innerText'] + "_" + (parseInt(splitfirstValue) - 1).toString()
            $(inputCtrl).attr(AppConstants.COMMON.COMMON_ID, id);
          } else if (tr.children[i]['innerText'] == "RP") {
            let id = tr.children[i]['innerText'] + "_" + (parseInt(splitfirstValue) - 1).toString()
            $(inputCtrl).attr(AppConstants.COMMON.COMMON_ID, id);
          } else {
            let UpdateId = split3rdValue + "_" + split2ndValue + "_" + splitfirstValue;
            $(inputCtrl).attr(AppConstants.COMMON.COMMON_ID, UpdateId);
          }
        }
      }

    });
  }
  setValueofNewTr(updateIds: any, utilityService_temp?: UtilityService) {

    let inputValueArray = [];
    let tableId = [];
    var count = 0;
    for (let i = 0; i < updateIds.length; i++) {
      // let currentId = (i == 0) ? updateIds[i] : updateIds[i] + 1;
      let currentId = updateIds[i];
      currentId = currentId + count;
      let currentInput = $("#sampleInitialization2Table").find("tbody tr").eq(currentId).children();
      for (let x = 0; x < currentInput.length; x++) {
        let inputCtrl = $(currentInput[x]).find('input');
        if (inputCtrl.length > 0) {
          inputValueArray.push(inputCtrl[0].value);
          tableId.push(inputCtrl[0].id);
        }
      }

      for (let a = 0; a < inputValueArray.length; a++) {
        let updateInput = $("#sampleInitialization2Table").find("tbody tr").eq(currentId + 1).children();
        for (let y = 0; y < updateInput.length; y++) {
          let inputCtrl = $(updateInput[y]).find('input');
          if (inputCtrl.length > 0) {
            let splitedvalue = tableId[a].split("_");
            let splitfirstValue = splitedvalue[splitedvalue.length - 1]
            let split2ndValue = parseInt(splitedvalue[splitedvalue.length - 2]) + 1;
            let split3rdValue = splitedvalue[splitedvalue.length - 3]
            let UpdateId = split3rdValue + "_" + split2ndValue + "_" + splitfirstValue;
            $(inputCtrl[0]).attr(AppConstants.COMMON.COMMON_ID, UpdateId);
            let tblId = 0;
            inputCtrl[0].setAttribute(AppConstants.COMMON.COMMON_TABLE_ID,tblId.toString());
            $(inputCtrl[0]).attr("value", inputValueArray[y]);
          } else {
            let btnCtrl = $(updateInput[y]).find('button');
            let currentTr = btnCtrl[0].parentElement.parentElement;
            if (btnCtrl[0].title == "Delete") {
              btnCtrl[0].addEventListener('click', () =>
                utilityService_temp.deleteCurrentTableRow(btnCtrl[0], currentTr));
            } else if (btnCtrl[0].title == "Above") {
              btnCtrl[0].addEventListener('click', () =>
                utilityService_temp.aboveCurrentTableRow(btnCtrl[0], currentTr));
            } else if (btnCtrl[0].title == "Down") {
              btnCtrl[0].addEventListener('click', () =>
                utilityService_temp.downCurrentTableRow(btnCtrl[0], currentTr));
            } else if (btnCtrl[0].innerHTML == "RN") {
              btnCtrl[0].addEventListener('click', () =>
                this.runningCurrentTableRow(btnCtrl[0], currentTr));
            } else if (btnCtrl[0].innerHTML == "RP") {
              btnCtrl[0].addEventListener('click', () =>
                this.repeatTableRow(btnCtrl[0], currentTr));
            }
          }
        }
        inputValueArray = [];
        tableId = [];
      }
      count = count + 1;
    }
  }

  aboveCurrentTableRow(deleteElement: HTMLElement, parentControlRow?: HTMLElement) {
    let row_index = [];
    let currentId = parentControlRow.children[0].children[0].id;
    let splitedvalue = currentId.split("_");
    let split2ndValue = parseInt(splitedvalue[splitedvalue.length - 2]);
    $("<tr>" + parentControlRow.innerHTML + "</tr>").insertBefore($('#sampleInitialization2Table > tbody tr').eq(split2ndValue));
    let rowIndex = split2ndValue;
    this.incrementTableId(rowIndex);
    row_index.push(rowIndex);
    this.setValueofNewTrForAbove(row_index, null);
    this.toastr.success('A row has been generated above', 'success', { timeOut: 2000 });
    this.populateRepeatData(null);
    this.populateRunningNumberData(true, null);
    var rowCount = $("#sampleInitialization2Table > tbody").children().length;
    let inputCtrl = document.getElementById("txtNoOfRows") as HTMLInputElement;
    if (rowCount > 0) {
      inputCtrl.value = rowCount.toString();
    }
  }
  downCurrentTableRow(deleteElement: HTMLElement, parentControlRow?: HTMLElement) {
    let row_index = [];
    let currentId = parentControlRow.children[0].children[0].id;
    let splitedvalue = currentId.split("_");
    let split2ndValue = parseInt(splitedvalue[splitedvalue.length - 2]);
    $("<tr>" + parentControlRow.innerHTML + "</tr>").insertAfter($('#sampleInitialization2Table > tbody tr').eq(split2ndValue));
    let rowIndex = split2ndValue;
    this.decrementTableId(rowIndex);
    row_index.push(rowIndex);
    this.setValueofNewTrForDown(row_index, null);
    this.toastr.success('A row has been generated down', 'success', { timeOut: 2000 });
    //this.populateRepeatData(null);
    //this.populateRunningNumberData(true, null);
    this.populateRepeatData(split2ndValue);
    this.populateRunningNumberData(true, split2ndValue);

    var rowCount = $("#sampleInitialization2Table > tbody").children().length;
    let inputCtrl = document.getElementById("txtNoOfRows") as HTMLInputElement;
    if (rowCount > 0) {
      inputCtrl.value = rowCount.toString();
    }
  }

  runningCurrentTableRow(currentElement: HTMLElement, parentControlRow?: HTMLElement) {
    let currentId = currentElement.id;
    let splitedvalue = currentId.split("_");
    let split2ndValue = parseInt(splitedvalue[splitedvalue.length - 1]);
    this.populateRunningNumberData(false, split2ndValue);
  }

  repeatTableRow(currentElement: HTMLElement, parentControlRow?: HTMLElement) {
    let currentId = currentElement.id;
    let splitedvalue = currentId.split("_");
    let split2ndValue = parseInt(splitedvalue[splitedvalue.length - 1]);
    this.populateRepeatData(split2ndValue);
  }
  setValueofNewTrForAbove(updateIds: any, utilityService_temp?: UtilityService) {
    let inputValueArray = [];
    let tableId = [];
    var count = 0;
    for (let i = 0; i < updateIds.length; i++) {
      let currentId = updateIds[i];
      currentId = currentId + count;
      let currentInput = $("#sampleInitialization2Table").find("tbody tr").eq(currentId + 1).children();
      for (let x = 0; x < currentInput.length; x++) {
        let inputCtrl = $(currentInput[x]).find('input');
        if (inputCtrl.length > 0) {
          inputValueArray.push(inputCtrl[0].value);
          tableId.push(inputCtrl[0].id);
        }
      }

      for (let a = 0; a < inputValueArray.length; a++) {
        let updateInput = $("#sampleInitialization2Table").find("tbody tr").eq(currentId).children();
        for (let y = 0; y < updateInput.length; y++) {
          let inputCtrl = $(updateInput[y]).find('input');
          if (inputCtrl.length > 0) {
            $(inputCtrl[0]).attr("value", inputValueArray[y]);
            let tblId = 0;
            inputCtrl[0].setAttribute(AppConstants.COMMON.COMMON_TABLE_ID,tblId.toString());
          } else {
            let btnCtrl = $(updateInput[y]).find('button');
            let currentTr = btnCtrl[0].parentElement.parentElement;
            if (btnCtrl[0].title == "Delete") {
              btnCtrl[0].addEventListener('click', () =>
                this.deleteCurrentTableRow(btnCtrl[0], currentTr));
            } else if (btnCtrl[0].title == "Above") {
              btnCtrl[0].addEventListener('click', () =>
                this.aboveCurrentTableRow(btnCtrl[0], currentTr));
            } else if (btnCtrl[0].title == "Down") {
              btnCtrl[0].addEventListener('click', () =>
                this.downCurrentTableRow(btnCtrl[0], currentTr));
            } else if (btnCtrl[0].innerHTML == "RN") {
              btnCtrl[0].addEventListener('click', () =>
                this.runningCurrentTableRow(btnCtrl[0], currentTr));
            } else if (btnCtrl[0].innerHTML == "RP") {
              btnCtrl[0].addEventListener('click', () =>
                this.repeatTableRow(btnCtrl[0], currentTr));
            }
          }
        }
        inputValueArray = [];
        tableId = [];
      }
      count = count + 1;
    }
  }

  setValueofNewTrForDown(updateIds: any, utilityService_temp?: UtilityService) {
    let inputValueArray = [];
    let tableId = [];
    var count = 0;
    for (let i = 0; i < updateIds.length; i++) {
      let currentId = updateIds[i];
      currentId = currentId + count;
      let currentInput = $("#sampleInitialization2Table").find("tbody tr").eq(currentId).children();
      for (let x = 0; x < currentInput.length; x++) {
        let inputCtrl = $(currentInput[x]).find('input');
        if (inputCtrl.length > 0) {
          inputValueArray.push(inputCtrl[0].value);
          tableId.push(inputCtrl[0].id);
        }
      }

      for (let a = 0; a < inputValueArray.length; a++) {
        let updateInput = $("#sampleInitialization2Table").find("tbody tr").eq(currentId + 1).children();
        for (let y = 0; y < updateInput.length; y++) {
          let inputCtrl = $(updateInput[y]).find('input');
          if (inputCtrl.length > 0) {
            let splitedvalue = tableId[a].split("_");
            let splitfirstValue = splitedvalue[splitedvalue.length - 1]
            let split2ndValue = parseInt(splitedvalue[splitedvalue.length - 2]) + 1;
            let split3rdValue = splitedvalue[splitedvalue.length - 3]
            let UpdateId = split3rdValue + "_" + split2ndValue + "_" + splitfirstValue;
            $(inputCtrl[0]).attr(AppConstants.COMMON.COMMON_ID, UpdateId);
            $(inputCtrl[0]).attr("value", inputValueArray[y]);
               let tblId
            inputCtrl[0].setAttribute(AppConstants.COMMON.COMMON_TABLE_ID,tblId);
          } else {
            let btnCtrl = $(updateInput[y]).find('button');
            let currentTr = btnCtrl[0].parentElement.parentElement;
            if (btnCtrl[0].title == "Delete") {
              btnCtrl[0].addEventListener('click', () =>
                this.deleteCurrentTableRow(btnCtrl[0], currentTr));
            } else if (btnCtrl[0].title == "Down") {
              btnCtrl[0].addEventListener('click', () =>
                this.downCurrentTableRow(btnCtrl[0], currentTr));
            } else if (btnCtrl[0].title == "Above") {
              btnCtrl[0].addEventListener('click', () =>
                this.aboveCurrentTableRow(btnCtrl[0], currentTr));
            } else if (btnCtrl[0].innerHTML == "RN") {
              btnCtrl[0].addEventListener('click', () =>
                this.runningCurrentTableRow(btnCtrl[0], currentTr));
            } else if (btnCtrl[0].innerHTML == "RP") {
              btnCtrl[0].addEventListener('click', () =>
                this.repeatTableRow(btnCtrl[0], currentTr));
            }
          }
        }
        inputValueArray = [];
        tableId = [];
      }
      count = count + 1;
    }
  }

  //   regexIndexOf(string, regex, startpos) {
  //     var indexOf = string.substring(startpos || 0).search(regex);
  //     return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
  // };

  // regexLastIndexOf(string, regex, startpos) {
  //     regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
  //     if(typeof (startpos) == "undefined") {
  //         startpos = string.length;
  //     } else if(startpos < 0) {
  //         startpos = 0;
  //     }
  //     var stringToWorkWith = string.substring(0, startpos + 1);
  //     var lastIndexOf = -1;
  //     var nextStop = 0;
  //     var result='';
  //     while((result = regex.exec(stringToWorkWith)) != null) {
  //         lastIndexOf = result.index;
  //         regex.lastIndex = ++nextStop;
  //     }
  //     return lastIndexOf;
  // };


  isNumber(data: any) {
    return !isNaN(parseFloat(data)) && !isNaN(data - 0);
  }

  populateRunningNumberData(check_maintainCondition: boolean, currentIndex?: Number) {
    let runningColumnNumbers: Array<RunningNumber>;
    runningColumnNumbers = new Array<RunningNumber>();
    $("#sampleInitialization2Table tr th").each(function (index) {

      let th = $(this)[0];
      if (check_maintainCondition == true) {
        if (th.getAttribute(AppConstants.COMMON.COMMON_IS_RUNNING_NUMBER) == "true" && th.getAttribute(AppConstants.COMMON.COMMON_MAINTAIN_REPEAT) == "false") {
          let runningNumber = new RunningNumber();
          runningNumber.runningColumnNumber = parseInt(index.toString());
          runningColumnNumbers.push(runningNumber);
        }
      } else {
        if (th.getAttribute(AppConstants.COMMON.COMMON_IS_RUNNING_NUMBER) == "true") {
          let runningNumber = new RunningNumber();
          runningNumber.runningColumnNumber = parseInt(index.toString());
          runningColumnNumbers.push(runningNumber);
        }
      }

    });

    let initialValues = [];
    const non_numeric_pattern = /[a-zA-Z_/\-]/g;
    const numeric_patternToMatch = /[\d+$]/g;

    let updated_row_number: any = (currentIndex == null) ? "0" : (currentIndex).toString();
    let elem = document.getElementById("chkRunningNo") as HTMLInputElement;
    $("#sampleInitialization2Table tr:gt(" + updated_row_number + ")").each(function (index) {

      let currentTr = $(this)[0];
      //Looping thru all the running number columns 
      for (let i = 0; i < runningColumnNumbers.length; i++) {
        let contextualTd = $(currentTr).find('td:eq(' + runningColumnNumbers[i].runningColumnNumber + ')');
        //take the value from child textbox
        let currentTextBox = contextualTd[0].children[0];
        currentTextBox['value'] as HTMLElement
        currentTextBox['value'] = (currentTextBox['value'] == '') ? runningColumnNumbers[i].previousValueNumber : currentTextBox['value'];

        //Pick the pattern from begining and keep searching for it as per the column number , till the pattern is differnt
        let result = currentTextBox['value'].match(non_numeric_pattern);
        // result = result==''? runningColumnNumbers[i].previouspattern
        //todo check and change, here we need to assign the complete non-numeric pattern to 'currentpattern'

        runningColumnNumbers[i].currentpattern = (result != null && result.length > 0) ? result.join('') : 'x';

        //point
        if (elem != null && elem.checked && runningColumnNumbers[i].previouspattern != '') {
          runningColumnNumbers[i].currentpattern = runningColumnNumbers[i].previouspattern;
        }

        //evaluate the non-numeric postition & numeric postion(last after last non-numeric postion)
        //code for incrementing the value as per previous logic
        let aggregated_non_numeric_position = 0;
        let aggregated_numeric_position = 0;
        let last_non_numeric_position = 0;
        let last_numeric_position = 0;
        let prev_segregated_string = '';
        let last_non_numeric_position_final = 0;
        let last_numeric_position_final = 0;

        if (runningColumnNumbers[i].previouspattern == '' ||
          (runningColumnNumbers[i].previouspattern == runningColumnNumbers[i].currentpattern)) {
          let temp_currentTextBox_value = runningColumnNumbers[i].previousValueNumber == '' ?
            currentTextBox['value'] : runningColumnNumbers[i].previousValueNumber;

          for (let j = 0; j < temp_currentTextBox_value.length; j++) {
            let single_char = temp_currentTextBox_value[j];
            last_non_numeric_position = single_char.search(non_numeric_pattern);
            last_numeric_position = single_char.search(numeric_patternToMatch);

            aggregated_non_numeric_position += (last_non_numeric_position + 1);
            aggregated_numeric_position += (last_numeric_position + 1);

            //*** We are storing the last num numeric char position when 'last_non_numeric_position != -1'
            if (last_non_numeric_position != -1) {
              last_non_numeric_position_final = j;
            }

          }
          //storing the last 'non-numeric position' for next iteration 
          runningColumnNumbers[i].lastNonNumericPosition = last_non_numeric_position_final;

        }
        else {
          last_non_numeric_position_final = runningColumnNumbers[i].lastNonNumericPosition;

        }

        let nonNumeric_result = currentTextBox['value'].substring(0, last_non_numeric_position_final + 1);
        let numeric_result = currentTextBox['value'].substring(last_non_numeric_position_final + 1);
        //HERE WE check for previous pattern 'null' which will happen only if first time, or if the pattern changes
        //Evaluate the numeric postions only after 'last_non_numeric_position_final' 


        //here if check box is true we reset the current patter to parev pattern


        if (runningColumnNumbers[i].previouspattern == '' ||
          (runningColumnNumbers[i].previouspattern != runningColumnNumbers[i].currentpattern)) {
          //Increment the value of the TD with the last number value
          //runningColumnNumbers[i].previousValueNumber = currentTextBox.value; // numeric_result.join('');
          runningColumnNumbers[i].previousValueNumber = currentTextBox['value'];
        }
        else if (runningColumnNumbers[i].previouspattern == runningColumnNumbers[i].currentpattern) {
          //case where the pattern changed

          let countOfNumericChars = (runningColumnNumbers[i].previousValueNumber.length - 1) - last_non_numeric_position_final;
          if (countOfNumericChars != -1) {
            let numeric_Value = (runningColumnNumbers[i].currentpattern == 'x') ? parseInt(runningColumnNumbers[i].previousValueNumber) + 1 : ((parseInt(runningColumnNumbers[i].previousValueNumber.substring(runningColumnNumbers[i].lastNonNumericPosition + 1, 50)) + 1).toString().padStart(countOfNumericChars, '0'));
            // last_non_numeric_position_final
            let new_value_for_cell_population = (runningColumnNumbers[i].currentpattern == 'x') ? numeric_Value : runningColumnNumbers[i].previousValueNumber.substring(0, runningColumnNumbers[i].lastNonNumericPosition + 1) + numeric_Value;

            runningColumnNumbers[i].previousValueNumber = new_value_for_cell_population.toString();
            currentTextBox['value'] = new_value_for_cell_population;
            initialValues.splice(i, 1, new_value_for_cell_population);
          }
        }


        runningColumnNumbers[i].previouspattern = runningColumnNumbers[i].currentpattern;
        runningColumnNumbers[i].lastNonNumericPosition = last_non_numeric_position_final;
        runningColumnNumbers[i].numericValue = numeric_result;
        runningColumnNumbers[i].nonNumericValue = nonNumeric_result;



      }
    });
  }

  PullDataFormGridMethodStageReading2(event: Event1, pagenumber: any, pageSize: any, utilityService: UtilityService) {

    let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : this.moduleName;
    // /* populate dependency  dropdown by replace keyid and valuename*/
    let url = utilityService.getApiUrl(module_temp) + event.EndPoint.EndpointAddress;
    if (event.EndPoint.AdditionalParams != null && event.EndPoint.AdditionalParams.length > 0) {

      for (let i = 0; i < event.EndPoint.AdditionalParams.length; i++) {

        /*EVALUATE THE VALUEKEY FROM THE RELATED CONTROL*/
        if (event.EndPoint.AdditionalParams[i].KeyName != null && url.includes(event.EndPoint.AdditionalParams[i].KeyName)) {

          if (event.EndPoint.AdditionalParams[i].ControlType == "select") {
            let control_temp = document.getElementById(event.EndPoint.AdditionalParams[i].ControlName) as HTMLSelectElement;
            let control_value = control_temp.options[control_temp.options.selectedIndex].value;
            url = url.replace(event.EndPoint.AdditionalParams[i].KeyName, control_value);
          }

        }
      }
    }



    let response = utilityService.getDataFormStageReading2Service(url, pagenumber, pageSize);
    response.subscribe(
      data => {

      });
  }
  populateRepeatData(currentIndex: number) {

    let repeatColumnNumbers = [];
    $("#sampleInitialization2Table tr th").each(function (index) {
      let th = $(this)[0];
      if (th.getAttribute(AppConstants.COMMON.COMMON_IS_REPEAT) == "true") {

        repeatColumnNumbers.push(index);

      }
    });


    let initialValues = [];
    let updated_row_number: any = (currentIndex == null) ? "0" : (currentIndex).toString();

    $("#sampleInitialization2Table tr:gt(" + updated_row_number + ")").each(function (index) {

      let currentTr = $(this)[0];
      for (let j = 0; j < repeatColumnNumbers.length; j++) {

        let contextualTd = $(currentTr).find('td:eq(' + repeatColumnNumbers[j] + ')');
        let currentTextBox = contextualTd[0].children[0];
        if (currentTextBox['value'] != "") {
          initialValues.push(currentTextBox['value']);
        }
        let currentValue = initialValues[j];
        if (currentValue != undefined) {
          currentTextBox['value'] = currentValue;
        }
      }

    });
  }
  populateInputDataSampleMethodStageTable(cellValue, utilityServiceTemp?: UtilityService) {
    let utilityService = utilityServiceTemp == null ? this : utilityServiceTemp;
    let selectedColumns = [];
    let selectedColumnNames = [];
    let selectedId = [];
    let idValueForBalance1 = getInputValue(AppConstants.GENERAL.HIDDEN_LAST_INPUT_DATA_TD_ID);
    let isManuallySetBalance1 = getInputValue(AppConstants.GENERAL.HIDDEN_INPUT_MANUALY_SET_ID);
    $("#SampleMethodStageReadings2 tr th").each(function (index) {
      let th = $(this)[0];
      if (th.getAttribute(AppConstants.COMMON.COMMON_IS_INPUT) == "true") {
        selectedColumns.push(index);
        selectedColumnNames.push(th.innerHTML);
      }
    });
    var sampleMethodStageRed2HeaderName = [];
    $("#SampleMethodStageReadings2 tr:gt(0)").each(function (index1) {
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

        $('table tr td').removeClass('tblActive');
        $(control_ref1).addClass('tblActive');
        let balanceIdToSearch1 = (last_row11 + 1).toString();
        setInputValue(AppConstants.GENERAL.HIDDEN_INPUT_MANUALY_SET_ID, 'false');
        setInputValue(AppConstants.GENERAL.HIDDEN_LAST_INPUT_DATA_TD_ID, splittedName + "_" + balanceIdToSearch1 + "_" + last_row12);

        let updateIdToSearch1 = last_row11.toString();
        let idValue = splittedName + "_" + updateIdToSearch1 + "_" + last_row12
        let splittedNameForPut = idValue.split('_');
        let currentRowNum = splittedNameForPut[splittedNameForPut.length - 2];
        let splitedValue = currentRowNum.split('');
        let updatesplitedValue = splitedValue[splitedValue.length - 1];

        utilityService.putSampleMethodStageReading2(currentRowNum, updatesplitedValue, utilityService);
      }
    }
    //utilityService.getMethodStageReading2Data();
  }

  putSampleMethodStageReading2(rowNumber, updatesplitedValue, utilityServiceTemp?: UtilityService) {
    let utilityService = utilityServiceTemp == null ? this : utilityServiceTemp;
    let selectedColumns = [];

    let elem = document.getElementById("chkPagesave") as HTMLInputElement;

    if (elem != null && (!elem.checked)) {
      $("#SampleMethodStageReadings2 tr th").each(function (index) {
        let th = $(this)[0];
        if (th.getAttribute(AppConstants.COMMON.COMMON_IS_INPUT) == "true" || th.getAttribute(AppConstants.COMMON.COMMON_IS_TEXT) == "true" || (th.getAttribute(AppConstants.COMMON.COMMON_IS_TEXT) != "true" && th.getAttribute(AppConstants.COMMON.COMMON_IS_INPUT) != "true" && th.getAttribute(AppConstants.COMMON.COMMON_IS_RUNNING_NUMBER) != "true" && th.getAttribute(AppConstants.COMMON.COMMON_IS_REPEAT) != "true" && th.getAttribute(AppConstants.COMMON.COMMON_IS_SCAN) != "true")) {
          selectedColumns.push(index);
        }
      });

      for (let j = 0; j < selectedColumns.length; j++) {
        let currentRow = [];
        let child_obj = {};
        let currentRowNum = parseInt(updatesplitedValue) + 1; // add one because It start form header
        let selectRow = $("#SampleMethodStageReadings2").find('tr:eq(' + currentRowNum + ')').children();

        let currentCellValue = selectRow[(selectedColumns[j])].innerText;
        currentCellValue = (currentCellValue == "") ? ((selectRow[(selectedColumns[j])].children[0] == undefined) ? "" : selectRow[(selectedColumns[j])].children[0]['value']) : currentCellValue;
        let UpdateValue = currentCellValue;

        let tableId = selectRow[(selectedColumns[j])].getAttribute(AppConstants.COMMON.COMMON_TABLE_ID);
        let tblId = 0;
        tableId = (tableId == null) ? tblId.toString() : tableId;
        tableId = (parseInt(tableId) == 0) ? ((selectRow[(selectedColumns[j])].children[0] == undefined) ? tblId.toString() : selectRow[(selectedColumns[j])].children[0].getAttribute(AppConstants.COMMON.COMMON_TABLE_ID)) : tableId;
        tableId = (tableId == null) ? tblId.toString() : tableId;
        let sampleMethodStageId = selectRow[(selectedColumns[j])].getAttribute(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID);
        let SMSId = 0;
        sampleMethodStageId = (sampleMethodStageId.toString() == null) ?  SMSId.toString(): sampleMethodStageId.toString();
        sampleMethodStageId = (parseInt(sampleMethodStageId) == 0) ? ((selectRow[(selectedColumns[j])].children[0] == undefined) ? SMSId.toString() : selectRow[(selectedColumns[j])].children[0].getAttribute(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID)) : sampleMethodStageId;

        child_obj[AppConstants.COMMON.ID] = (parseInt(tableId) != 0) ? parseInt(tableId) : 0;
        child_obj[AppConstants.COMMON.COMMON_ENTITY_STATE] = (parseInt(tableId) != 0) ? 2 : 1;
        child_obj[AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID] = parseInt(sampleMethodStageId);
        child_obj[AppConstants.COMMON.COMMON_ROW] = rowNumber;
        child_obj[AppConstants.COMMON.COMMON_COLUMN] = selectedColumns[j];
        child_obj[AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_COLUMN_VALUE] = UpdateValue;
        if (UpdateValue != null || UpdateValue != "") {
          currentRow.push(child_obj);
        }
        let requestModel = {
          DataCollection: currentRow
        };

        let url = utilityService.getApiUrl(this.moduleName) + '/' + '/v1/SampleMethodStageReadings2/UpdateBySampleMethodStageReading/' + tableId;
        utilityService.putDataToServiceForInputData(url, requestModel).subscribe(data => {
          $(modalLoader()).hide();
          if (data.status = 200 || 204) {
            this.toastr.success('Data Submitted Successfully', 'Success',
              { timeOut: 2000 });

          }
        });

      }

    }else if(elem != null && (elem.checked)){
     utilityService.getMethodStageReading2Data();
     }
  }

  getMethodStageReading2Data() {

    // Store the data with time
    let sampleElement = document.getElementById("hidden_sampleId") as HTMLInputElement;
    let methodElement = document.getElementById("hidden_methodId") as HTMLInputElement;
    let stageElement = document.getElementById("hidden_stageId") as HTMLInputElement;
    let currentPage = sessionStorage.getItem("currentPage");
    let sampleId = sampleElement.value;
    let methodId = methodElement.value;
    let stageId = stageElement.value;
    if (sampleId && methodId && stageId && currentPage) {
      const timestamp = new Date().getTime(); // current time
      const EXPIRE_TIME = timestamp + (60 * 60 * 24 * 1000 * 1);
      const now = new Date();
      let currentKey = 'storeData_' + sampleId + '_' + methodId + '_' + stageId + '_' + currentPage;
      localStorage.setItem(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_READING2, JSON.stringify({
        time: now.getTime() + EXPIRE_TIME,
        keyId: currentKey,
        data: $("#SampleMethodStageReadings2").html()
      }));

      // start the time out
      if(!this.isfunctionAssignedForAutoDeleteOfLocationStorage){
      let StorageData = JSON.parse(localStorage.getItem(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_READING2));
      if (StorageData != null) {
        if (now.getTime() > StorageData.time) {
          localStorage.removeItem(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_READING2);
        }
      }
      //  setTimeout(function () {
      //   localStorage.removeItem(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_READING2);
      // }, EXPIRE_TIME);
     this.isfunctionAssignedForAutoDeleteOfLocationStorage = true;
    }
   }
  }



  async resetBarcodeflag() {
    this.delay(2000);
    this.isBarcodeScanned = false;
    console.log(' reset the barcode to false')
  }

  populateBarcodeValue(currentValue: any, utilityServiceTemp?: UtilityService) {
    var inputColumnNumbers1 = [];
    var rawWt: any;

    let idValueForBarcode = getInputValue(AppConstants.GENERAL.HIDDEN_BARCODE_ID);
    console.log(idValueForBarcode);
    if (idValueForBarcode != "") {
      $('#' + idValueForBarcode).removeClass("barcodeAdd");
    }

    $("#SampleMethodStageReadings2 tr th").each(function (index) {
      let th = $(this)[0];
      if (th.getAttribute(AppConstants.COMMON.COMMON_IS_SCAN) == "true") {
        inputColumnNumbers1.push(index);
      }

      if (th.innerHTML.includes("Raw")) {
        rawWt = index;
      }
    });


    $("#SampleMethodStageReadings2 tr:gt(0)").each(function (index1) {

      let currentTr = $(this)[0];
      for (let a = 0; a < inputColumnNumbers1.length; a++) {
        let contextualTd = $(currentTr).find('td:eq(' + inputColumnNumbers1[a] + ')');

        if (currentValue.toLowerCase().trim() == contextualTd[0].innerHTML.toLowerCase().trim()) {

          $('#' + contextualTd[0].id).addClass("barcodeAdd");
          setInputValue(AppConstants.GENERAL.HIDDEN_BARCODE_ID, contextualTd[0].id);
          if (rawWt != null) {
            let contextualTd1 = $(currentTr).find('td:eq(' + rawWt + ')');

            setInputValue(AppConstants.GENERAL.HIDDEN_MANUALY_SET_ID, 'true');
            setInputValue(AppConstants.GENERAL.HIDDEN_LAST_TD_ID, contextualTd1[0].id);
          }
        }
      }
      // }
    });
  }


  deleteCurrentDropdownTableRow() {
    alert("hello");
  }

  populatetblHeaderData(columnData:any){
    if(columnData != null){
    let updatecolumnData =  columnData.length >15 ? columnData.slice(0,15)+'...' : columnData
    return updatecolumnData;
    }
  }

}