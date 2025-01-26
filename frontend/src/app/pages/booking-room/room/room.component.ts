import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BreadcrumbsComponent} from '../../../shared/breadcrumbs/breadcrumbs.component';
import {TranslatePipe} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {FlatpickrDefaultsInterface, FlatpickrDirective} from 'angularx-flatpickr';
import {MeetingRoom, RoomMeetingService} from '../../../core/services/room-meeting.service';
import {DatePipe, NgSwitch, SlicePipe} from '@angular/common';
import {GlobalComponent} from '../../../global-component';
import {IBookingRoom, ITimeSlot} from '../room.module';
import {ITimeSlotResponse, SlotTimeService, TimeSlot} from '../../../core/services/slot-time.service';
import {TokenStorageService} from '../../../core/services/token-storage.service';
import {LogInResponse} from '../../../core/services/auth.service';
import {BookingRoomService} from '../../../core/services/booking-room.service';
import {ToastrService} from 'ngx-toastr';
import Swal from 'sweetalert2';


// noinspection DuplicatedCode
@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    TranslatePipe,
    FormsModule,
    FlatpickrDirective,
    DatePipe,
    SlicePipe,
    NgSwitch
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class RoomComponent implements OnInit, AfterViewInit
{
  roomId: number = 0;
  breadCrumbItems!: Array<{}>;

  searchTerm: string = '';
  dateSelected:Date;
  datePickerOptions: FlatpickrDefaultsInterface = {
    minDate: this.getMinDate(),
    maxDate: this.getMaxDate(),
    dateFormat: 'Y-m-d',
  };

  roomInfo: MeetingRoom = {
    id: 0,
    name: '',
    description: '',
    status: '',
    createdAt: '',
    updatedAt: '',
    roomHasFeatures: []
  }

  timeSlots: TimeSlot[] = [];
  timeSlotsAvailable: ITimeSlotResponse;
  timeStartSlotSelected = '08:00';
  timeStartSlotSelectList:TimeSlot[] = [];
  timeEndSlotSelected = '8:30';
  timeEndSlotSelectList:TimeSlot[] = [];
  totalHours = 0;

  isFormBookingVisible = false;

  userInformation:LogInResponse;

  formBookingData:IBookingRoom = {
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    meetingRoomId: 0,
  }
  events: any[] = [];

  constructor(private route: ActivatedRoute,
              private roomMeetingService:RoomMeetingService,
              private cdr: ChangeDetectorRef,
              private slotTimeService:SlotTimeService,
              private tokenStorageService:TokenStorageService,
              private bookingRoomService:BookingRoomService,
              private toastr: ToastrService
  ) {
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'Booking Room'},
      { label: 'Room'},
      { label: 'Detail', active: true }
    ];
    this.userInformation = this.tokenStorageService.getUser();
    this.timeSlotsAvailable = {
      days: [
        {
          date: '2024-01-22T10:30:00',
          timeSlots: [
            {
            "id": 1,
            "startTime": "08:00",
            "endTime": "08:30",
            "isAvailable": true,
            "bookings": []
          },
            {
              "id": 2,
              "startTime": "08:30",
              "endTime": "09:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 3,
              "startTime": "09:00",
              "endTime": "09:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 4,
              "startTime": "09:30",
              "endTime": "10:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 5,
              "startTime": "10:00",
              "endTime": "10:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 6,
              "startTime": "10:30",
              "endTime": "11:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 7,
              "startTime": "11:00",
              "endTime": "11:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 8,
              "startTime": "11:30",
              "endTime": "12:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 9,
              "startTime": "12:00",
              "endTime": "12:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 10,
              "startTime": "12:30",
              "endTime": "13:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 11,
              "startTime": "13:00",
              "endTime": "13:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 12,
              "startTime": "13:30",
              "endTime": "14:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 13,
              "startTime": "14:00",
              "endTime": "14:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 14,
              "startTime": "14:30",
              "endTime": "15:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 15,
              "startTime": "15:00",
              "endTime": "15:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 16,
              "startTime": "15:30",
              "endTime": "16:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 17,
              "startTime": "16:00",
              "endTime": "16:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 18,
              "startTime": "16:30",
              "endTime": "17:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 19,
              "startTime": "17:00",
              "endTime": "17:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 20,
              "startTime": "17:30",
              "endTime": "18:00",
              "isAvailable": true,
              "bookings": []
            }
          ]
        },
        {
          date: '2024-01-23T10:30:00',
          timeSlots: [
            {
              "id": 1,
              "startTime": "08:00",
              "endTime": "08:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 2,
              "startTime": "08:30",
              "endTime": "09:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 3,
              "startTime": "09:00",
              "endTime": "09:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 4,
              "startTime": "09:30",
              "endTime": "10:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 5,
              "startTime": "10:00",
              "endTime": "10:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 6,
              "startTime": "10:30",
              "endTime": "11:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 7,
              "startTime": "11:00",
              "endTime": "11:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 8,
              "startTime": "11:30",
              "endTime": "12:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 9,
              "startTime": "12:00",
              "endTime": "12:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 10,
              "startTime": "12:30",
              "endTime": "13:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 11,
              "startTime": "13:00",
              "endTime": "13:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 12,
              "startTime": "13:30",
              "endTime": "14:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 13,
              "startTime": "14:00",
              "endTime": "14:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 14,
              "startTime": "14:30",
              "endTime": "15:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 15,
              "startTime": "15:00",
              "endTime": "15:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 16,
              "startTime": "15:30",
              "endTime": "16:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 17,
              "startTime": "16:00",
              "endTime": "16:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 18,
              "startTime": "16:30",
              "endTime": "17:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 19,
              "startTime": "17:00",
              "endTime": "17:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 20,
              "startTime": "17:30",
              "endTime": "18:00",
              "isAvailable": true,
              "bookings": []
            }
          ]
        },
        {
          date: '2024-01-24T10:30:00',
          timeSlots: [
            {
              "id": 1,
              "startTime": "08:00",
              "endTime": "08:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 2,
              "startTime": "08:30",
              "endTime": "09:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 3,
              "startTime": "09:00",
              "endTime": "09:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 4,
              "startTime": "09:30",
              "endTime": "10:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 5,
              "startTime": "10:00",
              "endTime": "10:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 6,
              "startTime": "10:30",
              "endTime": "11:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 7,
              "startTime": "11:00",
              "endTime": "11:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 8,
              "startTime": "11:30",
              "endTime": "12:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 9,
              "startTime": "12:00",
              "endTime": "12:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 10,
              "startTime": "12:30",
              "endTime": "13:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 11,
              "startTime": "13:00",
              "endTime": "13:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 12,
              "startTime": "13:30",
              "endTime": "14:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 13,
              "startTime": "14:00",
              "endTime": "14:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 14,
              "startTime": "14:30",
              "endTime": "15:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 15,
              "startTime": "15:00",
              "endTime": "15:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 16,
              "startTime": "15:30",
              "endTime": "16:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 17,
              "startTime": "16:00",
              "endTime": "16:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 18,
              "startTime": "16:30",
              "endTime": "17:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 19,
              "startTime": "17:00",
              "endTime": "17:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 20,
              "startTime": "17:30",
              "endTime": "18:00",
              "isAvailable": true,
              "bookings": []
            }
          ]
        },     {
          date: '2024-01-25T10:30:00',
          timeSlots: [
            {
              "id": 1,
              "startTime": "08:00",
              "endTime": "08:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 2,
              "startTime": "08:30",
              "endTime": "09:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 3,
              "startTime": "09:00",
              "endTime": "09:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 4,
              "startTime": "09:30",
              "endTime": "10:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 5,
              "startTime": "10:00",
              "endTime": "10:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 6,
              "startTime": "10:30",
              "endTime": "11:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 7,
              "startTime": "11:00",
              "endTime": "11:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 8,
              "startTime": "11:30",
              "endTime": "12:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 9,
              "startTime": "12:00",
              "endTime": "12:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 10,
              "startTime": "12:30",
              "endTime": "13:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 11,
              "startTime": "13:00",
              "endTime": "13:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 12,
              "startTime": "13:30",
              "endTime": "14:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 13,
              "startTime": "14:00",
              "endTime": "14:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 14,
              "startTime": "14:30",
              "endTime": "15:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 15,
              "startTime": "15:00",
              "endTime": "15:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 16,
              "startTime": "15:30",
              "endTime": "16:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 17,
              "startTime": "16:00",
              "endTime": "16:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 18,
              "startTime": "16:30",
              "endTime": "17:00",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 19,
              "startTime": "17:00",
              "endTime": "17:30",
              "isAvailable": true,
              "bookings": []
            },
            {
              "id": 20,
              "startTime": "17:30",
              "endTime": "18:00",
              "isAvailable": true,
              "bookings": []
            }
          ]
        }
      ],
      timeSlots: [
          {
            "id": 1,
            "startTime": "08:00",
            "endTime": "08:30",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 2,
            "startTime": "08:30",
            "endTime": "09:00",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 3,
            "startTime": "09:00",
            "endTime": "09:30",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 4,
            "startTime": "09:30",
            "endTime": "10:00",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 5,
            "startTime": "10:00",
            "endTime": "10:30",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 6,
            "startTime": "10:30",
            "endTime": "11:00",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 7,
            "startTime": "11:00",
            "endTime": "11:30",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 8,
            "startTime": "11:30",
            "endTime": "12:00",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 9,
            "startTime": "12:00",
            "endTime": "12:30",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 10,
            "startTime": "12:30",
            "endTime": "13:00",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 11,
            "startTime": "13:00",
            "endTime": "13:30",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 12,
            "startTime": "13:30",
            "endTime": "14:00",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 13,
            "startTime": "14:00",
            "endTime": "14:30",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 14,
            "startTime": "14:30",
            "endTime": "15:00",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 15,
            "startTime": "15:00",
            "endTime": "15:30",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 16,
            "startTime": "15:30",
            "endTime": "16:00",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 17,
            "startTime": "16:00",
            "endTime": "16:30",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 18,
            "startTime": "16:30",
            "endTime": "17:00",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 19,
            "startTime": "17:00",
            "endTime": "17:30",
            "isAvailable": true,
            "bookings": []
          },
          {
            "id": 20,
            "startTime": "17:30",
            "endTime": "18:00",
            "isAvailable": true,
            "bookings": []
          }
      ],
    }
    // get query params from URL date
    const date = this.route.snapshot.queryParamMap.get('date');
    if(date){
      this.dateSelected = new Date(date);
    }else{
      this.dateSelected = this.getMinDate();
    }
    console.log(this.dateSelected);
  }

  ngOnInit() {
    this.roomId = Number(this.route.snapshot.paramMap.get('id'));
    this.timeStartSlotSelected = this.route.snapshot.queryParamMap.get('startTime') || '08:00';
    this.timeEndSlotSelected = this.route.snapshot.queryParamMap.get('endTime') || '08:30';
    this.formBookingData.meetingRoomId = this.roomId;


    this.events = [{
      title: 'Meeting',
      start: new Date('2024-01-24T10:30:00'),
      end: new Date('2024-01-24T12:30:00')
    }];
    this.fetchRoomInfo();

    this.fetchTimeSlot();
  }
  fetchRoomInfo() {
    this.roomMeetingService.getRoomById(this.roomId).subscribe(
      {
        next: (room: MeetingRoom) => {
          this.roomInfo = room;
        },
        error: (error: any) => {
          console.error('Error:', error);
        }
      });

  }
  ngAfterViewInit() {
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
  }

  private getMinDate(){
    let currentDate = new Date();
    const currentHour = currentDate.getHours();
    if(currentHour > 17){
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
    return currentDate;
  }

  private getMaxDate(): Date {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 3);
    return currentDate;
  }

  onDateSelectChange(date: any)
  {
    this.dateSelected = new Date(date.dateString);
    this.fetchTimeSlot();
  }

  protected readonly GlobalComponent = GlobalComponent;

  onTimeStartSlotSelectChange(selectedStartTime: string) {
    this.timeStartSlotSelected = selectedStartTime;

    this.timeEndSlotSelectList = this.timeSlots.slice(
      this.timeSlots.findIndex((slot) => slot.endTime === this.timeStartSlotSelected) + 1,
      this.timeSlots.length
    ); // Update end time options

    // validate time slot
    this.calculateTotalHours(); // Recalculate hours
    this.cdr.detectChanges();

    this.formBookingData.startTime = this.timeStartSlotSelected;
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

    this.formBookingData.endTime = this.timeEndSlotSelected;
  }

  fetchTimeSlot() {
    // YYYY-MM-DD
    const date = this.dateSelected.toISOString().split('T')[0];
    this.slotTimeService.getTimeSlot(date, this.roomId).subscribe({
      next: (response) => {
        this.timeSlotsAvailable = response;
        this.timeSlots = []; // Clear time slots
        this.timeSlots.push(...response.timeSlots);

        this.onSelectTimeStartChange({target: {value: this.timeStartSlotSelected}});
        this.onSelectTimeEndChange({target: {value: this.timeEndSlotSelected}});
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }

  openBookingRoomForm(isVisible: boolean) {
    this.isFormBookingVisible = isVisible;
    this.formBookingData.title = '';
    this.formBookingData.description = '';
  }

  onSelectTimeStartChange($event: any) {
    this.onTimeStartSlotSelectChange($event.target.value);
  }

  onSelectTimeEndChange($event: any) {
    this.onTimeEndSlotSelectChange($event.target.value);
  }

  IsSlotTimeSelectedInRanges(date: string, startTime: string, endTime: string) {
    const slotDate = new Date(date);
    const selectedDate = new Date(this.dateSelected);

    // ถ้าต่างวันกัน return false
    if (slotDate.toDateString() !== selectedDate.toDateString()) {
      return false;
    }

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const selectedStart = new Date(`${date}T${this.timeStartSlotSelected}`);
    const selectedEnd = new Date(`${date}T${this.timeEndSlotSelected}`);

    // เช็คว่า slot ที่เลือกคาบเกี่ยวกับช่วงเวลาที่ต้องการไหม
    return selectedStart <= end && selectedEnd >= start;
  }

  onSubmitBookingRoom() {

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

    const formData:IBookingRoom = this.formBookingData;
    formData.startTime = startTime.toISOString();
    formData.endTime = endTime.toISOString();

    // option toasts position center display

    // Validate form title and description
    if (!formData.title || !formData.description) {
      this.toastr.error('กรุณากรอกข้อมูลให้ครบถ้วน', 'Error');
      Swal.fire({
        title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        icon: 'error',
        confirmButtonText: 'ปิด'
      });
      return;
    }



    this.bookingRoomService.createBookingRoom(formData).subscribe({
      next: (response) => {
        this.toastr.success('การจองห้องสำเร็จ', 'Success');
        this.openBookingRoomForm(false);
        this.fetchTimeSlot();
        Swal.fire({
          title: 'การจองห้องสำเร็จ',
          icon: 'success',
          confirmButtonText: 'ปิด',
          timer: 2000
        });
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastr.error('การจองห้องไม่สำเร็จ กรุณาตรวจสอบข้อมูล', 'Error');
        Swal.fire({
          title: 'การจองห้องไม่สำเร็จ กรุณาตรวจสอบข้อมูล',
          icon: 'error',
          confirmButtonText: 'ปิด'
        });
      } // Fix: Add error handling
    });
  }


  /**
   * ---------------------------- Schedule ----------------------------
   */

}
