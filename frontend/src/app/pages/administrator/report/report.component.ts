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
import {ChartConfiguration, Chart, ChartType, registerables} from 'chart.js'
import {BaseChartDirective} from 'ng2-charts';

Chart.register(...registerables);

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
    NgbPagination,
    BaseChartDirective,
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

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'จำนวนการจอง',
        backgroundColor: '#42A5F5',
      }
    ]
  };


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

  reportTopBooksResponse:ITopBooking =
    {
      booking: [],
      total: 0,
      totalPages: 0,
      current: 0
    };
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

  fetchTopBooks() {
    if(this.dateSelected.selectedDates.length < 2) {
      console.error('Please select a date range');
      return;
    }
    const startDate = this.dateSelected.selectedDates[0].toISOString();
    const endDate = this.dateSelected.selectedDates[1].toISOString()

    this.reportService.getTopBooks(this.searchTerm, this.page, this.pageSize, startDate,endDate,this.sort).subscribe(
      {
        next: (res) => {
          console.log(res);
          this.reportTopBooksResponse = res;
          const data = res.booking;

          const labels = data.map(item => item.name);
          const values = data.map(item => item.totalBookings);
          if(this.chart) {
            this.chart.data.labels = labels;
            this.chart.data.datasets[0].data = values;
            this.chart.update();
          }else {
            this.createChart();
          }
        },
        error: (error) => {
          console.error('Error fetching top books:', error);
        }
      }
    );
  }

  updateChart() {

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      document.getElementById('elmLoader')?.classList.add('d-none');
      this.fetchTopBooks();
      this.createChart();
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

  createChart(): void {
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'จำนวนการจอง',
          data: [],
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'รายงานการจองห้องประชุม'
          }
        }
      }
    });
  }



  changePage()
  {
    this.fetchTopBooks();
  }

  sortBy(sort: string) {
    this.sort = sort;
    this.fetchTopBooks();
  }


}
