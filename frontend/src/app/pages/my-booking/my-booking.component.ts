import {Component, OnInit} from '@angular/core';
import {BreadcrumbsComponent} from '../../shared/breadcrumbs/breadcrumbs.component';
import {FlatpickrDefaultsInterface, FlatpickrDirective} from 'angularx-flatpickr';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {BookingRoomService} from '../../core/services/booking-room.service';
import {IMyBookingsResponse, MeetingRoom, MyBooking} from '../booking-room/room.module';
import {DatePipe} from '@angular/common';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-my-booking',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    FlatpickrDirective,
    FormsModule,
    TranslatePipe,
    DatePipe,
    NgbPagination
  ],
  templateUrl: './my-booking.component.html',
  styleUrl: './my-booking.component.scss'
})
export class MyBookingComponent implements OnInit
{

  breadCrumbItems!: Array<{}>;
  searchTerm!: string;

  datePickerOptions: FlatpickrDefaultsInterface = {
    minDate: new Date(),
    maxDate: this.getMaxDate(),
    dateFormat: 'Y-m-d',
  };

  roomSelected: MyBooking;

  page = 1;
  pageSize = 10;
  searchTerms: string = '';
  myBookingList: IMyBookingsResponse;

  dateSelected!: Date;
  bookingEditForm: any = {
    title: '',
    description: '',
  };

  constructor(private bookingRoomService:BookingRoomService,
              private modalService: NgbModal
  )
  {
    this.breadCrumbItems = [{ label: 'Home', path: '/' }, { label: 'My Booking', active: true }];

    this.roomSelected = {
      id: 0,
      userId: 0,
      meetingRoomId: 0,
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      status: '',
      createdAt: '',
      updatedAt: '',
      MeetingRoom: {} as MeetingRoom
    }
    this.myBookingList = {
      myBooking: [],
      total: 0,
      totalPages: 0,
      current: 0
    }
  }


  ngOnInit() {
    this.fetchMyBooking();
  }

  fetchMyBooking() {
    this.bookingRoomService.listMyBooking(this.page,this.pageSize,this.searchTerm).subscribe({
      next: (response) => {
        this.myBookingList = response;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
  searchInput() {
    console.log('searchInput');
  }

  private getMaxDate(): Date {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 3);
    return currentDate;
  }

  onDateSelectChange(event: any) {
    console.log('onDateSelectChange');
  }

  changePage() {
    this.fetchMyBooking();
  }

  openEditBookingModal(content: any, room: MyBooking) {
    this.roomSelected = room;
    this.bookingEditForm.title = room.title;
    this.bookingEditForm.description = room.description;
    console.log({roomSelected: this.roomSelected});
    this.modalService.open(content, { centered: true });
  }

  formSubmit() {
    console.log('formSubmit');
    console.log({bookingEditForm: this.bookingEditForm});
  }
}
