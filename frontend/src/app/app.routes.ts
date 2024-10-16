import { Routes } from '@angular/router';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {LayoutComponent} from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component:LayoutComponent,
    children: [
      {
        path: '',
        component: DashboardComponent
      },
  ]
  }
];
