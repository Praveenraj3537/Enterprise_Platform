import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector, ErrorHandler, InjectionToken, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TooltipModule } from 'ng2-tooltip-directive';
import { DynamicFormIndexComponent } from './components/dynamic-form-index/dynamic-form-index.component';
import { DynamicFormAddEditComponent } from './components/dynamic-form-addEdit/dynamic-form-addEdit.component';
import { DynamicFormReportsComponent } from './components/dynamic-form-reports/dynamic-form-reports.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule, ToastrService } from 'ngx-toastr';
 import { GlobalHttpInterceptorService } from './services/global-http-interceptor.service';
 import { GlobalErrorHandlerService } from './services/global-error-handler.service';
import { FullCalendarModule } from '@fullcalendar/angular'; // the main connector. must go first
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { CustomDatePipe } from './pipes/custom-date.pipe';
import { CustomDateTimePipe } from './pipes/custom-date-time.pipe';
import { SignOutComponent } from './components/sign-out/sign-out.component';
import { TimesheetComponent } from './components/timesheet/timesheet.component';
import { TaskboardComponent } from './components/taskboard/taskboard.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DynamicTabIndexComponent } from './components/dynamic-tab-index/dynamic-tab-index.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { AgmCoreModule } from '@agm/core';
import { CallApiComponent } from './call-api/call-api.component';
import { DynamicProjectplusHelpBarComponent } from './components/dynamic-projectplus-help-bar/dynamic-projectplus-help-bar.component';
import { DynamicIotplusHelpBarComponent } from './components/dynamic-iotplus-help-bar/dynamic-iotplus-help-bar.component';
import { DynamicSalescrmHelpBarComponent } from './components/dynamic-salescrm-help-bar/dynamic-salescrm-help-bar.component';
import { DynamicParentAssociationComponent } from './components/dynamic-parent-association/dynamic-parent-association.component';
import { DynamicChildAssociationComponent } from './components/dynamic-child-association/dynamic-child-association.component';
// import { DynamicHelpBarComponent } from './components/dynamic-help-bar/dynamic-help-bar.component';
// import { DynamicSalescrmHelpBarComponent } from './components/dynamic-salescrm-help-bar/dynamic-salescrm-help-bar.component';
// import { DynamicIotplusHelpBarComponent } from './components/dynamic-iotplus-help-bar/dynamic-iotplus-help-bar.component';


export let InjectorInstance: Injector;

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin,
  listPlugin
  
]);

const rollbarConfig = {
  // accessToken: 'da15d7f183f44701ae91244b38f5501d',
  captureUncaught: true,
  captureUnhandledRejections: true,
};

// export function rollbarFactory() {
//   return new Rollbar(rollbarConfig)
// }

// export const RollbarService = new InjectionToken<Rollbar>('rollbar');
@NgModule({

   //All Modules
   imports: [
    TooltipModule,
    BrowserModule,
    AppRoutingModule,
    FullCalendarModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule, // required animations module
    DragDropModule,
    // GoogleMapsModule,
    ToastrModule.forRoot(),
    AgmCoreModule.forRoot({
      // apiKey: 'AIzaSyDIlVuW_f1kp3Mye36B9QADph3MnLl6hLc',
      // libraries: ['places']
    })
  ],
  //All Components
  declarations: [
    AppComponent,
    DynamicFormIndexComponent,
    DynamicFormAddEditComponent,
    DynamicFormReportsComponent,
    AuthCallbackComponent,
    DashboardComponent,
    CustomDatePipe,
    CustomDateTimePipe,
    SignOutComponent,
    TimesheetComponent,
    TaskboardComponent,
    DynamicTabIndexComponent,
    CallApiComponent,
    DynamicProjectplusHelpBarComponent,
    DynamicIotplusHelpBarComponent,
    DynamicSalescrmHelpBarComponent,
    DynamicParentAssociationComponent,
    DynamicChildAssociationComponent,
  ],
 
  //All Services and Guards 
  providers: [ToastrService,
    { provide: 'LOCALSTORAGE', useFactory: getLocalStorage },
     { provide: HTTP_INTERCEPTORS, useClass: GlobalHttpInterceptorService, multi: true },
     { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: HttpErrorInterceptor,
    //   multi: true
    // }
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    InjectorInstance = this.injector;
  }
}

// Adding function to get access to local storage
export function getLocalStorage() {
  return (typeof window !== "undefined") ? window.localStorage : null;
}
