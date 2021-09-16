import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service'
import { AppConstants } from '../constants/AppConstants';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private authService: AuthService, private router:Router, private activatedRoute: ActivatedRoute) { 

    //let path = activatedRoute.snapshot.url[0].path;

    //sessionStorage.setItem('lastUrl', path);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    sessionStorage.setItem('lastUrl', state.url);
  
    let expires_at = sessionStorage.getItem('expires_at');
    let current_date = Math.floor(Number(Date.now().toString()) / 1000);
    let expires_at_number = expires_at!=null? Number(expires_at) : 0;

    let stage = sessionStorage.getItem(AppConstants.OIDC.STAGE); //'STARTED-AUTHENTICATION','AUTH-COMPLETE'
    if(this.authService.isLoggedIn()) {
      return true;
    }
    else{
      expires_at_number = 0;
    }

    if(stage != AppConstants.AUTHENTICATION_STAGES.SIGNED_OUT)
      if(stage!=null && stage == AppConstants.AUTHENTICATION_STAGES.STARTED_AUTHENTICATION){
        this.authService.completeAuthentication();
      }
      else if(stage== AppConstants.AUTHENTICATION_STAGES.STARTED_AUTHENTICATION){
        return true;
      }
      else if(stage==null || (stage!=null && (stage == AppConstants.AUTHENTICATION_STAGES.SIGNED_OUT || (current_date > expires_at_number)))){
        this.authService.startAuthentication();
      }
    
    return false;

  }

}
