// Angular Module
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TooltipModule } from 'ngx-bootstrap/tooltip';

// Pagination Module
import { PaginationModule } from 'ngx-bootstrap/pagination';

// Users Component && Routing
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CategoryComponent } from './category.component';
import { AddCategoryComponent } from './model/add-category.component';

import { ModalModule } from 'ngx-bootstrap/modal';
import { CategoryService } from './category.service';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
    {
        path: '',
        data: {
            title: 'Categories'
        },
        component: CategoryComponent
    }
];


@NgModule({
    imports: [
        RouterModule.forChild(routes),
        ModalModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        TooltipModule.forRoot(),
        PaginationModule.forRoot(),
        BsDatepickerModule.forRoot()
    ],
    declarations: [CategoryComponent, AddCategoryComponent],
    exports: [CategoryComponent],
    providers: [CategoryService],
    entryComponents: [
        AddCategoryComponent
    ]
})
export class CategoryModule { }
