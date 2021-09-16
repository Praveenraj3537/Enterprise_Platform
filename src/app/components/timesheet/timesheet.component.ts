import { Scripts, Section, SectionAttribute, Event as Event1, UIMenuAndRoles } from '../../shared/interface/form-data-advanced';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, Event } from '@angular/router';
//import { FormGroup, FormControl } from '@angular/forms';

import { Form as Form1 } from './../../shared/interface/form-data-advanced';
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
import { any } from 'underscore';
import { Location } from '@angular/common';
import { CalendarOptions } from '@fullcalendar/angular';
import   data1 from '../../../assets/jsons/timeSheet.json';
import  task from '../../../assets/jsons/timeSheetTask.json';
import { environment } from 'src/environments/environment';
// import { Form } from '@angular/forms';
declare var modalLoader: any;
@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.css']
})
export class TimesheetComponent extends BaseComponent implements AfterViewInit {

  @ViewChild('hiddenId', { static: false }) hiddenId: ElementRef;
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
  public calendarOptions: CalendarOptions;
  ScriptStore: Scripts[] = [
    { name: 'Mqttws_Script', src: '../../../assets/scripts/mqttws31.js' }
  ];
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


    let calendar_array = [];
    let calenderTask_array = [];
    this.isPageLoaded = false;
    let height = $(window).height() - 160;
    $('#scroll').css("overflow-y", "scroll");
    $('#scroll').css("height", height);
    sessionStorage.setItem('lastUrl', window.location.pathname);
    //*********** Getting the Form Data ********* */
    //THIS HAS TO BE UN COMMENTED ONCE THE SERVER ISSUE OF 500 IS RESOLVED

    //this.utilityService.initializeDataArray();

    this.getFormData('addEdit');
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    let currentDate = yyyy + '-' + mm + '-' + dd;
    //populate datepicker inside model

    this.calendarOptions = {
      initialView: 'dayGridMonth',
      weekends: true,
      height: 600,
      initialDate: currentDate,// startDate_temp,
      titleFormat: { // will produce something like "Tuesday, September 18, 2018"
        month: 'long',
        year: 'numeric',
        day: 'numeric',
        weekday: 'long',

      }

    };

    for (let i = 0; i < data1.DataCollection.length; i++) {
      if (data1.DataCollection[i]['StaffHours'] > 0)
        calendar_array.push({
          title: data1.DataCollection[i]['StaffHours'],
          start: data1.DataCollection[i]['ContextDay'],
          backgroundColor: 'green',
          textColor: 'white'
        });

      //**************** BLOCKED HOURS ********************* */
      if (data1.DataCollection[i]['ApprovalHours'] > 0)
        calendar_array.push({
          title: data1.DataCollection[i]['ApprovalHours'],
          start: data1.DataCollection[i]['ContextDay'],
          backgroundColor: 'maroon',
          textColor: 'white'
        });

      /*****************PROJECT HOURS ***************************** */
      if (data1.DataCollection[i]['CorrectionHours'] > 0)
        calendar_array.push({
          title: data1.DataCollection[i]['CorrectionHours'],
          start: data1.DataCollection[i]['ContextDay'],
          backgroundColor: 'navy',
          textColor: 'white'
        });
    }
    this.calendarOptions['events'] = calendar_array;


    for (let i = 0; i < task.DataCollection.length; i++) {

      calenderTask_array.push({
        title: task.DataCollection[i]['Task'] + ":  " + task.DataCollection[i]['Hours'] + " hrs",
        start: task.DataCollection[i]['Date'],
        backgroundColor: 'white',
        textColor: 'black'
      });

    }
    this.calendarOptions['events'] = calenderTask_array;





