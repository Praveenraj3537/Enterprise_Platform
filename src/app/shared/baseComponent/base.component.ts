import { Component, OnInit, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Form, ColumnString, GridColumn, Section, Header, SectionAttribute, RequestModel, PageCache } from '../interface/form-data-advanced';
import { AuthService } from 'src/app/services/auth.service';
import { UtilityService } from 'src/app/services/utility.service';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { AppConstants } from 'src/app/constants/AppConstants';

@Component({
  template: ''
})
// this class will hold base for all component and will have all utlity methods
export class BaseComponent implements OnInit {

  protected currentData: any;
  public formData: Form;
  protected pageName1: string;
  protected module: string;
  public header = '';
  form: FormGroup;
  title: string;
  formMsg: string;
  popUpUrl: string;
  isFormMsg: boolean;
  isPaginationEnabled: boolean;
  public popUpformData: Form;

  isOperationButton: boolean;
  model: any;
  protected renderer2: Renderer2;
  pageInfo1: any;
  protected gridColumns: Array<GridColumn>;
  private subscrib: Subscription;
  protected scripts: any = {};
  protected isAddCase: boolean;
  protected responseDataTemp: Observable<any>;

  constructor(protected httpclient: HttpClient,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected authService: AuthService,
    public utilityService: UtilityService,
    public toastr: ToastrService) {
    //getvalue from AppRouting MOdules
    this.pageName1 = activatedRoute.data['value'].val;
    this.module = activatedRoute.data['value'].module;

    this.utilityService.updateModule(this.module);
    this.pageInfo1 = { currentPage: 1, pagesize: 10, totalrecords: 0 };

    //set navigation property Data like navigationStart // NavigationEnd

    router.events.subscribe((routerEvent: Event) => {
      this.checkRouterEvent(routerEvent);
    });

  }

  ngOnInit() {
    //console.log('base components ngOnInit');
  }
  //Set previors page routing url in session
  checkRouterEvent(routerEvent: Event): void {
    if (routerEvent instanceof NavigationStart) {
      //Note down the previous url from session and put that to prevUrl 
      let lastUrl = sessionStorage.getItem('lastUrl');
      var routerEvent_nagivationStart = routerEvent as NavigationStart;
      var currentUrl = (routerEvent_nagivationStart != null) ? routerEvent_nagivationStart.url : '';
      if (lastUrl != null && lastUrl != currentUrl) {

        let isendingWithNumeric = lastUrl.match(/\/(\d+)$/);
        if (isendingWithNumeric == null) {
          sessionStorage.setItem(AppConstants.COMMON.COMMON_PREV_URL, lastUrl);
        }


        if (routerEvent_nagivationStart != null) {
          sessionStorage.setItem('lastUrl', currentUrl);
        }
      }

    }

    if (routerEvent instanceof NavigationEnd ||
      routerEvent instanceof NavigationCancel ||
      routerEvent instanceof NavigationError) {

    }
  }

