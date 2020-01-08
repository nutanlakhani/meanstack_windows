import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { CustomShareService } from 'src/app/services/custom.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  private userInfo:any;
  constructor(private authService:AuthService,
    private toastrService:ToastrService,
    private router:Router,
    private customShareService:CustomShareService) { 
      this.userInfo = JSON.parse(this.authService.getUserInfo());
      if(this.userInfo){
        this.profile = environment.ASSET_URL+ this.userInfo.profile;
      }      
    }
    isLoggedIn = false;
    profile:any;
    ngOnInit() {   

        this.customShareService.loginObjservable.subscribe(currentData => {
          this.isLoggedIn = currentData;
        });

        if(this.authService.isAuthenticated()){
          this.isLoggedIn = true;
        }

        this.customShareService.profileObjservable.subscribe(currentProfile =>{
          if(currentProfile){
            this.profile = environment.ASSET_URL+currentProfile['profile'];
          }
        });
    }
    logout(){
      this.authService.logout({token : this.userInfo.token}).subscribe(response => {
        if(response.status == 200){
          this.customShareService.userLoggedIn(false);
          localStorage.removeItem('userInfo');
          this.router.navigate(['/login']);
          this.toastrService.success('','Logout successfully.');
        }
      }, err =>{
        this.toastrService.error('','Oops something went wrong.');
        console.log("err", err);
      });
    }
    setDefaultPicture(){
      this.profile = `${environment.userProfileImgNotFound}`
    }

}
