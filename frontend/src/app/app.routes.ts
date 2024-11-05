import { Routes } from '@angular/router';
import {LoginComponent} from './pages/auth/login/login.component';
import {LayoutComponent} from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'app',
    component: LayoutComponent,
    loadChildren: ()=> import('./pages/routing').then(m => m.Routing)
  }
];
