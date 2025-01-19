import {AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BreadcrumbsComponent} from '../../../shared/breadcrumbs/breadcrumbs.component';
import {TranslatePipe} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {FlatpickrDefaultsInterface, FlatpickrDirective} from 'angularx-flatpickr';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    TranslatePipe,
    FormsModule,
    FlatpickrDirective
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class RoomComponent implements OnInit, AfterViewInit
{
  roomId: number = 0;
  breadCrumbItems!: Array<{}>;

  searchTerm: string = '';
  dateSelected!:Date;
  datePickerOptions: FlatpickrDefaultsInterface = {
    minDate: new Date(),
    maxDate: this.getMaxDate(),
    dateFormat: 'Y-m-d',
  };

  constructor(private route: ActivatedRoute) {
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'Booking Room'},
      { label: 'Room'},
      { label: 'Detail', active: true }
    ];

  }
  ngOnInit() {
    this.roomId = Number(this.route.snapshot.paramMap.get('id'));
    this.dateSelected = new Date();
  }

  ngAfterViewInit() {
    // call getRoomDetail API
    console.log('Room ID:', this.roomId);
  }

  searchInput() {
    console.log('Search Term:', this.searchTerm);
  }

  private getMaxDate(): Date {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 3);
    return currentDate;
  }
  onDateSelectChange(date: any)
  {
    console.log('Date Selected:', date);
  }
}
