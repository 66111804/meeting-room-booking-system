import { Routes } from '@angular/router';
import {BookingRoomComponent} from './booking-room/booking-room.component';
import {MyBookingComponent} from './my-booking/my-booking.component';
import {SettingComponent} from './setting/setting.component';
import {AdministratorComponent} from './administrator/administrator.component';
import {UserComponent} from './administrator/user/user.component';
import {MeetingRoomComponent} from './administrator/meeting-room/meeting-room.component';
import {RolePermissionComponent} from './administrator/role-permission/role-permission.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {RoomComponent} from './booking-room/room/room.component';
import {EditBookingComponent} from './my-booking/edit-booking/edit-booking.component';
import {ContactUsComponent} from './contact-us/contact-us.component';
import {NewComponent} from './administrator/new/new.component';
import {NewCreateComponent} from './administrator/new/new-create/new-create.component';
import {BlogComponent} from './dashboard/blog/blog.component';

const Routing: Routes = [
  {
    path: 'app',
    component: DashboardComponent
  },
  {
    path: 'app/:id/blog',
    component: BlogComponent
  },
  {
    path: 'booking-room/:id/info',
    component: RoomComponent
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
    path: 'my-booking/:id/edit',
    component: EditBookingComponent
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
      },
      {
        path: 'new',
        component: NewComponent
      },
      {
        path: 'new/create',
        component: NewCreateComponent
      },
      {
        path: 'new/:id/edit',
        component: NewCreateComponent
      }
    ]
  },
  {
    path: 'contact-us',
    component: ContactUsComponent,
  }
];
export {Routing}
