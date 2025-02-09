import { Routes } from '@angular/router';
import {LoginComponent} from './pages/auth/login/login.component';
import {LayoutsComponent} from './layouts/layouts.component';
import {BackComponent} from './pages/back/back.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path:'back',
    component: BackComponent
  },
  {
    path: '',
    component: LayoutsComponent,
    loadChildren: ()=> import('./pages/routes').then(m => m.Routing)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
];
