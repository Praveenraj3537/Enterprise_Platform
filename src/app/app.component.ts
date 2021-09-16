import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as $ from 'jquery';
import { AuthService } from './services/auth.service';
import { Menu, RouteEntry, AppMessage, UIMenuAndRoles, ColumnString } from './shared/interface/form-data-advanced';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from './shared/baseComponent/base.component';
import { HttpClient } from '@angular/common/http';
import { UtilityService } from './services/utility.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { AppConstants } from './constants/AppConstants';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {
    '(window:resize)': 'onResize($event)'
  }
})
export class AppComponent extends BaseComponent implements AfterViewInit {
  menuItem: Menu;
  menuData: Menu;
  authorizeData: any;
  childrenData: Object[]
  claims: any;
  appMessages: Array<AppMessage>;
  private isMenuPopulated: boolean;
  totalMessageRecords: any;
  constructor(@Inject(DOCUMENT) private document: Document,
    httpclient: HttpClient,
    activatedRoute: ActivatedRoute,
    router: Router,
    authService: AuthService,
    utilityService: UtilityService,
    toastr: ToastrService
  ) {

    super(httpclient, activatedRoute, router, authService, utilityService, toastr);
    this.isMenuPopulated = false;
    this.appMessages = new Array<AppMessage>();
  
    
  }
  onResize(event) { }

  ngAfterViewInit() { 
    let height = $(window).height();
    $('#content').css("height", height-80);
    console.log("112"+$(window).height());
  }


  ngDoCheck() {
    var menu = sessionStorage.getItem('MENU');
    if (menu != null && !this.isMenuPopulated) {
      this.isMenuPopulated = true;
      this.menuItem = JSON.parse(menu);
    }
    
  }

  /* This event is called before the controls are rendered on HTML */
  ngOnInit() {
    let height = $(window).height();
    $('#content').css("height", height-80);
    this.totalMessageRecords = 0;
    this.claims = null;
    /*This will process the login based on action (sign-in under process, sign out, completedAuthentication etc)*/
    if (sessionStorage.getItem('DASHBOARD_URLS') == null)
      sessionStorage.setItem('DASHBOARD_URLS', JSON.stringify(environment.dashboardBaseUrls))
    let x = this.authService.updateConfigFromService();
    x.then(x1 => {
      if (sessionStorage.getItem('STAGE') != null && sessionStorage.getItem('STAGE') == 'SIGNED_OUT') {

        this.router.navigate(['sign-out']);
      }
      else {
        this.authService.processLogin();
      }
    });

    // $(document).ready(function () {
    //   $('[data-toggle="tooltip"]').tooltip();
    // });

    $(".tiptext").mouseover(function () {
      $(this).children(".description").show();
    }).mouseout(function () {
      $(this).children(".description").hide();
    });
  }

  private pagesPopulated: Array<number>;
  /* Populate Application Messages */
  populateApplicationMessage() {
    this.pagesPopulated = this.pagesPopulated == null ? new Array<number>() : this.pagesPopulated;
    if (this.pagesPopulated.includes(this.pageInfo1.currentPage))
      return;
    /* create URl for Get Notification Message */
    let urlToCall = environment.appBaseUrls[0] + '/' + 'v1/appmessages' + '/' + this.pageInfo1.pagesize + '/' + this.pageInfo1.currentPage;
    let headerValues_temp = new Array<ColumnString>();
    headerValues_temp.push({
      Key: "RequestModel",
      Value: "{'Filter': {'Conditions':[{'FieldName':'IsRead','FieldValue':false}]} }"
    });
    let response = this.utilityService.getDataFormService(urlToCall, headerValues_temp);
    response.subscribe(data => {
      /*Updating the array for page number for whi hcwe got the recorsd */
      this.pagesPopulated.push(data.PageInfo.PageNumber);
      this.pageInfo1.totalrecords = data.PageInfo.TotalRecords;
      this.totalMessageRecords = data.PageInfo.TotalRecords;
      for (let i = 0; i < data.DataCollection.length; i++) {
        let existingrecords = this.appMessages.filter(t => t.Id == data.DataCollection[i].Id);

        if (existingrecords != null && existingrecords.length > 0) {


        }
        else {
          this.appMessages.push({
            Id: data.DataCollection[i].Id,
            MessageBody: data.DataCollection[i].MessageBody,
            IsRead: data.DataCollection[i].IsRead,
            RowVersion: data.DataCollection[i].RowVersion,
            AppId: data.DataCollection[i].AppId
          })
        }
      }
    });
  }

