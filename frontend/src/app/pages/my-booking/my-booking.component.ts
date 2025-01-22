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

  // confirm(content: any) {
  //   this.modalService.open(content, { centered: true });
  // }

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
    const diff = Math.abs(currentDate.getTime() - selectedDate.getTime());
    const diffHours = Math.ceil(diff / (1000 * 60 * 60));
    return currentDate.toDateString() === selectedDate.toDateString() && diffHours > 3;
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
}
