import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {GlobalComponent} from '../../../../global-component';
import {FlatPickrOutputOptions} from 'angularx-flatpickr/lib/flatpickr.directive';
import {Chart} from 'chart.js';
import {NgbDropdown, NgbDropdownMenu, NgbDropdownToggle, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {ITopDepartmentBooking, ReportService} from '../../../../core/services/report.service';

@Component({
  selector: 'app-top-department-booking',
  standalone: true,
  imports: [
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownToggle,
    NgbPagination
  ],
  templateUrl: './top-department-booking.component.html',
  styleUrl: './top-department-booking.component.scss'
})
export class TopDepartmentBookingComponent implements OnInit,AfterViewInit, OnDestroy, OnChanges
{
  @Input() dateSelected!: FlatPickrOutputOptions;

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  serverUrl= GlobalComponent.SERVE_URL;
  page = 1;
  pageSize = 10;
  searchTerm: string = '';
  sort: string = 'desc';
  topDepartmentBooking:ITopDepartmentBooking = {
    data: [],
    total: 0,
    totalPages: 0,
    current: 0,
  }

  constructor(private reportService: ReportService) {
    document.getElementById('elmLoader')?.classList.remove('d-none');
  }

  ngOnInit(): void {
    this.fetchTopDepartmentBooking();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      document.getElementById('elmLoader')?.classList.add('d-none');
    }, 500);
    this.createChart();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  ngOnChanges(changes: SimpleChanges): void{
    if (changes['dateSelected']) {
      this.handleDateChange(changes['dateSelected'].currentValue);
    }
  }

  handleDateChange(date: FlatPickrOutputOptions) {
    // console.log('Date changed in child:', date);
    this.fetchTopDepartmentBooking();
  }

  fetchTopDepartmentBooking(){
    if(this.dateSelected.selectedDates.length < 2) {
      console.log('Please select a date range');
      return;
    }

    const startDate = this.dateSelected.selectedDates[0].toISOString();
    const endDate = this.dateSelected.selectedDates[1].toISOString()

    this.reportService.getTopDepartmentBooks(this.searchTerm, this.page, this.pageSize, startDate,endDate,this.sort).subscribe(
      {
        next: (data) => {
          console.log(data);
          this.topDepartmentBooking = data;

          if(this.chart){
            const labels = data.data.map((item) => item.department);
            const values = data.data.map((item) => item.totalBookings);
            const suggestedMax = this.getSuggestedMax(values);
            const backgroundColors = [
              '#42A5F5', '#66BB6A', '#FFA726', '#26C6DA', '#7E57C2', '#FF7043', '#26A69A'
            ];

            const dataSet = {
              label: 'ยอดการใช้งาน',
              data: values,
              backgroundColor: backgroundColors.slice(0, values.length)
            }
            this.chart.data.labels = labels;
            this.chart.data.datasets[0] = dataSet;
            this.chart.options.scales = {
              y: {
                beginAtZero: true,
                suggestedMax: suggestedMax,
                ticks: {
                  stepSize: 1,
                  precision: 0
                }
              }
            };

            this.chart.update();

          }
        },
        error: (error) => {
          console.log(error);
          this.topDepartmentBooking = {
            data: [],
            total: 0,
            totalPages: 0,
            current: 0,
          }
        }
      });
  }
  sortBy(sort: string) {
    this.sort = sort;
    this.fetchTopDepartmentBooking();
  }

  changePage(){
    this.fetchTopDepartmentBooking();
  }

  createChart(): void {
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'ยอดการใช้งาน',
          data: [],
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'รายงานการใช้งานตามแผนก',
          }
        }
      }
    });
  }

  getSuggestedMax(data: number[]): number {
    const max = Math.max(...data);
    return Math.ceil(max * 1.1); // Increase the max value by 10%
  }

}
