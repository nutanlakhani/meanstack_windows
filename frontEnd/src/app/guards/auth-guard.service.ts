import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate{
  url:any = '';
  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    this.url = state.url;
   
    if(this.authService.isAuthenticated()){     
      if(this.url == '/login' || this.url == '/register'){
        this.router.navigate(['/dashboard']);
      }
      return true;
    } else {
     
      if(this.url == '/login' || this.url == '/register'){
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }      
    }
   
    // if(this.url == '/login'){
    //   if(this.authService.isAuthenticated()){
    //     this.router.navigate(['/dashboard']);        
    //   }
    //   return true;
    // } else{
    //   if (this.authService.isAuthenticated()) {
    //     return true;
    //   }
    //       // navigate to login page
    //   this.router.navigate(['/login']);
      
    //   return false;
    // }
  }
}
