import { Subject, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';


@Injectable({
  'providedIn':'root'
})
export class CustomShareService {

  private isUserLogin = new BehaviorSubject<any>(false);
  loginObjservable = this.isUserLogin.asObservable();

  private profileUpdate = new BehaviorSubject<any>(false);
  profileObjservable = this.profileUpdate.asObservable();

  userLoggedIn(data:any){
    this.isUserLogin.next(data);
  }

  userProfileUpdated(data:any){
      this.profileUpdate.next(data);
  }

}
