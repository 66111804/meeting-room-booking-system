// noinspection SpellCheckingInspection

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit,} from '@angular/core';
import {BreadcrumbsComponent} from '../../shared/breadcrumbs/breadcrumbs.component';
import {TranslatePipe} from '@ngx-translate/core';
import {DatePipe, NgForOf, SlicePipe} from '@angular/common';
import {FlatpickrDefaultsInterface, FlatpickrDirective} from 'angularx-flatpickr';
import {FormsModule} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {debounceTime, distinctUntilChanged, forkJoin, Subject} from 'rxjs';
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
  isSelectMultipleRoom: boolean = false;
  selectedMultipleRooms: MeetingRoom[] = [];

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
    this.dateSelected = date.selectedDates[0];
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

  onSubmit() {
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
                id: 0,
                bookedBy: '',
                roomName: '',
                startTime: '',
                endTime: '',
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

  onSelectMultipleRoomChange($event: any) {
    this.isSelectMultipleRoom = $event.target.checked;
  }

  onSelectMultipleRoomSelected(room: MeetingRoom) {
    if (this.selectedMultipleRooms.includes(room)) {
      this.selectedMultipleRooms = this.selectedMultipleRooms.filter((selectedRoom) => selectedRoom !== room);
    } else {
      this.selectedMultipleRooms.push(room);
    }
  }

  isRoomSelected(room: MeetingRoom):boolean {
    return this.selectedMultipleRooms.includes(room); // true if room is selected else false
  }

  onBookAlready(room: MeetingRoom) {
    this.toastr.error('ห้องนี้ถูกจองแล้ว กรุณาเลือกห้องอื่น');
  }

  openBookingMultipleRoomModal(content: any) {
    this.bookingRoomForm.meetingRoomId = 0;
    this.bookingRoomForm.startTime = this.timeStartSlotSelected;
    this.bookingRoomForm.endTime = this.timeEndSlotSelected;
    this.bookingRoomForm.title = '';
    this.bookingRoomForm.description = '';
    this.selectedMultipleRooms.forEach((room) => {
      // clear titleBooking and descriptionBooking
      room.titleBooking = '';
      room.descriptionBooking = '';
    });
    this.modalService.open(content, { centered: true , size: 'lg', scrollable: true});
  }

  /*
  onBookingMultipleRoom(){
    // noinspection DuplicatedCode
    this.selectedMultipleRooms.forEach((room) => {
      const bookingRoomForm = {
        ...this.bookingRoomForm,
        meetingRoomId: room.id
      }

      const date = new Date(this.dateSelected); // type: Date
      date.setHours(0, 0, 0, 0);
      // this.timeStartSlotSelected = 8:00
      // this.timeEndSlotSelected = 8:30
      const [startHours, startMinutes] = this.timeStartSlotSelected.split(':').map(Number);
      const [endHours, endMinutes] = this.timeEndSlotSelected.split(':').map(Number);

      const startTime = new Date(date);
      startTime.setHours(startHours, startMinutes, 0, 0);

      const endTime = new Date(date);
      endTime.setHours(endHours, endMinutes, 0, 0);

      const formData:IBookingRoom = this.bookingRoomForm;

      formData.startTime = startTime.toISOString();
      formData.endTime = endTime.toISOString();
      formData.meetingRoomId = room.id;

      console.log('Booking Room:', formData);

      // const response = this.bookingRoomService.createOrUpdateBookingRoom(formData).subscribe();

      this.bookingRoomService.createOrUpdateBookingRoom(formData).subscribe({
        next: (response) => {
          console.log('Booking Success:', response);
        },
        error: (error) => {
          console.error('Booking Error:', error);
        }
      });
    },() => {
      console.log("booking multiple room completed");
    });
    console.log("booking multiple room completed ----------");

  // Close the modal
    this.modalService.dismissAll();
    this.toastr.success('จองห้องสำเร็จ');
    // clear selected rooms
    this.selectedMultipleRooms = [];

  }
  */

  onBookingMultipleRoom() {
    // Create an array to store all booking observables
    const bookingRequests = this.selectedMultipleRooms.map(room => {
      // noinspection DuplicatedCode
      const date = new Date(this.dateSelected);
      date.setHours(0, 0, 0, 0);

      const [startHours, startMinutes] = this.timeStartSlotSelected.split(':').map(Number);
      const [endHours, endMinutes] = this.timeEndSlotSelected.split(':').map(Number);

      const startTime = new Date(date);
      startTime.setHours(startHours, startMinutes, 0, 0);

      const endTime = new Date(date);
      endTime.setHours(endHours, endMinutes, 0, 0);

      const formData: IBookingRoom = {
        title: room.titleBooking ?? '-',
        description: room.descriptionBooking,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        meetingRoomId: room.id
      };

      return this.bookingRoomService.createOrUpdateBookingRoom(formData);
    });
    // Wait for all booking requests to complete
    forkJoin(bookingRequests).subscribe({
      next: (responses) => {
        this.modalService.dismissAll();
        this.toastr.success('จองห้องสำเร็จ');
        this.selectedMultipleRooms = [];

        // Reload your data here
        this.fetchMeetingRooms();

      },
      error: (error) => {
        console.error('Error in booking:', error);
        this.toastr.error('เกิดข้อผิดพลาดในการจองห้อง');
      },
      complete: () => {
        console.log('Booking process completed');
      }
    });
  }

  /**
   * ---------------
   */
}
