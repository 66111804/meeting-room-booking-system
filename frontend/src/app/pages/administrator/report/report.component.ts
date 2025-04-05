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
import {RouterLink} from '@angular/router';
import {provideNativeDateAdapter} from '@angular/material/core';
import {FlatpickrDirective} from 'angularx-flatpickr';
import {FormsModule} from '@angular/forms';
import {FlatPickrOutputOptions} from 'angularx-flatpickr/lib/flatpickr.directive';
import {NgbDropdown, NgbDropdownMenu, NgbDropdownToggle, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {ITopBooking, ReportService} from '../../../core/services/report.service';
import {GlobalComponent} from '../../../global-component';
import {ChartConfiguration, Chart, registerables} from 'chart.js'
import {BaseChartDirective} from 'ng2-charts';
import {TopBookingComponent} from './top-booking/top-booking.component';
import {TopDepartmentBookingComponent} from './top-department-booking/top-department-booking.component';
import {HourlyBookingComponent} from './hourly-booking/hourly-booking.component';

Chart.register(...registerables);

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    FeatherModule,
    FlatpickrDirective,
    FormsModule,
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownToggle,
    NgbPagination,
    TopBookingComponent,
    TopDepartmentBookingComponent,
    HourlyBookingComponent,
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
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

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

  onDateSelectChange(date: FlatPickrOutputOptions) {
    this.dateSelected = date;

  }

}
