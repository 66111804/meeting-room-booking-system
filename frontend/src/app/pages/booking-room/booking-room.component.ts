import {ChangeDetectionStrategy, ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit,} from '@angular/core';
import {BreadcrumbsComponent} from '../../shared/breadcrumbs/breadcrumbs.component';
import {TranslatePipe} from '@ngx-translate/core';
import {DatePipe, NgForOf, SlicePipe} from '@angular/common';
import {FlatpickrDefaultsInterface, FlatpickrDirective} from 'angularx-flatpickr';
import {FormsModule} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';
import {MeetingRoom, MeetingRoomResponse, RoomMeetingService} from '../../core/services/room-meeting.service';
import {GlobalComponent} from '../../global-component';
import {IBookingRoom, ITimeSlot} from './room.module';
import {BookingRoomService} from '../../core/services/booking-room.service';
import {ToastrService} from 'ngx-toastr';
import {RouterLink} from '@angular/router';


@Component({
  selector: 'app-booking-room',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    TranslatePipe,
    FlatpickrDirective,
    NgForOf,
    FormsModule,
    DatePipe,
    SlicePipe,
    NgbPagination,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './booking-room.component.html',
  styleUrl: './booking-room.component.scss',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class BookingRoomComponent implements OnInit
{
  breadCrumbItems!: Array<{}>;
  // Every 30 minutes
  // timeSlots: string[] = [
  //   '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  //   '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  //   '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  //   '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  //   '20:00', '20:30', '21:00', '21:30', '22:00', '23:30',
  // ];

  timeSlots: ITimeSlot[] = [
    { time: '08:00', available: true },
    { time: '08:30', available: true },
    { time: '09:00', available: true },
    { time: '09:30', available: true },
    { time: '10:00', available: true },
    { time: '10:30', available: true },
    { time: '11:00', available: true },
    { time: '11:30', available: true },
    { time: '12:00', available: true },
    { time: '12:30', available: true },
    { time: '13:00', available: true },
    { time: '13:30', available: true },
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '15:00', available: true },
    { time: '15:30', available: true },
    { time: '16:00', available: true },
    { time: '16:30', available: true },
    { time: '17:00', available: true },
    { time: '17:30', available: true },
    { time: '18:00', available: true },
  ];

  datePickerOptions: FlatpickrDefaultsInterface = {
    minDate: new Date(),
    maxDate: this.getMaxDate(),
    dateFormat: 'Y-m-d',
  };

  timeStartSlotSelected = '08:00';
  timeStartSlotSelectList = this.timeSlots.slice(0, this.timeSlots.length - 1);
  timeEndSlotSelected = '23:30';
  timeEndSlotSelectList = this.timeSlots.slice(1);
  totalHours = 0;

  dateSelected!:Date;
  validateTimeSlot:boolean = false; // true is invalid, false is valid

  page:number = 1;
  limit:number = 12; // col-xxl-3 = 11, col-xl-4 = 9, col-lg-6 = 6
  searchTerm:string = '';

  meetingRooms: MeetingRoomResponse;
  roomSelected: MeetingRoom | undefined = undefined;
  bookingRoomForm: IBookingRoom = {
    meetingRoomId: 0,
    startTime: '',
    endTime: '',
    title: '',
    description: ''
  }

  searchSubject: Subject<string> = new Subject<string>();
  protected readonly GlobalComponent = GlobalComponent;
  constructor(private roomMeetingService: RoomMeetingService,
              private cdr: ChangeDetectorRef,
              private modalService: NgbModal,
              private bookingRoomService:BookingRoomService,
              private toastr: ToastrService) {
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'Booking Room', active: true }
    ];

    // this.timeSlots = [
    //   '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    //   '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    //   '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    //   '17:00', '17:30', '18:00'
    // ];

    this.dateSelected = new Date();
    this.meetingRooms = {
      meetingRooms: [],
      total: 0,
      totalPages: 0,
      current: 0
    }



    // check time slot is out of range and set datePickerOptions to next day
    const now = new Date();
    const currentHour = now.getHours() + 1;
    const currentMinute = now.getMinutes();
    const formattedCurrentTime = `${String(currentHour).padStart(2, '0')}:${currentMinute < 30 ? '00' : '30'}`;
    // const currentTimeSlotIndex = this.timeSlots.indexOf(formattedCurrentTime);
    const currentTimeSlotIndex = this.timeSlots.findIndex((slot) => slot.time === formattedCurrentTime);
    if (currentTimeSlotIndex === -1) {
      this.datePickerOptions.minDate = new Date(now.setDate(now.getDate() + 1));
      this.dateSelected = new Date(now.setDate(now.getDate()));
    }

    // get window size
    // if(window.innerWidth < 576){
    //   // size is xs
    // }else if(window.innerWidth < 768){
    //   // size is sm
    // }else if(window.innerWidth < 992){
    //   // size is md
    // }else if(window.innerWidth < 1200){
    //   // size is lg
    //   this.limit = 6;
    // }else if(window.innerWidth < 1400){
    //   // size is xl
    //   this.limit = 9;
    // }else{
    //   // size is xxl
    //   this.limit = 12;
    // }

    this.fetchMeetingRooms();
  }

  ngOnInit() {
    const now = new Date();
    const currentHour = now.getHours() + 1;
    const currentMinute = now.getMinutes();

    // Find the nearest time slot for the current time
    const formattedCurrentTime = `${String(currentHour).padStart(2, '0')}:${currentMinute < 30 ? '00' : '30'}`;
    // const currentTimeSlotIndex = this.timeSlots.indexOf(formattedCurrentTime);
    const currentTimeSlotIndex = this.timeSlots.findIndex((slot) => slot.time === formattedCurrentTime);

    if (currentTimeSlotIndex === -1) {
      // If the current time is not in the timeSlots list, set default to the first slot
      this.timeStartSlotSelected = this.timeSlots[0].time;
      this.timeEndSlotSelected = this.timeSlots[1].time;
    } else
    {
      // Set start time to the current time slot and end time to the next slot
      this.timeStartSlotSelected = this.timeSlots[currentTimeSlotIndex].time;
      this.timeEndSlotSelected = this.timeSlots[currentTimeSlotIndex + 1].time || this.timeSlots[1].time;
    }

    if(this.timeStartSlotSelected === this.timeEndSlotSelected){
      this.timeStartSlotSelected = this.timeSlots[0].time;
      this.timeEndSlotSelected = this.timeSlots[1].time;
    }

    // Initialize the selectable time slot lists
    this.timeEndSlotSelectList = this.timeSlots.slice(1);
    this.timeStartSlotSelectList = this.timeSlots.slice(0, 1);

    // Calculate the initial total hours
    this.calculateTotalHours();


    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((value) => {
      this.page = 1;
      this.fetchMeetingRooms();
    });
  }

  fetchMeetingRooms() {
    this.roomMeetingService.getAllBooking(this.page, this.limit,this.searchTerm).subscribe({
      next: (response) => {
        this.meetingRooms = response;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  onTimeStartSlotSelectChange(selectedStartTime: string) {
    this.timeStartSlotSelected = selectedStartTime;
    this.timeEndSlotSelectList = this.timeSlots.slice(
      this.timeSlots.findIndex((slot) => slot.time === selectedStartTime) + 1
    ); // Update end time options

    // validate time slot

    this.calculateTotalHours(); // Recalculate hours
    this.cdr.detectChanges();
  }

  onTimeEndSlotSelectChange(selectedEndTime: string) {
    this.timeEndSlotSelected = selectedEndTime;
    this.timeStartSlotSelectList = this.timeSlots.slice(
      0,
      this.timeSlots.findIndex((slot) => slot.time === selectedEndTime)
    ); // Update start time options

   // validate time slot

    this.calculateTotalHours(); // Recalculate hours
    this.cdr.detectChanges();
  }

  calculateTotalHours() {
    const startTime = this.timeStartSlotSelected.split(':');
    const endTime = this.timeEndSlotSelected.split(':');

    const startHour = parseInt(startTime[0], 10);
    const startMinute = parseInt(startTime[1], 10); // Fix: Use base 10
    const endHour = parseInt(endTime[0], 10);
    const endMinute = parseInt(endTime[1], 10); // Fix: Use base 10

    const totalHours = endHour - startHour;
    const totalMinutes = endMinute - startMinute;

    this.totalHours = totalHours + totalMinutes / 60;

    // console.log('Start Time:', startHour, startMinute);
    // console.log('End Time:', endHour, endMinute);
    // console.log('Total Hours:', this.totalHours);
  }

  onDateSelectChange(date: any) {
    this.roomSelected = undefined;
  }


  changePage() {
    this.roomSelected = undefined;
    this.fetchMeetingRooms();
  }

  private getMaxDate(): Date {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 3);
    return currentDate;
  }


  searchInput(){
    this.searchSubject.next(this.searchTerm);
  }

  onRoomSelect(room: MeetingRoom) {
    this.roomSelected = room;
    // get time and date of the selected rooms
    this.fetchTimeSlots(room);
    this.bookingRoomForm.meetingRoomId = room.id;
  }

  fetchTimeSlots(room: MeetingRoom){
    const date = new Date(this.dateSelected);
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    this.bookingRoomService.getTimeSlot(room.id,dateStr).subscribe({
      next: (response) => {
        this.timeSlots = response;
        // this.timeStartSlotSelected = this.timeSlots[0].time;
        // this.timeEndSlotSelected = this.timeSlots[1].time;
        this.calculateTotalHours();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.timeSlots = [];
        this.cdr.detectChanges();
      }
    });
  }


  openBookingModal(content: any) {
    // console.log(this.dateSelected);
    // console.log(this.timeStartSlotSelected);
    // console.log(this.timeEndSlotSelected);
    const startDateTime = new Date(this.dateSelected);
    // set the time
    const startTime = this.timeStartSlotSelected.split(':');
    startDateTime.setHours(parseInt(startTime[0], 10));
    //  Sat Dec 21 2024 08:33:30 GMT+0700 (Indochina Time) to  Sat Dec 21 2024 08:30:00 GMT+0700 (Indochina Time)
    startDateTime.setMinutes(parseInt(startTime[1], 10));
    startDateTime.setSeconds(0);


    const endDateTime = new Date(this.dateSelected);

    const endTime = this.timeEndSlotSelected.split(':');
    endDateTime.setHours(parseInt(endTime[0], 10));
    endDateTime.setMinutes(parseInt(endTime[1], 10));
    endDateTime.setSeconds(0);

    console.log('Start Date:', startDateTime);
    console.log('End Date:', endDateTime);

    this.bookingRoomForm.startTime =  startDateTime.toISOString();
    this.bookingRoomForm.endTime = endDateTime.toISOString();

    this.modalService.open(content, { size: 'lg', centered: true });
  }

  onSubmit() {
    console.log(this.bookingRoomForm);
    if(this.bookingRoomForm.meetingRoomId === 0){
      this.toastr.error('Please select a room');
      return;
    }

    if(this.bookingRoomForm.startTime >= this.bookingRoomForm.endTime){
      this.toastr.error('End time must be greater than start time');
      return;
    }

    if(this.bookingRoomForm.title === ''){
      this.toastr.error('Please enter title');
      return;
    }

    if(this.bookingRoomForm.description === ''){
      this.toastr.error('Please enter description');
      return;
    }

    this.bookingRoomService.createBooking(this.bookingRoomForm).subscribe({
      next: (response) => {
        console.log(response);
        this.toastr.success('จองห้องสำเร็จแล้ว');
        if(this.roomSelected !== undefined){
          this.fetchTimeSlots(this.roomSelected);
        }
        this.modalService.dismissAll();
      },
      error: (error) => {
        console.log(error);
        this.toastr.error(error.error.message);
      }
    });
    // this.modalService.dismissAll();
  }
}
