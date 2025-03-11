// noinspection SpellCheckingInspection

import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {BreadcrumbsComponent} from '../../shared/breadcrumbs/breadcrumbs.component';
import {DatePipe, NgClass, SlicePipe} from '@angular/common';
import {StatComponent} from '../../widget/stat/stat.component';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {
  DashboardService,
  IBlogResponseDahsboard,
  IMeetingDashboardResponse
} from '../../core/services/dashboard.service';
import {GlobalComponent} from '../../global-component';
import {Router} from '@angular/router';
import {FlatpickrDefaultsInterface, FlatpickrDirective} from 'angularx-flatpickr';
import {FormsModule} from '@angular/forms';
//
const projectstatData = [{
  title: 'การใช้งานล่าสุด 30 วัน',
  value: 825,
  icon: 'briefcase',
  persantage: '5.02',
  profit: 'up',
  month: ''
}, {
  title: 'ยอดใช้งาน',
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
    FlatpickrDirective,
    FormsModule,
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

  flatpickrOptions: FlatpickrDefaultsInterface = {
    // minDate: this.getMinDate(),
    maxDate: this.getMaxDate(),
    dateFormat: 'Y-m-d',
    enableTime: false,
    altInput: true,
    convertModelValue: true,
    monthSelectorType: 'dropdown',
    mode: 'single'
  };
  dateSelected:Date;
  bookingRoom:IMeetingDashboardResponse ={
    meetings: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  }
  currentDay: Date = new Date();
  constructor(private dashboardService:DashboardService,
              private router:Router) {
    this.breadCrumbItems = [
      { label: '', active: true }
    ];
    this.dateSelected = new Date();
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
    this.fetchBooking();
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

  private getMinDate(){
    let currentDate = new Date();
    const currentHour = currentDate.getHours();
    if(currentHour > 17){
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
    return currentDate;
  }

  private getMaxDate(): Date {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 3);
    return currentDate;
  }

  protected readonly GlobalComponent = GlobalComponent;

  gotoBlog(id: number) {
    this.router.navigate(['/app/'+id+'/blog']).then();
  }

  onDateSelectChange(event: any) {
    this.dateSelected = new Date(event.dateString);
    this.fetchBooking();
    const todayElement = document.querySelector(".flatpickr-day.today") as HTMLElement;
    if (todayElement) {
      todayElement.style.opacity = this.dateSelected.toDateString() === this.currentDay.toDateString() ? "1" : "0.5";
    }

  }

  bookingPageSize: number = 5;
  bookingPage: number = 1;

  fetchBooking() {
    let formattedDate = this.dateSelected.toLocaleDateString('en-CA');
    this.dashboardService.getBookings(this.bookingPage,this.bookingPageSize,formattedDate).subscribe({
        next: (data) => {
          this.bookingRoom = data;
        },
        error: (err) => {
          console.error(err);
      }
    });
  }

  getTimes(startTime: string, endTime: string) {
    let start = new Date(startTime);
    let end = new Date(endTime);
    // 11:00 AM - 05:00 PM to 11:00 - 17:00
    return start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) + ' - ' + end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
  }

  showBookingMore(){
    this.bookingPage = 1;
    this.bookingPageSize += 10;
    this.fetchBooking();
  }

  IsAfterDay(date: string){
    // 3 days ago
    let threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    let dateToCheck = new Date(date);
    const _date = dateToCheck > threeDaysAgo;
    console.log(dateToCheck, "is after now", _date);
    return _date;
  }
}
