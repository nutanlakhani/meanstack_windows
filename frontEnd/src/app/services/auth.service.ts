import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = environment.baseUrl
  constructor(private http: HttpClient, private route:Router) { }
  isAuthenticated(){
    if(localStorage.getItem('userInfo')){
      return true;
    } else {
      return false;
    }
  }
  getUserInfo(){
    return localStorage.getItem('userInfo');
  }

  setUserInfo(data){
    localStorage.setItem('userInfo', data);
  }

  login(data){
    return this.http.post<any>(this.baseUrl+'login', data);
  }

  register(data){
    return this.http.post<any>(this.baseUrl+'register', data);
  }

  updateProfile(data){
    return this.http.post<any>(this.baseUrl+'users/update', data);
  }
  
  logout(data){    
    return this.http.post<any>(this.baseUrl + 'logout', data);
  }
}
