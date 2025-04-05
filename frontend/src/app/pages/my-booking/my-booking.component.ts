import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {BreadcrumbsComponent} from '../../shared/breadcrumbs/breadcrumbs.component';
import {FlatpickrDefaultsInterface, FlatpickrDirective} from 'angularx-flatpickr';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {BookingRoomService} from '../../core/services/booking-room.service';
import {IMyBookingsResponse, MeetingRoom, MyBooking} from '../booking-room/room.module';
import {DatePipe} from '@angular/common';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {RouterLink} from '@angular/router';
import {debounceTime, Subject} from 'rxjs';

@Component({
  selector: 'app-my-booking',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    FlatpickrDirective,
    FormsModule,
    TranslatePipe,
    DatePipe,
    NgbPagination,
    RouterLink
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
  searchSubject: Subject<string> = new Subject<string>();
  constructor(private bookingRoomService:BookingRoomService,
              private modalService: NgbModal,
              private toastr: ToastrService
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


    this.searchSubject.pipe(debounceTime(500))
      .subscribe((searchTerm) => {
      this.searchTerm = searchTerm;
      this.fetchMyBooking();
    });
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
    this.searchSubject.next(this.searchTerm);
  }

  private getMaxDate(): Date {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 3);
    return currentDate;
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

  cancelBooking() {
    console.log('deleteRoom', this.roomSelected);

    // Close the modal
    this.bookingRoomService.cancelBooking(this.roomSelected.id).subscribe({
      next: (response) => {
        console.log(response);
        this.toastr.success('ยกเลิกการจองสำเร็จ');
        this.fetchMyBooking();
      },
      error: (error) => {
        console.log(error);
        this.toastr.error('ยกเลิกการจองไม่สำเร็จ');
      }
    });

    this.modalService.dismissAll();
  }

  confirm(deleteRoomModel:any,room:MyBooking){
    this.roomSelected = room;
    this.modalService.open(deleteRoomModel, { centered: true });
  }

  /**
   * Check if the date is in the future
   * @param date - The date to check format 'YYYY-MM-DD'
   */
  isFutureDate(date: string): boolean {
    const currentDate = new Date();
    const selectedDate = new Date(date);
    return currentDate < selectedDate;
  }

  /**
   * Check if the date is the current date
   * @param date - The date to check format 'YYYY-MM-DD'
   */
  isCurrentDate(date: string): boolean {
    const currentDate = new Date();
    const selectedDate = new Date(date);
    return currentDate.toDateString() === selectedDate.toDateString();
  }

  /**
   * Check if the date is the current date และเวลามากวก่า 3 ชั่วโมง
   * @param date - The date to check format 'YYYY-MM-DD HH:mm:ss'
   */
  isCurrentDateTime(date: string): boolean {
    const currentDate = new Date();
    const selectedDate = new Date(date);
    selectedDate.setHours(selectedDate.getHours() - 2);
    const seconds = 1000;
    const minutes = seconds * 60;
    const diff = (currentDate.getTime() - selectedDate.getTime()) / (minutes);
    const diffHours = Math.ceil(diff);
    return currentDate.toDateString() === selectedDate.toDateString() && diffHours > -2; // After 2 hours return true
  }

  showTime(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    const startTimeString = start.toLocaleString('en-US', options);
    const endTimeString = end.toLocaleString('en-US', options);
    return `${startTimeString} - ${endTimeString}`;
  }

  /**
   * Check if the date is in the past
   * @param date - The date to check format 'YYYY-MM-DD'
   */
  isPastDate(date: string): boolean {
    const currentDate = new Date();
    const selectedDate = new Date(date);
    return currentDate > selectedDate;
  }

  getLink(id: number) {
    return `/my-booking/${id}/edit`;
  }
}