    let currentDiv = document.getElementsByClassName("fc-daygrid-day-top");


  }


  getIdForRefresh(inputControlName: string) {
    return "refresh_" + inputControlName;
  }

  getDateValue(propName: string, sectionAttribute?: SectionAttribute, modelObjectName?: string) {
    //  alert(defaultValue);
    // let data = columnData.slice(0, 10);
    let currentdate: any;
    if (sectionAttribute != null) {
      if (sectionAttribute.DefaultValue == "current_date") {
        var currentDate = new Date().toLocaleDateString().split('/');
        var today = ("0" + currentDate[0]).slice(-2) + "/" + ("0" + currentDate[1]).slice(-2) + "/" + currentDate[2];
        // console.log(today);
        return today;
      }
     
    }
    return 0;
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
              $(anchorControl).hide();
            }

          }
        });
      })
    }
  }
  //*********** CALLED WHEN THERE IS A MODEL CHANGE, SO ONCE THE MODEL IS UDPATED BY PROMISE THIS WILL BE CALLED */
  ngDoCheck() {

   

    // Get the modal
    // var modal = document.getElementById("myModal");
    // let currentDiv = document.getElementsByClassName("fc-event-title-container");

    // for (let i = 0; i < currentDiv.length; i++) {
    //   currentDiv[i].addEventListener('click', function () {

    //     modal.style.display = "block";
    //     // Get the <span> element that closes the modal
    //     var span = document.getElementById("closeId");
    //     // When the user clicks on <span> (x), close the modal
    //     span.onclick = function () {
    //       modal.style.display = "none";
    //     }
    //     // When the user clicks anywhere outside of the modal, close it
    //     window.onclick = function (event) {
    //       if (event.target == modal) {
    //         modal.style.display = "none";
    //       }
    //     }

    //   });
    // }


    if (this.isDataPopulated)
      return;

    if (this.formData == null)
      return;

    //************ this part ideally should populate all data on the UI including single Child and Children/Array of child/grid ************** */
    if (this.formData != null && this.isAddCase == true && !this.isDataPopulationUnderProcess) {
      let utilityService = this.utilityService;
      try {
        //************* MAIN LOOP ADDED TO LOOP THROUGH THE FORM SECTIONS /
        if (this.formData != null) {

          this.formData.Sections.forEach(
            section => {
              //Looping sub sections to produce relavant controls like tables/...
              utilityService.processSection(section, this.model, utilityService, false, this.isPageLoaded);
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
        //************* MAIN LOOP ADDED TO LOOP THROUGH THE FORM SECTIONS to populate data mainly for Dropdowns /
        if (this.formData != null) {
          this.formData.Sections.forEach(
            section => {
              let path = window.location.pathname;
              let splittedValues = path.split('/');
              let splittedName = splittedValues[2].toLowerCase();
              let splittedRow = parseInt(splittedValues[3]);
              switch (splittedName) {
                // populate instrumentcalibrationsets addEdit Table data
                case "instrumentcalibrationsets":

                  if (section.SectionTypeName == 'Normal' || section.SectionTypeName == 'object') {
                    currentEvents = this.getFilterEvent(section);
                    utilityService.processSection(section, this.model, utilityService, false, this.isPageLoaded);
                  } else {

                    if (currentEvents != null && currentEvents != undefined) {
                      currentEvents.forEach(event => {
                        if (event.EndPoint.AdditionalParams != null && event.EndPoint.AdditionalParams.length > 0) {
                          for (let i = 0; i < event.EndPoint.AdditionalParams.length; i++) {
                            if (event.EndPoint.AdditionalParams[i].KeyName != null) {
                              // currentModel
                              let controlId = event.EndPoint.AdditionalParams[i].ModelPropName
                              let currentValue = this.model[event.EndPoint.AdditionalParams[i].ModelPropName];

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
                  //Looping sub sections to produce relavant controls like tables/...
                  utilityService.processSection(section, this.model, utilityService, false, this.isPageLoaded);
                  break;
              }

            });
        };

        //This will set the data for the single object types
        if (!this.isDataPopulated) {
          // this.getObjectData(this.model, true);
          //For existing data it will generate rows for table(s) if any
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
        };
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
          // this.getObjectData(this.model, true);
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

    let roles = '';
    if (this.authService != null && this.authService.isLoggedIn()) {
     let key = 'routingEntries_' + environment.appBaseUrls[0] + '/v1/common/menus';
     let objectFromSession = sessionStorage.getItem(key);
     if (objectFromSession != null) {
       let roles_and_menu = JSON.parse(objectFromSession) as UIMenuAndRoles;
       roles + 'Role(s):';
       if (roles_and_menu != null) {
         let iCount = 0;
         roles_and_menu.Roles.forEach(item => {
           if (iCount > 0) {
             roles += ',';
           }
           roles += item;
           iCount++;
         });
       }
     };

   }

   if(roles != "" && roles.includes('ClientEmployee')){
    let btnCtrlRef = document.getElementById("btnApprove") as HTMLButtonElement;
    btnCtrlRef.style.display = 'block';
   }


    this.populatePopupFormData(this.formData.PopUpUrl);
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
          utilityService.processSection(section, currentModel, utilityService, true, isPageLoaded);
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
  ngOnDestroy() { }

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
    return (this.model != null) ? this.model['Id'] : 0;
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


  envirementEntityState(modelTemp1: any) {
    this.model2.forEach(moduleData => {
      moduleData
    });
  }



  getFilterEvent(section: Section): Array<Event1> {
    let events: Array<Event1>;
    let selectedDataTemplates = section.SectionAttributes.filter(t => t.ControlName == "btnPopulateTable");
    if (selectedDataTemplates != null && selectedDataTemplates.length > 0) {
      events = selectedDataTemplates[0].Events;
    }

    //***************** Process SubSections ***************************** */
    section.SubSections.forEach(section => {
      //******** RECURSION TO PROCESS SUB SECTION WITHIN THE SECTIONS /
      this.getFilterEvent(section);
    });
    return events;
  }

  updateDateValue() {
    let currentCtrl = document.getElementById("updateDate") as HTMLInputElement;
    let currentDiv = document.getElementsByClassName("fc-event-title");
    //for (let i = 0; i < currentDiv.length; i++) {
    currentDiv[0].innerHTML = currentCtrl.value;
    //}       
  }

  populateController() {

    if (this.formData != null) {
      this.validationErrors = new Array<string>();

      this.formData.Sections.forEach(
        section => {
          this.processValidation(section);
        });


      //Check the validation array 
      let msg1 = '';
      if (this.validationErrors.length > 0) {

        this.validationErrors.forEach(item => {
          msg1 += '\n' + item + '\n'
        });
        alert(msg1);
        return
      }

      this.validationErrors = new Array<string>()
    };

    var modal = document.getElementById("myModal");
    modal.style.display = "block";

    var span = document.getElementById("closeId");
    span.onclick = function () {
      modal.style.display = "none";
    }
    let popupUrl = this.formData.PopUpUrl;
    if (popupUrl != null && popupUrl != '' && this.popUpformData == null) {
      if (this.popUpformData != null) {
        this.popUpformData.Sections.forEach(
          section => {
            //Looping sub sections to produce relavant controls like tables/...
            this.utilityService.processSection(section, this.model, this.utilityService, false, true);
          });
      };
    }
    else if (this.popUpformData != null) {
      this.popUpformData.Sections.forEach(
        section => {
          //Looping sub sections to produce relavant controls like tables/...
          this.utilityService.processSection(section, this.model, this.utilityService, false, true);
        });
    };
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
  submitPopUp() {

    let model = {};
    let currentObj = this.getPopUpFormData(model);
    if (currentObj != null) {
      let elem = document.getElementById("selectStaffs") as HTMLSelectElement;
      let selectedValue = elem.options[elem.selectedIndex].value != null ? elem.options[elem.selectedIndex].value : "0";
      currentObj["ProjectStaffId"] = parseInt(selectedValue);
      let dateControl = document.getElementById("date") as HTMLInputElement;
      let titleControl = document.getElementById("textTitle") as HTMLInputElement;
      let descriptionControl = document.getElementById("txtDescription") as HTMLInputElement;

      currentObj["ProjectAssignments"] = [
        {
          "Id": 0,
          "AssignmentId": 0,
          "AutoOffset": new Date().getTimezoneOffset(),
          "EntityState": 1,
          "RowVersion": "",
          "TaskTitle": titleControl.value,
          "Description": descriptionControl.value
        }
      ]
      currentObj["TaskAssignmentHours"] = [
        {
          "Id": 0,
          "AssignmentId": 0,
          "AutoOffset": new Date().getTimezoneOffset(),
          "EntityState": 1,
          "RowVersion": "",
          "Date": dateControl.value,
          "Hours": parseInt(currentObj['EstimatedHoursForCompletion'])
        }
      ]
      let url = this.utilityService.getApiUrl(this.module) + '/' + this.popUpformData.EndPoint.EndpointAddress;
      let requestModel = {
        DataCollection: [currentObj]
      };

      this.utilityService.postDataToService(url, requestModel).subscribe(data => {
        //  this.router.navigate([navigate]);
        $(modalLoader()).hide();
        this.toastr.success('Data Submitted Successfully', 'Success',
          { timeOut: 2000 });
        if (this.formData.GotoBack == true) {
          //  this.backData();
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


  getPopUpFormData(modelTemp: any) {
    modelTemp = modelTemp == null ? {} : modelTemp;
    let obj = {};

    
    this.popUpformData.Sections.forEach(
      section => {

        section.SectionAttributes.forEach(sectionAttribute => {
          switch (sectionAttribute.ControlType) {
            // TEXTBOX ADD/EDIT FORM DATA
            // case "text": {
            //   let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

            //   if (elem != null) {

            //     obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.value, sectionAttribute);;

            //   }
            // }

            //   break;
            case "checkbox": {
              let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

              if (elem != null) {

                obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.checked, sectionAttribute);

              }

            }
              break;

            case "number": {
              let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

              if (elem != null) {
                obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.value, sectionAttribute);

              }
              break;
            }
            case "hidden": {
              if (sectionAttribute.ControlName == "hiddenEntitystate") {
                let elem = document.getElementById("hiddenId") as HTMLInputElement;

                if (elem != null) {

                  if (elem.value == "0") {
                    let rawData = "1";
                    obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(rawData, sectionAttribute);
                  } else {
                    let rawData = "2";
                    obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(rawData, sectionAttribute);
                  }

                }
              } else if (sectionAttribute.ControlName == "AutoOffset") {

                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;

                if (elem != null) {

                  let rawData = new Date().getTimezoneOffset();
                  obj[sectionAttribute.ModelPropName] = rawData;

                }

              }
              else {
                let elem = document.getElementById(sectionAttribute.ControlName) as HTMLInputElement;
                if (elem != null) {

                  obj[sectionAttribute.ModelPropName] = this.utilityService.getObjectTypeCastedData(elem.value, sectionAttribute);

                }
              }
            }
              break;
            case "select": {
              let elem = document.getElementById(sectionAttribute.ControlName) as HTMLSelectElement;
              if (elem != null && elem.options.length > 0) {

                obj[sectionAttribute.ModelPropName] =
                  this.utilityService.getObjectTypeCastedData(elem.options[elem.selectedIndex].value, sectionAttribute);

              }
            }
              break;
          }
        });

      });
    return obj;
  }



}