  private lastposition: number;

  scrollHandler(event) {
    if (!event) event = window.event;
    let delta = 0;

    /* normalize the delta*/
    if (event.wheelDelta) {
      /* IE and Opera  */
      delta = event.wheelDelta / 60;
    } else if (event.detail) {
      /* W3C */
      delta = -event.detail / 2;
    }

    let currentAppMessageControls = document.getElementsByClassName('messageData');
    let currentAppMessageControl = currentAppMessageControls != null && currentAppMessageControls.length > 0 ? currentAppMessageControls[0] : null;
    if (currentAppMessageControl != null) {
      let currentAppMessageControl_temp = currentAppMessageControl as HTMLDivElement;
      let currentPosition = currentAppMessageControl_temp.offsetTop;
      let action = this.lastposition != null && this.lastposition > currentPosition ? 'up' : 'down';
      this.lastposition = currentPosition;
      /*calculating the next position of the object */
      currentPosition = (currentPosition) - (delta * 10);
      this.pageInfo1.currentPage = action == 'up' ? (this.pageInfo1.currentPage - 1) : this.pageInfo1.currentPage + 1;
      this.pageInfo1.currentPage = this.pageInfo1.currentPage <= 0 ? 1 : this.pageInfo1.currentPage;
      this.pageInfo1.currentPage = (this.pageInfo1.totalrecords > 0 && this.pageInfo1.currentPage > (this.pageInfo1.totalrecords / this.pageInfo1.pagesize))
        ? (this.pageInfo1.totalrecords / this.pageInfo1.pagesize)
        : this.pageInfo1.currentPage;

      this.pageInfo1.currentPage = Math.round(this.pageInfo1.currentPage);
      this.populateApplicationMessage();
    }
  }
  /* Get current comp.  Image  */
  getImage() {
    if (sessionStorage.getItem('oidc_settings') != null) {
      let imageManagerSettings = JSON.parse(sessionStorage.getItem('oidc_settings'));
      let oidc_image = imageManagerSettings.siteImageUrl;
      return oidc_image;
    }
  }
  /* ---------------------------------This Method populate Menu --------------------------------------------*/
  populateMenu(routeEntries: Array<RouteEntry>, menu: Menu) {

    let updatedMenuResults = this.prepareMenu(menu, routeEntries);
    this.menuItem = updatedMenuResults;
    sessionStorage.setItem('MENU', JSON.stringify(updatedMenuResults));

  }
  prepareMenu(inputMenu: Menu, routeEntries: Array<RouteEntry>): Menu {

    if (inputMenu.Children != null) {
      for (let i = 0; i < inputMenu.Children.length; i++) {
        let updatedMenu = this.prepareMenu(inputMenu.Children[i], routeEntries);
        /*Updating the current menu with the processed menu after recursion, assigning it null if ots not authorized */
        inputMenu.Children[i] = (updatedMenu.ToDelete) ? null : updatedMenu;
      }
    }
    if (routeEntries.length != 0) {
      if (inputMenu.Children == null || inputMenu.Children.length == 0) {
        let stringtoMatch = routeEntries.filter(t => inputMenu.RouterPath != null && '/' + t.path.toLowerCase() == inputMenu.RouterPath.toLowerCase());
        if (stringtoMatch == null || (stringtoMatch != null && stringtoMatch.length == 0)) {
          console.log(inputMenu);
          inputMenu.ToDelete = true;
          return inputMenu;
        }
        else {
          return inputMenu;
        }
      }
      else {
        return inputMenu;
      }
    }else{
      return inputMenu;
    }
  }

