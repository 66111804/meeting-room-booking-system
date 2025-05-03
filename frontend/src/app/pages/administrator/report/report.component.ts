import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {BreadcrumbsComponent} from '../../../shared/breadcrumbs/breadcrumbs.component';
import {FeatherModule} from 'angular-feather';
import {provideNativeDateAdapter} from '@angular/material/core';
import {FlatpickrDirective} from 'angularx-flatpickr';
import {FormsModule} from '@angular/forms';
import {FlatPickrOutputOptions} from 'angularx-flatpickr/lib/flatpickr.directive';
import {ReportService} from '../../../core/services/report.service';
import {GlobalComponent} from '../../../global-component';
import {Chart, registerables} from 'chart.js'
import {TopBookingComponent} from './top-booking/top-booking.component';
import {TopDepartmentBookingComponent} from './top-department-booking/top-department-booking.component';
import {HourlyBookingComponent} from './hourly-booking/hourly-booking.component';
import {StatComponent} from '../../../widget/stat/stat.component';

Chart.register(...registerables);

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    FeatherModule,
    FlatpickrDirective,
    FormsModule,
    TopBookingComponent,
    TopDepartmentBookingComponent,
    HourlyBookingComponent,
    StatComponent,
  ],
  providers:[provideNativeDateAdapter()],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class ReportComponent implements OnInit,AfterViewInit, OnDestroy
{
  breadCrumbItems!: Array<{}>;
  dateSelected!: FlatPickrOutputOptions;
  chart!: Chart;

  roomSelected: string = '';
  roomsSelected: string[] = [];
  constructor(private reportService:ReportService) {
    document.getElementById('elmLoader')?.classList.remove('d-none');
    this.breadCrumbItems = [
      {label: 'Administrator'},
      {label: 'Report', active: true}
    ];
  }

  serverUrl= GlobalComponent.SERVE_URL;
  page = 1;
  pageSize = 10;
  searchTerm: string = '';
  sort: string = 'desc';

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
  ngOnInit():void {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 30);

    this.dateSelected = {
      selectedDates: [
        currentDate,
        new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 30)
      ],
      dateString: this.formatDateRange(currentDate, 30),
      instance: null
    };

    this._dateSelectStart =
      {
        selectedDates: [
          currentDate,
        ],
        dateString: this.formatDate(currentDate),
        instance: null
      }

    this._dateSelectEnd =
      {
        selectedDates: [
          new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 30)
        ],
        dateString: this.formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 30)),
        instance: null
      }

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      document.getElementById('elmLoader')?.classList.add('d-none');

    }, 500);
  }

  formatDateRange(start: Date, offset: number): string {
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return `${start.toLocaleDateString('en-GB', options)} to ${end.toLocaleDateString('en-GB', options)}`;
  }

  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  }

  onDateSelectChange(date: FlatPickrOutputOptions) {
    this.dateSelected = date;
    console.log(date);
  }

  _dateSelectStart!:FlatPickrOutputOptions;
  onDateSelectChangeStart(date: FlatPickrOutputOptions) {
    this._dateSelectStart = date;
    this.updateDateRange();
  }

  _dateSelectEnd!:FlatPickrOutputOptions;
  onDateSelectChangeEnd(date: FlatPickrOutputOptions) {
    this._dateSelectEnd = date;
    this.updateDateRange();
  }

  updateDateRange() {
    if (this._dateSelectStart.selectedDates.length > 0 && this._dateSelectEnd.selectedDates.length > 0) {
      const startDate = this._dateSelectStart.selectedDates[0];
      const endDate = this._dateSelectEnd.selectedDates[0];
      this.dateSelected = {
        selectedDates: [startDate, endDate],
        dateString: this.formatDateRange(startDate, Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)),
        instance: null
      };

      // console.log(this.dateSelected);
    }
  }

  onRoomSelectChange(room: any) {
    this.roomSelected = room;
    // console.log("roomSelected:", room);
  }

  onRoomsSelectedChange(rooms: any) {
    this.roomsSelected = rooms;
    // console.log("roomsSelected:", rooms);
  }

}
