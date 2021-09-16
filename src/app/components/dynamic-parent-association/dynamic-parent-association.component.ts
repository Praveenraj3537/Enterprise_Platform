import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { IdService } from 'src/app/services/id.service';
import { UtilityService } from 'src/app/services/utility.service';
import { BaseComponent } from 'src/app/shared/baseComponent/base.component';
import { CustomKeyValueString, DataTemplate, Form, GridColumn } from 'src/app/shared/interface/form-data-advanced';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dynamic-parent-association',
  templateUrl: './dynamic-parent-association.component.html',
  styleUrls: ['./dynamic-parent-association.component.css']
})
export class DynamicParentAssociationComponent extends BaseComponent implements AfterViewInit {

  preexisting_rows_for_staff_hours: Array<CustomKeyValueString>;
  tableContents1: Array<any>;
  model: any;
  submitted: boolean;
  headerToPublish: Array<string>;
  printModelData: any;
  baseUrl: string;
  dataTemplates: Array<DataTemplate>;
  public header = 'report';
  gridData :any;
  public startDate_temp: string;
  public formPrintData: Form;
  public splittedStringV: string;
  public budgetColumnName :any;
  public monthRegionBudgetData =[];
  public productRegionBudgetData =[];
  public regionBudgetData = [];

  constructor(
    httpclient: HttpClient,
    activatedRoute: ActivatedRoute,
    router: Router,
    authService: AuthService,
    private idService: IdService,
    utilityService: UtilityService,
    toastr: ToastrService) {

    super(httpclient, activatedRoute, router, authService, utilityService, toastr);
    utilityService.updateIdService(this.idService);
    this.isAddCase = false;
    this.startDate_temp = '2020-06-01';
  }

  ngOnInit() {
    let height = $(window).height() - 150;
    //let width = $(window).width() - 250;
    $('#scroll').css("overflow-y", "scroll");
    $('#scroll').css("height", height);
    // $('#modal_id').css("width",width);
    sessionStorage.setItem('lastUrl', window.location.pathname);
    /*********** Getting the Form Data ********* */
    //THIS HAS TO BE UN COMMENTED ONCE THE SERVER ISSUE OF 500 IS RESOLVED
    this.getFormData('index');
    let path = window.location.pathname;
    let splittedValues = path.split('/');
    this.splittedStringV = splittedValues[2].toLowerCase();
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
  getUpdateClass(cssClassName: string) {
    return "col-sm-3 " + cssClassName;
  }
  getDateClass(cssClassName: string) {
    return "col-sm-2 " + cssClassName;
  }
  submitForm() {
    this.submitted = true;
  }
  ngAfterViewInit() {
    let height = $(window).height() - 85;
    $('.modal-content').css("height", height);
    let utilityService = this.utilityService;
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
    this.populateGridColumn();
    /*********************************USE PROCESSDATATEMPLATES ***********************************************/
    /************* MAIN LOOP ADDED TO LOOP THROUGH THE FORM SECTIONS***********************/
    this.formData.Sections.forEach(
      section => {
        //Looping sub sections to produce relavant controls like tables/...
        utilityService.processSection(section, currentModel, utilityService, true);
      });
  
  }
  populateGridColumn(formData?: Form) {
    let  monthUrl  = "";
    let  productUrl = "";
    let formdata_temp = formData == null ? this.formData : formData;
    for (let i = 0; i < formdata_temp.GridColumns.length; i++) {
      if (this.formData.GridColumns[i].ColumnName != null) {
        this.budgetColumnName = this.formData.GridColumns[0].ColumnName;
        monthUrl = this.formData.GridColumns[0].APIUrl;
        productUrl = this.formData.GridColumns[1].APIUrl
      }
    }
    this.populateMonthData(monthUrl,productUrl);  
  }

  populateMonthData(monthRegionBudgetUrl:string,productRegionBudgetUrl:string) {
      let url = environment.templateUrl + '/' + this.module + '/' + monthRegionBudgetUrl + '/index';
      /*-----------------------------call service  for  get the data-------------------------------------------------------*/
      let response = this.utilityService.getDataFormService(url);
      response.subscribe(
        data => {
          this.monthRegionBudgetData =data.GridColumns;
          this.populateProductData(productRegionBudgetUrl);
        });
     }

  populateProductData(productRegionBudgetUrl:string) {
    let url = environment.templateUrl + '/' + this.module + '/' + productRegionBudgetUrl + '/index';
    /*-----------------------------call service  for  get the data-------------------------------------------------------*/
    let response = this.utilityService.getDataFormService(url);
    response.subscribe(
      data => {
        this.productRegionBudgetData = data.GridColumns;
        this.populateGridData();
      });
      
   }
  populateGridData(){
  if(this.monthRegionBudgetData.length>0 && this.productRegionBudgetData.length>0)
    this.regionBudgetData = this.monthRegionBudgetData.map((obj, index) => Object.assign({}, obj, this.productRegionBudgetData[index]));
  }
}
