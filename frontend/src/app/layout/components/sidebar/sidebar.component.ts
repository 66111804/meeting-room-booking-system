import { Component } from '@angular/core';
import {SidebarFooterComponent} from './sidebar-footer/sidebar-footer.component';
import {SidebarMenuComponent} from './sidebar-menu/sidebar-menu.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    SidebarFooterComponent,
    SidebarMenuComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

}