  load(...scripts: string[]) {
    var promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
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

  getProperLabelName(label: string) {
    return this.utilityService.changePascalCaseToSpace(label);
  }
  //GET Add/Edit and Index  Data
  getFormData(type: string) {
    let url: any;
    let lastUrl = localStorage.getItem('lastUrl');
    lastUrl = (lastUrl != null && lastUrl.length > 0) ? lastUrl : '' + this.pageName1;
    let contextualUrlSplittedItems = window.location.pathname.split('/');
    let contextualItem = (type == 'addEdit') ? contextualUrlSplittedItems[contextualUrlSplittedItems.length - 2] : contextualUrlSplittedItems[contextualUrlSplittedItems.length - 1];
    url = environment.templateUrl + '/' + this.module + '/' + contextualItem + '/' + type
    let response = this.utilityService.getDataFromApiAsPromise(url);
    let splittedValues = (window.location.hash.includes('#') ? window.location.hash : window.location.pathname).split('/');

    response.then(
      data => {
        this.formData = data as Form;
        let formGroup = {};
        this.header = (type == 'addEdit') ? 'Add/Edit ' + splittedValues[2] : splittedValues[1];
        this.title = this.formData.FormName;
        let headerCtrl = document.getElementById('headerTitle') as HTMLElement;
        if(headerCtrl != null){
        headerCtrl.innerHTML =  this.title; 
        }
        this.formMsg = this.formData.FormMsg;
        this.isFormMsg = this.formData.IsFormMsg;

        this.isOperationButton = this.formData.IsOperationButton;
        this.isPaginationEnabled = this.formData.IsPaginationEnabled;


        // Looping each sections in a given FORM
        this.formData.Sections.forEach(
          section => {
            // Looping each Section Attributes in Given Section (* Section Attributes are the one that we need to show as control)
            section.SectionAttributes.forEach(sectionAttribute => {
              formGroup[sectionAttribute.ControlName] = new FormControl('', [Validators.required]);
            });
            this.generateControls(section, formGroup);
          });
        this.form = new FormGroup(formGroup);
        if (type == 'addEdit') {
          //make api call to get the data
          let id = splittedValues[splittedValues.length - 1];
          if (id != '0' && id != 'view') {
            let urlToCall = this.formData.EndPoint.EndpointAddress;
            let path = window.location.pathname;
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
                urlToCall = urlToCall.slice(0, 9) + resValue.substring(0, resValue.length - 3);
              }
              icount++;
            }
            this.formData.EndPoint.EndpointAddress = urlToCall;
            //handle View cases in special way 
            let viewCaseNumericalValue = window.location.pathname.toLowerCase().endsWith('view') ? 2 : 1;

            let actualUrl = this.utilityService.getApiUrl(this.module) + '/' + this.formData.EndPoint.EndpointAddress + '/' + splittedValues[splittedValues.length - 1];
            this.updateDataModel(actualUrl, this.formData.EndPoint.Headers, this.pageInfo1.currentPage, this.pageInfo1.pagesize);

          }
          else {
            this.isAddCase = true;
            this.utilityService.updateTypeOfCase(true);
          }
        }
      }).
      catch((error) => {
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
          this.toastr.warning('Unauthorized', 'Warning',
            { timeOut: 2000 });
        }
      });
    return this.formData;
  }
  //API call for show edit data
  async updateDataModel(urlToCall: string, headers: Array<Header>, currentPage?: any, pageSize?: any) {
    headers = headers == null ? [] : headers;
    let columnStrings: Array<ColumnString> = new Array<ColumnString>();
    headers.forEach(item => {
      columnStrings.push({ Key: item.KeyName, Value: item.ValueName })
    });
    let currentForm_temp =  this;
    let path = window.location.pathname;
    let splittedValues = path.split('/');
    let splittedValue = splittedValues[2].toLowerCase();

    if (splittedValue == "samplemethodstagereadings2") {
      this.responseDataTemp = this.utilityService.getDataFormStageReading2Service(urlToCall, currentPage, pageSize);
      this.subscrib = this.responseDataTemp.subscribe(
        data => {
          if (data.DataCollection.length > 0) {
            this.model = data.DataCollection[0];
            this.pageInfo1.totalrecords = data.PageInfo.TotalRecords;
            this.pageInfo1.currentPage = data.PageInfo.CurrentPage;
            this.pageInfo1.pagesize = data.PageInfo.PageSize;

            sessionStorage.setItem("currentPage",data.PageInfo.CurrentPage.toString());
            if(parseInt(data.PageInfo.TotalRecords)<10){
            sessionStorage.setItem(AppConstants.COMMON.COMMON_LAST_RECORD, data.PageInfo.TotalRecords.toString());
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
        },function complete(){
         
          let lblRecordsInf = document.getElementById(AppConstants.COMMON.COMMON_LBL_RECORDS_INFO1) as HTMLLabelElement;
          if (lblRecordsInf != null) {
            let fromRecord = (((currentForm_temp.pageInfo1.currentPage * currentForm_temp.pageInfo1.pagesize) - currentForm_temp.pageInfo1.pagesize) + 1);
            let toRecord = (currentForm_temp.pageInfo1.currentPage * currentForm_temp.pageInfo1.pagesize);
            toRecord = toRecord > currentForm_temp.pageInfo1.totalrecords ? currentForm_temp.pageInfo1.totalrecords : toRecord;
            lblRecordsInf.innerText = "Record(s) " + fromRecord + ' to ' + toRecord + ' of ' + currentForm_temp.pageInfo1.totalrecords + '  ';
          };
        });

    } else {
      this.responseDataTemp = this.getDataFromService(urlToCall, columnStrings);
      this.subscrib = this.responseDataTemp.subscribe(
        data => {
          if (data.DataCollection.length > 0) {
            this.model = data.DataCollection[0];
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
        });
    }

    
  }

  // Looping each Section Attributes in Given Section (* Section Attributes are the one that we need to show as control)
  generateControls(section: Section, formGroup: any) {
    section.SubSections.forEach(
      section => {
        section.SectionAttributes.forEach(sectionAttribute => {
          formGroup[sectionAttribute.ControlName] = new FormControl('');
        });
        this.generateControls(section, formGroup);
      });
  };


  populatePopupFormData(popupUrl: string) {
    if (popupUrl != null && popupUrl != '') {
      let urlToCall = environment.templateUrl + popupUrl;
      let response = this.utilityService.getDataFormService(urlToCall, null);
      response.subscribe(data => {
        this.popUpformData = data;
        console.log(this.popUpformData.Sections);
      });
    };
  };


  //toastor for succsess case
  showInfo(msg = "") {
    var x = document.getElementById("toastSuccess")
    if (x != null) {
      let divMessage = x.childNodes[1];
      if (divMessage != null) {
        let divMessageTemp = divMessage as HTMLDivElement;
        divMessageTemp.innerText = msg;
      }

      x.className = "show";
      setTimeout(function () { x.className = x.className.replace("show", ""); }, 5000);
    }
  }
  //toastor for failure case
  showError(msg = "") {
    var x = document.getElementById("toastFailure")
    if (x != null) {
      let divMessage = x.childNodes[1];
      if (divMessage != null) {
        let divMessageTemp = divMessage as HTMLDivElement;
        divMessageTemp.innerText = msg;
      }
      x.className = "show";
      setTimeout(function () { x.className = x.className.replace("show", msg); }, 5000);
    }
  };

  getPageName(): string {
    let path = window.location.pathname;
    let splittedValues = path.split('/');
    let splittedName = splittedValues[2];
    return splittedName;
  };

  setPageCache(url: string, pageName: string, requestModel: RequestModel, isClear?: boolean) {

    pageName = pageName == null ? this.getPageName() : pageName;
    let searchConf = document.getElementById("searchIndexData") as HTMLInputElement;
    let searchValue = isClear == true && isClear != undefined ? "" : searchConf.value;
    let pageCache = new PageCache();
    pageCache.Page = pageName;
    pageCache.RequestModel = requestModel;
    pageCache.Url = url;
    pageCache.SearchContent = searchValue != null ? searchValue : "";
    sessionStorage.setItem("cacheData", JSON.stringify(pageCache));


  }

  getPageCache(pageName: string): PageCache {

    pageName = pageName == null ? this.getPageName() : pageName;

    /*check if the current page is from session */
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
  //**For get value**/ satya (1)
  getDataFromService(url: string, headerValues?: Array<ColumnString>): Observable<any> {

    var response = this.utilityService.getDataFormService(url, headerValues);
    return response;
  }

  isDate(x) {
    return (null != x) && !isNaN(x) && ("undefined" !== typeof x.getDate);
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  logFromHtml(objectvalue: any) {
    //console.log(JSON.stringify(objectvalue));
  }

  private isProcessComplete: boolean;

  navigateAddEdit(id: any) {
    let url = window.location.pathname;
    let navigationPath = (url == '') ? '/' + this.pageName1 : url;
    this.router.navigate([navigationPath, id]);
    return this.router.navigate;
  }
}