
import { Scripts, Section, SectionAttribute, Event as Event1, PageCache } from '../../shared/interface/form-data-advanced';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';


declare var getInputValue: any;
declare var setInputValue: any;
declare var modalLoader:any;
declare var checkAndShowHideDraftButton: any;
@Component({
  selector: 'app-taskboard',
  templateUrl: './taskboard.component.html',
  styleUrls: ['./taskboard.component.css']
})
export class TaskboardComponent extends BaseComponent implements OnInit {

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
    private _location: Location
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

    /* INITIALING THE SCRIPTS */
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
  /*load script*/
  loadScript(name: string) {
    return new Promise((resolve, reject) => {
      /*resolve if already loaded*/
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
  //***************** PAGE EVENTS IN SEQUENCE ************************ */
  ngOnChanges() { }

  navigateTaskBoardAddEdit(Id: any) {
    let tempUrl = "/projectplus/assignments/" + Id;
    this.utilityService.navigateAddEditDirect(tempUrl);

  }

  async drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      let status_value = 1;
      /*evaluate the target container & then set the status of the 'item' that is being dragged. */
      let container_temp = document.getElementById(event.container.id);
      if (container_temp != null) {
        let div_temp_statuses = $(container_temp).prev(); //('.clsStatusId');
        if (div_temp_statuses != null && div_temp_statuses['length'] > 0) {
          let status_id = div_temp_statuses[0];
          status_value = parseInt($(status_id).val().toString());
        };

      };

      /* Drag Drop Functionality */
      event.previousContainer.data[event.previousIndex]['Status'] = status_value.toString();
      await this.submitPutData(event.previousContainer.data[event.previousIndex]);
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);

    }

  };

  onToggle(event) {
    let parentElement = event.target.parentElement.parentElement.parentElement as HTMLTableElement;
    $(parentElement).find('tbody').toggle();
  };

