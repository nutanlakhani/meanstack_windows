import { Component, OnInit, ViewChild } from "@angular/core";
import {
    FormGroup,
    FormBuilder,
    FormControl,
    Validators
} from "@angular/forms";
import { CustomValidators } from "ng2-validation";

import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { FileUploader } from "ng2-file-upload";
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';


@Component({
    selector: "app-register",
    templateUrl: "register.component.html"
})
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    public uploader: FileUploader = new FileUploader({});
    @ViewChild("fileInput",{static:false}) fileInput;
    isSubmitted: Boolean = false;
    btnDisabled = false;
    resData: any;
    userType: any;

    logo: any = {
        url: "",
        preview: "",
        extensionErr: false
    };
    isToggle = false;

    constructor(
        private fb: FormBuilder,
        private toastrService: ToastrService,
        private authService: AuthService,
        
        private router: Router        
    ) {
        const password = new FormControl("", [Validators.required]);

        this.registerForm = fb.group({
            profile_picture: new FormControl(null, Validators.required),
            first_name: new FormControl(
                "",
                Validators.compose([Validators.required])
            ),
            last_name: new FormControl("", Validators.required),
            email: new FormControl(
                "",
                Validators.compose([Validators.required, CustomValidators.email])
            ),
            password: password,
            confirmPassword: new FormControl(
                "",
                Validators.compose([
                    Validators.required,
                    CustomValidators.equalTo(password)
                ])
            ),
            phone: new FormControl(
                "",
                Validators.compose([Validators.required])
            ),
            portfolio_link: new FormControl("", CustomValidators.url),
            sec_portfolio_link: new FormControl("", CustomValidators.url),
            // design_link: new FormControl("", CustomValidators.url),
            // exp_year: new FormControl("", CustomValidators.digits),
            insta_handle: new FormControl(""),
            influent_artist: new FormControl(""),
            art_style: new FormControl(""),
            ship_address: new FormControl(""),
            display_art: new FormControl(false, Validators.required),
            us_citizen: new FormControl(false, Validators.required),
            tshirt_size: new FormControl(1, Validators.required),
        });
    }

    ngOnInit() { }

    toggle() {
        this.isToggle = !this.isToggle;
      }

    setUserDefaultImage($event) {
        $event.target.src = `${environment.userProfileImgNotFound}`;
    }

    imageUpload(e: any) {
        const reader = new FileReader();
        const file = e.target.files[0];

        if (file) {
            let fileTypeArr = ['png', 'jpg', 'jpeg'];
            let name = file.name.substring(file.name.lastIndexOf('.') + 1);

            if(fileTypeArr.indexOf(name) === -1){ 
                this.logo.extensionErr = true;
                this.logo.preview = "";
            } else {
                reader.onloadend = (readFiles: any) => {
                    this.logo.preview = readFiles.target.result;
                };

                reader.readAsDataURL(e.target.files[0]);
                this.logo.extensionErr = false;
                this.logo.url = file;
            }
        } else {
            this.logo.extensionErr = false;
        }
    }

    /*This function is use for submit form */
    submitForm($e, value) {
        this.isSubmitted = true;

        /*Check if form is valid then call resiger api */
        if (this.registerForm.valid) {
            const formdata: FormData = new FormData();
            // this.registerForm.value['exp_year'] = (this.registerForm.value['exp_year'] !== "") ? this.registerForm.value['exp_year'] : 0;

            if (this.logo.extensionErr) {
                return false;
            }
            if (!this.logo.extensionErr) {
                if (this.logo.url && this.logo.preview) {
                    formdata.append("profile_picture", this.logo.url);
                }
            }
            this.btnDisabled = true;

            for (let key in this.registerForm.value) {
                if (key !== "profile_picture") {
                    formdata.append(key, this.registerForm.value[key]);
                }
            }
            /*Use for pass user type in API and access data according to that */
            this.authService
                .register(formdata)
                .subscribe(
                    response => {
                        this.btnDisabled = false;
                        this.isSubmitted = false;
                        if (response.status === 201) {
                            this.resData = response;

                            /* Prepare object for store required userdata  */
                            this.toastrService.success("", this.resData.message);

                            /* Use for store token and userdata in localstorate */

                            setTimeout(() => {
                                this.router.navigateByUrl("/login");
                            });
                        } else {
                            this.toastrService.error("", this.resData.message);
                        }
                    },
                    error => {
                        this.btnDisabled = false;
                        this.isSubmitted = false;
                        this.toastrService.error("", error.error.message);
                    }
                );
        }
    }
}
