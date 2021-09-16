import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { Menu, ColumnString, UIMenu, UIMenuAndRoles } from './shared/interface/form-data-advanced';
import { environment } from 'src/environments/environment';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient as HttpClient2, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SignOutComponent } from './components/sign-out/sign-out.component';
import { DynamicFormAddEditComponent } from './components/dynamic-form-addEdit/dynamic-form-addEdit.component';
import { DynamicFormIndexComponent } from './components/dynamic-form-index/dynamic-form-index.component';
import { TaskboardComponent } from './components/taskboard/taskboard.component';
import { TimesheetComponent } from './components/timesheet/timesheet.component';
import { DynamicTabIndexComponent } from './components/dynamic-tab-index/dynamic-tab-index.component';
import { DynamicFormReportsComponent } from './components/dynamic-form-reports/dynamic-form-reports.component';
import { CallApiComponent } from './call-api/call-api.component';
import { DynamicProjectplusHelpBarComponent } from './components/dynamic-projectplus-help-bar/dynamic-projectplus-help-bar.component';
import { DynamicSalescrmHelpBarComponent } from './components/dynamic-salescrm-help-bar/dynamic-salescrm-help-bar.component';
import { DynamicIotplusHelpBarComponent } from './components/dynamic-iotplus-help-bar/dynamic-iotplus-help-bar.component';
import { DynamicParentAssociationComponent } from './components/dynamic-parent-association/dynamic-parent-association.component';
import { DynamicChildAssociationComponent } from './components/dynamic-child-association/dynamic-child-association.component';

const routes: Routes = [
  { path: 'home', component: DashboardComponent, canActivate: [AuthGuardService], data: { "val": "Dashboards", "module": "platform" } },
  { path: 'home', redirectTo: 'home', pathMatch: 'full' },
  { path: 'auth-callback', component: AuthCallbackComponent },
  { path: 'sign-out', component: SignOutComponent },
  { path: 'call-api', component: CallApiComponent, canActivate: [AuthGuardService] },
  { path: 'project-plus-flow', component: DynamicProjectplusHelpBarComponent },
  { path: 'salescrm-flow', component: DynamicSalescrmHelpBarComponent },
  { path: 'iotplus-flow', component: DynamicIotplusHelpBarComponent },

];

const headerOption = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
}
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false})],
  exports: [RouterModule]
})

export class AppRoutingModule {
  router: Router;
  httpClient: HttpClient2;

  constructor(router: Router, private http: HttpClient2, private authService: AuthService) {
    this.router = router;
    this.httpClient = http;

    /*GET THE MENU FOR ALL APPS THAT ARE REGISTERED OR USER, EXAMPLE PLATFORM, PROJECTPLUS*/
    if (sessionStorage.getItem('ROUTED_ADDED') != null && sessionStorage.getItem('ROUTED_ADDED') == 'true') {
      /*Read from Session Variables*/
      environment.appBaseUrls.forEach(url => {
        let url_temp = url + '/v1/common/menus';
        let key = "routingEntries_" + url_temp;
        this.getRoutesInfo(url_temp);
      });
      sessionStorage.setItem('ROUTED_ADDED', 'true');
    }
  }



 
  /*Populate All Routes  Dynamically (This methods provides Path,Component and Data Dynamically) */
 

  handleError(error: HttpErrorResponse) {
    return throwError(error);
  }
  /* Append All  Headers */
  appendHeaders(additionalHeaders?: Array<ColumnString>): HttpHeaders {
    let headers1 = new HttpHeaders();
    headers1 = headers1.set('Content-Type', 'application/json');
    if (additionalHeaders != null) {
      additionalHeaders.forEach(item => {
        headers1 = headers1.set(item.Key, item.Value);
      });
    }
    return headers1;
  };

  
  getRoutesInfo(url) {
    /*Make a Service call to get the routes*/
    /*this swill loop all apps for the routs*/
    let key = "routingEntries_" + url;
    let valueFromSessionStorage = sessionStorage[key] != null ? sessionStorage[key] : null;

    if (valueFromSessionStorage == null) {
      let headers1 = this.appendHeaders(null);
      let headers = { headers: headers1 }

      //*********** running via Observable  */
      let serviceData_temp = this.httpClient.get(url, headers).pipe(catchError(this.handleError));
      serviceData_temp.subscribe((data) => {
        let dataOfUIMenu_and_Roles = data as UIMenuAndRoles; // Array<UIMenu>;
        if (dataOfUIMenu_and_Roles != null && dataOfUIMenu_and_Roles.Menus.length > 0) {
          this.populateRoutes(dataOfUIMenu_and_Roles.Menus);
          /*Adding to the Session Storage*/
          sessionStorage[key] = JSON.stringify(dataOfUIMenu_and_Roles);
        }
      })
    }
    else {
      let sessionData = JSON.parse(valueFromSessionStorage);
      let dataOfUIMenu_and_Roles = sessionData as UIMenuAndRoles;
      this.populateRoutes(dataOfUIMenu_and_Roles.Menus);
    }
  }
  /*Populate All Routes  Dynamically (This methods provides Path,Component and Data Dynamically) */
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
 /* THIS METHOD CHECK PAGE IS WHICH TYPES */
 returnPageType(componentType: string): any {
  let page: any;
  switch (componentType) {
    case "index":
      page = DynamicFormIndexComponent;
      break;
    case "addEdit":
      page = DynamicFormAddEditComponent;
      break;
    case "report":
      page = DynamicFormReportsComponent;
      break;
    case "taskboard":
      page = TaskboardComponent;
      break;
    case "timesheet":
      page = TimesheetComponent;
      break;
    default:
      page = DynamicFormIndexComponent;
      break;
  };
  return page;
}

 /* THIS METHOD CHECK PAGE IS WHICH TYPES */
  /* THis Method Generates Routes  */
  generateRoutes(router: Router, menu: Menu, unshiftItems: Array<any>) {
    unshiftItems = unshiftItems == null ? [] : unshiftItems;
    if (menu.Children != null) {
      menu.Children.forEach(
        menu => {
          let unshiftItem = {
            path: (menu.RouterPath == null) ? '/' :
              menu.RouterPath.replace('/', ''),
              component: this.returnPageType(menu.ComponentType),
            data: {
              "val": menu.Value != null ? menu.Value : ''
            },
            canActivate: menu.CanActivate != null && menu.CanActivate == true ? [AuthGuardService] : []
          };
          if (menu.RouterPath != null && menu.RouterPath.length > 0) {
            unshiftItems.push(unshiftItem);
          }
          else {
            unshiftItems = this.generateRoutes(router, menu, unshiftItems);
          }
        });
    }
    return unshiftItems
  }
}

