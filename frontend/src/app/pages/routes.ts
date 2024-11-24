import { Routes } from '@angular/router';
import {BookingRoomComponent} from './booking-room/booking-room.component';
import {MyBookingComponent} from './my-booking/my-booking.component';
import {SettingComponent} from './setting/setting.component';
import {AdministratorComponent} from './administrator/administrator.component';
import {UserComponent} from './administrator/user/user.component';
import {MeetingRoomComponent} from './administrator/meeting-room/meeting-room.component';
import {RolePermissionComponent} from './administrator/role-permission/role-permission.component';
import {DashboardComponent} from './dashboard/dashboard.component';

const Routing: Routes = [
  {
    path: 'app',
    component: DashboardComponent
  },
  {
    path: 'booking-room',
    component: BookingRoomComponent
  },
  {
    path: 'my-booking',
    component: MyBookingComponent
  },
  {
    path: 'setting',
    component: SettingComponent
  },
  {
    path: 'admin',
    component: AdministratorComponent,
    children:[
      {
        path: 'user',
        component: UserComponent
      },
      {
        path: 'meeting-room',
        component: MeetingRoomComponent
      },
      {
        path: 'role-permission',
        component: RolePermissionComponent
      }
    ]
  }
];
export {Routing}
