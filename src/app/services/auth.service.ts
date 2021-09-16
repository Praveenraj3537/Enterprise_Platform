import { Injectable } from '@angular/core';
import { UserManager, UserManagerSettings, User } from 'oidc-client';
import { Router } from '@angular/router';
import { HttpClient as HttpClient2, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { AuthGuardService } from './auth-guard.service';
import { DynamicFormIndexComponent } from '../components/dynamic-form-index/dynamic-form-index.component';
import { DynamicFormAddEditComponent } from '../components/dynamic-form-addEdit/dynamic-form-addEdit.component';
import { DynamicFormReportsComponent } from '../components/dynamic-form-reports/dynamic-form-reports.component';
import { UIMenu, ColumnString, KeyValueOfUIMenu, Menu, UIMenuAndRoles } from '../shared/interface/form-data-advanced';
import { AppRoutingModule } from '../app-routing.module';

import { catchError } from 'rxjs/operators';
import { KeyValue } from '@angular/common';
import { MenuItem } from '../shared/mock/mock-menu-json';
import { AppConstants } from '../constants/AppConstants';
import { TaskboardComponent } from '../components/taskboard/taskboard.component';
import { TimesheetComponent } from '../components/timesheet/timesheet.component';
import { DynamicTabIndexComponent } from '../components/dynamic-tab-index/dynamic-tab-index.component';
import { DynamicChildAssociationComponent } from '../components/dynamic-child-association/dynamic-child-association.component';
import { DynamicParentAssociationComponent } from '../components/dynamic-parent-association/dynamic-parent-association.component';




@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private manager: UserManager; // = new UserManager(getClientSettings());
  private user: User = null;
  public httpClient: HttpClient2;
  private allRoutes: Array<KeyValueOfUIMenu>;
  menuItem: Menu;
  public routerValues = [];
  private _userManagerSettings: UserManagerSettings;


  constructor(private router: Router, private cookieService: CookieService, httpClient_temp: HttpClient2) {
    this.httpClient = httpClient_temp;

    //************ TRY TO GET OIDC FROM 'appBaseUrls' ******************* */
    // if(sessionStorage.getItem(AppConstants.OIDC.OIDC_SETTINGS) == null){
    //   let platformUrl = environment.appBaseUrls[0];
    //   let configuration = httpClient_temp.get(platformUrl + '/v1/General/Configuration').toPromise();
    //   configuration.then((data)=>{
    //     let json_oidc_settings = JSON.stringify(data);
    //     sessionStorage.setItem(AppConstants.OIDC.OIDC_SETTINGS, json_oidc_settings);

    //     // if(this.manager==null)
    //     //   this.manager = new UserManager(getClientSettings());
    //   });
    // }

    // //*********** Setting the OIDC Setitngs to SESSION ************** */
    // if(environment!=null && environment[AppConstants.OIDC.OIDC_SETTINGS]!=null && sessionStorage.getItem(AppConstants.OIDC.OIDC_SETTINGS)==null){
    //   let json_oidc_settings = JSON.stringify(environment.oidc_settings);
    //   sessionStorage.setItem(AppConstants.OIDC.OIDC_SETTINGS, json_oidc_settings);
    // }

    // if(this.manager==null)
    //   this.manager = new UserManager(getClientSettings());

    this.allRoutes = new Array<KeyValueOfUIMenu>();
    if (this.manager != null){

      this.manager.getUser().then(user => {
        this.user = user;
      });
      
      this.manager.events.addAccessTokenExpiring(x => {
        console.log('Acess token expiring event');
        this.renewToken().then(u => {
          console.log('Acess token expiring event renew success');
        });
      });
    }
     

    

    //Subscribing to events
    //this.subscribeEvents();
  };

  renewToken() {
    return this.manager.signinSilent().then(u => {
      this.user = u;
    }).catch(er => {
      console.log(er);
    });
  };

  subscribeEvents() {
    this.manager.events.addSilentRenewError(() => {
      console.log("error SilentRenew");
    });

    this.manager.events.addAccessTokenExpiring(() => {
      console.log("access token expiring");
    });

    this.manager.events.addAccessTokenExpired(() => {
      console.log("access token expired");
    });
  };

  refreshCallBack(): void {
    console.log("start refresh callback");
    this.manager.signinSilentCallback()
      .then(data => { console.log("suucess callback") })
      .catch(err => {
        console.log("err callback");
      });
    console.log("end refresh callback");
  };

  ngDoCheck() {
    if (sessionStorage.getItem(AppConstants.OIDC.OIDC_SETTINGS) != null) {
      if (this.manager == null)
        this.manager = new UserManager(getClientSettings());
    }
    // let environmentUrlsLength = environment.appBaseUrls.length;

    // if(this.allRoutes.length ==  environmentUrlsLength){
    //   this.populateMenu(this.allRoutes, MenuItem);
    // }
  };


  async updateConfigFromService() {

    if (environment != null && sessionStorage.getItem(AppConstants.OIDC.OIDC_SETTINGS) == null) {
      //if (environment != null && sessionStorage.getItem(this._oidc_settings)==null) {
      // let url = environment.appBaseUrls[0] + '/Dashboard';
      let url = environment.appBaseUrls[0] + '/v1/General/Configuration';
      let headers1 = new HttpHeaders();
      // console.log('fetching config data from ' + url); 
      headers1 = headers1.set('Content-Type', 'application/json');
      headers1 = headers1.set('Access-Control-Allow-Origin', '*');
      // headers1 = headers1.set('HOST', window.location.host);
      // console.log('host is :' + window.location.host);
      let headers = { headers: headers1 }
      let request = this.httpClient.get(url, headers).toPromise();
      //let request = this._httpClient.get(gqlUrl).toPromise();
      let result = await request.then(data => {
        let is_production = environment['production'] as boolean;
        data['redirect_uri'] = window.location.protocol + '//' + window.location.host + '/' + 'auth-callback';
        data['post_logout_redirect_uri'] = window.location.protocol + '//' + window.location.host;
        data['silent_redirect_uri'] = window.location.protocol + '//' + window.location.host + '/silent-refresh.html';
        this._userManagerSettings = data as UserManagerSettings;
        sessionStorage.setItem(AppConstants.OIDC.OIDC_SETTINGS, JSON.stringify(this._userManagerSettings));
        console.log("2"+ AppConstants.OIDC.OIDC_SETTINGS);
        //************ If its not production, try to take from environment */
        // if (is_production != null && !is_production) {
        //     this.populateUserManagerSettingsFromEnvironment(environment);
        // }

      }, (error) => {
        console.log('Error on retrival user settings in server' + JSON.stringify(error));
      });
    }
  }

  populateMenu(routeEntries: Array<KeyValueOfUIMenu>, menu: Menu) {

    let allmenuItems = new Array<UIMenu>();
    routeEntries.forEach(item => {
      item.Value.forEach(value_temp => {
        allmenuItems.push(value_temp);
      });
    });
    let menu_temp = this.prepareMenu(menu, allmenuItems); //recursion;
    menu_temp.Children = menu_temp.Children.filter(t => t != null);
    sessionStorage.setItem('MENU', JSON.stringify(menu_temp));
  }

  prepareMenu(inputMenu: Menu, routeEntries: Array<UIMenu>): Menu {

    //TODO: deleete from route entries later

    if (inputMenu.Children != null) {
      for (let i = 0; i < inputMenu.Children.length; i++) {
        let updatedMenu = this.prepareMenu(inputMenu.Children[i], routeEntries);
        //Updating the current menu with the processed menu after recursion, assigning it null if ots not authorized
        inputMenu.Children[i] = (updatedMenu == null || updatedMenu.ToDelete) ? null : updatedMenu;
      }

    }

    if (routeEntries.length != 0) {
      if (inputMenu.Children == null || inputMenu.Children.length == 0) {

        let matchedEntry = routeEntries.filter(t => inputMenu.RouterPath.toLowerCase() == ('/' + t.path.toLowerCase()));
        if (matchedEntry == null || (matchedEntry != null && matchedEntry.length == 0)) {
          inputMenu.ToDelete = true;
          return inputMenu;
        }
        else {
          return inputMenu;
        }
      }
      else {
        inputMenu.Children = inputMenu.Children.filter(t => t != null);
        inputMenu.ToDelete = inputMenu.Children.length == 0 ? true : false;
        return inputMenu;
      }
    }else{
      console.log(inputMenu.Text);
      return inputMenu;
    }
  }


  isSessionValuePopulated(): boolean {

    let key = (this.manager == null) ? null : 'oidc.user:' + this.manager.settings.authority + ':' + this.manager.settings.client_id;
    return (key != null && sessionStorage[key] != null) ? true : false;
  }

  getCurrentUser(): User {
    return this.user;
  }

  isUserLoggedIn() {
    let user_specific_info = (this._userManagerSettings != null) ? (this._userManagerSettings.authority + ':' + this._userManagerSettings.client_id) : '';
    let oidc_token = sessionStorage.getItem('oidc.user:' + user_specific_info);

    let userLoggedIn = false;

    if (oidc_token != null) {
      let oidc_token_parsed = JSON.parse(oidc_token);
      let currentDateStamp = Math.floor(Number(Date.now().toString()) / 1000);
      let expires_at = oidc_token_parsed['expires_at'];
      if (expires_at != null) {
        userLoggedIn = currentDateStamp < expires_at;
      }

    }
    return userLoggedIn;
  }

  logout(): boolean {
    if (this.manager == null)
      return false;

    sessionStorage.setItem(AppConstants.OIDC.STAGE, AppConstants.AUTHENTICATION_STAGES.SIGN_OUT);
    console.log("3"+ AppConstants.OIDC.STAGE);
    //Store the auth_time 
    let key = (this.manager == null) ? null : 'oidc.user:' + this.manager.settings.authority + ':' + this.manager.settings.client_id;
    var oidc_values = JSON.parse(sessionStorage.getItem(key));
    let auth_time:number = oidc_values["profile"]["auth_time"];
    let id_token = oidc_values["id_token"];

    console.log("authentication time" + auth_time);

    //Remove all other items from session
    //sessionStorage.removeItem('MENU');
    //sessionStorage.removeItem('oidc_settings');
    sessionStorage.removeItem('expires_at');
    //sessionStorage.removeItem('lastUrl');
    sessionStorage.removeItem('FQModel');

    let logout_status = false;

    try {
      let clearStaleState_temp = this.manager.clearStaleState();
      let status = clearStaleState_temp.then(d => {

        //this.manager.signoutPopup

        let signOut = this.manager.signoutRedirect();

        //let signOut = this.manager.signoutPopup(); //.signoutRedirect();
        let signoutRedirect = this.manager.signoutRedirectCallback();
        //let signoutRedirect = this.manager.signoutPopupCallback();
        signoutRedirect.then(d => {
          sessionStorage.setItem(AppConstants.OIDC.STAGE, AppConstants.AUTHENTICATION_STAGES.SIGNED_OUT);
          console.log("1"+AppConstants.OIDC.STAGE);
          sessionStorage.setItem(AppConstants.OIDC.IS_APP_LOADED, "false");
          // sessionStorage.removeItem(AppConstants.OIDC.OIDC_SETTINGS);
          //sessionStorage.removeItem(AppConstants.OIDC.IS_APP_LOADED);
          sessionStorage.removeItem('DASHBOARD_URLS');

          sessionStorage.setItem(AppConstants.OIDC.EXPIRES_AT, auth_time.toString());
          console.log("4"+ AppConstants.OIDC.EXPIRES_AT);
          //SETTING THE LOG OUT URL 
          let post_logout_redirect_uri   = "https://localhost:4200/sign-out"

          // sessionStorage.removeItem(AppConstants.GENERAL.ROUTED_ADDED);
          //sessionStorage.removeItem('routingEntries_https://platform.antronsys.com/v1/common/menus');

          //Redirecting to logout page
          //this.router.navigate(['sign-out']);
        });

      });
      //logout_status = (status) true;
    }
    catch (e) {
      //TODO: add logging thru logger
      console.log(JSON.stringify(e));
      logout_status = false;
    }
    finally {

    }

    return logout_status;

  }
  navigateAddEdit(routeEntry: string, id: any) {
    return this.router.navigate([routeEntry, id]);
  }

  isLoggedIn(): boolean {
    return this.user != null && !this.user.expired;
  }

  getClaims(): any {
    if ((this.user) == null) {
      return null;
    }
    else {
      return this.user.profile == null ? '' : this.user.profile;
    }
  }

  getAuthorizationHeaderValue(): string {
    return `${this.user.token_type} ${this.user.access_token}`;
  }

  startAuthentication() //: Promise<any> 
  {
    if (this.manager == null)
      this.manager = new UserManager(getClientSettings());
    let startAuthentication = this.manager.signinRedirect();
    startAuthentication.then(data => {
      sessionStorage.setItem(AppConstants.OIDC.STAGE, AppConstants.AUTHENTICATION_STAGES.STARTED_AUTHENTICATION);
      console.log("5",AppConstants.OIDC.STAGE);
    });


    // let isAppLoaded = sessionStorage.getItem('isAppLoaded');
    // let stage = sessionStorage.getItem('STAGE');
    // //Start Authentication only once
    // if(!(isAppLoaded!=null && isAppLoaded=='true')){
    //   let startAuthentication = this.manager.signinRedirect();
    //   startAuthentication.then(data=>{
    //       sessionStorage.setItem('STAGE','START-AUTH');
    //       console.log(data);
    //   });

    //   sessionStorage.setItem('isAppLoaded','true');
    // }
    // else if (stage!=null && stage=='SIGNED-OUT'){
    //   let startAuthentication = this.manager.signinRedirect();
    //   startAuthentication.then(data=>{
    //       sessionStorage.setItem('STAGE','START-AUTH');
    //       console.log(data);
    //   });

    // }
  }

  /**
    * 
    * @param tokenType > this can be 'access_token' or 'id_token', default is 'access_token'
    */
  getToken(tokenType: string = 'access_token') {
    let token = '';
    let userManagerSettings = sessionStorage.getItem(AppConstants.OIDC.OIDC_SETTINGS) != null ? JSON.parse(sessionStorage.getItem(AppConstants.OIDC.OIDC_SETTINGS)) : null;
    let user_specific_info = (userManagerSettings != null) ? (userManagerSettings.authority + ':' + userManagerSettings.client_id) : '';
    let oidc_token = sessionStorage.getItem('oidc.user:' + user_specific_info);
    if (oidc_token != null) {
      let oidc_token_object = JSON.parse(oidc_token);
      token = oidc_token_object[tokenType];
    }
    return token;
  }

  processLogin() {
    let isAppLoaded = sessionStorage.getItem(AppConstants.OIDC.IS_APP_LOADED);
    let stage = sessionStorage.getItem(AppConstants.OIDC.STAGE);
    //Start Authentication only once
    if (!(isAppLoaded != null && isAppLoaded == 'true')) {
      //Set the session for OIDC
      // if(environmentRef!=null && environmentRef[AppConstants.OIDC.OIDC_SETTINGS]!=null && sessionStorage.getItem(AppConstants.OIDC.OIDC_SETTINGS)==null){
      //   let json_oidc_settings = JSON.parse(environmentRef[AppConstants.OIDC.OIDC_SETTINGS]);
      //   sessionStorage.setItem(AppConstants.OIDC.OIDC_SETTINGS, json_oidc_settings);
      // }

      if (this.manager == null)
        this.manager = new UserManager(getClientSettings());

      this.startAuthentication();
      sessionStorage.setItem(AppConstants.OIDC.IS_APP_LOADED, 'true');
    }
    else if (stage != null && stage == AppConstants.AUTHENTICATION_STAGES.SIGNED_OUT) {
      // this.startAuthentication();
      this.cookieService.deleteAll('/');
    }
  }


  completeAuthentication(): Promise<any> {
    if (this.manager == null)
      this.manager = new UserManager(getClientSettings());

    return this.manager.signinRedirectCallback().then(user => {
      this.user = user;
      sessionStorage.setItem(AppConstants.OIDC.STAGE, AppConstants.AUTHENTICATION_STAGES.COMPLETE_AUTHENTICATION); // 'AUTH-COMPLETE');
      console.log("5"+AppConstants.OIDC.STAGE);
      sessionStorage.setItem('expires_at', this.user.expires_at.toString());
      //After the Authentication, please call the app routing's populate routes
      if (sessionStorage.getItem(AppConstants.GENERAL.ROUTED_ADDED) == null || (sessionStorage.getItem(AppConstants.GENERAL.ROUTED_ADDED) != null && sessionStorage.getItem(AppConstants.GENERAL.ROUTED_ADDED) != 'true')) {
        this.initiateRoutes();
        sessionStorage.setItem(AppConstants.GENERAL.ROUTED_ADDED, 'true');
      }
      let lastUrl = sessionStorage.getItem('lastUrl');
      let urlToRedirect = lastUrl != null ? lastUrl : '/home';
      this.router.navigate([urlToRedirect]);
    });
  }

  initiateRoutes() {
    environment.appBaseUrls.forEach(url => {
      let url_temp = url + '/v1/common/menus';
      this.getRoutesInfo(url_temp);
    });
  }

  getRoutesInfo(url) {
    //Make a Service call to get the routes
    //this swill loop all apps for the routs
    let key = "routingEntries_" + url;
    let valueFromSessionStorage = sessionStorage[key] != null ? sessionStorage[key] : null;
    if (valueFromSessionStorage == null) {
      let columnStrings = new Array<ColumnString>();
      columnStrings.push({
        Key: 'GetAllClaims',
        Value: 'true'
      });

      let headers1 = this.appendHeaders(columnStrings);
      let headers = { headers: headers1 }
      let serviceData_temp = this.httpClient.get(url, headers).pipe(catchError(this.handleError));

      serviceData_temp.subscribe((data) => {
        let data_of_UIMenus_and_Roles = data as UIMenuAndRoles;
        let dataOfUIMenus = data_of_UIMenus_and_Roles.Menus;
        let keyValueOfUImenu = new KeyValueOfUIMenu();
        keyValueOfUImenu.Key = key;
        keyValueOfUImenu.Value = dataOfUIMenus;
        this.populateRoutes(dataOfUIMenus);
        this.allRoutes.push(keyValueOfUImenu);
        //Adding to the Session Storage
        sessionStorage[key] = JSON.stringify(data_of_UIMenus_and_Roles);
        //If all routes has been captured
        let environmentUrlsLength = environment.appBaseUrls.length;
        if (this.allRoutes.length == environmentUrlsLength) {
          this.populateMenu(this.allRoutes, MenuItem);
        }
      }, (error) => {
        // console.log(error)
      });
    }
    else {
      let sessionData = JSON.parse(valueFromSessionStorage);
      let dataOfUIMenu_and_Roles = sessionData as UIMenuAndRoles;
      let dataOfUIMenus = dataOfUIMenu_and_Roles.Menus;
      this.populateRoutes(dataOfUIMenus);
    }
  }

  handleError(error: HttpErrorResponse) {

    return throwError(error);
  }

  appendHeaders(additionalHeaders?: Array<ColumnString>): HttpHeaders {

    let headers1 = new HttpHeaders();
    let token = this.getAuthorizationHeaderValue();

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

  populateRoutes(dataOfUIMenus: Array<UIMenu>) {
    if (dataOfUIMenus != null) {
      dataOfUIMenus.forEach(item => {

        let obj_route = item.canActivate ?
          {
            path: item.path,
            component: item.typeofpage == 'index' ? DynamicFormIndexComponent : (item.typeofpage == 'addEdit') ? DynamicFormAddEditComponent : (item.typeofpage == 'taskboard')?TaskboardComponent:(item.typeofpage == 'timesheet')?TimesheetComponent:(item.typeofpage == 'tab')?DynamicTabIndexComponent: (item.typeofpage == 'dynamicparentassociation')?DynamicParentAssociationComponent: (item.typeofpage == 'dynamicchildassociation')?DynamicChildAssociationComponent:DynamicFormReportsComponent,
            data: item.data, canActivate: [AuthGuardService]
          } :
          {
            path: item.path,
            component: item.typeofpage == 'index' ? DynamicFormIndexComponent : (item.typeofpage == 'addEdit') ? DynamicFormAddEditComponent : (item.typeofpage == 'taskboard')?TaskboardComponent:(item.typeofpage == 'timesheet')?TimesheetComponent:(item.typeofpage == 'tab')?DynamicTabIndexComponent: (item.typeofpage == 'dynamicparentassociation')?DynamicParentAssociationComponent: (item.typeofpage == 'dynamicchildassociation')?DynamicChildAssociationComponent:DynamicFormReportsComponent,
            data: item.data
          }
        this.router.config.unshift(obj_route);
      });
    }
  }
}

function getCurrentHost() {
  return window.location.host;
}

export function getClientSettings(): UserManagerSettings {

  let oidc_settings: UserManagerSettings = {};

  let session_oidc_settings = sessionStorage.getItem(AppConstants.OIDC.OIDC_SETTINGS) != null ? JSON.parse(sessionStorage.getItem(AppConstants.OIDC.OIDC_SETTINGS)) : null;
  let oidc_settings_temp = session_oidc_settings ??
  {
    // authority: 'https://antronsysinfo.okta.com/',
    authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_PT6NoLhLE',
    // client_id: '0oa5f0npienbKPn9t4x6',
    client_id: '',
    response_type: "code",
    scope: "openid profile email",
    filterProtocolClaims: true,
    loadUserInfo: true,
    automaticSilentRenew: false,
    includeIdTokenInSilentRenew: false,
    revokeAccessTokenOnSignout: true,
  };

  oidc_settings_temp.redirect_uri = window.location.protocol + '//' + window.location.host + '/' + 'auth-callback';
  oidc_settings_temp.post_logout_redirect_uri = window.location.protocol + '//' + window.location.host;
  oidc_settings_temp.silent_redirect_uri = window.location.protocol + '//' + window.location.host + '/silent-refresh.html';
  oidc_settings_temp.automaticSilentRenew = true;
  oidc_settings_temp.silentRequestTimeout = 10000;
  oidc_settings = oidc_settings_temp as UserManagerSettings;

  //oidc_settings.

  return oidc_settings;

  // return {
  //     //*********** GOOGLE ******************** */ 
  //    //  authority: 'https://accounts.google.com/',
  //   //   client_id:'112794653344-vruckajkuvb70rmrp7a6fclonfopuama.apps.googleusercontent.com',
  //     // redirect_uri: 'http://localhost:4200/auth-callback',
  //     // client_secret: "tbw05DwJjQBokMA3Tuoxb_fj",

  //     //********** OKTA ************************* */
  //    // authority: 'https://antronsys.okta.com/',
  //    // client_id: '0oa27bkesk1YRQtkC4x6', // '0oa27bkesk1YRQtkC4x6', // '0oa27ahe6VOHHOnRm4x6',

  //        //********** OKTA (INFO@)************************* */
  //      authority: 'https://antronsysinfo.okta.com/',
  //      client_id: '0oa5f0npienbKPn9t4x6', // '0oa27bkesk1YRQtkC4x6', // '0oa27ahe6VOHHOnRm4x6',

  //     //********** LOCAL************************* */
  //     // authority: 'http://localhost:5000/',
  //     // client_id: 'js_oidc', 

  //     //***********OPEN-ID (IDENTITY SERVER 4) ************** (TODO) */


  //     //*********** COMMON CONFIG ENTRIES ****************** */
  //     redirect_uri: window.location.protocol + '//' + window.location.host + '/' + 'auth-callback',
  //     response_type:"code",
  //     scope:"openid profile email",
  //     post_logout_redirect_uri: window.location.protocol + '//' + window.location.host,
  //     filterProtocolClaims: true,
  //     loadUserInfo: true,
  //     automaticSilentRenew: false,
  //     includeIdTokenInSilentRenew: false,
  //     revokeAccessTokenOnSignout: true,

  //     silent_redirect_uri: window.location.protocol + '//' + window.location.host + '/silent-refresh.html' 



  //     //************************* PREVIOUS CODE ONLY KEFT FOR REFERENCE  */
  //     //redirect_uri: 'http://localhost:4200/auth-callback',
  //     // 'https://newweb.salescrmplus.com/auth-callback',
  //     //  redirect_uri: "http://dev.cxo-insights.com",
  //     //  client_secret: 'n9UYBqSq8myfgSnTBkuyuQeX0um9gJbfrDZGdz2q',
  //     //Audience 0oa27bkesk1YRQtkC4x6


  //     //scope:"openid profile email api1 api2.read_only api2.full_access",

  //     //post_logout_redirect_uri: 'http://localhost:4200/',
  //     // post_logout_redirect_uri: window.location.protocol + '//' + window.location.host , // 'https://newweb.salescrmplus.com/',

  //     // post_logout_redirect_uri: 'http://dev.cxo-insights.com/',


  //     // silent_redirect_uri: 'http://localhost:4200/silent-refresh.html'
  //     // 'https://newweb.salescrmplus.com/silent-refresh.html'

  //     // silent_redirect_uri: 'http://dev.cxo-insights.com/silent-refresh.html'
  //     //********************* END OF OLD CODE ************************************* */
  // };
}