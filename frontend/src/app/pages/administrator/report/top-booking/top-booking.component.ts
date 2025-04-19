import {
  AfterViewInit,
  Component,
  ElementRef, EventEmitter,
  Input, model,
  OnChanges,
  OnDestroy,
  OnInit, Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {GlobalComponent} from '../../../../global-component';
import {FlatPickrOutputOptions} from 'angularx-flatpickr/lib/flatpickr.directive';
import {ITopBooking, ReportService} from '../../../../core/services/report.service';
import {NgbDropdown, NgbDropdownMenu, NgbDropdownToggle, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {Chart,registerables} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-top-booking',
  standalone: true,
  imports: [
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownToggle,
    NgbPagination
  ],
  templateUrl: './top-booking.component.html',
  styleUrl: './top-booking.component.scss'
})
export class TopBookingComponent implements OnInit,AfterViewInit, OnDestroy, OnChanges
{
  @Input() dateSelected!: FlatPickrOutputOptions;
  @Output() roomUpdate = new EventEmitter<string>();
  roomSelected: string = '';

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  serverUrl= GlobalComponent.SERVE_URL;
  page = 1;
  pageSize = 5;
  searchTerm: string = '';
  sort: string = 'desc';
  reportTopBooksResponse:ITopBooking =
    {
      booking: [],
      total: 0,
      totalPages: 0,
      current: 0
    };


  reportTopBooksResponseTable:ITopBooking =
    {
      booking: [],
      total: 0,
      totalPages: 0,
      current: 0
    };

  constructor(private reportService:ReportService) {
  }

  ngOnChanges(changes: SimpleChanges): void{
    if (changes['dateSelected']) {
      this.handleDateChange(changes['dateSelected'].currentValue);
    }
  }

  handleDateChange(date: FlatPickrOutputOptions) {
    // console.log('Date changed in child:', date);
    this.fetchTopBooks();
  }

  ngOnInit() {

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      document.getElementById('elmLoader')?.classList.add('d-none');
      this.fetchTopBooks();
    }, 500);
  }

  ngOnDestroy(): void {
    document.getElementById('elmLoader')?.classList.add('d-none');
  }

  fetchTopBooks() {
    if(this.dateSelected.selectedDates.length < 2) {
      console.log('Please select a date range');
      return;
    }

    const startDate = this.dateSelected.selectedDates[0].toISOString();

    const endDate = this.dateSelected.selectedDates[1].toISOString()

    this.reportService.getTopBooks(this.searchTerm, 1, 1000, startDate,endDate,this.sort,this.roomSelected).subscribe(
      {
        next: (res) => {
          console.log(res);
          if(this.roomSelected === ''){
            this.reportTopBooksResponse = res;
          }
          this.updateTable();
          const data = res.booking;
          const labels = data.map(item => item.name);
          const values = data.map(item => item.totalBookings);
          if(this.chart) {
            const suggestedMax = this.getSuggestedMax(values);
            const backgroundColors = [
              '#66BB6A'
            ];
            //'42A5F5', '#66BB6A', '#FFA726', '#26C6DA', '#7E57C2', '#FF7043', '#26A69A'
            const dataset = {
              // label: 'จำนวนการจอง',
              label: this.roomSelected === '' ? 'ยอดการใช้งาน' : 'ห้อง '+this.roomSelected,
              data: values,
              backgroundColor: backgroundColors.slice(0, values.length)
            };

            this.chart.data.labels = labels;
            this.chart.data.datasets[0] = dataset;
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

            // change chart title
            if(this.chart.options.plugins && this.chart.options.plugins.title && this.chart.options.plugins.title.text)
            {
              this.chart.options.plugins.title.text = this.roomSelected === '' ? 'รายงานการจองห้องประชุม' : 'รายงานการจองห้อง '+this.roomSelected;
            }

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
  updateTable()
  {
    const totalData = this.reportTopBooksResponse.booking.length;
    const totalPage = Math.ceil(totalData / this.pageSize);
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.reportTopBooksResponseTable.booking = this.reportTopBooksResponse.booking.slice(startIndex, endIndex);
    this.reportTopBooksResponseTable.total = totalData;
    this.reportTopBooksResponseTable.totalPages = totalPage;
    this.reportTopBooksResponseTable.current = this.page;

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
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            color: '#000',
            font: {
              weight: 'lighter'
            },
            formatter: (val: number) => val + ' ครั้ง'
          }
        }
      }
    });
  }

  getSuggestedMax(data: number[]): number {
    const max = Math.max(...data);
    return Math.ceil(max * 1.1); // Increase the max value by 10%
  }

  changePage()
  {
    this.fetchTopBooks();
  }

  sortBy(sort: string) {
    this.sort = sort;
    this.fetchTopBooks();
  }

  onRoomSelectedChange(room: string = '') {
    this.roomSelected = room;
    this.roomUpdate.emit(this.roomSelected);
    this.fetchTopBooks();
  }
}

