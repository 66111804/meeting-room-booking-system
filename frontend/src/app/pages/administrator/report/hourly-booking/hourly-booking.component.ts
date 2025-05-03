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
      labels: [],
      datasets: [],
    };

  reportHourlyBookingTable:  IHourlyBooking =
    {
      labels: [],
      datasets: [],
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
  chartColors = [
    '#42A5F5',
    '#66BB6A',
    '#FFA726',
    '#AB47BC',
    '#EC407A',
    '#FF7043',
    '#26A69A',
    '#7E57C2',
    '#78909C',
  ];
  fetchHourlyBooking() {
    if(this.dateSelected.selectedDates.length < 2)
      return;

    const startDate = this.dateSelected.selectedDates[0].toISOString();
    const endDate = this.dateSelected.selectedDates[1].toISOString();

    this.reportService.getHourlyBookingByRooms(this.roomsSelected,startDate, endDate, ).subscribe(
      {
        next: (res) => {
          /* example response
          {
            labels: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'],... 18:00
            datasets: [
              {
                label: 'ห้อง A',
                data: [2, 3, 4, 5, 6, 7, 8, 9, 10]
              },
              {
                label: 'ห้อง B',
                data: [1, 2, 3, 4, 5, 6, 7, 8, 9]
              }
            ]
           */
          this.reportHourlyBookingResponse = res;
          this.updateTable();

          if (this.chart) {
            const labels = res.labels;
            const values = res.datasets.map(d => d.data).flat();
            const suggestedMax = this.getSuggestedMax(values);

            this.chart.data.labels = labels;
            this.chart.data.datasets = res.datasets.map((item, index) => ({
              label: item.label,
              data: item.data,
              borderColor: this.chartColors[index % this.chartColors.length],
              backgroundColor: this.chartColors[index % this.chartColors.length] + '33', // 20% opacity
              pointBackgroundColor: this.chartColors[index % this.chartColors.length],
              pointRadius: 5,
              pointHoverRadius: 8,
              fill: true,
              tension: 0.3,
              borderWidth: 2
            }));

            this.chart.options.scales = {
              y: {
                beginAtZero: true,
                suggestedMax,
                title: {
                  display: true,
                  text: 'จำนวนการจอง'
                },
                ticks: {
                  stepSize: 1,
                  precision: 0
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'เวลา (30 นาที)'
                },
                grid: {
                  display: false
                }
              }
            };

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
        datasets: []
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'รายงานการใช้งานห้องประชุม (ทุก 30 นาที)',
            font: { size: 18 }
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
            font: { weight: 'lighter' },
            formatter: (val: number) => val + ''
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'เวลา (30 นาที)' },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'จำนวนการจอง' },
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
    this.reportHourlyBookingTable = this.reportHourlyBookingResponse;

    // const totalData = this.reportHourlyBookingResponse.data.length;
    // const totalPage = Math.ceil(totalData / this.pageSize);
    // const startIndex = (this.page - 1) * this.pageSize;
    // const endIndex = startIndex + this.pageSize;
    // this.reportHourlyBookingTable.data = this.reportHourlyBookingResponse.data.slice(startIndex, endIndex);
    // this.reportHourlyBookingTable.total = totalData;
    // this.reportHourlyBookingTable.totalPages = totalPage;
    // this.reportHourlyBookingTable.current = this.page;
  }

  changePage() {
    this.updateTable();
  }
}
