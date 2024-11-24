import { Routes } from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import {LayoutsComponent} from './layouts/layouts.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },{
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: LayoutsComponent,
    loadChildren: ()=> import('./pages/routes').then(m => m.Routing)
  }
];