  async submitPutData(objectToModify: any) {
    let headerValues_temp = [];
    let currentId: number;

    /*Getting the endpoint */
    let url = this.utilityService.getApiUrl(this.module) + this.formData.EndPoint.EndpointAddress;
    if (this.formData.EndPoint != null && this.formData.EndPoint.Headers != null) {
      this.formData.EndPoint.Headers.forEach(data => {
        headerValues_temp.push({
          Key: data.KeyName,
          Value: data.ValueName
        });
      })
    };

    let model2 = {};
    /*This will GET Requestmodel*/
    objectToModify[AppConstants.COMMON.COMMON_ENTITY_STATE] = 2;

    let requestModel = {
      DataCollection: [objectToModify]
    };

    currentId = parseInt(objectToModify['Id'].toString());

    this.utilityService.putDataToService(url, currentId, requestModel).subscribe(data => {
      $(modalLoader()).hide();
      if (data.status = 200 || 204) {

        this.toastr.success('Data Submitted Successfully', 'Success',
          { timeOut: 2000 });
        if (this.formData.GotoBack == true) {

        }
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
  ngOnInit() {
    this.isPageLoaded = false;
    let height = $(window).height() - 160;
    $('#scroll').css("overflow-y", "scroll");
    $('#scroll').css("height", height);
    sessionStorage.setItem('lastUrl', window.location.pathname);
    /*********** Getting the Form Data ********* */
    /*THIS HAS TO BE UN COMMENTED ONCE THE SERVER ISSUE OF 500 IS RESOLVED */
    this.getFormData('addEdit');

    this.utilityService.initializeSearchVariables();
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
        updateDate = today;
      }
    }
 return  updateDate;
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

  getTaskBoardResponseData(cuurentStatus: String, responseData: Array<any>): Array<any> {
    let taskBoardresponseData: Array<any>;
    if (responseData != null && responseData.length > 0) {
      let filterData = responseData.filter(t => t.Status == cuurentStatus.toString());

      if (filterData != null && filterData.length > 0) {

       taskBoardresponseData =filterData;
      }
    }
    return  taskBoardresponseData;
  }

  //*********** CALLED WHEN THERE IS A MODEL CHANGE, SO ONCE THE MODEL IS UDPATED BY PROMISE THIS WILL BE CALLED */
  ngDoCheck() {

    if (this.isDataPopulated)
      return;

    let path = window.location.pathname;
    let splittedValues = path.split('/');
    let splittedName = splittedValues[2];
    //************ this part ideally should populate all data on the UI including single Child and Children/Array of child/grid ************** */
    if (this.formData != null && this.isAddCase == true && !this.isDataPopulationUnderProcess) {
      let utilityService = this.utilityService;
      try {
        //************* MAIN LOOP ADDED TO LOOP THROUGH THE FORM SECTIONS /
        if (this.formData != null) {


          let currentModel = this.model
          let cache = this.getPageCache(splittedName);
          // //************* MAIN LOOP ADDED TO LOOP THROUGH THE FORM SECTIONS /
          if (currentModel == null || currentModel == undefined) {
            currentModel = {};
            if (cache != null) {
              cache.ControlCollectionNValues.forEach(CollectionValue => {
                //TODO: check if number then parse the string to number/date
                currentModel[CollectionValue.ControlId] = parseInt(CollectionValue.ControlKeyValue);
              });
            }
       
          };
         
          this.formData.Sections.forEach(
            section => {
              //Looping sub sections to produce relavant controls like tables/...
              utilityService.processSection(section, currentModel, utilityService, false, this.isPageLoaded);
            });

          
        };
        let cache = this.getPageCache(splittedName);
        if(cache != null){
         utilityService.populateTaskBoardDragDropCacheData(cache, utilityService);
        }
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
                  /*Looping sub sections to produce relavant controls like tables */
                  utilityService.processSection(section, this.model, utilityService, false, this.isPageLoaded);
                  break;
              }

            });
        };

        /*This will set the data for the single object types */
        if (!this.isDataPopulated) {
          this.getObjectData(this.model, true);
          this.formData.Sections.forEach(
            section => {

              if (this.model != null && this.isDataPopulated == false) {
                let tempTable = document.getElementById(section.SectionName) as HTMLTableElement;
                if (tempTable != null && section.ModelCollectionName != null) {
                  /*Get the DataCollection for Table Types */
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

  populateAccordionId(controlName: string) {
    return '#accordion' + controlName;

  }

  populateAccordionId1(controlName: any) {
    return '#accordion1' + controlName;

  }

  populateHeadingId(controlName: any) {
    return 'headingOne' + controlName;
  }

  populateHeadingId1(controlName: any) {
    return 'headingOne1' + controlName;
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
    let path = window.location.pathname;
    let splittedValues = path.split('/');
    let splittedName = splittedValues[2];
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



    // let cache = this.getPageCache(splittedName);
    //can u get the dropdown values from cache ?
    //if yes then can u set to currentModel['Projectid'] ?
    //if currentModel= null  then currentModel= {}, currentModel['Projectid']=cache value for project dropdown
    let currentModel = this.model;
    let cache = this.getPageCache(splittedName);

    //************* MAIN LOOP ADDED TO LOOP THROUGH THE FORM SECTIONS /
    if (currentModel == null || currentModel == undefined) {
      currentModel = {};
      if (cache != null) {
        cache.ControlCollectionNValues.forEach(CollectionValue => {
          //TODO: check if number then parse the string to number/date
          currentModel[CollectionValue.ControlId] = parseInt(CollectionValue.ControlKeyValue);
        });
      }
    };

    if (this.formData != null) {
      this.formData.Sections.forEach(
        section => {
          //Looping sub sections to produce relavant controls like tables/...
          utilityService.processSection(section, currentModel, utilityService, true, isPageLoaded);
        });
    };

    //put it on async for 3 seconds and then set the value / delay 
    await this.delayApp(2000);
    this.isPageLoaded = true;

    //Execute the function thats on click of Show button
    //Always update the cache 
    utilityService.populateTaskBoardDragDropCacheData(cache, utilityService);

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

              dateControl.valueAsDate = (returnValue != null) ? new Date(returnValue) : new Date(Date.now());
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

  populateIdForDelete(controlName: string) {
    return 'delete_' + controlName;
  }
  getData(data) { }
  /*This method check Unique Value */
  processUniqueValue(section: Section) {
    let output: any;
    if (section.ModelCollectionName != null) {

      /*get the table reference */
      let tableRef = document.getElementById('tbl' + section.ModelCollectionName);
      if (tableRef != null) {
        let table = tableRef as HTMLTableElement;

        let uniqueCount = 0;
        let uniqueKeys = [];

        for (let i = 0; i < table.rows.length; i++) {
          let unique_value_combination = '';

          if (section.UniqueKeys != null) {

            section.UniqueKeys.forEach(item => {
              let control = table.rows[i].getElementsByClassName(item);
              if (control != null && control.length > 0) {
                /*find and convert the proper control type from seciton attribute */
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
              }

            });
            uniqueKeys.push(unique_value_combination);
          }
        }


        uniqueKeys.forEach(val_temp => {
          let occurances = uniqueKeys.filter(t => t == val_temp);
          if (occurances.length > 1) {
            /*add validation here for Unique Value Msg*/
            let msg = 'There are duplicates in section [' + section.ModelCollectionName + ']';
            if (!this.validationErrors.includes(msg)) {
              this.validationErrors.push(msg);
            }
            return;
          }
        });
      }


    }


    /*Looping the sub sections */
    section.SubSections.forEach(section_temp => {
      /*looping the sub section*/
      this.processUniqueValue(section_temp);
    })


  }
  /*-------------------------------       Process Validation All Controllers-------------------------------------*/
  processValidation(section: Section) {
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

                /*add to the validationArray*/
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

    /*Looping the sub sections */
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

  /*-------------------------------   End Process Validation All Controllers-------------------------------------*/


  /*---------------------------this populate child object data like adress  Data ----------------------------------------------*/
  getObjectData(modelTemp1: any, isSet: boolean = false) {
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
                            var fileName = $(fileControl).val().toString().substring($(fileControl).val().toString().lastIndexOf("\\") + 1, $(fileControl).val()['length']);
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
                    /*Here compare objects of previous and current using object comparer and then set 1 */

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

                  if (elem != null && elem.options.length > 0) {
                    for (let i = 0; i < elem.options.length; i++) {
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



  getFilterEvent(section: Section): Array<Event1> {
    let events: Array<Event1>;
    let selectedDataTemplates = section.SectionAttributes.filter(t => t.ControlName == "btnPopulateTable");
    if (selectedDataTemplates != null && selectedDataTemplates.length > 0) {
      events = selectedDataTemplates[0].Events;
    }

    //***************** Process SubSections ***************************** */
    section.SubSections.forEach(section => {
      //******** RECURSION TO PROCESS SUB SECTION WITHIN THE SECTIONS */
      this.getFilterEvent(section);
    });
    return events;
  }

  getPageCache(pageName: string): PageCache {

    pageName = pageName == null ? this.getPageName() : pageName;

    /*-----------------check if the current page is from session----------------------------*/
    let sesionCacheData = sessionStorage.getItem("cacheData");
    let getCacheData = sesionCacheData != null ? JSON.parse(sessionStorage.getItem("cacheData")) : null;
    if (getCacheData != null) {
      let cache_data = getCacheData as PageCache;
      if (cache_data != null && cache_data.Page != null && cache_data.Page == pageName) {
        return cache_data;
      };
    };
    return null;
  }


}
