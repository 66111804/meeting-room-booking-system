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
import {Router, RouterLink} from '@angular/router';
import {ITimeSlotResponse, SlotTimeService, TimeSlot} from '../../core/services/slot-time.service';


@Component({
  selector: 'app-booking-room',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    TranslatePipe,
    FlatpickrDirective,
    FormsModule,
    DatePipe,
    NgbPagination,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './booking-room.component.html',
  styleUrl: './booking-room.component.scss',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class BookingRoomComponent implements OnInit
{
  breadCrumbItems!: Array<{}>;

  timeSlots: TimeSlot[] = [];

  datePickerOptions: FlatpickrDefaultsInterface = {
    minDate: this.getMinDate(),
    maxDate: this.getMaxDate(),
    dateFormat: 'Y-m-d',
  };

  timeStartSlotSelected = '08:00';
  timeStartSlotSelectList = this.timeSlots.slice(0, this.timeSlots.length - 1);
  timeEndSlotSelected = '18:00';
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
              private toastr: ToastrService,
              private slotTimeService:SlotTimeService,
              private router: Router) {
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'Booking Room', active: true }
    ];
    this.dateSelected = this.getMinDate();
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
    const currentTimeSlotIndex = this.timeSlots.findIndex((slot) => slot.startTime === formattedCurrentTime);
    if (currentTimeSlotIndex === -1) {
      this.datePickerOptions.minDate = new Date(now.setDate(now.getDate() + 1));
      this.dateSelected = new Date(now.setDate(now.getDate()));
    }

    this.fetchMeetingRooms();
  }

  ngOnInit() {
    const now = new Date();
    if(now.getHours() >= 18){
      now.setDate(now.getDate() + 1);
    }

    const currentHour = now.getHours() + 1;
    const currentMinute = now.getMinutes();

    // Find the nearest time slot for the current time
    const formattedCurrentTime = `${String(currentHour).padStart(2, '0')}:${currentMinute < 30 ? '00' : '30'}`;

    const slotTimeTemp = this.slotTimeService.getSlotTimeTemp();

    this.timeStartSlotSelected = slotTimeTemp ? slotTimeTemp.startTime : '08:00';
    this.timeEndSlotSelected = slotTimeTemp ? slotTimeTemp.endTime : '08:30';

    this.timeStartSlotSelectList = this.timeSlots.slice(0, 1);
    this.timeEndSlotSelectList = this.timeSlots.slice(0, this.timeSlots.length - 1);

    // Calculate the initial total hours
    // this.calculateTotalHours();


    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((value) => {
      this.page = 1;
      this.fetchMeetingRooms();
    });

    this.fetchTimeSlot();
  }

  fetchMeetingRooms() {
    this.roomMeetingService.getAllBooking(this.page, this.limit,this.searchTerm, this.dateSelected.toISOString(), this.timeStartSlotSelected, this.timeEndSlotSelected)
      .subscribe({
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
      this.timeSlots.findIndex((slot) => slot.endTime === this.timeStartSlotSelected) + 1,
      this.timeSlots.length
    ); // Update end time options

    this.calculateTotalHours(); // Recalculate hours
    this.cdr.detectChanges();

    this.slotTimeService.storeSlotTimeTemp(
      {
        startTime: this.timeStartSlotSelected,
        endTime: this.timeEndSlotSelected
      }
    );

    this.fetchMeetingRooms();
  }

  onTimeEndSlotSelectChange(selectedEndTime: string) {
    this.timeEndSlotSelected = selectedEndTime;
    this.timeStartSlotSelectList = this.timeSlots.slice(
      0,
      this.timeSlots.findIndex((slot) => slot.startTime === this.timeEndSlotSelected)
    ); // Update start time options

    // validate time slot
    this.calculateTotalHours(); // Recalculate hours
    this.cdr.detectChanges();

    this.slotTimeService.storeSlotTimeTemp(
      {
        startTime: this.timeStartSlotSelected,
        endTime: this.timeEndSlotSelected
      }
    );

    this.fetchMeetingRooms();
  }

  calculateTotalHours() {
    // Calculate total hours
    const startTime = this.timeStartSlotSelected.split(':');
    const endTime = this.timeEndSlotSelected.split(':');

    const startHour = parseInt(startTime[0], 10);
    const startMinute = parseInt(startTime[1], 10); // Fix: Use base 10
    const endHour = parseInt(endTime[0], 10);
    const endMinute = parseInt(endTime[1], 10); // Fix: Use base 10

    const totalHours = endHour - startHour;
    const totalMinutes = endMinute - startMinute;

    this.totalHours = totalHours + totalMinutes / 60;
  }

  onDateSelectChange(date: any) {
    // this.roomSelected = undefined;
    this.fetchMeetingRooms();
  }


  changePage() {
    this.roomSelected = undefined;
    this.fetchMeetingRooms();
  }

  private getMinDate(): Date {
    const currentDate = new Date();
    // if time > 15:00, set min date to next day
    if(currentDate.getHours() >= 17){
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return currentDate;
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
        // this.timeSlots = response;
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


  /*
  openBookingModal(content: any) {
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
  */
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
  }

  openBookingRoomModal(room: MeetingRoom) {
    this.router.navigate(['/booking-room', room.id, 'info'], {
      queryParams: {
        date: this.dateSelected.toISOString(),
        startTime: this.timeStartSlotSelected,
        endTime: this.timeEndSlotSelected
      }
    });
  }
  timeSlotsAvailable: ITimeSlotResponse ={
    days: [
      {
        date: '',
        timeSlots: [
          {
            id: 0,
            startTime: '',
            endTime: '',
            isAvailable: false,
            bookings: [
              {
                start: new Date(),
                end: new Date(),
                title: '---'
              }
            ]
          }
        ]
      }
    ],
    timeSlots: [],
  }

  fetchTimeSlot() {
    // YYYY-MM-DD
    const date = this.dateSelected.toISOString().split('T')[0];
    this.slotTimeService.getTimeSlot(date).subscribe({
      next: (response) => {
        this.timeSlotsAvailable = response;
        // console.log('Time Slot:', response);
        this.timeSlots.push(...response.timeSlots);

        this.onSelectTimeStartChange({target: {value: this.timeStartSlotSelected}});
        this.onSelectTimeEndChange({target: {value: this.timeEndSlotSelected}});
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }

  onSelectTimeStartChange($event: any) {
    this.onTimeStartSlotSelectChange($event.target.value);
  }

  onSelectTimeEndChange($event: any) {
    this.onTimeEndSlotSelectChange($event.target.value);
  }
}
