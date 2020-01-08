import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoginComponent } from './login/login.component';
import { AuthGuardService } from './guards/auth-guard.service';
import { LayoutComponent } from './layout/layout.component';
import { RegisterComponent } from './register/register.component';
import { UpdateProfileComponent } from './profile/update-profile.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate:[AuthGuardService] },
  { path: 'register', component: RegisterComponent, canActivate:[AuthGuardService] },
  {
    path:'',
    component:LayoutComponent,
    canActivate:[AuthGuardService],
    children:[
      { path: 'profile', component:UpdateProfileComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path:'dashboard',
        loadChildren :() => import('../app/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path:'cities',
        loadChildren :() => import('../app/city/city.module').then(m => m.CityModule)
      },
      {
        path:'categories',
        loadChildren :() => import('../app/category/category.module').then(m => m.CategoryModule) 
      }
    ]
  },
    
 
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
