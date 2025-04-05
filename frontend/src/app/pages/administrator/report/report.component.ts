import {AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
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

// export interface FlatPickrOutputOptions {
//   selectedDates: Date[];
//   dateString: string;
//   instance: any;
// }
@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    FeatherModule,
    RouterLink,
    FlatpickrDirective,
    FormsModule,
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownToggle,
    NgbPagination
  ],
  providers:[provideNativeDateAdapter()],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class ReportComponent implements OnInit,AfterViewInit
{
  breadCrumbItems!: Array<{}>;
  dateSelected!: FlatPickrOutputOptions;
  dateSelectedUpdate!:FlatpickrDirective;
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

  reportTopBooksResponse:ITopBooking =
    {
      booking: [],
      total: 0,
      totalPages: 0,
      current: 0
    };

  ngOnInit():void {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 50);

    this.dateSelected = {
      selectedDates: [
        currentDate,
        new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 50)
      ],
      dateString: this.formatDateRange(currentDate, 1),
      instance: null
    };
  }

  fetchTopBooks() {
    this.reportService.getTopBooks(this.searchTerm, this.page, this.pageSize,this.dateSelected.selectedDates[0].toISOString(), this.dateSelected.selectedDates[1].toISOString()).subscribe(
      {
        next: (response) => {
          console.log(response);
          this.reportTopBooksResponse = response;
        },
        error: (error) => {
          console.error('Error fetching top books:', error);
        }
      }
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      document.getElementById('elmLoader')?.classList.add('d-none');
      this.fetchTopBooks();
    }, 500);
  }

  formatDateRange(start: Date, offset: number): string {
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };

    return `${start.toLocaleDateString('en-GB', options)} to ${end.toLocaleDateString('en-GB', options)}`;
  }

  onDateSelectChange(date: FlatPickrOutputOptions) {
    this.dateSelected = date;
    // console.log(this.dateSelected);
    this.fetchTopBooks();
  }

  changePage()
  {
    this.fetchTopBooks();
  }
}
