import { Routes } from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';


const Routing: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => DashboardComponent
  }
  ];


export { Routing };
