// noinspection SpellCheckingInspection

import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {BreadcrumbsComponent} from '../../shared/breadcrumbs/breadcrumbs.component';
import {NgClass} from '@angular/common';
import {StatComponent} from '../../widget/stat/stat.component';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {DashboardService} from '../../core/services/dashboard.service';
//
const projectstatData = [{
  title: 'การใช้งานล่าสุด 30 วัน',
  value: 825,
  icon: 'briefcase',
  persantage: '5.02',
  profit: 'up',
  month: ''
}, {
  title: 'ยอดใช้งานแล้ว',
  value: 7522,
  icon: 'award',
  persantage: '3.58',
  profit: 'up',
  month: ''
}, {
  title: 'ยอดจองรอใช้งาน',
  value: 168.40,
  icon: 'clock',
  persantage: '10.35 ',
  profit: 'down',
  month: ''
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
    NgbPagination,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class DashboardComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  statData!: any;

  content!: Array<{}>;
  order: string = 'asc';
  sort: string = 'id';
  page: number = 1;
  limit: number = 10;
  constructor(private dashboardService:DashboardService) {
    this.breadCrumbItems = [
      { label: '', active: true }
    ];

    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.statData = data;
        console.log(data);
      },
      error: (err) => {
        console.error(err);
      }
    });

  }

  ngOnInit() {
    // this.statData = projectstatData;

    this.content = [
      {
        title: 'การใช้งานล่าสุด 30 วัน',
        value: 825,
        image: "assets/images/dashboard/1.png",
        persantage: '5.02',
        profit: 'down',
      },
      {
        title: 'ยอดใช้งานแล้ว',
        value: 7522,
        image: "assets/images/dashboard/2.png",
        persantage: '3.58',
        profit: 'up',
      },
      {
        title: 'ยอดจองรอใช้งาน',
        value: 168.40,
        image: "assets/images/dashboard/3.png",
        persantage: '10.35 ',
        profit: 'down',
      },
      {
        title: 'ยอดจองรอใช้งาน',
        value: 168.40,
        image: "assets/images/dashboard/4.png",
        persantage: '10.35 ',
        profit: 'down',
      }
    ];
  }

  changePage(){

  }
}
