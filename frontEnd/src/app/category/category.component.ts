import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import * as moment from 'moment';
import { CategoryService } from './category.service';
import { AddCategoryComponent } from './model/add-category.component';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
    currentPage = 1;
    totalItem = 0;
    offset = 0;
    smallnumPages = 0;
    page: any = 1;
    limit = 10;
    categoriesList: any = [];
    showPagination: Boolean = false;
    isDataLoading: Boolean = false;
    resData: any;
    sort_type: any;
    sort_field: any;
    fieldNameUsed: any;
    order_type: any = 'asc';
    params: any = {};
    isFilter: Boolean = false;
    bsModalRef: BsModalRef;
    private subscriptions;

    objectKeys = Object.keys;
    constructor(
        private modalService: BsModalService,
        private CategoryService: CategoryService,
        private router: Router,
        private toastrService: ToastrService
    ) { }

    ngOnInit() {
        this.getCategories(this.offset, this.limit);
    }

    getCategories(offset: number, limit: number, resetPagination: Boolean = false) {
        this.isDataLoading = true;
        let sort;
        if (this.sort_type) {
            sort = { 'colId': this.sort_field, 'sort': this.sort_type };
        } else {
            sort = {};
        }

        let filter = {};
        if (this.isFilter) {
            filter = Object.assign({}, this.params);
            /*If type filter is date then pass date object for filter */
            if (this.params.date) {
                const obj = {
                    'startDate': moment(this.params.date[0]).format('YYYY-MM-DD'),
                    'endDate': moment(this.params.date[1]).format('YYYY-MM-DD'),
                    'field': "created_at"
                };
                filter['date'] = obj;
            }
        }

        this.CategoryService.getCategories(offset, limit, sort, filter).subscribe(response => {
            this.isDataLoading = false;
            this.resData = response;

            if (response.status === 200) {
                this.categoriesList = this.resData.data.rows;

                if (this.offset === 0) {
                    this.totalItem = this.resData.data.count;
                }

                this.showPagination = true;
                if (resetPagination) {
                    this.currentPage = 1;
                }
            } else {
                this.toastrService.error('', this.resData.message);
            }
        }, err => {
            this.isDataLoading = false;
        });
    }

    /**
     * This function is use redirect to add credit page
     */
    addUpdateCategory(type, data = {}, index = 0) {
        const initialState = {
            type: type,
            categoryData: data,
        };
        this.bsModalRef = this.modalService.show(AddCategoryComponent, {
            initialState, class: 'modal-lg', backdrop: true, ignoreBackdropClick: true
        });
        this.getCategories(0, this.limit, true);
        this.subscriptions = this.modalService.onHide.subscribe((reason: string) => {
            if (this.bsModalRef.content.type === 'edit') {
                if (this.bsModalRef.content.catData) {
                    this.categoriesList[index] = this.bsModalRef.content.catData;
                }
            } else if (this.bsModalRef.content.type === 'add_success') {
                this.getCategories(0, this.limit, true);
            }
            this.subscriptions.unsubscribe();
        });
    }

    // /* This function is call when page change*/
    pageChanged(event: any, resetPagination: Boolean = false): void {
        this.page = event.page;
        this.offset = ((this.page - 1) * this.limit);
        this.getCategories(this.offset, this.limit, resetPagination);
    }

    // /* This function is use for sorting */
    sorting() {
        if (this.totalItem > 10) {
            const event = { page: 1 };
            this.showPagination = false;
            this.pageChanged(event, true);
        }
    }

    // /*This function is use for sorting */
    headerSort(field_name, order_type) {
        this.sort_field = field_name;
        if (!this.fieldNameUsed) {
            this.fieldNameUsed = this.sort_field;
            this.sort_type = order_type;
            if (order_type === 'asc') {
                this.order_type = 'desc';
            } else {
                this.order_type = 'asc';
            }
        } else if (this.fieldNameUsed === field_name) {
            this.sort_type = order_type;
            if (order_type === 'asc') {
                this.order_type = 'desc';
            } else {
                this.order_type = 'asc';
            }
        } else {
            this.fieldNameUsed = field_name;
            this.order_type = 'desc';
            this.sort_type = 'asc';
        }
        const event = { page: 1 };
        this.showPagination = false;
        this.pageChanged(event, true);
    }

    /* This function is use for reset filter */
    resetFilter() {
        this.params = {};
        if (this.isFilter) {
            this.isFilter = false;
            const event = { page: 1 };
            this.showPagination = false;
            this.pageChanged(event, true);
        }
    }

    /* This function is use for filter data */
    filterData() {
        for (const propName in this.params) {
            if (this.params[propName] === null || this.params[propName] === undefined || this.params[propName] === "") {
                delete this.params[propName];
            }
        }

        /*Use for check that filter value has object contains */
        if (Object.keys(this.params).length === 0 && this.params.constructor === Object) {
            this.isFilter = false;
        } else {
            this.isFilter = true;
        }

        const event = { page: 1 };
        this.showPagination = false;
        this.pageChanged(event, true);
    }

    deleteCategory(cat_id, i) {

        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete category',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.value) {
                this.toastrService.clear();
                const index =  this.categoriesList.findIndex(x => x._id === cat_id); //this.categoriesList.indexOf(cat_id);
                console.log("index", index);
                if (index > -1) {
                    this.categoriesList.splice(index, 1);
                }
                this.CategoryService.deleteCategory({ cat_id: cat_id }).subscribe(response => {
                    this.resData = response;
                    this.toastrService.success('', this.resData.message);
                    this.getCategories(0, this.limit, true);
                }, error => {
                    this.toastrService.error('', error.error.message);
                });
            }
        });

        
    }

    /* This function is use for update status */
    updateStatus(status, cat_id, i) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to update category status',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.value) {
                this.toastrService.clear();
                this.CategoryService.updateCategoryStatus({ status: status, cat_id: cat_id }).subscribe(response => {
                    this.resData = response;
                    this.categoriesList[i].status = status;
                    this.toastrService.success('', this.resData.message);
                }, error => {
                    this.toastrService.error('', error.error.message);
                });
            } else if (result.dismiss) {
                this.categoriesList[i].status = !status;
            }
        });
    }

}
