import { Component, OnInit } from '@angular/core';
import {AuthService} from '../services/auth.service';
import { Router } from '@angular/router';
import { AppConstants } from '../constants/AppConstants';


@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.css']
})
export class AuthCallbackComponent implements OnInit {

  constructor(private authService: AuthService, private router:Router) { }
 

  ngOnInit() {
    this.authService.completeAuthentication();

    let lastUrl =   sessionStorage.getItem('lastUrl');
    let urlToRedirect = lastUrl!=null? lastUrl: '/home';

    if(sessionStorage.getItem(AppConstants.OIDC.STAGE)!=null && sessionStorage.getItem(AppConstants.OIDC.STAGE) == AppConstants.AUTHENTICATION_STAGES.COMPLETE_AUTHENTICATION){
      this.router.navigate([urlToRedirect]);
    }
    else if(sessionStorage.getItem(AppConstants.OIDC.STAGE)!=null && sessionStorage.getItem(AppConstants.OIDC.STAGE) == AppConstants.AUTHENTICATION_STAGES.SIGNED_OUT){
      this.router.navigate(['sign-out']);
    }
    else if(sessionStorage.getItem(AppConstants.OIDC.STAGE)!=null && sessionStorage.getItem(AppConstants.OIDC.STAGE) == AppConstants.AUTHENTICATION_STAGES.STARTED_AUTHENTICATION){
      let completeAuthResult = this.authService.completeAuthentication();
      completeAuthResult.then(x=>{
        
      });
    }


    // this.router.navigate([urlToRedirect]);
    // let lastUrl = sessionStorage.getItem('lastUrl');
    // if(lastUrl!=null){
    //   //window.location.href = lastUrl;
    //   this.router.navigate([lastUrl]);
    // }
    // else
    // {
    //   //After the authentication variables setting, redirect to previous page or atleast to home page
    //   this.router.navigate(['/home']);
    // }
   

  }

}
