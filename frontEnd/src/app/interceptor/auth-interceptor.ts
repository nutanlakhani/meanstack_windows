import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';



@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // add authorization header with basic auth credentials if available
        const currentUser = JSON.parse(this.authenticationService.getUserInfo());
        // console.log("token", currentUser.token)
        if (currentUser && currentUser.token) {
            request = request.clone({
                setHeaders: { 
                    Authorization: `${currentUser.token}`
                }
            });
        }

        return next.handle(request);
    }
}