  isUserLogged() {
    return this.authService.isLoggedIn();
  }
  /* SignIn Method Logic */
  signIn() {
    sessionStorage.removeItem('completeAuthenticationUnderProcess');
    sessionStorage.removeItem('authenticationUnderProcess');
    sessionStorage.removeItem('isUserLoggedOut');
    sessionStorage.removeItem(AppConstants.OIDC.STAGE);
    this.authService.startAuthentication();
  }
  /* SignOut Method Functionality */
  signOut() {
    //   var x = confirm("Are you sure you want to sign out?");
    //   if (x) {
    this.authService.logout();
    //   } else {
    //   }
  }
  /* This event is called show  email in nav bar. */
  profileData() {
    let email = '<Not Logged>';
    if (this.authService != null) {
      let claims = this.authService.getClaims();
      if (claims != null) {
        email = claims.email;
      }
    }
    return email;
  }
  /* Get the Roles from Session */
  getRoleNames(): string {
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

    return roles;
  }
  /* Get Populate ToggleMenu */
  ToggleMenu() {
    $('.sidebar').toggleClass('active');
  }
  ToggleSlideMenu(){
   // $('.sidebar').toggleClass('active1');
 
    if($('.sidebar').hasClass('active1')){
      $('.sidebar').addClass('active');
      $('.sidebar').removeClass('active1');
    } else {
      $('.sidebar').addClass('active1');
      $('.sidebar').removeClass('active');
    }
  
  }
  /* Get Populate HostName */
  getHostName() {
    return window.location.host;
  }
  getCurrentYear(){
    var cuurentDate = new Date();
    var currentYear = cuurentDate.getFullYear();
    return currentYear;
  }
  /* Get Populate Current Version */
  getVersion() {
    return environment.version;
  }

  onProjectPlusHelp() {
    this.router.navigate(['project-plus-flow'])
  }


  onSalesCRMHelp() {
    this.router.navigate(['salescrm-flow'])
  }

  onIotHelp() {
    this.router.navigate(['iotplus-flow'])
  }

  /*-----------------------------------------------APPLICATION MESSAGES OPERATIONS -------------------------------------------------------*/
  onMouseUp(event): void {
    let idValue = "0";
    let rowversion = "";
    let appId = "0";
    let parentDiv = event.target.parentElement as HTMLDivElement;
    if (parentDiv != null) {
      let hiddenInputs = parentDiv.getElementsByClassName('hiddenAppMessageIdClass');
      let hiddenInput_For_RowVersion = parentDiv.getElementsByClassName('hiddenAppMessageRowVersionClass');
      let hiddenAppId = parentDiv.getElementsByClassName('hiddenAppIdClass');
      if (hiddenInputs != null && hiddenInputs.length > 0) {
        idValue = (hiddenInputs[0] as HTMLInputElement).value;
      }

      if (hiddenInput_For_RowVersion != null && hiddenInput_For_RowVersion.length > 0) {
        rowversion = (hiddenInput_For_RowVersion[0] as HTMLInputElement).value;
      }

      if (hiddenAppId != null && hiddenAppId.length > 0) {
        appId = (hiddenAppId[0] as HTMLInputElement).value;
      }
    }
    let isRead = true;
    let requestModelWithDataCollection = {
      DataCollection: [
        {
          Id: parseInt(idValue),
          AppId: parseInt(appId),
          IsRead: true,
          AutoOffset: new Date().getTimezoneOffset(),
          EntityState: 2,
          RowVersion: rowversion
        }
      ]
    };

    /*********************** PUT OPERATION FOR APPLICATION MESSAGES******************************/
    if (idValue != "0") {
      let id = parseInt(idValue);
      let urlToCall = environment.appBaseUrls[0] + '/' + 'v1/AppMessages';
      this.utilityService.putDataToService(urlToCall, id, requestModelWithDataCollection).subscribe(data => {
        if (data.status = 200 || 204) {
          this.toastr.success('Data Submitted Successfully', 'Success',
            { timeOut: 2000 });
        }
      }, (error) => {
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

    }
  }
}
