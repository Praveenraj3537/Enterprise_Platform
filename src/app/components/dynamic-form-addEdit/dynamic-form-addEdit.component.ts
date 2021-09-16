import { Scripts, Section, SectionAttribute, Event as Event1, Header, ColumnString } from '../../shared/interface/form-data-advanced';
import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router, Event } from '@angular/router';
import { } from './../../shared/interface/form-data-advanced';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { UtilityService } from '../../services/utility.service';
import { IdService } from '../../services/id.service';
import { BaseComponent } from 'src/app/shared/baseComponent/base.component';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import * as $ from 'jquery';
import { stringify } from 'querystring';
import { delay } from 'rxjs/operators';
import { AppConstants } from 'src/app/constants/AppConstants';
import { Location } from '@angular/common';
import { MapsAPILoader, MouseEvent } from '@agm/core';


declare var disconnectWebSocketOnDestroy: any;
declare var disconnectConnection: any;
declare var  disconnectLiveWebSocket:any;
declare var modalLoader: any;
//************** DECLARARION FOR DIRECT SERIAL ********************* */
declare var doDirectSerialConnection: any;
declare var disconnectDirectSerial: any;
@Component({
  selector: 'app-dynamic-form-addEdit',
  templateUrl: './dynamic-form-addEdit.component.html',
  styleUrls: ['./dynamic-form-addEdit.component.scss']
})

export class DynamicFormAddEditComponent extends BaseComponent implements OnInit {

  submitted: boolean;
  countries: [];
  responseModel: any;
  module1 = this.module;
  public model2: any;
  data = '';
  maxDate = '';
  responseDataTemp: Observable<any>;
  private validationErrors: Array<string>;
  private isDataPopulationUnderProcess: boolean;
  public isDataPopulated: boolean;
  allSearchData: Object[];
  isPageLoaded: boolean;
  serverVisited: boolean;
  items: [];
  latitude: number;
  longitude: number;
  zoom: number=0;
  address: string;
  private geoCoder;
  splittedValues: any = window.location.pathname.split('/');
  splittedStringV: string;
  public sampleMethodStageReadings2CurrentTotalRow: number;
  @ViewChild('search') public searchElementRef: ElementRef;

  ScriptStore: Scripts[] = (this.checkIfPageRequireMqttDirectSerial()) ? [
    { name: 'Mqttws_Script', src: '../../../assets/scripts/mqttws31.js' },
    { name: 'DirectSerial_Script', src: '../../../assets/scripts/directSerial.js' }

  ] : [];

  charSetForNoGivenData: number;


