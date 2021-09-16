import { Component, OnInit, ViewChild, ElementRef, AfterViewInit  } from '@angular/core';
import { UtilityService } from '../../services/utility.service';
import { HttpClient } from '@angular/common/http';
//import { AuthService } from 'src/app/services/auth.service.js';
import { Router, ActivatedRoute } from '@angular/router';
import {Scripts } from '../../shared/interface/form-data-advanced';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { BaseComponent } from 'src/app/shared/baseComponent/base.component';
import { AuthService } from 'src/app/services/auth.service';

declare var loadDashboards: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent extends BaseComponent implements OnInit,AfterViewInit {
  @ViewChild('startDate', { static: false }) startDate: ElementRef<any>;
  @ViewChild('endDate', { static: false }) endDate: ElementRef;
  
  ScriptStore: Scripts[] = (this.checkIfPageRequireMqttDirectSerial()) ?[
    { name: 'Dashboard_Script', src: '../../../assets/scripts/dashboard_helper.js' },
    { name: 'Canvas_Script', src: '../../../assets/scripts/canvasjs.min.js' }

  ]:[];


  constructor(httpclient: HttpClient,
    activatedRoute: ActivatedRoute,
    router: Router,
    _elementRef: ElementRef,
    authService: AuthService,
    utilityService: UtilityService,
    toastr: ToastrService) {

    super(httpclient, activatedRoute,router, authService, utilityService,toastr);
      //INITIALING THE SCRIPTS 
      this.ScriptStore.forEach((script: any) => {
        this.scripts[script.name] = {
          loaded: false,
          src: script.src
        };
      });

      this.isDataPopulated = false;
     //this.startDate=
  
  }
  
  private firstDay:Date;
  private lastDay:Date;
  private isDataPopulated : boolean;

  checkIfPageRequireMqttDirectSerial(): boolean {
    let status: boolean
    status = (window.location.pathname.search('home') >=0 || window.location.pathname.search('Dashboard') >=0);
    return status;
  }
  
  ngOnInit() {

    var date = new Date();
    this.firstDay= new Date(date.getFullYear(), date.getMonth(), 1);
    this.lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    this.firstDay.setDate(this.firstDay.getDate()+1);
    this.lastDay.setDate(this.lastDay.getDate()+1);

    // let stDate_temp = this.firstDay.toISOString().slice(0, 10);
    // let endDate_temp = this.lastDay.toISOString().slice(0, 10);

    // if(loadDashboards!=null){
      
    //   loadDashboards(stDate_temp, endDate_temp);
    // }
    
  }

  ngDoCheck(){

    if(!this.isDataPopulated && sessionStorage.getItem('oidc_settings') != null){
      let userManagerSettings = JSON.parse(sessionStorage.getItem('oidc_settings'));
      let user_specific_info = (userManagerSettings != null) ? (userManagerSettings.authority + ':' + userManagerSettings.client_id) : '';
      let oidc_token = sessionStorage.getItem('oidc.user:' + user_specific_info);

      if(oidc_token==null) return;

      this.isDataPopulated = true;
      var date = new Date();
      this.firstDay= new Date(date.getFullYear(), date.getMonth(), 1);
      this.lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
      this.firstDay.setDate(this.firstDay.getDate()+1);
      this.lastDay.setDate(this.lastDay.getDate()+1);
  
      let stDate_temp = this.firstDay.toISOString().slice(0, 10);
      let endDate_temp = this.lastDay.toISOString().slice(0, 10);

      console.log('do check');
  
      if(loadDashboards!=null){
        
        loadDashboards(stDate_temp, endDate_temp);
      }
    }
  }

 ngAfterViewInit(){
  

  let stDate = this.startDate.nativeElement as HTMLInputElement;
    let endDate = this.endDate.nativeElement as HTMLInputElement;


   stDate.value= this.firstDay.toISOString().slice(0, 10);
   endDate.value = this.lastDay.toISOString().slice(0, 10);
  
   

 }
 processDashboardData(startDate:any,endDate:any){
   if(startDate.value > endDate.value){
    this.toastr.error("Start date should be less than or equal to end date", 'Error',
    { timeOut: 2000 });
     //  alert("Start date should be less than or equal to end date")
   }else{
    if(loadDashboards!=null){
      loadDashboards( startDate.value, endDate.value);
    }
   }
  
 }
}
