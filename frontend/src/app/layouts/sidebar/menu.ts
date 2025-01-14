import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
  {
    id: 1,
    label: 'MENUITEMS.MENU.TEXT',
    isTitle: true
  },
  {
    id: 2,
    label: 'MENUITEMS.HOME.TEXT',
    icon: 'ri-dashboard-2-line',
    link: '/app'
  },
  {
    id: 3,
    label: 'MENUITEMS.BOOKING-ROOM.TEXT',
    icon: 'ri-dashboard-2-line',
    link: '/booking-room'
  },{
    id: 4,
    label: 'MENUITEMS.MY-BOOKING.TEXT',
    icon: 'ri-dashboard-2-line',
    link: '/my-booking'
  },
  {
    id: 5,
    label: 'MENUITEMS.SETTING.TEXT',
    icon: 'ri-settings-3-line',
    link: '/setting'
  },
  {
    id: 6,
    label: 'MENUITEMS.ADMIN.TEXT',
    icon: 'ri-profile-line',
    link: '/admin',
    subItems: [
      {
        id: 7,
        label: 'MENUITEMS.ADMIN.LIST.USER',
        link: '/admin/user',
        parentId: 6
      },
      {
        id: 8,
        label: 'MENUITEMS.ADMIN.LIST.ROOM',
        link: '/admin/meeting-room',
        parentId: 6
      },{
        id: 9,
        label: 'MENUITEMS.ADMIN.LIST.ROLE-PERMISSION',
        link: '/admin/role-permission',
        parentId: 6
      }
    ]
  },
  {
    id: 7,
    label: 'MENUITEMS.LOGOUT.TEXT',
    icon: 'ri-logout-box-line',
    link: '/logout'
  }
];
