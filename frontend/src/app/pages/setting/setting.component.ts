import { Component } from '@angular/core';
import {BreadcrumbsComponent} from "../../shared/breadcrumbs/breadcrumbs.component";

@Component({
  selector: 'app-setting',
  standalone: true,
    imports: [
        BreadcrumbsComponent
    ],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})
export class SettingComponent {

  breadCrumbItems!: Array<{}>;

  constructor() {
    this.breadCrumbItems = [{ label: 'Home', path: '/' }, { label: 'Setting', active: true }];
  }

}
