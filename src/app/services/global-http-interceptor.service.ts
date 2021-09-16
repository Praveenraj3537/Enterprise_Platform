import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from "rxjs";
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as $ from 'jquery';

declare var modalLoader: any;
@Injectable()
export class GlobalHttpInterceptorService implements HttpInterceptor {
  constructor(public router: Router, private toastr: ToastrService) {
  }

  //1.  No Errors
  intercept1(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        return throwError(error.message);
      })
    )
  }
 //Hsandling ServerSite Error
  //2. Sending an Invalid Token will generate error
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token: string = 'invald token, please login or refresh any page';
    req = req.clone({ headers: req.headers.set('Access-Control-Allow-Origin', '*') });
    return next.handle(req).pipe(
      catchError((error) => {
        $(modalLoader()).hide();
        let msg = '';
        if (typeof error.error == "string") {
          let currentMessage =  this.populateErrorMessages(JSON.stringify(error.error));
          error['message'] = currentMessage;
        }

        else if (error.error != null && typeof error.error != "string") {
          let errorMessages = new Array<string>();
          if (error.error.Messages != null && error.error.Messages.length >= 0) {
            error.error.Messages.forEach(msg => {
              errorMessages.push(msg.Text);
            });
          }

          errorMessages.forEach(item => {
            msg += '<br/>' + item + '<br/>'
          });
          if(msg != null && msg != ""){
            this.toastr.error(msg, 'Error', { timeOut: 4000, progressBar: true, enableHtml: true });
          }
        }
       
        switch (error.status) {
          case 500:
            this.toastr.error(error.message, 'Error', { timeOut: 4000 })
            break;
          case 401:
            this.toastr.error(error.error, 'Error', { timeOut: 4000 })
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

        if (error.status == 401)
          return null;
        else
          return throwError(error.message);
      })
    )
  }
//Populate ServerSite errors
  populateErrorMessages(error: string) {
    let msg = '';
    let result = error.match(/duplicate (key) (value)/g);
    if(result != null){
    msg = result[0] ;
    if (result[0] != null) {
      let patternToMatch = /uq_[a-zA-Z0-9_]*/g;
        let result1 = error.match(patternToMatch);
        if(result1 != null){
        msg = msg + " " + result1
        msg = msg.replace("uq_","");
        let splittedValues = msg.split('_')
      
      }
    }
  }
  else{
    msg = error;
  }
    return msg;
  }
  intercept3(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token: string = 'invald token, please refresh any page';
    req = req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + token) });

    return next.handle(req).pipe(
      catchError((error) => {

        let handled: boolean = false;
        console.error(error);
        if (error instanceof HttpErrorResponse) {
          if (error.error instanceof ErrorEvent) {
            console.error("Error Event");
          } else {
            switch (error.status) {
              case 401:      //login
                this.router.navigateByUrl("/login");
                handled = true;
                break;
              case 403:     //forbidden
                this.router.navigateByUrl("/login");
                handled = true;
                break;
            }
          }
        }
        else {
          console.error("Other Errors");
        }

        if (handled) {
          return of(error);
        } else {
          return throwError(error);
        }

      })
    )
  }
}