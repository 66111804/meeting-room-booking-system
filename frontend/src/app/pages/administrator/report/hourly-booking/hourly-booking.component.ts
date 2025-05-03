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
import {FlatPickrOutputOptions} from 'angularx-flatpickr/lib/flatpickr.directive';
import {Chart} from 'chart.js';
import {GlobalComponent} from '../../../../global-component';
import {NgbDropdown, NgbDropdownMenu, NgbDropdownToggle, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {IHourlyBooking, ReportService} from '../../../../core/services/report.service';

@Component({
  selector: 'app-hourly-booking',
  standalone: true,
  imports: [
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownToggle,
    NgbPagination
  ],
  templateUrl: './hourly-booking.component.html',
  styleUrl: './hourly-booking.component.scss'
})
export class HourlyBookingComponent implements OnInit,AfterViewInit, OnDestroy, OnChanges
{
  @Input() dateSelected!: FlatPickrOutputOptions;
  @Input() roomSelected: string = '';
  @Input() roomsSelected: string[] = [];

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  serverUrl= GlobalComponent.SERVE_URL;
  page = 1;
  pageSize = 100;

  reportHourlyBookingResponse: IHourlyBooking =
    {
      data: [],
      total: 0,
      totalPages: 0,
      current: 0
    };

  reportHourlyBookingTable:  IHourlyBooking =
    {
      data: [],
      total: 0,
      totalPages: 0,
      current: 0
    };

  constructor(private reportService: ReportService) {
  }
  ngOnChanges(changes: SimpleChanges): void{
    if (changes['dateSelected']) {
      this.handleDateChange(changes['dateSelected'].currentValue);
    }

    if (changes['roomSelected']) {
      this.roomSelected = changes['roomSelected'].currentValue;
      this.fetchHourlyBooking();
    }
    if (changes['roomsSelected']) {
      this.roomsSelected = changes['roomsSelected'].currentValue;
      console.log(this.roomsSelected);
    }
  }

  handleDateChange(date: FlatPickrOutputOptions) {
    this.fetchHourlyBooking();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createChart();
      this.fetchHourlyBooking();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  fetchHourlyBooking() {
    if(this.dateSelected.selectedDates.length < 2)
      return;

    const startDate = this.dateSelected.selectedDates[0].toISOString();
    const endDate = this.dateSelected.selectedDates[1].toISOString();

    this.reportService.getHourlyBooking(startDate, endDate,this.roomSelected).subscribe(
      {
        next: (res) => {
          // console.log(res);
          this.reportHourlyBookingResponse = res;
          this.updateTable();
          if(this.chart){
            const labels = res.data.map((item) => item.hour);
            const values = res.data.map((item) => item.totalBookings);
            const suggestedMax = this.getSuggestedMax(values);

            this.chart.data.labels = labels;
            this.chart.data.datasets[0].data = values;
            this.chart.options.scales =
              {
                y: {
                  beginAtZero: true,
                  suggestedMax: suggestedMax,
                  ticks: {
                    stepSize: 1,
                    precision: 0
                  }
                }
              }

            this.chart.update();
          }
        },
        error: (error) => {
          console.error('Error fetching hourly booking data:', error);
        }
      }) ;
  }

  createChart(): void {
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'ยอดการใช้งานต่อชั่วโมง',
          data: [],
          borderColor: '#42A5F5',
          backgroundColor: 'rgba(66, 165, 245, 0.2)',
          pointBackgroundColor: '#1E88E5',
          pointRadius: 5,
          pointHoverRadius: 8,
          tension: 0.3, // ความโค้งของเส้น
          fill: true,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'รายงานการใช้งานห้องประชุมรายชั่วโมง (08:00 - 17:00)',
            font: {
              size: 18
            }
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            color: '#000',
            font: {
              weight: 'lighter'
            },
            formatter: (val: number) => val + ''
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'เวลา (ชั่วโมง)'
            },
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'จำนวนการจอง'
            },
            ticks: {
              stepSize: 1,
              precision: 0
            }
          }
        }
      }
    });
  }

  getSuggestedMax(values: number[]): number {
    const max = Math.max(...values);
    return Math.ceil(max / 10) * 10; // ปรับให้เป็นจำนวนเต็มที่ใกล้เคียงที่สุด
  }

  updateTable() {
    const totalData = this.reportHourlyBookingResponse.data.length;
    const totalPage = Math.ceil(totalData / this.pageSize);
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.reportHourlyBookingTable.data = this.reportHourlyBookingResponse.data.slice(startIndex, endIndex);
    this.reportHourlyBookingTable.total = totalData;
    this.reportHourlyBookingTable.totalPages = totalPage;
    this.reportHourlyBookingTable.current = this.page;
  }

  changePage() {
    this.updateTable();
  }
}