  constructor(
    router: Router,
    httpclient: HttpClient,
    private idService: IdService,
    utilityService: UtilityService,
    activatedRoute: ActivatedRoute,
    authService: AuthService,
    toastr: ToastrService,
    private _location: Location,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {

    super(httpclient, activatedRoute, router, authService, utilityService, toastr);

    this.model2 = [];
    this.isDataPopulated = false;
    this.isDataPopulationUnderProcess = false;
    this.isAddCase = false;
    utilityService.updateIdService(this.idService);
    this.validationErrors = new Array<string>();
    this.isPageLoaded = false;
    this.serverVisited = false;
    this.charSetForNoGivenData = 0;

    //INITIALING THE SCRIPTS 
    this.ScriptStore.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src
      };
    });
  }

  checkIfPageRequireMqttDirectSerial(): boolean {
    let status: boolean
    status = (window.location.pathname.search('sampleMethodStageReadings2') >= 0 || window.location.pathname.search('instrumentCalibrationSets') >= 0 || window.location.pathname.search('internalCalibrations') >= 0 || window.location.pathname.search('balanceRecords') >= 0);
    return status;
  }

  currentTimeStamp() {
    return Math.floor(Date.now() / 1000);
  }
  loadScript(name: string) {
    return new Promise((resolve, reject) => {
      //resolve if already loaded
      if (this.scripts[name].loaded) {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      }
      else {
        //load script
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
  //***************** PAGE EVENTS IN SEQUENCE ************************ */
  ngOnChanges() { }

  ngOnInit() {
    sessionStorage.removeItem(AppConstants.COMMON.COMMON_FIRST_RECORD);
    sessionStorage.removeItem(AppConstants.COMMON.COMMON_LAST_RECORD);
    this.isPageLoaded = false;
    let height = $(window).height() - 150;
    //let width = $(window).width() - 250;
    $('#scroll').css("overflow-y", "scroll");
    $('#scroll').css("height", height);
    // $('#modal_id').css("width",width);
    sessionStorage.setItem('lastUrl', window.location.pathname);
    /*********** Getting the Form Data ********* */
    //THIS HAS TO BE UN COMMENTED ONCE THE SERVER ISSUE OF 500 IS RESOLVED
    this.getFormData('addEdit');

    this.utilityService.initializeSearchVariables();


    let path = window.location.pathname;
    let splittedValues = path.split('/');
    this.splittedStringV = splittedValues[2].toLowerCase();
    //*****************serial_div  (enabling the serial_div only if its reading2 page, else hiding it) ************
    // var serial_divs = document.getElementsByClassName('serial_div');
    // if(serial_divs.length>0){
    //   if(this.splittedStringV=='samplemethodstagereadings2'){
    //     $(serial_divs[0]).show();
    //   }
    //   else{
    //     $(serial_divs[0]).hide();
    //   }
    // };
    //************************************************************************************************************* */
    //load Places Autocomplete
   // if (this.splittedStringV == "taskboardVi") {
      this.mapsAPILoader.load().then(() => {
        this.setCurrentLocation();
        this.geoCoder = new google.maps.Geocoder;

        let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
        autocomplete.addListener("place_changed", () => {
          this.ngZone.run(() => {
            //get the place result
            let place: google.maps.places.PlaceResult = autocomplete.getPlace();

            //verify result
            if (place.geometry === undefined || place.geometry === null) {
              return;
            }

            //set latitude, longitude and zoom
            this.latitude = place.geometry.location.lat();
            this.longitude = place.geometry.location.lng();
            this.zoom = 12;
          });
        });
      });
    //}
  }

  // Get Current Location Coordinates
  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 8;
        this.getAddress(this.latitude, this.longitude);
      });
    }
  }


  markerDragEnd($event: MouseEvent) {
    console.log($event);
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
      console.log(results);
      console.log(status);
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 12;
          this.address = results[0].formatted_address;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }

    });
  }
  getIdForRefresh(inputControlName: string) {
    return "refresh_" + inputControlName;
  }

  getDateValue(propName: string, sectionAttribute?: SectionAttribute, modelObjectName?: string) {
    let updateDate: any;
    if (sectionAttribute != null) {
      if (sectionAttribute.DefaultValue == "current_date") {
        var currentDate = new Date().toLocaleDateString().split('/');
        var today = ("0" + currentDate[0]).slice(-2) + "/" + ("0" + currentDate[1]).slice(-2) + "/" + currentDate[2];
        // console.log(today);
        updateDate = today;
      }
    }
     return updateDate;
  }
  getDisabledValue(isDisabled?: boolean): boolean {
    return (isDisabled != null && isDisabled);
  }

  get inputDisabled() {
    return 'disabled';
  }

  get inputEnabled() {
    return '';
  }

  deleteExistingFile(sectionAttribute: SectionAttribute, event) {
    let inputValue = event.target.parentElement as HTMLDivElement;
    let inputControl = $(inputValue).find('input');

    let tagValue = inputControl[0].getAttribute('tag');
    var x = confirm("Are you sure you want to delete this file?");
    if (x) {
      sectionAttribute.Events.forEach(event => {
        let url = this.utilityService.getApiUrl(event.EndPoint.ModuleName) + event.EndPoint.EndpointAddress;
        this.utilityService.deleteDataToService(url, tagValue).subscribe(data => {
          if (data == true) {

            let lebelControl = $(inputValue).find('label');
            let anchorControl = $(inputValue).find('a');
            if (lebelControl != null) {
              $(lebelControl).html('');
            }
            inputControl[0].setAttribute('tag', AppConstants.GENERAL.DEFAULT_GUID);
            $(inputControl).val('');


            if (anchorControl != null) {
              //  anchorControl.style.display = 'none';
              $(anchorControl).hide();
            }

          }
        });
      })
    }
  }
  //*********** CALLED WHEN THERE IS A MODEL CHANGE, SO ONCE THE MODEL IS UDPATED BY PROMISE THIS WILL BE CALLED */
  ngDoCheck() {
    // let elem = document.getElementById("chkPagesave") as HTMLInputElement;
    // if (elem) {
    //   elem.checked = true;
    // }
    var rowCount = $("#sampleInitialization2Table > tbody").children().length;
    let inputCtrl = document.getElementById("txtNoOfRows") as HTMLInputElement;
    if (rowCount > 0) {
      inputCtrl.value = rowCount.toString();
    }
    if (this.isDataPopulated)
      return;
    //************ this part ideally should populate all data on the UI including single Child and Children/Array of child/grid ************** */
    if (this.formData != null && this.isAddCase == true && !this.isDataPopulationUnderProcess) {
      let utilityService = this.utilityService;
      try {
        /************* MAIN LOOP ADDED TO LOOP THROUGH THE FORM SECTIONS */
        if (this.formData != null) {

          this.formData.Sections.forEach(
            section => {
              /*Looping sub sections to produce relavant controls like tables  */
              utilityService.processSection(section, this.model, utilityService, false, this.isPageLoaded, null, null, null, this.pageInfo1.pagesize);
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

      if (this.isDataPopulationUnderProcess)
        return;

      try {
        this.isDataPopulationUnderProcess = true;

        let idService = this.idService;
        let utilityService = this.utilityService;
        let currentEvents: Array<Event1>;
        /************* MAIN LOOP ADDED TO LOOP THROUGH THE FORM SECTIONS to populate data mainly for Dropdowns *******************/
        if (this.formData != null) {
          this.formData.Sections.forEach(
            section => {
              let path = window.location.pathname;
              let splittedValues = path.split('/');
              let splittedName = splittedValues[2].toLowerCase();
              let splittedRow = parseInt(splittedValues[3]);
              switch (splittedName) {
                /*---------------------------- populate instrumentcalibrationsets addEdit Table data----------------------*/
                case "instrumentcalibrationsets":

                  if (section.SectionTypeName == 'Normal' || section.SectionTypeName == 'object') {
                    currentEvents = this.getFilterEvent(section);
                    utilityService.processSection(section, this.model, utilityService, false, this.isPageLoaded, null, null, null, this.pageInfo1.pagesize);
                  } else {

                    if (currentEvents != null && currentEvents != undefined) {
                      currentEvents.forEach(event => {
                        if (event.EndPoint.AdditionalParams != null && event.EndPoint.AdditionalParams.length > 0) {
                          for (let i = 0; i < event.EndPoint.AdditionalParams.length; i++) {
                            if (event.EndPoint.AdditionalParams[i].KeyName != null) {
                              let controlId = event.EndPoint.AdditionalParams[i].ModelPropName
                              let currentValue = this.model[event.EndPoint.AdditionalParams[i].ModelPropName];
                              /*Generate Url  for  get InstrumentCalibrationsets Report Data*/
                              let url = utilityService.getUrlForGenerateTable(splittedName, event, null, controlId, currentValue);

                              if (url != null) {
                                let response = utilityService.getDataFormService(url);
                                response.subscribe(
                                  data => {
                                    if (data != null) {
                                      //create url that give edit data
                                      let controlName_temp = (event.EndPoint.RelatedParams != null && event.EndPoint.RelatedParams.length > 0) ?
                                        event.EndPoint.RelatedParams[0].ControlName : null;
                                      if (controlName_temp != null) {
                                        let module_temp = event.EndPoint.ModuleName != null ? event.EndPoint.ModuleName : this.module;
                                        let editDataUrl = utilityService.getApiUrl(module_temp) + event.EndPoint.EndpointAddress;
                                        let measurementValue = this.model[event.EndPoint.RelatedParams[0].ModelPropName];

                                        let addURl = url;
                                        url = url + "/" + splittedRow;

                                        utilityService.processSection(data, this.model, utilityService, false, this.isPageLoaded, addURl, url, measurementValue);
                                      }
                                    }
                                  });
                              }
                            }
                          }
                        }
                      })
                    }
                  }
                  break;

                default:
                  /*********Looping sub sections to produce relavant controls like tables**********/
                  utilityService.processSection(section, this.model, utilityService, false, this.isPageLoaded, null, null, null, this.pageInfo1.pagesize);
                  break;
              }

            });
        };

        /*--------------------This will set the data for the single object types --------------------------*/
        if (!this.isDataPopulated) {
          this.getObjectData(this.model, true);
          this.formData.Sections.forEach(
            section => {

              if (this.model != null && this.isDataPopulated == false) {
                let tempTable = document.getElementById(section.SectionName) as HTMLTableElement;
                if (tempTable != null && section.ModelCollectionName != null) {
                  //Get the DataCollection for Table Types 
                  let dataCollection = this.model[section.ModelCollectionName]
                  if (dataCollection != null && Array.isArray(dataCollection)) {
                    dataCollection = dataCollection as Array<any>;
                    if (dataCollection != null) {
                      for (let i = 0; i < dataCollection.length; i++) {
                        this.utilityService.createRowForGivenTable(tempTable, section, dataCollection[i], this.utilityService);
                      };
                    }
                  }
                }
              }
            });
        }
        this.isDataPopulated = true;
        this.isDataPopulationUnderProcess = false;
      }
      catch (error) {
        switch (error.status) {

          case 500:
            this.toastr.error(error.message, 'Error', { timeOut: 4000 })
            break;
          case 401:
            this.toastr.error(error.message, 'Error', { timeOut: 4000 })
            break;
          case 404:
            this.toastr.warning('No Records', 'Warning', { timeOut: 4000 })
            break;
          case 400:
          case 409:
            this.toastr.warning(error.message, 'Warning', { timeOut: 4000 })
            break;

          default:
            this.toastr.warning(error.message, 'Warning', { timeOut: 4000 })
            break;
        }

      }
    };
  }

  getClassNameForULHelper(inputControlName, addedText) {
    return inputControlName + addedText + ' ulHelper list-group';

  }



  populateDataToPage() {
    //************ this part ideally should populate all data on the UI including single Child and Children/Array of child/grid ************** */
    if (this.formData != null && this.model != null && !this.isDataPopulationUnderProcess) {

      try {
        this.isDataPopulationUnderProcess = true;

        //This will set the data for the single object types
        if (!this.isDataPopulated)
          this.getObjectData(this.model, true);
        this.formData.Sections.forEach(
          section => {

            if (this.model != null && this.isDataPopulated == false) {
              let tempTable = document.getElementById(section.SectionName) as HTMLTableElement;
              if (tempTable != null && section.ModelCollectionName != null) {
                //Get the DataCollection for Table Types 
                let dataCollection = this.model[section.ModelCollectionName]
                if (dataCollection != null && Array.isArray(dataCollection)) {
                  dataCollection = dataCollection as Array<any>;
                  if (dataCollection != null) {
                    for (let i = 0; i < dataCollection.length; i++) {
                      this.utilityService.createRowForGivenTable(tempTable, section, dataCollection[i], this.utilityService);
                    };


                  }

                }
              }
              this.isDataPopulated = true;
            }
          });
      }
      catch (error) {
        switch (error.status) {

          case 500:
            this.toastr.error(error.message, 'Error', { timeOut: 4000 })
            break;
          case 401:
            this.toastr.error(error.message, 'Error', { timeOut: 4000 })
            break;
          case 404:
            this.toastr.warning('No Records', 'Warning', { timeOut: 4000 })
            break;
          case 400:
          case 409:
            this.toastr.warning(error.message, 'Warning', { timeOut: 4000 })
            break;
          case 0:
            this.toastr.warning('Unauthorized', 'Warning', { timeOut: 4000 })
            break;
          default:
            this.toastr.warning(error.message, 'Warning', { timeOut: 4000 })
            break;
        }
      }
    };
  }

  ngAfterContentInit() {
    if (this.model != null && this.isDataPopulated == false) {
    }

  }
  async ngAfterViewInit() {
    //set scroll window heights

    window.onresize = onResizeOfWindow;
    let isPageLoaded = this.isPageLoaded;
    function onResizeOfWindow() {
      let windowHeight = $(window).height();
      let model_body = $('#scroll');
      if (model_body != undefined) {
        let heightInPixels = (windowHeight - 170);
        $('#scroll').css("overflow-y", "scroll");
        $('#scroll').css("height", heightInPixels);
      }
    }

    let utilityService = this.utilityService;

    let currentModel = this.model;

    // //************* MAIN LOOP ADDED TO LOOP THROUGH THE FORM SECTIONS /
    if (this.formData != null) {
      this.formData.Sections.forEach(
        section => {
          //Looping sub sections to produce relavant controls like tables/...
          utilityService.processSection(section, currentModel, utilityService, true, isPageLoaded, null, null, null, this.pageInfo1.pagesize);
        });
    };

    //put it on async for 3 seconds and then set the value / delay 
    await this.delayApp(8000);
    this.isPageLoaded = true;

  }

  async delayApp(ms: number) {
    return of(new Boolean()).pipe(delay(ms));

  }

  ngAfterViewChecked() { }

  ngOnDestroy() {
    sessionStorage.removeItem(AppConstants.COMMON.COMMON_INITIALIZATION);
  let btnCtrl = document.getElementById("btnBack") as HTMLButtonElement;
  if(btnCtrl != null && btnCtrl.innerText != "Back"){
    if (disconnectWebSocketOnDestroy != null) {
      disconnectWebSocketOnDestroy();
      disconnectDirectSerial();
    }
    if (disconnectLiveWebSocket != null) {
      disconnectLiveWebSocket();
    }
  }
    let iotDeviceId = localStorage.getItem("iotDeviceId");
    let url = AppConstants.GENERAL.DISCONNECTSOCKETURL + "/" + iotDeviceId;
    disconnectConnection(url, 0);

    sessionStorage.removeItem(AppConstants.COMMON.COMMON_FIRST_RECORD);
    sessionStorage.removeItem(AppConstants.COMMON.COMMON_LAST_RECORD);
  }

  deleteCurrentRow(currentRow) {
    alert(currentRow.parentElement.parentElement.innerHTML);
  }

  getUUID() {
    return this.idService.generate();
  }

  getCurrentModel(): Observable<any> {
    return this.model;
  }

  populateIdFieldValue() {
    return (this.model != null) ? this.model[AppConstants.COMMON.ID] : 0;
  }

  populateFieldValue(propName: string, sectionAttribute?: SectionAttribute, modelObjectName?: string) {

    let controlId: string;
    let controlType: string;

    let modelPropType: string;
    let returnValue: any;

    if (sectionAttribute != null) {
      controlId = sectionAttribute.ControlName;
      controlType = sectionAttribute.ControlType;
      modelPropType = sectionAttribute.ModelPropType;
    }

    if (this.model != undefined) {
      if (modelObjectName != null) {
        returnValue = (propName.length == 0) ? '' : (this.model[modelObjectName] != null) ? this.model[modelObjectName][propName] : '';

      }
      else {
        returnValue = (propName.length == 0) ? '' : (this.model != null) ? this.model[propName] : '';
      }


      returnValue = (sectionAttribute != null && sectionAttribute.ModelPropType != null && sectionAttribute.ModelPropType == "number" &&
        (returnValue == '' || returnValue == undefined)) ? 0 : returnValue;

      //For Select Control evaluate the Index position and then set that 
      if (controlType != null && controlId != null) {
        switch (controlType) {
          case "date":
            let dateControl = document.getElementById(controlId) as HTMLInputElement;
            if (returnValue != null)
              //  var originalValue = returnValue.toString().substr(0, 10);
              //  dateControl.value = originalValue
              // var originalValue =returnValue.toString().slice(0, 10);
              dateControl.valueAsDate = (returnValue != null) ? new Date(returnValue) : new Date(Date.now());
            // document.getElementById("controlId")['valueAsDate'] = "2020-06-30"
            break;
          case "datetime-local":
            let dateControl2 = document.getElementById(controlId) as HTMLInputElement;
            if (returnValue != null)

              dateControl2.valueAsDate = (returnValue != null) ? new Date(returnValue) : new Date(Date.now());

            break;
          case "file":
            sectionAttribute.Events.forEach(event => {
              let fileId = document.getElementById(controlId) as HTMLInputElement;
              if (controlId != null) {
                let tagValue = fileId.getAttribute('tag');
                if (!(tagValue == null || tagValue.length < 25)) {
                  let element = document.getElementById('download_' + controlId) as HTMLAnchorElement;
                  let elementDel = document.getElementById('delete_' + controlId) as HTMLAnchorElement;
                  let url_for_download = this.utilityService.getApiUrl(event.EndPoint.ModuleName) + event.EndPoint.EndpointAddress + "/" + tagValue;
                  if (tagValue != null && tagValue != '' && tagValue != AppConstants.GENERAL.DEFAULT_GUID) {
                    element.style.display = 'inline-block';
                    element.setAttribute('href', url_for_download);
                    element.setAttribute('tag', tagValue);
                    elementDel.style.display = 'inline-block;'
                    $(element).show();
                    $(elementDel).show();
                  }
                  else {
                    element.style.display = 'none';
                    elementDel.style.display = 'none';
                  }
                }

              }

            })

            break;

          default:
            break;
        }
      }

    }
    return returnValue;

  }

  getModelCollectionForTable(collectionName: string) {
    let returnCollection = [];
    return (this.model == null || this.model == undefined || collectionName.length == 0) ? returnCollection :
      (this.model != null && this.model[collectionName] != null) ? this.model[collectionName] : returnCollection;
  }

  submitForm() {
    this.submitted = true;
  }

  populateLabelIdForFile(controlName: string) {
    return 'label_' + controlName;

  }
  populateLabelIdForDownloadFile(controlName: string) {
    return 'download_' + controlName;
  }
  populateIdForDelete(controlName: string) {
    return 'delete_' + controlName;
  }
  getData(data) { }

  processUniqueValue(section: Section) {
    let output: any;
    if (section.ModelCollectionName != null) {

      //get the table reference 
      let tableRef = document.getElementById('tbl' + section.ModelCollectionName);
      if (tableRef != null) {
        let table = tableRef as HTMLTableElement;

        let uniqueCount = 0;
        let uniqueKeys = [];
        //loop 1 
        for (let i = 0; i < table.rows.length; i++) {
          let unique_value_combination = '';

          if (section.UniqueKeys != null) {


            section.UniqueKeys.forEach(item => {
              let control = table.rows[i].getElementsByClassName(item);
              if (control != null && control.length > 0) {
                //find and convert the proper control type from seciton attribute 
                let controlRef = section.SectionAttributes.filter(t => t.ControlName == item);
                if (controlRef != null && controlRef.length > 0) {
                  switch (controlRef[0].ControlType) {
                    case "tblselect":
                      let control1 = control[0] as HTMLSelectElement;
                      let value = (control1.options != null && control1.options.length > 0) ? control1.options[control1.selectedIndex].value : "0";
                      if (controlRef[0].ModelPropType == 'number') {
                        output = Number(value);
                        unique_value_combination += '_' + (output != null ? output.toString() : '');
                      }
                      break;

                    case "tbltext":
                      let control2 = control[0] as HTMLInputElement;
                      unique_value_combination += '_' + control2.value;

                      break;
                  }
                }
                // uniqueKeys.push(control)
              }

            });
            uniqueKeys.push(unique_value_combination);
          }
        }


        uniqueKeys.forEach(val_temp => {
          let occurances = uniqueKeys.filter(t => t == val_temp);
          if (occurances.length > 1) {
            //add validation here 
            let msg = 'There are duplicates in section [' + section.ModelCollectionName + ']';
            if (!this.validationErrors.includes(msg)) {
              this.validationErrors.push(msg);
            }
            return;
          }
        });
      }


    }


    //Looping the sub sections 
    section.SubSections.forEach(section_temp => {
      //looping the sub section
      this.processUniqueValue(section_temp);
    })


  }

  processValidation(section: Section) {
    //  this.validationErrors = [];
    let message_temp = '';
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

      let iCount = 1;
      elems_temp.forEach(elem_temp1 => {
        switch (sectionAttribute.ControlType) {
          case "text":
          case "textarea":
          case "tbltext":
          case "tbltextarea":
          case "tblnumber":

            let elem_temp2 = elem_temp1 as HTMLInputElement;
            if (elem_temp2 != null) {
              sectionAttribute.Validators.forEach(validator => {
                let msg = (section.ModelCollectionName == null) ? sectionAttribute.LabelName + ' is required' + (isCollection) ? sectionAttribute.LabelName + ' is required' + '' : '' : sectionAttribute.LabelName + ' is required' + (isCollection) ? sectionAttribute.LabelName + ' is required' + (' at position :' + iCount) : '';
                if (validator != null) {
                  if (validator.Maxlength < elem_temp2.value.length || validator.Minlength > elem_temp2.value.length) {
                    if (validator.Required == true) {
                      if (!this.validationErrors.includes(msg)) {
                        this.validationErrors.push(msg);
                      }
                    }
                  }
                }
              });
            }
            break;


          case "email":
            let elem_temp4 = elem_temp1 as HTMLInputElement;
            if (elem_temp4 != null) {
              sectionAttribute.Validators.forEach(validator => {
                let msg = (section.ModelCollectionName == null) ? sectionAttribute.LabelName + ' is required' + (isCollection) ? sectionAttribute.LabelName + ' is required' + '' : '' : sectionAttribute.LabelName + ' is required' + (isCollection) ? sectionAttribute.LabelName + ' is required' + (' at position :' + iCount) : '';

                if (validator != null) {
                  if (validator.Maxlength <= elem_temp4.value.length || validator.Minlength > elem_temp4.value.length) {
                    if (validator.Required == true) {
                      if (!this.validationErrors.includes(msg)) {
                        this.validationErrors.push(msg);
                      }
                    }
                  } else {
                    let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                    let emailData = "";
                    if (reg.test(elem_temp4.value) == false) {
                      emailData = 'Please enter valid ' + sectionAttribute.LabelName;
                      if (!this.validationErrors.includes(emailData)) {
                        this.validationErrors.push(emailData);
                      }
                    }
                  }
                }
              });
            }
            break;
          case "select":
          case "tblselect":
            let elem_temp_select = elem_temp1 as HTMLSelectElement;

            let value = (elem_temp_select.options != null && elem_temp_select.options.length > 0) ? elem_temp_select.options[elem_temp_select.selectedIndex].value : "0";
            sectionAttribute.Validators.forEach(validator => {
              if (value == "0" && validator.Required == true) {
                let msg = (section.ModelCollectionName == null) ? sectionAttribute.LabelName + ' is required' + (isCollection) ? sectionAttribute.LabelName + ' is required' + '' : '' : sectionAttribute.LabelName + ' is required' + (isCollection) ? sectionAttribute.LabelName + ' is required' + (' at position :' + iCount) : '';

                //add to the validationArray;
                if (validator.Required == true) {
                  if (!this.validationErrors.includes(msg)) {
                    this.validationErrors.push(msg);
                  }
                }
              }
            });


            break;
          case "file":
          case "tblfile":
            let elem_file = elem_temp1 as HTMLInputElement;
            let elem_file_value = elem_file.getAttribute('tag');
            if (elem_file_value == null || elem_file_value == '') {
              elem_temp1.setAttribute('tag', AppConstants.GENERAL.DEFAULT_GUID);
            }
            //let dateRange = // != null ? elem.value : "";
            break;
          case "date":
          case "datetime-local":
          case "tbldate":
            let elem = elem_temp1 as HTMLInputElement;
            let dateRange = elem != null ? elem.value : "";
            sectionAttribute.Validators.forEach(validator => {
              if (dateRange == "" && validator.Required == true) {
                let msg = (section.ModelCollectionName == null) ? sectionAttribute.LabelName + ' is required' + (isCollection) ? sectionAttribute.LabelName + ' is required' + '' : '' : sectionAttribute.LabelName + ' is required' + (isCollection) ? sectionAttribute.LabelName + ' is required' + (' at position :' + iCount) : '';

                //add to the validationArray;
                if (validator.Required == true) {
                  if (!this.validationErrors.includes(msg)) {
                    this.validationErrors.push(msg);
                  }
                }
              } else {
                if (validator.DateValidators != null) {
                  validator.DateValidators.forEach(dateValidator => {
                    if (dateValidator.isGlobalyAffectedControl == true) {
                      let controlRef = dateValidator.affectedControl != null ? document.getElementById(dateValidator.affectedControl) as HTMLInputElement : null;
                      if (controlRef != null) {
                        if (dateValidator.rule != null) {
                          let val_temp = this.compareDates(dateRange, controlRef.value, dateValidator.msg, dateValidator.rule, iCount);
                          if (val_temp != "") {
                            if (!this.validationErrors.includes(val_temp)) {
                              this.validationErrors.push(val_temp);
                            }
                          }
                        }
                      }
                    } else {
                      let reference_elements = elem.parentElement.parentElement.getElementsByClassName(dateValidator.affectedControl);
                      let controlRef = reference_elements[0] as HTMLInputElement;
                      if (controlRef != null) {
                        if (dateValidator.rule != null) {
                          let val_temp = this.compareDates(dateRange, controlRef.value, dateValidator.msg, dateValidator.rule, iCount);
                          if (val_temp != "") {
                            if (!this.validationErrors.includes(val_temp)) {
                              this.validationErrors.push(val_temp);
                            }
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
      this.processValidation(section_temp);
    })

  }

  compareDates(leftValue: string, rightValue: string, dateMsg: string, operationInString: string, position: number) {
    let dateValue: Boolean
    let msg = "";
    switch (operationInString) {
      case ">=":
        dateValue = Date.parse(leftValue) >= Date.parse(rightValue);
        if (dateValue == false) {
          msg = dateMsg + ' at position :' + position;
        }
        break;
      case "<=":
        dateValue = Date.parse(leftValue) <= Date.parse(rightValue);
        if (dateValue == false) {
          msg = dateMsg + ' at position :' + position;
        }
        break;

    }
    return msg;
  }



  //******************************************************SUBMIT ADD/EDIT FORM DATA ********************************/
  submitData() {
    if (this.formData != null) {
      let utilityService = this.utilityService;
      this.validationErrors = new Array<string>();

      this.formData.Sections.forEach(
        section => {

          this.processValidation(section);
          this.processUniqueValue(section);
        });


      //Check the validation array 
      let msg1 = '';
      if (this.validationErrors.length > 0) {

        this.validationErrors.forEach(item => {

          msg1 += '<br/>' + item + '<br/>'
        });
        this.toastr.error(msg1, 'Validation Error', { timeOut: 2000, progressBar: true, enableHtml: true });

        return false;
      }

      this.validationErrors = new Array<string>()
    };
    let path = window.location.pathname;
    let urlToCall = this.formData.EndPoint.EndpointAddress;
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
        urlToCall = urlToCall.slice(0, 9) + resValue.substring(0, resValue.length - 2);
      }
      icount++;
    }
    let hiddenCtrl = document.getElementById("hiddenId") as HTMLInputElement;
    let SampleMethodStageId = document.getElementById( AppConstants.GENERAL.HIDDEN_SAMPLE_ID) as HTMLInputElement;
    this.formData.EndPoint.EndpointAddress = urlToCall;
    let navigate = splittedValues[splittedValues.length - 2];
    let splited_id = parseInt(splittedValues[splittedValues.length - 1]);
    let id = (navigate == "sampleInitialization2") ? parseInt(hiddenCtrl.value) : (navigate == "sampleMethodStageReadings2") ? parseInt(SampleMethodStageId.value) : splited_id;
    let url = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress;
    let model2 = {};

    this.getObjectData(model2);   //This will populate all single object for main model
    this.getTableData(model2);
    //This will populate all array object(s) for main model
    let requestModel = {
      RequestGuid: this.utilityService.getUUID(),
      DataCollection: [model2]
    };
    if (this.validationErrors.length == 0) {
      if (id != 0) {
        this.utilityService.putDataToService(url, id, requestModel).subscribe(data => {
          $(modalLoader()).hide();
          if (data.status = 200 || 204) {
            this.router.navigate([navigate]);
            this.toastr.success('Data Submitted Successfully', 'Success',
              { timeOut: 2000 });
            if (this.formData.GotoBack == true) {
              this.backData();
            }
          }
        }, (error) => {
          // console.error('error caught in component')
          switch (error.status) {

            case 500:
              this.toastr.error(error.message, 'Error', { timeOut: 4000 })
              break;
            case 401:
              this.toastr.error(error.message, 'Error', { timeOut: 4000 })
              break;
            case 404:
              this.toastr.warning('No Records', 'Warning', { timeOut: 4000 })
              break;
            case 400:
            case 409:
              this.toastr.warning(error.message, 'Warning', { timeOut: 4000 })
              break;

            default:
              this.toastr.warning(error.message, 'Warning', { timeOut: 4000 })
              break;
          }
          throw error;
        });
      } else {
        this.utilityService.postDataToService(url, requestModel).subscribe(data => {
          //  this.router.navigate([navigate]);
          $(modalLoader()).hide();
          this.toastr.success('Data Submitted Successfully', 'Success',
            { timeOut: 2000 });
          if (this.formData.GotoBack == true) {
            this.backData();
          }

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

    }
    this.removeStorageData();
    return true;
  }
  /*---------------------------this populate child object data like adress  Data ----------------------------------------------*/
  getObjectData(modelTemp1: any, isSet: boolean = false) {
    /*We need to scan the section which are of type 'object' and populate modelTemp's prop as per ModelProp 'ModelObjectName'*/
    let modelPropName = '';
    modelTemp1 = modelTemp1 == null ? {} : modelTemp1;

    this.formData.Sections.forEach(
      section => {
        if (section.ModelObjectName != null) {
          modelPropName = section.ModelObjectName;
          let obj = (isSet) ? modelTemp1[modelPropName] : {};

          section.SectionAttributes.forEach(sectionAttribute => {
            switch (sectionAttribute.ControlType) {
              // TEXTBOX ADD/EDIT FORM DATA
              case "text": {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                if (elem != null) {
                  if (isSet)
                    elem.value = obj[sectionAttribute.ModelPropName];
                  else {
                    obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.value, sectionAttribute);;
                  }
                }
              }

                break;
              case "checkbox": {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                if (elem != null) {
                  if (isSet)
                    elem.checked = obj[sectionAttribute.ModelPropName];
                  else {
                    obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.checked, sectionAttribute);
                  }

                }

              }
                break;
              case "typoselect": {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                if (elem != null) {
                  if (isSet)
                    elem.value = obj[sectionAttribute.ModelPropName];
                  else {
                    obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.value, sectionAttribute);;
                  }

                  if (sectionAttribute.ReadFromTag == true) {
                    let tagValue = elem.getAttribute('tag');
                    if (tagValue != null) {
                      let addEditTagValue = parseInt(tagValue);
                      obj[sectionAttribute.ModelPropName2] = addEditTagValue;
                    } else {
                      if (isSet) {
                        let setTagValue = obj[sectionAttribute.ModelPropName2];
                        elem.setAttribute('tag', setTagValue);
                      }
                    }
                  }
                }
              }

                break;


              case "file": {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                if (elem != null) {
                  if (isSet)
                    elem.setAttribute('tag', obj[sectionAttribute.ModelPropName]);
                  else {
                    obj[sectionAttribute.ModelPropName] = elem.getAttribute('tag');

                    if (sectionAttribute.SecondaryEntity != null) {
                      switch (sectionAttribute.SecondaryEntity.ControlProperty) {
                        case "Value":
                          var fileControl = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;
                          if ($(fileControl).val()['length'] > 0) {
                            var fileName = $(fileControl).val().toString().substring($(fileControl).val().toString().lastIndexOf("\\") + 1, $(fileControl).val()['length']);
                            obj[sectionAttribute.SecondaryEntity.ModelPropName] = fileName;
                          }
                          break;
                        default:
                          break;
                      }
                    }
                    //obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.value, sectionAttribute);;
                  }
                }
              }

                break;
              case "textarea": {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                if (elem != null) {
                  if (isSet)
                    elem.value = obj[sectionAttribute.ModelPropName];
                  else {
                    obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.value, sectionAttribute);;
                  }
                }
              }

                break;

              case "json": {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                if (elem != null && elem.value != "") {
                  if (isSet) {
                    let currentValue = JSON.stringify(elem.value);
                    currentValue = obj[sectionAttribute.ModelPropName];
                  } else {
                    obj[sectionAttribute.ModelPropName] = JSON.parse(elem.value);
                  }
                }
              }

                break;

              case "email": {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                if (elem != null) {
                  if (isSet)
                    elem.value = obj[sectionAttribute.ModelPropName];
                  else {
                    obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.value, sectionAttribute);;
                  }
                }
              }

                break;
              case "number": {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                if (elem != null) {
                  if (isSet)
                    elem.value = obj[sectionAttribute.ModelPropName];
                  else {
                    obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.value, sectionAttribute);
                  }
                }
              }
               break;
              case "hidden": {
                if (sectionAttribute.ControlName == "hiddenEntitystate") {
                  let elem = document.getElementById("hiddenId") as HTMLInputElement;

                  if (elem != null) {
                    //Here compare objects of previous and current using object comparer and then set 1

                    if (isSet) {
                      elem.value = obj[sectionAttribute.ModelPropName];
                    }
                    else {
                      if (elem.value == "0") {
                        let rawData = "1";
                        obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(rawData, sectionAttribute);
                      } else {
                        let rawData = "2";
                        obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(rawData, sectionAttribute);
                      }
                    }
                  }
                } else if (sectionAttribute.ControlName == AppConstants.COMMON.COMMON_AUTO_OFF_SET) {

                  let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                  if (elem != null) {
                    //Here compare objects of previous and current using object comparer and then set 1

                    if (isSet) {
                      elem.value = obj[sectionAttribute.ModelPropName];
                    }
                    else {
                      let rawData = new Date().getTimezoneOffset();
                      obj[sectionAttribute.ModelPropName] = rawData;
                    }
                  }

                }
                else {
                  let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;
                  if (elem != null) {
                    if (isSet) {
                      elem.value = obj[sectionAttribute.ModelPropName];
                    }
                    else {
                      obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.value, sectionAttribute);
                    }
                  }
                }
              }
                break;
              case "select": {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLSelectElement;
                if (elem != null && elem.options.length > 0) {
                  if (isSet) {

                    for (let i = 0; i < elem.options.length; i++) {
                      if (elem.options[i].value != null && obj[sectionAttribute.ModelPropName] != null &&
                        elem.options[i].value.toString() === obj[sectionAttribute.ModelPropName].toString()) {
                        elem.selectedIndex = i;
                        break;
                      }
                    }
                  }
                  else {
                    obj[sectionAttribute.ModelPropName] =
                      this.utilityService.getObjectTypeCastedData(elem.options[elem.selectedIndex].value, sectionAttribute);
                  }
                }
              }
                break;


              case "selectMultiple":
                let elem9 = document.getElementById(sectionAttribute.ControlName) as HTMLSelectElement;
                if (!isSet) {
                  let str = '';
                  let positiveCounter = 0;
                  for (let i = 0; i < elem9.options.length; i++) {
                    if (elem9.options[i].selected && elem9.options[i].text.toLowerCase() != 'select') {
                      if (positiveCounter > 0) {
                        str += ',';
                      }
                      str += elem9.options[i].value;
                      positiveCounter++;
                    }
                  }
                  obj[sectionAttribute.ModelPropName] = str;
                }
                break;
              case "date":
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;
                if (!isSet) {
                  obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.value, sectionAttribute);
                }
                break;

              case "datetime-local":
                let elem4 = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;
                if (!isSet) {
                  obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem4.value, sectionAttribute);
                }
                break;
            }
          });
          if (!isSet)
            modelTemp1[modelPropName] = obj;
          return;
        }
        else {
          section.SectionAttributes.forEach(sectionAttribute => {
            switch (sectionAttribute.ControlType) {
              // TEXTBOX ADD/EDIT FORM DATA
              case "text": {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                if (elem != null) {
                  if (isSet)
                    elem.value = modelTemp1[sectionAttribute.ModelPropName];
                  else {
                    modelTemp1[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.value, sectionAttribute);
                  }
                }
              }
                break;

              case "typoselect": {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                if (elem != null) {
                  if (isSet)
                    elem.value = modelTemp1[sectionAttribute.ModelPropName];
                  else {
                    modelTemp1[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.value, sectionAttribute);;
                  }

                  if (sectionAttribute.ReadFromTag == true) {
                    let tagValue = elem.getAttribute('tag');
                    if (tagValue != null) {
                      let addEditTagValue = parseInt(tagValue);
                      modelTemp1[sectionAttribute.ModelPropName2] = addEditTagValue;
                    } else {
                      if (isSet) {
                        let setTagValue = modelTemp1[sectionAttribute.ModelPropName2];
                        elem.setAttribute('tag', setTagValue);
                      }
                    }
                  }
                }
              }

                break;
              case "file": {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                if (elem != null) {
                  if (isSet)
                    elem.setAttribute('tag', modelTemp1[sectionAttribute.ModelPropName]);
                  else {
                    let tagValue = elem.getAttribute('tag');
                    let patternToMatch = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/; //this Regex pattern check AddressGuid
                    if (tagValue.match(patternToMatch) != null) {
                      modelTemp1[sectionAttribute.ModelPropName] = tagValue;
                    } else {
                      let tagValue = AppConstants.GENERAL.DEFAULT_GUID
                      modelTemp1[sectionAttribute.ModelPropName] = tagValue;
                    }

                    if (sectionAttribute.SecondaryEntity != null) {
                      switch (sectionAttribute.SecondaryEntity.ControlProperty) {
                        case "Value":
                          var fileControl = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;
                          if ($(fileControl).val()['length'] > 0) {
                            var fileName = $(fileControl).val().toString().substring($(fileControl).val().toString().lastIndexOf("\\") + 1, $(fileControl).val()['length']).toString();
                            modelTemp1[sectionAttribute.SecondaryEntity.ModelPropName] = fileName;
                          }
                          else {
                            let label_for_file = document.getElementById("label_" + sectionAttribute.ControlName) as HTMLLabelElement;
                            if (label_for_file != null) {
                              modelTemp1[sectionAttribute.SecondaryEntity.ModelPropName] = label_for_file.textContent;
                            }
                          }
                          break;
                        default:
                          break;
                      }
                    }
                    //obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.value, sectionAttribute);;
                  }
                }
              }

                break;
              case "textarea": {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                if (elem != null) {
                  if (isSet)
                    elem.value = modelTemp1[sectionAttribute.ModelPropName];
                  else {
                    modelTemp1[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.value, sectionAttribute);
                  }
                }
              }
                break;

              case "json": {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                if (elem != null) {
                  if (isSet) {
                    let currentValue = JSON.stringify(elem.value);
                    currentValue = modelTemp1[sectionAttribute.ModelPropName];
                  } else {
                    modelTemp1[sectionAttribute.ModelPropName] = JSON.parse(elem.value);
                  }
                }
              }
                break;

              case "email": {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                if (elem != null) {
                  if (isSet)
                    elem.value = modelTemp1[sectionAttribute.ModelPropName];
                  else {
                    modelTemp1[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.value, sectionAttribute);
                  }
                }
              }
                break;

              case "checkbox": {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                if (elem != null) {
                  if (isSet)
                    elem.checked = modelTemp1[sectionAttribute.ModelPropName];
                  else {
                    modelTemp1[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.checked, sectionAttribute);
                  }

                }

              }

                break;

              case "number": {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                if (elem != null) {
                  if (isSet)
                    elem.value = modelTemp1[sectionAttribute.ModelPropName];
                  else {
                    modelTemp1[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.value, sectionAttribute);
                  }
                }
              }
                break;
              case "hidden": {
                if (sectionAttribute.ControlName == "hiddenEntitystate") {

                  let elem = document.getElementById("hiddenId") as HTMLInputElement;

                  if (elem != null) {

                    if (isSet) {
                      elem.value = modelTemp1[sectionAttribute.ModelPropName];
                    }
                    else {
                      if (elem.value == "0") {
                        let rawData = "1";
                        modelTemp1[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(rawData, sectionAttribute);
                      } else {
                        let rawData = "2";
                        modelTemp1[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(rawData, sectionAttribute);
                      }
                    }
                  }

                } else if (sectionAttribute.ControlName == AppConstants.COMMON.COMMON_AUTO_OFF_SET) {

                  let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                  if (elem != null) {
                    //Here compare objects of previous and current using object comparer and then set 1

                    if (isSet) {
                      elem.value = modelTemp1[sectionAttribute.ModelPropName];
                    }
                    else {
                      modelTemp1[sectionAttribute.ModelPropName] = new Date().getTimezoneOffset();
                    }
                  }

                } else {
                  let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                  if (elem != null) {
                    if (isSet) {
                      elem.value = modelTemp1[sectionAttribute.ModelPropName];
                    }
                    else {
                      modelTemp1[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.value, sectionAttribute);;
                    }
                  }
                }
              }
                break;
              case "select": {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLSelectElement;

                if (isSet) {
                  //&& elem.selectedIndex <= 0
                  if (elem != null && elem.options.length > 0) {
                    //find the index that has the value 'obj[sectionAttribute.ModelPropName]' then make that index as selected
                    for (let i = 0; i < elem.options.length; i++) {
                      // if (elem.options[elem.selectedIndex].value.toString() == modelTemp1[sectionAttribute.ModelPropName].toString()) {
                      if (elem.options[i].value != null && modelTemp1[sectionAttribute.ModelPropName] != null &&
                        elem.options[i].value.toString() === modelTemp1[sectionAttribute.ModelPropName].toString()) {
                        elem.selectedIndex = i;
                        break;
                      }
                    }
                  }
                }
                else {
                  if (elem != null && elem.options.length > 0) {
                    modelTemp1[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.options[elem.selectedIndex].value, sectionAttribute);;
                  }
                }
              }
                break;
              case "selectMultiple":
                let elem9 = document.getElementById(sectionAttribute.ControlName) as HTMLSelectElement;
                if (!isSet) {
                  let str = '';
                  let positiveCounter = 0;
                  for (let i = 0; i < elem9.options.length; i++) {
                    if (elem9.options[i].selected && elem9.options[i].text.toLowerCase() != 'select') {
                      if (positiveCounter > 0) {
                        str += ',';
                      }
                      str += elem9.options[i].value;
                      positiveCounter++;
                    }
                  }
                  modelTemp1[sectionAttribute.ModelPropName] = str;
                }
                break;
              case "datetime-local":
                let elem1 = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;
                if (!isSet) {

                  modelTemp1[sectionAttribute.ModelPropName] = new Date(elem1.value);
                }
                break;


              case "date":
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLSelectElement;
                if (!isSet) {

                  modelTemp1[sectionAttribute.ModelPropName] = new Date(elem.value);
                }
                break;

            }

          });
        }
      });
  }

  envirementEntityState(modelTemp1: any) {
    this.model2.forEach(moduleData => {
      moduleData
    });
  }
  //------------------------------------- GET ADD/EDIT FORM DATA-------------------------------------------------- 
  getTableData(modelTemp: any) {

    let path = window.location.pathname;
    let splittedValues = path.split('/');
    let splittedName = splittedValues[2].toLowerCase();

    switch (splittedName) {

      case "sampleinitialization2":
        let tblArray = [];
        let rowVersions = [];
        let inputColumnNumbers = [];
        let samplemethodstageids = [];
        let methodStageGridColumnIds = [];
        let totalRecords = [];
        let stageId = "";
        let methodId = "";
        $("#sampleInitialization2Table tr th").each(function (index) {
          let th = $(this)[0];
          if (th.innerHTML != "Delete" && th.innerHTML != "↑" && th.innerHTML != "↓" && th.innerHTML != "RN" && th.innerHTML != "RP") {

            let sampleMethodStageId = th.getAttribute(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID);
            let methodStageGridColumnId = th.getAttribute(AppConstants.COMMON.COMMON_METHOD_STAGE_GRID_COLUMN_ID);
            stageId = th.getAttribute(AppConstants.COMMON.COMMON_STAGE_ID);
            methodId = th.getAttribute(AppConstants.COMMON.COMMON_METHOD_ID);
            let rowVersion = th.getAttribute(AppConstants.COMMON.COMMON_ROWVERSION);
            let totalRecord = th.getAttribute(AppConstants.COMMON.COMMON_TOTAL_RECORDS);
            rowVersions.push(rowVersion);
            inputColumnNumbers.push(index);
            samplemethodstageids.push(parseInt(sampleMethodStageId));
            methodStageGridColumnIds.push(parseInt(methodStageGridColumnId));
            totalRecords.push(totalRecord);
          }
        });


        for (let i = 0; i < inputColumnNumbers.length; i++) {
          let tblchildArray = [];
          let obj = {};

          $("#sampleInitialization2Table tr:gt(0)").each(function (index1) {
            let child_obj = {};
            let currentTr = $(this)[0];
            let contextualTd = $(currentTr).find('td:eq(' + inputColumnNumbers[i] + ')');

            //take the value from child textbox
            let currentTextBox = contextualTd[0].children[0];
            // if (currentTextBox.value != "") {
            let sampleMethodStageId = currentTextBox.getAttribute(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID);
            let currentId = currentTextBox.getAttribute(AppConstants.COMMON.COMMON_TABLE_ID);
            child_obj[AppConstants.COMMON.ID] = (currentId == null || parseInt(currentId) == 0 || currentId == "undefined") ? 0 : parseInt(currentId);
            child_obj[AppConstants.COMMON.COMMON_ENTITY_STATE] = (currentId == null || parseInt(currentId) == 0 || currentId == "undefined") ? 1 : 2;
            child_obj[AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID] = parseInt(sampleMethodStageId);
            child_obj[AppConstants.COMMON.COMMON_ROW] = index1;
            child_obj[AppConstants.COMMON.COMMON_COLUMN] = inputColumnNumbers[i];
            child_obj[AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_COLUMN_VALUE] = currentTextBox['value'];
            // }
            tblchildArray.push(child_obj);

          });

          let collectionAssignment = (this.model != null && this.model[AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGES] != null) ?
            this.model[AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGES] as Array<any> : null;

          //set EntityState data get time for new record update record and delete record for sampleInitialization2Table page   

          if (collectionAssignment != null && collectionAssignment.length > 0) {

            let finalCollection = [];
            let sampleMethodStageReading = this.model[AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGES][i]["SampleMethodStageReadings"];
            if (sampleMethodStageReading.length > 0) {
              sampleMethodStageReading.forEach(item => {

                let recordsWithId0 = tblchildArray.filter(t => t[AppConstants.COMMON.ID] == "0" || t[AppConstants.COMMON.ID] == 0);
                let existingRecords = tblchildArray.filter(t => t[AppConstants.COMMON.ID] == item.Id);

                if (existingRecords == null || existingRecords.length == 0) {
                  finalCollection.push({
                    Id: item.Id,
                    EntityState: 3,
                    RowVersion: item[AppConstants.COMMON.COMMON_ROWVERSION]

                  });
                } else if (existingRecords != null || existingRecords.length > 0) {
                  let item_temp = existingRecords[0];
                  let keys = Object.keys(item_temp);
                  let values = Object.values(item_temp);
                  let item_to_push = {};

                  for (let i = 0; i < values.length; i++) {
                    item_to_push[keys[i]] = values[i];
                  }
                  item_to_push[AppConstants.COMMON.COMMON_ENTITY_STATE] = 2;
                  finalCollection.push(item_to_push);
                }

                recordsWithId0.forEach(item => {
                  item[AppConstants.COMMON.COMMON_ENTITY_STATE] = 1;
                  finalCollection.push(item);
                });

              });
            }
            else {
              finalCollection = tblchildArray;
            }

            let totalRows = $("#sampleInitialization2Table tr:gt(0)").length;
            obj[AppConstants.COMMON.ID] = samplemethodstageids[i];
            obj[AppConstants.COMMON.COMMON_METHOD_STAGE_GRID_COLUMN_ID] = methodStageGridColumnIds[i];
            obj[AppConstants.COMMON.COMMON_ENTITY_STATE] = 2;
            obj[AppConstants.COMMON.COMMON_METHOD_ID] = methodId;
            obj[AppConstants.COMMON.COMMON_STAGE_ID] = stageId;
            obj[AppConstants.COMMON.COMMON_ROWVERSION] = rowVersions[i];
            obj[AppConstants.COMMON.COMMON_NO_OF_ROWS] = (totalRows != null) ? totalRows : totalRecords[i];
            obj[AppConstants.COMMON.SAMPLE_METHOD_STAGE_READINGS] = finalCollection;
            tblArray.push(obj);
          }
        }

        modelTemp[AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGES] = tblArray;
        break;
      case "samplemethodstagereadings2":
        let tblArray1 = [];
        let rowVersions1 = [];
        let inputColumnNumbers1 = [];
        let samplemethodstageids1 = [];
        let methodStageGridColumnIds1 = [];

        $("#SampleMethodStageReadings2 tr th").each(function (index) {
          let th = $(this)[0];
          //   if (th.getAttribute(AppConstants.COMMON.COMMON_IS_INPUT) == "true" && (th.getAttribute(AppConstants.COMMON.COMMON_IS_TEXT) == "false" ||th.getAttribute(AppConstants.COMMON.COMMON_IS_TEXT) == "true")) {
          if (((th.getAttribute(AppConstants.COMMON.COMMON_FORMULAE) != "     " && th.getAttribute(AppConstants.COMMON.COMMON_FORMULAE) != "" && th.getAttribute(AppConstants.COMMON.COMMON_FORMULAE) != null) || th.getAttribute(AppConstants.COMMON.COMMON_IS_INPUT) == "true" || th.getAttribute(AppConstants.COMMON.COMMON_IS_TEXT) == "true") || (th.getAttribute(AppConstants.COMMON.COMMON_IS_TEXT) != "true" && th.getAttribute(AppConstants.COMMON.COMMON_IS_INPUT) != "true" && th.getAttribute(AppConstants.COMMON.COMMON_IS_RUNNING_NUMBER) != "true" && th.getAttribute(AppConstants.COMMON.COMMON_IS_REPEAT) != "true" && th.getAttribute(AppConstants.COMMON.COMMON_IS_SCAN) != "true")) {

            let sampleMethodStageId = th.getAttribute(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID);
            let methodStageGridColumnId = th.getAttribute(AppConstants.COMMON.COMMON_METHOD_STAGE_GRID_COLUMN_ID);
            let rowVersion = th.getAttribute(AppConstants.COMMON.COMMON_ROWVERSION);
            rowVersions1.push(rowVersion);
            inputColumnNumbers1.push(index);
            samplemethodstageids1.push(parseInt(sampleMethodStageId));
            methodStageGridColumnIds1.push(parseInt(methodStageGridColumnId));
          }
        });

        for (let i = 0; i < inputColumnNumbers1.length; i++) {
          let tblchildArray = [];
          let obj = {};
          $("#SampleMethodStageReadings2 tr:gt(0)").each(function (index1) {
            let child_obj = {};
            let currentTr = $(this)[0];
            let contextualTd = $(currentTr).find('td:eq(' + inputColumnNumbers1[i] + ')');
            //take the value from child textbox


            let currentTextBox;
            currentTextBox = contextualTd[0].children[0] != undefined ? contextualTd[0].children[0] : contextualTd[0];


            if (currentTextBox.innerHTML != "") {
              let currentTblId = currentTextBox.id;
              let splitted_value11 = currentTblId.split('_');
              let current_tbl_row = parseInt(splitted_value11[splitted_value11.length - 2]);
              let sampleMethodStageId = currentTextBox.getAttribute(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID);
              let tableId = currentTextBox.getAttribute(AppConstants.COMMON.COMMON_TABLE_ID);

              child_obj[AppConstants.COMMON.ID] = (tableId != null) ? parseInt(tableId) : 0;
              // child_obj[AppConstants.COMMON.COMMON_SAMPLE_ID] = samplemethodstageids1[i];
              child_obj[AppConstants.COMMON.COMMON_ENTITY_STATE] = (tableId != null) ? 2 : 1;
              child_obj[AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID] = parseInt(sampleMethodStageId);
              child_obj[AppConstants.COMMON.COMMON_ROW] = current_tbl_row;
              child_obj[AppConstants.COMMON.COMMON_COLUMN] = inputColumnNumbers1[i];
              child_obj[AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_COLUMN_VALUE] = currentTextBox.innerHTML;

            } else if (currentTextBox.value != "") {
              let currentTblId = currentTextBox.id;
              let splitted_value11 = currentTblId.split('_');
              let current_tbl_row = parseInt(splitted_value11[splitted_value11.length - 2]);
              let sampleMethodStageId = currentTextBox.getAttribute(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID);
              let tableId = currentTextBox.getAttribute(AppConstants.COMMON.COMMON_TABLE_ID);
              child_obj[AppConstants.COMMON.ID] = (tableId != null) ? parseInt(tableId) : 0;
              //  child_obj[AppConstants.COMMON.COMMON_SAMPLE_ID] = samplemethodstageids1[i];
              child_obj[AppConstants.COMMON.COMMON_ENTITY_STATE] = (tableId != null) ? 2 : 1;
              child_obj[AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_ID] = parseInt(sampleMethodStageId);
              child_obj[AppConstants.COMMON.COMMON_ROW] = current_tbl_row;
              child_obj[AppConstants.COMMON.COMMON_COLUMN] = inputColumnNumbers1[i];
              child_obj[AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_COLUMN_VALUE] = currentTextBox.value;
            }
            tblchildArray.push(child_obj);
          });

          obj[AppConstants.COMMON.ID] = samplemethodstageids1[i];
          obj[AppConstants.COMMON.COMMON_METHOD_STAGE_GRID_COLUMN_ID] = methodStageGridColumnIds1[i];
          obj[AppConstants.COMMON.COMMON_ENTITY_STATE] = 2;
          obj[AppConstants.COMMON.COMMON_ROWVERSION] = rowVersions1[i]
          obj[AppConstants.COMMON.SAMPLE_METHOD_STAGE_READINGS] = tblchildArray;
          tblArray1.push(obj);

        }
        modelTemp[AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGES] = tblArray1;
        break;
      case "instrumentcalibrationsets":
        this.formData.Sections.forEach(
          section => {
            section.SubSections.forEach(subSection => {
              let section_temp = sessionStorage.getItem('dynamicSection_InstrumentCalibrationSetDetails') != null ?
                JSON.parse(sessionStorage.getItem('dynamicSection_InstrumentCalibrationSetDetails')) as Section : subSection;
              let tblArray = [];
              //loop table rows
              $("#InstrumentCalibrationSetDetails tr").each(function () {
                let tr = $(this)[0];
                let column = $(tr).children('td');
                if (column != null && column.length > 0) {
                  for (let col = 2; col < column.length; col++) {
                    let obj = {};
                    let currentId = column[col].id;
                    let patternToMatch = /Observed_[0-9_]*/g;
                    let result = currentId.match(patternToMatch);
                    if (result != null) {
                      obj[AppConstants.COMMON.COMMON_TD_ID] = currentId;
                      obj[AppConstants.COMMON.COMMON_PREDEFINED_WEIGHT] = column[col].getAttribute('tag');
                      let idRef = document.getElementById(currentId) as HTMLTableElement;
                      //float Number
                      let updateValue = parseFloat(idRef.innerText);
                      obj[AppConstants.COMMON.COMMON_OBSERVED_WEIGHT] = (idRef.innerText == "") ? 0.0000 : updateValue;
                      let special_rowversion_value = idRef.getAttribute(AppConstants.COMMON.COMMON_SPECIAL_ROWVERSION);
                      let id_tagValue = idRef.getAttribute(AppConstants.COMMON.COMMON_SPECIAL_ID);
                      //Edit case
                      if (special_rowversion_value != null && id_tagValue != null) {
                        //number
                        obj[AppConstants.COMMON.ID] = parseInt(id_tagValue);
                        obj[AppConstants.COMMON.COMMON_ROWVERSION] = special_rowversion_value;
                        obj[AppConstants.COMMON.COMMON_ENTITY_STATE] = 2;
                      }
                      tblArray.push(obj);

                    }
                  }
                }
              });

              var rowCount = $('#InstrumentCalibrationSetDetails tr').length - 2;
              let avgCtrl = document.getElementById(AppConstants.COMMON.COMMON_INSTRUMENT_CALIBRATION_SET_DETAILS) as HTMLTableElement;
              let columnForAvg = avgCtrl.rows[rowCount].cells;
              if (columnForAvg != null && columnForAvg.length > 0) {
                for (let col = 1; col < columnForAvg.length; col++) {
                  let obj = {};
                  let currentId = columnForAvg[col].id;
                  obj[AppConstants.COMMON.COMMON_TD_ID] = currentId;
                  let averageCol = document.getElementById(currentId);
                  let avgValue = averageCol.innerText;
                  let patternToMatch = /[0-9]*/g;
                  let result = avgValue.match(patternToMatch);
                  obj['Average'] = result[0];
                  tblArray.push(obj);
                }
              }

              var rowCount = $('#InstrumentCalibrationSetDetails tr').length - 1;
              let rsdCtrl = document.getElementById(AppConstants.COMMON.COMMON_INSTRUMENT_CALIBRATION_SET_DETAILS) as HTMLTableElement;
              let columnForRSD = rsdCtrl.rows[rowCount].cells;
              if (columnForRSD != null && columnForRSD.length > 0) {
                for (let col = 1; col < columnForRSD.length; col++) {
                  let obj = {};
                  let currentId = columnForRSD[col].id;
                  obj[AppConstants.COMMON.COMMON_TD_ID] = currentId;
                  let rsdCol = document.getElementById(currentId);
                  let rsdValue = rsdCol.innerText;
                  let patternToMatch = /[0-9]*/g;
                  let result = rsdValue.match(patternToMatch);
                  obj['RSD'] = result[0];
                  tblArray.push(obj);

                }
              }

              if (section_temp.ModelCollectionName != null && subSection.ModelCollectionName != undefined) {
                modelTemp[section_temp.ModelCollectionName] = tblArray;
              }
            });
          });
        break;
      default:
        this.formData.Sections.forEach(
          section => {
            section.SubSections.forEach(subSection => {

              let section_temp = sessionStorage.getItem('dynamicSection_' + subSection.SectionName) != null ?
                JSON.parse(sessionStorage.getItem('dynamicSection_' + subSection.SectionName)) as Section : subSection;
              //GET TABLE ID
              let tableId = document.getElementById(section_temp.SectionName) as HTMLTableElement;

              if (tableId != null) {
                let iCount = 0;
                let outputData = [];

                let len = tableId.rows.length;
                for (let i = 1; i < len; i++) {
                  let tr1 = tableId.rows[i];
                  let subArray = [];

                  //Get ref of existing object to compare if the object underwent change then set to 2 (update) or 0 (unchangeed) or 3 (if deleted)
                  //let currentObject = modelTemp

                  section_temp.SectionAttributes.forEach(sectionAttribute => {
                    if (tr1 != null) {
                      let elems = tr1.getElementsByClassName(sectionAttribute.ControlName);
                      switch (sectionAttribute.ControlType) {
                        // TEXTBOX ADD/EDIT FORM DATA

                        case "tbltd": {
                          if (elems != null && elems.length > 0) {
                            let tdConfig = elems[0].id.includes(sectionAttribute.ModelPropName);
                            if (tdConfig == true) {
                              let currentTd = document.getElementById(elems[0].id) as HTMLTableCellElement;
                              let updateValue = parseFloat(currentTd.innerText);
                              subArray.push('"' + sectionAttribute.ModelPropName + '":' + updateValue);
                            }

                          }
                        }
                          break;
                        case "tbltext": {
                          if (elems != null && elems.length > 0) {
                            let tblText = elems[0] as HTMLInputElement;
                            let processedModelData = this.utilityService.getObjectTypeCastedData(tblText.value, sectionAttribute);
                            if (sectionAttribute.ModelPropType != null && (sectionAttribute.ModelPropType == "number" || sectionAttribute.ModelPropType == "float")) {
                              subArray.push('"' + sectionAttribute.ModelPropName + '":' + processedModelData);
                            }
                            else {
                              subArray.push('"' + sectionAttribute.ModelPropName + '":"' + processedModelData + '"');
                            }

                          }
                        }
                          break;

                        case "tblnumber": {
                          if (elems != null && elems.length > 0) {
                            let tblText = elems[0] as HTMLInputElement;
                            let processedModelData = this.utilityService.getObjectTypeCastedData(tblText.value, sectionAttribute);
                            if (sectionAttribute.ModelPropType != null && (sectionAttribute.ModelPropType == "number" || sectionAttribute.ModelPropType == "float")) {
                              subArray.push('"' + sectionAttribute.ModelPropName + '":' + processedModelData);
                            }
                            else {
                              subArray.push('"' + sectionAttribute.ModelPropName + '":"' + processedModelData + '"');
                            }

                          }
                        }
                          break;

                        case "tbltyposelect": {
                          if (elems != null && elems.length > 0) {
                            let tblText = elems[0] as HTMLInputElement;
                            let processedModelData = this.utilityService.getObjectTypeCastedData(tblText.value, sectionAttribute);
                            if (sectionAttribute.ModelPropType != null && (sectionAttribute.ModelPropType == "number" || sectionAttribute.ModelPropType == "float")) {
                              subArray.push('"' + sectionAttribute.ModelPropName + '":' + processedModelData);
                            }
                            else {
                              subArray.push('"' + sectionAttribute.ModelPropName + '":"' + processedModelData + '"');

                            }


                            // let input_temp = $(tblText).parent();
                            // let nodes = $(input_temp).find('input');
                            // let input_tag_value = nodes[0].getAttribute('tag');
                            // let affectedModelName = sectionAttribute.Events.filter(t => t.affectedControlModelName != null)

                            // subArray.push('"' + affectedModelName[0].affectedControlModelName + '":' + parseInt(input_tag_value));


                          }
                        }
                          break;
                        case "tbltypomultiselect": {
                          if (elems != null && elems.length > 0) {
                            let tblmultiSelect = elems[0] as HTMLInputElement;
                            let str = '';
                            let positiveCounter = 0;
                            if (tblmultiSelect != null) {
                              let div_temp = $(tblmultiSelect).parent().find('.divContainer');
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
                            subArray.push('"' + sectionAttribute.ModelPropName + '":"' + str + '"');

                          }
                        }
                          break;
                        case "tbltextbtn": {
                          if (elems != null && elems.length > 0) {
                            let tbltextbtn = elems[0] as HTMLInputElement;
                            let processedModelData = this.utilityService.getObjectTypeCastedData(tbltextbtn.value, sectionAttribute);
                            if (sectionAttribute.ModelPropType != null && (sectionAttribute.ModelPropType == "number" || sectionAttribute.ModelPropType == "float")) {
                              subArray.push('"' + sectionAttribute.ModelPropName + '":' + processedModelData);
                            }
                            else {
                              subArray.push('"' + sectionAttribute.ModelPropName + '":"' + processedModelData + '"');
                            }

                          }
                        }
                          break;
                        case "tbltextarea": {
                          if (elems != null && elems.length > 0) {
                            let tblText = elems[0] as HTMLInputElement;
                            let processedModelData = this.utilityService.getObjectTypeCastedData(tblText.value, sectionAttribute);
                            if (sectionAttribute.ModelPropType != null && (sectionAttribute.ModelPropType == "number" || sectionAttribute.ModelPropType == "float")) {
                              subArray.push('"' + sectionAttribute.ModelPropName + '":' + processedModelData);
                            }
                            else {
                              subArray.push('"' + sectionAttribute.ModelPropName + '":"' + processedModelData + '"');
                            }

                          }
                        }
                          break;
                        case "tblselect": {
                          if (elems != null) {
                            let tblSelect = elems[0] as HTMLSelectElement;
                            let rawData = tblSelect.options[tblSelect.selectedIndex].value;
                            let processedModelData = this.utilityService.getObjectTypeCastedData(rawData, sectionAttribute);
                            if (sectionAttribute.ModelPropType != null && (sectionAttribute.ModelPropType == "number" || sectionAttribute.ModelPropType == "float")) {
                              subArray.push('"' + sectionAttribute.ModelPropName + '":' + processedModelData);
                            }
                            else {
                              subArray.push('"' + sectionAttribute.ModelPropName + '":"' + processedModelData + '"');
                            }
                          }
                        }
                          break;
                        case "tblhidden": {
                          if (elems != null && elems.length > 0) {
                            let hiddenTemp = elems[0] as HTMLInputElement;
                            let rawData = hiddenTemp.value;
                            //Check if the current Value is Ref type to be referred from Parent Id (eg. DivisionId in DivisionHoliday will refer to Id of Division)
                            let parentIdValue = null;
                            if (sectionAttribute.CurrentValue == "hiddenId") {
                              let hiddenIdField = document.getElementById(sectionAttribute.CurrentValue) as HTMLInputElement;
                              if (hiddenIdField != null) {
                                parentIdValue = this.utilityService.getObjectTypeCastedData(hiddenIdField.value, sectionAttribute);
                              }
                            }
                            let processedModelData = (parentIdValue != null) ? parentIdValue : this.utilityService.getObjectTypeCastedData(rawData, sectionAttribute);
                            if (sectionAttribute.ControlName == AppConstants.COMMON.COMMON_AUTO_OFF_SET && sectionAttribute.ModelPropType != null) {
                              subArray.push('"' + sectionAttribute.ModelPropName + '":' + new Date().getTimezoneOffset());
                            }
                            else {
                              if (sectionAttribute.ModelPropType != null && (sectionAttribute.ModelPropType == "number" || sectionAttribute.ModelPropType == "float")) {
                                subArray.push('"' + sectionAttribute.ModelPropName + '":' + processedModelData);
                              }
                              else {
                                if (sectionAttribute.ModelPropName == AppConstants.COMMON.COMMON_ROWVERSION && processedModelData != "") {
                                  subArray.push('"' + sectionAttribute.ModelPropName + '":"' + processedModelData + '"');
                                }
                                else if (sectionAttribute.ModelPropName != AppConstants.COMMON.COMMON_ROWVERSION) {
                                  subArray.push('"' + sectionAttribute.ModelPropName + '":"' + processedModelData + '"');
                                }
                              }
                            }

                          }
                        }
                          break;
                        // CHECKBOX ADD/EDIT FORM DATA
                        case "tblcheckbox": {
                          if (elems != null && elems.length > 0) {
                            let tblCheckBox = elems[0] as HTMLInputElement;
                            let processedModelData = this.utilityService.getObjectTypeCastedData(tblCheckBox.checked, sectionAttribute);
                            subArray.push('"' + sectionAttribute.ModelPropName + '":' + processedModelData);

                          }
                        }
                          break;
                        // DATE ADD/EDIT FORM DATA
                        case "tbldate":
                          {
                            if (elems != null && elems.length > 0) {
                              let tblDate = elems[0] as HTMLInputElement;
                              let processedModelData = this.utilityService.getObjectTypeCastedData(tblDate.value, sectionAttribute);
                              subArray.push('"' + sectionAttribute.ModelPropName + '":"' + processedModelData + '"');
                            }

                          }
                          break;
                        // DATE ADD/EDIT FORM DATA
                        case "tblfile":
                          {
                            if (elems != null && elems.length > 0) {
                              let elem = elems[0] as HTMLInputElement;
                              let guidValue = elem.getAttribute('tag');
                              subArray.push('"' + sectionAttribute.ModelPropName + '":"' + guidValue + '"');
                              if (sectionAttribute.SecondaryEntity != null) {
                                switch (sectionAttribute.SecondaryEntity.ControlProperty) {
                                  case "Value":
                                    var fileControl = elems[0] as HTMLInputElement;
                                    if ($(fileControl).val()['length'] > 0) {
                                      var fileName = $(fileControl).val().toString().substring($(fileControl).val().toString().lastIndexOf("\\") + 1, $(fileControl).val()['length']);
                                      subArray.push('"' + sectionAttribute.SecondaryEntity.ModelPropName + '":"' + fileName + '"');
                                    }
                                    else {
                                      subArray.push('"' + sectionAttribute.SecondaryEntity.ModelPropName + '":"' + $(fileControl).val() + '"');
                                    }
                                    break;
                                  default:
                                    break;
                                }
                              }
                            }

                          }
                          break;

                        default:
                          {
                            let elems1 = tr1.getElementsByClassName(AppConstants.COMMON.COMMON_LATTITUDE);
                            if (elems1 != null && elems1.length > 0) {
                              let elem1 = elems1[0] as HTMLInputElement;
                              elem1.value
                            }

                            let elems2 = tr1.getElementsByClassName(AppConstants.COMMON.COMMON_LONGITUDE);
                            if (elems2 != null && elems2.length > 0) {
                              let elem2 = elems2[0] as HTMLInputElement;
                              elem2.value
                            }
                          }
                          break;
                      }
                    }
                  });
                  outputData.push(subArray);
                };
                iCount++;
                let str = '[';
                iCount = 0;
                outputData.forEach(element => {
                  if (iCount > 0) {
                    str += ',';
                  }
                  str += '{';
                  str += element.join(',');
                  str += '}';

                  iCount++;
                });
                str += ']';

                let collection = JSON.parse(str) as Array<any>;

                let collectionBeforeAssignment = (this.model != null && this.model[section_temp.ModelCollectionName] != null) ?
                  this.model[section_temp.ModelCollectionName] as Array<any> : null;




                //*********** FINDING DELETED & UPDATE RECORDS *****************/
                let finalCollection = [];

                //**************************** SECTION 1: Push the Entries which are new, meanswith Id = 0; **********************************//
                let recordsWithId0 = collection.filter(t => t[AppConstants.COMMON.ID] == "0" || t[AppConstants.COMMON.ID] == 0);

                if (collectionBeforeAssignment != null && collectionBeforeAssignment.length > 0) {

                  collectionBeforeAssignment.forEach(item => {
                    let existingRecords = collection.filter(t => t[AppConstants.COMMON.ID] == item.Id);

                    if (existingRecords == null || existingRecords.length == 0) {
                      finalCollection.push({
                        Id: item.Id,
                        EntityState: 3,
                        RowVersion: item[AppConstants.COMMON.COMMON_ROWVERSION],

                      });
                    }
                    //*********** FINDING UPDATED RECORDS ****************** */
                    else if (existingRecords != null || existingRecords.length > 0) {
                      let item_temp = existingRecords[0];
                      let keys = Object.keys(item_temp);
                      let values = Object.values(item_temp);
                      let item_to_push = {};

                      for (let i = 0; i < values.length; i++) {
                        item_to_push[keys[i]] = values[i];
                      }
                      item_to_push[AppConstants.COMMON.COMMON_ENTITY_STATE] = 2;
                      finalCollection.push(item_to_push);
                    }
                  });
                }
                recordsWithId0.forEach(item => {
                  item[AppConstants.COMMON.COMMON_ENTITY_STATE] = 1;
                  finalCollection.push(item);
                });
                if (splittedName == "sampleinitializations") {

                  let path = window.location.pathname;
                  let splittedValues = path.split('/')
                  let splited_id = parseInt(splittedValues[splittedValues.length - 1]);
                  let finalCollection_initializationValue = [];
                  let initializationValue = JSON.parse(sessionStorage.getItem(AppConstants.COMMON.COMMON_INITIALIZATION));
                  if (initializationValue != null && initializationValue.length > 0) {
                    initializationValue.forEach(element => {
                      element[AppConstants.COMMON.COMMON_METHOD_STAGE_GRID_COLUMN_ID] = element.Id;
                      element[AppConstants.COMMON.COMMON_SAMPLE_ID] = splited_id
                      element[AppConstants.COMMON.ID] = 0;
                      element[AppConstants.COMMON.COMMON_ENTITY_STATE] = 1,
                        element[AppConstants.COMMON.COMMON_ROWVERSION] = "";
                      element[AppConstants.COMMON.COMMON_NO_OF_ROWS] = element.Sequence;
                      finalCollection_initializationValue.push(element);
                    });
                  }
                  let dataCollection = finalCollection.concat(finalCollection_initializationValue);

                  if (dataCollection != null && dataCollection.length > 0) {
                    let updatedata = [];
                    dataCollection.forEach(item => {
                      let existingRecords = collection.filter(t => t[AppConstants.COMMON.ID] == item.Id);

                      if (existingRecords == null || existingRecords.length == 0) {

                        updatedata.push({
                          Id: item.Id,
                          EntityState: 3,
                          RowVersion: item[AppConstants.COMMON.COMMON_ROWVERSION],
                          ColumnName: item[AppConstants.COMMON.COMMON_COLUMN_NAME],
                          CreationDate: item[AppConstants.COMMON.COMMON_CREATION_DATE],
                          CustomAttributes: item[AppConstants.COMMON.CUSTOMATTRIBUTES],
                          Formulae: item[AppConstants.COMMON.COMMON_FORMULAE],
                          IsInput: item[AppConstants.COMMON.COMMON_IS_INPUT],
                          IsRepeat: item[AppConstants.COMMON.COMMON_IS_REPEAT],
                          IsRunningNumber: item[AppConstants.COMMON.COMMON_IS_RUNNING_NUMBER],
                          IsText: item[AppConstants.COMMON.COMMON_IS_TEXT],
                          MethodStageColumnName: item[AppConstants.COMMON.COMMON_METHOD_STAGE_COLUMN_NAME],
                          MethodStageGridColumnId: item[AppConstants.COMMON.COMMON_METHOD_STAGE_GRID_COLUMN_ID],
                          MethodStageId: item[AppConstants.COMMON.COMMON_METHOD_STAGE_ID],
                          MethodStageName: item[AppConstants.COMMON.COMMON_METHOD_STAGE_NAME],
                          ModifiedDate: item[AppConstants.COMMON.COMMON_MODIFIED_DATE],
                          NoOfRows: item[AppConstants.COMMON.COMMON_NO_OF_ROWS],
                          SampleId: item[AppConstants.COMMON.COMMON_SAMPLE_ID],
                          StartColumnPattern: item[AppConstants.COMMON.COMMON_START_COLUMN_PATTERN],
                        });

                      } else {
                        updatedata = existingRecords;
                      }
                    });
                    let recordsWithId0 = updatedata.filter(t => t[AppConstants.COMMON.ID] == "0" || t[AppConstants.COMMON.ID] == 0);
                    recordsWithId0.forEach(item => {
                      item[AppConstants.COMMON.COMMON_ENTITY_STATE] = 1;
                      finalCollection.push(item);
                    });
                  }

                }

                modelTemp[section_temp.ModelCollectionName] = finalCollection;
              }
            });
          });
        break;
      //read the session variable by name 

    }
  }

  getFilterEvent(section: Section): Array<Event1> {
    let events: Array<Event1>;
    let selectedDataTemplates = section.SectionAttributes.filter(t => t.ControlName == "btnPopulateTable");
    if (selectedDataTemplates != null && selectedDataTemplates.length > 0) {
      events = selectedDataTemplates[0].Events;
    }

    /***************** Process SubSections ******************************/
    section.SubSections.forEach(section => {
      /******** RECURSION TO PROCESS SUB SECTION WITHIN THE SECTIONS *******************************/
      this.getFilterEvent(section);
    });
    return events;
  }

  /*-------------------------------pagination Functionality----------------------------------------------------*/
  first() {
    if (this.utilityService.isBarcodeScanned) {
      this.utilityService.isBarcodeScanned = false;
      return;
    }
    let populateData: boolean = true;
    let sampleElement = document.getElementById( AppConstants.GENERAL.HIDDEN_SAMPLE_ID) as HTMLInputElement;
    let methodElement = document.getElementById( AppConstants.GENERAL.HIDDEN_METHOD_ID) as HTMLInputElement;
    let stageElement = document.getElementById( AppConstants.GENERAL.HIDDEN_STAGE_ID) as HTMLInputElement;
    let currentPage = sessionStorage.getItem( AppConstants.COMMON.COMMON_CURRENT_PAGE);
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
      populateData = this.submitData();
      }
    }
    if (populateData) {
      this.removeStorageData();
    this.pageInfo1.currentPage = 1;
    let actualUrl = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress + '/' + this.splittedValues[this.splittedValues.length - 1];

    let firstRecord = (((this.pageInfo1.currentPage * this.pageInfo1.pagesize) - this.pageInfo1.pagesize));
    let lastRecord = (this.pageInfo1.currentPage * this.pageInfo1.pagesize);

    let lblRecordsInf = document.getElementById(AppConstants.COMMON.COMMON_LBL_RECORDS_INFO1) as HTMLLabelElement;
    if (lblRecordsInf != null) {
      let fromRecord = (((this.pageInfo1.currentPage * this.pageInfo1.pagesize) - this.pageInfo1.pagesize) + 1);
      let toRecord = (this.pageInfo1.currentPage * this.pageInfo1.pagesize);
      toRecord = toRecord > this.pageInfo1.totalrecords ? this.pageInfo1.totalrecords : toRecord;
      lblRecordsInf.innerText = "Record(s) " + fromRecord + ' to ' + toRecord + ' of ' + this.pageInfo1.totalrecords + '  ';


      sessionStorage.setItem( AppConstants.COMMON.COMMON_FIRST_RECORD, fromRecord.toString());
      sessionStorage.setItem(AppConstants.COMMON.COMMON_LAST_RECORD, toRecord.toString());
      sessionStorage.setItem( AppConstants.COMMON.COMMON_CURRENT_PAGE, this.pageInfo1.currentPage.toString());
      this.updateDataModel2(actualUrl, this.formData.EndPoint.Headers, this.pageInfo1.currentPage, this.pageInfo1.pagesize);

    }
  }
  }

  prev() {
    if (this.utilityService.isBarcodeScanned) {
      this.utilityService.isBarcodeScanned = false;
      return;
    }
    let populateData: boolean = true;
     let sampleElement = document.getElementById( AppConstants.GENERAL.HIDDEN_SAMPLE_ID) as HTMLInputElement;
    let methodElement = document.getElementById( AppConstants.GENERAL.HIDDEN_METHOD_ID) as HTMLInputElement;
    let stageElement = document.getElementById( AppConstants.GENERAL.HIDDEN_STAGE_ID) as HTMLInputElement;
    let currentPage = sessionStorage.getItem( AppConstants.COMMON.COMMON_CURRENT_PAGE);
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
      populateData = this.submitData();
      }
    }
    if (populateData) {
      this.removeStorageData();
    this.pageInfo1.currentPage = this.pageInfo1.currentPage - 1;
    this.pageInfo1.currentPage = (this.pageInfo1.currentPage <= 0) ? 1 : this.pageInfo1.currentPage;
    let actualUrl = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress + '/' + this.splittedValues[this.splittedValues.length - 1];

    let lblRecordsInf = document.getElementById(AppConstants.COMMON.COMMON_LBL_RECORDS_INFO1) as HTMLLabelElement;
    if (lblRecordsInf != null) {
      let fromRecord = (((this.pageInfo1.currentPage * this.pageInfo1.pagesize) - this.pageInfo1.pagesize) + 1);
      let toRecord = (this.pageInfo1.currentPage * this.pageInfo1.pagesize);
      toRecord = toRecord > this.pageInfo1.totalrecords ? this.pageInfo1.totalrecords : toRecord;
      lblRecordsInf.innerText = "Record(s) " + fromRecord + ' to ' + toRecord + ' of ' + this.pageInfo1.totalrecords + '  ';
      sessionStorage.setItem( AppConstants.COMMON.COMMON_FIRST_RECORD, fromRecord.toString());
      sessionStorage.setItem(AppConstants.COMMON.COMMON_LAST_RECORD, toRecord.toString());
      sessionStorage.setItem( AppConstants.COMMON.COMMON_CURRENT_PAGE, this.pageInfo1.currentPage.toString());
      this.updateDataModel2(actualUrl, this.formData.EndPoint.Headers, this.pageInfo1.currentPage, this.pageInfo1.pagesize);

    }
  }
  }

  next() {
   
    if (this.utilityService.isBarcodeScanned) {
      this.utilityService.isBarcodeScanned = false;
      return;
    }
    let populateData: boolean = true;
    let sampleElement = document.getElementById( AppConstants.GENERAL.HIDDEN_SAMPLE_ID) as HTMLInputElement;
    let methodElement = document.getElementById( AppConstants.GENERAL.HIDDEN_METHOD_ID) as HTMLInputElement;
    let stageElement = document.getElementById( AppConstants.GENERAL.HIDDEN_STAGE_ID) as HTMLInputElement;
    let currentPage = sessionStorage.getItem( AppConstants.COMMON.COMMON_CURRENT_PAGE);
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
      populateData = this.submitData();
      }
    }
    if (populateData) {
      this.removeStorageData();
      this.pageInfo1.currentPage =
        ((this.pageInfo1.currentPage * this.pageInfo1.pagesize) > (this.pageInfo1.totalrecords)) ?
          Math.round(this.pageInfo1.totalrecords / this.pageInfo1.pagesize) : this.pageInfo1.currentPage + 1;

      let actualUrl = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress + '/' + this.splittedValues[this.splittedValues.length - 1];

      let lblRecordsInf = document.getElementById(AppConstants.COMMON.COMMON_LBL_RECORDS_INFO1) as HTMLLabelElement;
      if (lblRecordsInf != null) {
        let fromRecord = (((this.pageInfo1.currentPage * this.pageInfo1.pagesize) - this.pageInfo1.pagesize) + 1);
        let toRecord = (this.pageInfo1.currentPage * this.pageInfo1.pagesize);
        toRecord = toRecord > this.pageInfo1.totalrecords ? this.pageInfo1.totalrecords : toRecord;
        lblRecordsInf.innerText = "Record(s) " + fromRecord + ' to ' + toRecord + ' of ' + this.pageInfo1.totalrecords + '  ';

        sessionStorage.setItem( AppConstants.COMMON.COMMON_FIRST_RECORD, fromRecord.toString());
        sessionStorage.setItem(AppConstants.COMMON.COMMON_LAST_RECORD, toRecord.toString());
        sessionStorage.setItem( AppConstants.COMMON.COMMON_CURRENT_PAGE, this.pageInfo1.currentPage.toString());
        this.updateDataModel2(actualUrl, this.formData.EndPoint.Headers, this.pageInfo1.currentPage, this.pageInfo1.pagesize);

      }
    }
  }
  last() {
    if (this.utilityService.isBarcodeScanned) {
      this.utilityService.isBarcodeScanned = false;
      return;
    }
    let populateData: boolean = true;
    let sampleElement = document.getElementById( AppConstants.GENERAL.HIDDEN_SAMPLE_ID) as HTMLInputElement;
    let methodElement = document.getElementById( AppConstants.GENERAL.HIDDEN_METHOD_ID) as HTMLInputElement;
    let stageElement = document.getElementById( AppConstants.GENERAL.HIDDEN_STAGE_ID) as HTMLInputElement;
    let currentPage = sessionStorage.getItem( AppConstants.COMMON.COMMON_CURRENT_PAGE);
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
      populateData = this.submitData();
      }
    }
    if (populateData) {
      this.removeStorageData();
    this.pageInfo1.currentPage = Math.ceil(this.pageInfo1.totalrecords / this.pageInfo1.pagesize);
    let actualUrl = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress + '/' + this.splittedValues[this.splittedValues.length - 1];

    let lblRecordsInf = document.getElementById(AppConstants.COMMON.COMMON_LBL_RECORDS_INFO1) as HTMLLabelElement;
    if (lblRecordsInf != null) {
      let fromRecord = (((this.pageInfo1.currentPage * this.pageInfo1.pagesize) - this.pageInfo1.pagesize) + 1);
      let toRecord = (this.pageInfo1.currentPage * this.pageInfo1.pagesize);
      toRecord = toRecord > this.pageInfo1.totalrecords ? this.pageInfo1.totalrecords : toRecord;
      lblRecordsInf.innerText = "Record(s) " + fromRecord + ' to ' + toRecord + ' of ' + this.pageInfo1.totalrecords + '  ';
      sessionStorage.setItem( AppConstants.COMMON.COMMON_FIRST_RECORD, fromRecord.toString());
      sessionStorage.setItem(AppConstants.COMMON.COMMON_LAST_RECORD, toRecord.toString());
      sessionStorage.setItem( AppConstants.COMMON.COMMON_CURRENT_PAGE, this.pageInfo1.currentPage.toString());
      this.updateDataModel2(actualUrl, this.formData.EndPoint.Headers, this.pageInfo1.currentPage, this.pageInfo1.pagesize);

    }
  }
  }
  /*-------------------------------pagination Functionality End----------------------------------------------------*/

  // reload() {
  //   let lastUrl = sessionStorage.getItem('lastUrl');
  //   if (lastUrl != null) {
  //     this.router.navigate([lastUrl]);
  //   }
  // }
  //----------------------------------------------------END SUBMIT DATA FORM ---------------------------------------------
  // BACK BUTTON EVENT CALL
  backData() {
    let prev_Url = sessionStorage.getItem(AppConstants.COMMON.COMMON_PREV_URL);
    this.router.navigate([prev_Url]);
    sessionStorage.removeItem(AppConstants.COMMON.COMMON_INITIALIZATION);
    sessionStorage.removeItem(AppConstants.COMMON.COMMON_FIRST_RECORD);
    sessionStorage.removeItem(AppConstants.COMMON.COMMON_LAST_RECORD);
  }

  updateDataModel2(urlToCall: string, headers: Array<Header>, currentPage?: any, pageSize?: any) {

    let currentAddEditForm_temp = this;
    headers = headers == null ? [] : headers;
    let columnStrings: Array<ColumnString> = new Array<ColumnString>();
    headers.forEach(item => {
      columnStrings.push({ Key: item.KeyName, Value: item.ValueName })
    });

    let path = window.location.pathname;
    let splittedValues = path.split('/');
    let splittedValue = splittedValues[2].toLowerCase();

    if (splittedValue == "samplemethodstagereadings2") {
      this.responseDataTemp = this.utilityService.getDataFormStageReading2Service(urlToCall, currentPage, pageSize);
      let subscrib = this.responseDataTemp.subscribe(
        data => {
          if (data.DataCollection.length > 0) {
            let model = data.DataCollection[0];
            this.pageInfo1.totalrecords = data.PageInfo.TotalRecords;
            this.pageInfo1.currentPage = data.PageInfo.CurrentPage;
            this.pageInfo1.pagesize = data.PageInfo.PageSize;
            if (this.formData != null) {
              this.formData.Sections.forEach(
                section => {
                  this.utilityService.processSection(section, model, this.utilityService, false, this.isPageLoaded, null, null, null, this.pageInfo1.pagesize);

                });
            }
          }
        }, (error) => {
          this.showError(JSON.stringify(error));
          if (error.status == 500) {
            this.toastr.error(error.message, 'Error',
              { timeOut: 2000 });
          } else if (error.status == 401) {
            this.toastr.error('Un-authorized', 'Error',
              { timeOut: 2000 });
          } else if (error.status == 404) {
            this.toastr.warning('No Records', 'Warning',
              { timeOut: 2000 });
          } else if (error.status == 400) {
            this.toastr.warning(error.message, 'Warning',
              { timeOut: 2000 });
          }
        }, function complete() {
          let lblRecordsInfo1 = document.getElementById(AppConstants.COMMON.COMMON_LBL_RECORDS_INFO1) as HTMLLabelElement;
          if (lblRecordsInfo1 != null) {
          };
        });

    }
  }

  removeStorageData() {
    let sampleElement = document.getElementById( AppConstants.GENERAL.HIDDEN_SAMPLE_ID) as HTMLInputElement;
    let methodElement = document.getElementById( AppConstants.GENERAL.HIDDEN_METHOD_ID) as HTMLInputElement;
    let stageElement = document.getElementById( AppConstants.GENERAL.HIDDEN_STAGE_ID) as HTMLInputElement;
    let currentPage = sessionStorage.getItem( AppConstants.COMMON.COMMON_CURRENT_PAGE);
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
        localStorage.removeItem(AppConstants.COMMON.COMMON_SAMPLE_METHOD_STAGE_READING2);
      }
    }
  }
}
