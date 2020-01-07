import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CategoryService } from '../category.service';



@Component({
    selector: 'app-add-category',
    templateUrl: './add-category.component.html'
})
export class AddCategoryComponent implements OnInit {
    categoryForm: FormGroup;
    type: string;
    filter: any;
    private resData: any;
    public btnDisabled = false;
    editorConfig: Object;
    filterType: any;
    isSubmitted: Boolean = false;
    categoryData: any;

    constructor(public bsModalRef: BsModalRef, private fb: FormBuilder,
        private toastrService: ToastrService, private categoryService: CategoryService) {
        this.categoryForm = this.fb.group({
            'cat_name': ['', Validators.compose([Validators.required])],
            'status': true,
            'cat_id': ['']
        });
    }

    ngOnInit() {
        if (this.categoryData && this.categoryData._id) {
            this.categoryForm.patchValue({
                cat_name: this.categoryData.cat_name.trim(),
                cat_id: this.categoryData._id,
                status: this.categoryData.status
            });
        }
    }

    /* This function is call when submit button will click */
    submitForm($ev, value) {
        this.isSubmitted = true;

        $ev.preventDefault();
        if (this.categoryForm.valid) {
            this.btnDisabled = true;
            if (this.type === 'add') {
                delete value.cat_id;
                value.cat_name = value.cat_name.trim();
                this.categoryService.addCategory(value).subscribe(response => {
                    this.resData = response;
                    this.toastrService.success('', this.resData.message);
                    this.btnDisabled = false;
                    this.bsModalRef.hide();
                    this.bsModalRef.content.type = "add_success";
                }, error => {
                    this.toastrService.error('', error.error.message);
                    this.btnDisabled = false;
                });
            } else {
                value.cat_name = value.cat_name.trim();
                this.categoryService.updateCategory(value).subscribe(response => {
                    this.resData = response;
                    this.toastrService.success('', this.resData.message);
                    this.btnDisabled = false;
                    this.bsModalRef.hide();
                    this.bsModalRef.content.type = "edit";
                    this.bsModalRef.content.catData = value;
                    this.bsModalRef.content.catData._id = value.cat_id;
                    this.bsModalRef.content.catData.created_at = this.categoryData.created_at;
                    this.bsModalRef.content.catData.displayStatus = (value.status == 1) ? true : false;

                }, error => {
                    this.toastrService.error('', error.error.message);
                    this.btnDisabled = false;
                });
            }
        }
    }
}
