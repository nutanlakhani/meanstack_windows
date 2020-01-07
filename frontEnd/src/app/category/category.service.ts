import { Injectable } from "@angular/core";
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Injectable()
export class CategoryService {
    baseUrl = environment.baseUrl;

    constructor(private customHttp: HttpClient) { }

    /**
     * This fundtion is use for get category listing with pagination.
     * @param offset
     * @param limit
     */
    getCategories(offset: number = 0, limit: any = 10, sort: any = {}, filter: any = {}) {
        const params = { 'offset': offset, 'limit': limit, 'filter': filter, 'sort': sort, type: 'list' };
        return this.customHttp.post(this.baseUrl+'categories/getCategories', params)
            .pipe(
                map((response: Response) => {
                    return response;
                })
            );
    }

    /**
     * This function is use for add category information
     * @param data object {}
     */
    addCategory(data) {
        return this.customHttp.post(this.baseUrl+'categories/createCategory', data)
            .pipe(
                map((response: Response) => {
                    return response;
                })
            );
    }

    /**
     * This function is use for change category status.
     * @param data object {id:id}
     */
    updateCategoryStatus(data) {
        return this.customHttp.post(this.baseUrl+'categories/updateCategoryStatus', data)
            .pipe(
                map((response: Response) => {
                    return response;
                })
            );
    }

    /**
     * This function is use for Update category information.
     * @param data object {id:id}
     */
    updateCategory(data) {
        return this.customHttp.post(this.baseUrl+'categories/updateCategory', data)
            .pipe(
                map((response: Response) => {
                    return response;
                })
            );
    }

    /**
     * This function is use for delete category information.
     * @param data object {id:id}
     */
    deleteCategory(data) {
        return this.customHttp.post(this.baseUrl+'categories/deleteCategory', data)
            .pipe(
                map((response: Response) => {
                    return response;
                })
            );
    }

    /**
     * This function is use for get category by id for edit
     * @param data
     */
    getCategory(categoryId: string) {
        const param = { categoryId: categoryId };
        return this.customHttp.post(this.baseUrl+'categories/getCategory', param)
            .pipe(
                map((response: Response) => {
                    return response;
                })
            );
    }
}
