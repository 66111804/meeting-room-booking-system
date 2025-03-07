// noinspection SpellCheckingInspection

import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {BreadcrumbsComponent} from '../../shared/breadcrumbs/breadcrumbs.component';
import {DatePipe, NgClass, SlicePipe} from '@angular/common';
import {StatComponent} from '../../widget/stat/stat.component';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {DashboardService, IBlogResponseDahsboard} from '../../core/services/dashboard.service';
import {GlobalComponent} from '../../global-component';
import {Router} from '@angular/router';
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
    StatComponent,
    NgbPagination,
    SlicePipe,
    DatePipe,
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
  pageSize: number = 10;
  searchTerm: string = '';
  blogs: IBlogResponseDahsboard = {
    blogs: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  };
  constructor(private dashboardService:DashboardService,
              private router:Router) {
    this.breadCrumbItems = [
      { label: '', active: true }
    ];



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

    this.fetchStats();
    this.fetchBlogs();
  }

  fetchStats(){
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.statData = data;
        // console.log(data);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  fetchBlogs() {
    this.dashboardService.getBlogs(this.searchTerm, this.page, this.pageSize).subscribe(
      {
        next: (data) => {
          this.blogs = data;
        },
        error: (error) => {
          console.log(error);
          this.blogs = {
            blogs: [],
            total: 0,
            totalPages: 0,
            currentPage: 0,
          }
        }
      });
  }
  changePage(){
    this.fetchBlogs();
  }

  protected readonly GlobalComponent = GlobalComponent;

  gotoBlog(id: number) {
    this.router.navigate(['/app/'+id+'/blog']).then();
  }
}
