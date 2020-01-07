import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastrService:ToastrService) {      
    }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
  onSubmit() {
    this.submitted = true; 

    // stop here if form is invalid
    if (this.loginForm.invalid) {
        return;
    }
    this.loading = true;
    // this.loginForm.value.role = 'Admin';
    this.authService.setUserInfo(JSON.stringify(this.loginForm.value))
   
    this.authService.login(this.loginForm.value).subscribe(
      data => {
        this.loading = false;
        this.authService.setUserInfo(JSON.stringify(data.result))
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 300)
        this.toastrService.success(data.message);
      },
      error => {
          
          this.loading = false;
      });
    }

}
