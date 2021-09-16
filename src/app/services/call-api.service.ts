import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {  HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { UtilityService } from './utility.service';


@Injectable({
  providedIn: 'root'
})
export class CallApiService {
  pageInfo1:any;
  pageName1:string;
  baseUrl:string;
  pageName:string;
  public module: string;
  constructor(private httpclient:HttpClient,private activatedRoute: ActivatedRoute,private utilityService:UtilityService) {
    this.pageName1 = activatedRoute.data['value'].val;
    this.module = activatedRoute.data['value'].module;
 
   }


  ngOnInit() {
    this.pageInfo1 = {
    currentPage:1,
    pagesize:5,
    totalrecords:0
    };
    let urlToCall = this.utilityService.getApiUrl(this.module) + '/' + this.pageName1 + '/' + this.pageInfo1.pagesize + '/' + this.pageInfo1.currentPage;
    alert( urlToCall);
  }

  getDataFromService(url:string):Observable<any>{
    var response =  this.httpclient.get(url);
    return response;
}
}
