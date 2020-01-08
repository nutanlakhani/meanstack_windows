import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FileUploader } from "ng2-file-upload";
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';
import { CustomShareService } from '../services/custom.service';

@Component({
    templateUrl: 'update-profile.component.html'
})
export class UpdateProfileComponent implements OnInit {
    public uploader: FileUploader = new FileUploader({});
    @ViewChild("fileInput",{static:false}) fileInput;
    userForm: FormGroup;
    resData: any;
    btnDisabled = false;
    isSubmitted: Boolean = false;
    currrentUserData: any;
    logo: any = {
        url: "",
        preview: "",
        extensionErr: false
    };
    constructor(private fb: FormBuilder,
        private authService: AuthService,
        private route: Router,        
        private toastrService: ToastrService,
        private customService: CustomShareService) {

        this.userForm = fb.group({
            'profile': new FormControl('', Validators.required),
            'firstName': new FormControl('', Validators.compose([Validators.required])),
            'lastName': new FormControl('', Validators.compose([Validators.required])),
            'email': new FormControl('', [Validators.required]),
        });
    }

    ngOnInit() {
        this.currrentUserData = JSON.parse(localStorage.getItem('userInfo'));
        if (this.currrentUserData) {
            this.userForm.patchValue({
                'profile': [''],
                'firstName': this.currrentUserData.firstName,
                'lastName': this.currrentUserData.lastName,
                'email': this.currrentUserData.email
            });
            if (this.currrentUserData.profile) {
                this.logo.url = environment.ASSET_URL + this.currrentUserData.profile;
            }
        } else {
            this.route.navigate(['/login']);
        }
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
            if ((fileTypeArr.indexOf(name) === -1) ){
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

    /* This function is use for save change password data */
    submitForm($ev, value) {
        this.isSubmitted = true;
        this.toastrService.clear();
        if (this.userForm.valid) {
            const formdata: FormData = new FormData();
            if (this.logo.extensionErr) {
                return false;
            }
            if (!this.logo.url){
                return false;
            }
            if (!this.logo.extensionErr) {
                if (this.logo.url && this.logo.preview) {
                    formdata.append("profile", this.logo.url);
                }
            }
            this.btnDisabled = true;
            delete value.email;

            for (const key in this.userForm.value) {
                if (key !== "profile") {
                    formdata.append(key, this.userForm.value[key]);
                }
            }
            formdata.append('_id', this.currrentUserData._id);

            /*API call */
            this.authService.updateProfile(formdata).subscribe(response => {
                this.resData = response;
                /* Prepare object for store required userdata  */
                const userData = {
                    '_id': this.resData.data._id,
                    'firstName': this.resData.data.firstName,
                    'lastName': this.resData.data.lastName,
                    'email': this.currrentUserData.email,
                    'profile': this.resData.data.profile,
                    'createdAt': this.resData.data.createdAt,
                    'token':this.currrentUserData.token
                };
                this.customService.userProfileUpdated(userData);
                const setUserData = this.authService.setUserInfo( JSON.stringify(userData));
                this.toastrService.success('', response.message);
                Promise.all([setUserData]).then((response) => {
                    setTimeout(() => {
                        this.btnDisabled = false;
                        this.isSubmitted = false;
                    });
                });
            }, error => {
                this.btnDisabled = false;
                this.toastrService.error('', error.error.message);
            });
        }
    }
}
