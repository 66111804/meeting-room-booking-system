import {Component, OnInit} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {BreadcrumbsComponent} from '../../shared/breadcrumbs/breadcrumbs.component';
import {NgClass} from '@angular/common';
import {StatComponent} from '../../widget/stat/stat.component';
//
const projectstatData = [{
  title: 'การใช้งานล่าสุด 30 วัน',
  value: 825,
  icon: 'briefcase',
  persantage: '5.02',
  profit: 'down',
  month: 'Projects'
}, {
  title: 'ยอดใช้งานแล้ว',
  value: 7522,
  icon: 'award',
  persantage: '3.58',
  profit: 'up',
  month: 'Leads'
}, {
  title: 'ยอดจองรอใช้งาน',
  value: 168.40,
  icon: 'clock',
  persantage: '10.35 ',
  profit: 'down',
  month: 'Work'
}
];


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    TranslatePipe,
    BreadcrumbsComponent,
    NgClass,
    StatComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  statData!: any;

  constructor() {
    this.breadCrumbItems = [
      { label: '', active: true }
    ];
  }

  ngOnInit() {
    this.statData = projectstatData;
  }
}
