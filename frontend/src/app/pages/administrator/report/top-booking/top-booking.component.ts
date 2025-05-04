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
import {ActiveElement, Chart, ChartEvent, registerables} from 'chart.js';
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
  @Output() roomsSelectedUpdate = new EventEmitter<string[]>();
  roomSelected: string = '';

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;
  chartColors = ['#42A5F5', '#66BB6A', '#FFA726', '#26C6DA', '#7E57C2', '#FF7043', '#26A69A', '#FFB74D', '#8D6E63', '#BDBDBD'];

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

  IsAfterViewInit: boolean = false;
  handleDateChange(date: FlatPickrOutputOptions) {
    // console.log('Date changed in child:', date);
    if (this.IsAfterViewInit) {
      this.fetchTopBooks();
    }
  }

  ngOnInit() {

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      document.getElementById('elmLoader')?.classList.add('d-none');
      this.createChart();
      this.fetchTopBooks();
      this.IsAfterViewInit = true;
    }, 500);
  }

  ngOnDestroy(): void {
    document.getElementById('elmLoader')?.classList.add('d-none');
  }
  isChartLoading: boolean = false;

  fetchTopBooks() {
    if (this.dateSelected.selectedDates.length < 2) {
      console.log('Please select a date range');
      return;
    }

    const startDate = this.dateSelected.selectedDates[0].toISOString();
    const endDate = this.dateSelected.selectedDates[1].toISOString();
    this.isChartLoading = true;
    if (this.roomsSelected.length === 0) {
      this.reportService.getTopBooks(this.searchTerm, 1, 1000, startDate, endDate, this.sort).subscribe({
        next: (res) => {
          this.reportTopBooksResponse = res;
          this.updateTable();
          this.isChartLoading = false;
          const data = res.booking ?? [];
          const labels = data.map(item => item.name);
          const values = data.map(item => item.totalBookings);
          this.updateSingleDatasetChart(labels, values);
        },
        error: (err) => {
          console.error('Error fetching all bookings:', err);
          this.isChartLoading = false;
        }
      });
    } else {
      this.isChartLoading = true;
      this.reportService.getTopBooksByRooms(this.roomsSelected, startDate, endDate).subscribe({
        next: (res) => {
          const { labels, datasets } = res;
          this.isChartLoading = false;
          if (!res || !res.labels || !res.datasets) {
            console.warn('Invalid response for multi-room:', res);
            return;
          }
          if (!this.chart) {
            this.createChart();
          }

          this.chart.data.labels = labels;
          this.chart.data.datasets = datasets.map((d, i) => ({
            label: "ห้อง:" + d.label,
            data: d.data,
            backgroundColor: this.chartColors[i % this.chartColors.length]
          }));

          this.chart.options.plugins!.title!.text = 'รายงานการจองเปรียบเทียบหลายห้อง';
          this.chart.update();

        },
        error: (err) => {
          console.error('Error fetching multi-room bookings:', err)
          this.isChartLoading = false;
        }
      });
    }
  }

  updateSingleDatasetChart(labels: string[], values: number[]) {
    const suggestedMax = this.getSuggestedMax(values);
    const backgroundColors = ['#66BB6A'];

    const dataset = {
      label: this.roomSelected === '' ? 'ยอดการใช้งาน' : 'ห้อง ' + this.roomSelected,
      data: values,
      backgroundColor: backgroundColors.slice(0, values.length)
    };

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets = [dataset];
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

      if (this.chart.options.plugins?.title) {
        const roomNames = this.roomsSelected.map((room) => room).join(', ');
        this.chart.options.plugins.title.text =
          this.roomSelected === '' ? 'รายงานการจองห้องประชุม' : 'รายงานการจองห้อง ' + roomNames;
      }

      this.chart.update();
    }
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
            formatter: (val: number) => val.toString()
          }
        },
        onClick:(event: ChartEvent, elements: ActiveElement[], chart: Chart) => {
          const chartElement = elements[0];
          const datasetIndex = chartElement.datasetIndex;
          const index = chartElement.index;

          console.log(chartElement, datasetIndex, index);
          if (datasetIndex !== undefined && index !== undefined) {
           let label = "";
           const dataset = chart.data.datasets[datasetIndex];
           if (chart.data.datasets[datasetIndex].label) {
              label = chart.data.datasets[datasetIndex].label;
              console.log(chart.data.datasets);
            }
            const value = chart.data.datasets[datasetIndex].data[index];
            const dateLabel = chart.data.labels?.[index];
            console.log('Label:', label, 'Value:', value, 'Date:', dateLabel);
            if (label.includes('ยอดการใช้งาน') && dateLabel)
            {
              this.onRoomSelectedChange(dateLabel.toString())
            }else {
              // console.log("ไม่พบ ยอดการใช้งาน");
            }
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

  roomsSelected:string[] = [];
  onRoomSelectedChange(room: string = '') {
    this.roomSelected = room;

    if(room !== '') {
      if (!this.roomsSelected.includes(room)) {
        this.roomsSelected.push(room);
      }else
      {
        const index = this.roomsSelected.indexOf(room);
        if (index > -1) {
          this.roomsSelected.splice(index, 1);
        }

        if (this.roomsSelected.length === 0) {
          this.roomSelected = '';
        } else {
          this.roomSelected = this.roomsSelected[this.roomsSelected.length - 1];
        }
      }
    }else {
      this.roomsSelected = [];
      this.roomSelected = '';
    }
    this.fetchTopBooks();
    this.roomUpdate.emit(this.roomSelected);
    this.roomsSelectedUpdate.emit(this.roomsSelected);
  }

  onRoomSelectALL()
  {
    const allRooms = this.reportTopBooksResponse.booking.map(item => item.name);
    const isAllSelected = this.roomsSelected.length === allRooms.length;

    this.roomsSelected = isAllSelected ? [] : allRooms;
    this.roomSelected = this.roomsSelected.at(-1) || '';

    this.fetchTopBooks();
    this.roomUpdate.emit(this.roomSelected);
    this.roomsSelectedUpdate.emit(this.roomsSelected);
  }
}

