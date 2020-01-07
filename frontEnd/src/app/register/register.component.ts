import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CityService } from '../city/city.service';



@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  submitted = false;
  maxDate:Date;
  preview: string;
  loading = false;
  cities = [];

  constructor(private formBuilder: FormBuilder,
    private router:Router,
    private cityService:CityService,
    private authService: AuthService) { 
    this.maxDate = new Date(); // moment().subtract(10, 'years')
  }

  ngOnInit() {
      this.registerForm = this.formBuilder.group({
          prefix: ['', Validators.required],
          profile: ['', Validators.required],
          firstName: ['', Validators.required],
          lastName: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]],
          password: ['', [Validators.required, Validators.minLength(6)]],
          confirmPassword: ['', Validators.required],
          gender:['male', Validators.required],
          birthDate:['', Validators.required],
          phone:['',Validators.required],
          cityId:['', Validators.required]
      }, {
          validator: MustMatch('password', 'confirmPassword')
      });
      this.getCities();
  }

  getCities(){
    this.cityService.getAllCities().subscribe(res =>{
      this.cities = res.data
    }, 
    err => {
      console.log("err", err);
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  uploadFile(event) {
    const file = (event.target as HTMLInputElement).files[0];
    console.log("file",file);
    this.registerForm.patchValue({
      profile: file
    });
    this.registerForm.get('profile').updateValueAndValidity()

    // File Preview
    const reader = new FileReader();
    reader.onload = () => {
      this.preview = reader.result as string;
    }
    reader.readAsDataURL(file)
  }

  onSubmit() {
      this.submitted = true;

      // stop here if form is invalid
      if (this.registerForm.invalid) {
          return;
      }
      let formData = new FormData();
      for(let key in this.registerForm.value){
        if( key != 'confirmPassword'){
          formData.append(key, this.registerForm.value[key]);
        }
      }

      this.loading = true;    
      this.authService.register(formData).subscribe(
        data => {
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 300)
          
        },
        error => {
            
            this.loading = false;
        });
      }
  
}


export function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
          // return if another validator has already found an error on the matchingControl
          return;
      }

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
          matchingControl.setErrors({ mustMatch: true });
      } else {
          matchingControl.setErrors(null);
      }
  }
}
