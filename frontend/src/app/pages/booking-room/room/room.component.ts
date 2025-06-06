import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA, Input,
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
import {format} from 'date-fns';
import {FlatPickrOutputOptions} from 'angularx-flatpickr/lib/flatpickr.directive';


// noinspection DuplicatedCode
@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    FormsModule,
    FlatpickrDirective,
    DatePipe,
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class RoomComponent implements OnInit, AfterViewInit
{
  @Input() isEdit = false;
  @Input() bookingId = 0;
  @Input() bookingInfo: IBookingRoom | null = null;

  roomId: number = 0;
  breadCrumbItems!: Array<{}>;
  searchTerm: string = '';
  dateSelected:Date;
  datePickerOptions: FlatpickrDefaultsInterface = {
    minDate: this.getMinDate(),
    maxDate: this.getMaxDate(),
    dateFormat: 'd M, Y',
  };

  roomInfo: MeetingRoom = {
    id: 0,
    name: '',
    description: '',
    status: '',
    createdAt: '',
    isAvailable: true,
    updatedAt: '',
    bookings: [],
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
  dateSelectedFlatPickr!: FlatPickrOutputOptions;

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

    this.dateSelectedFlatPickr =
      {
        selectedDates: [this.dateSelected],
        dateString: this.formatDate(this.dateSelected),
        instance: null
      };
  }
  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  }

  ngOnInit() {
    if(!this.isEdit) {
      this.roomId = Number(this.route.snapshot.paramMap.get('id'));
      this.timeStartSlotSelected = this.route.snapshot.queryParamMap.get('startTime') || '08:00';
      this.timeEndSlotSelected = this.route.snapshot.queryParamMap.get('endTime') || '08:30';
      this.formBookingData.meetingRoomId = this.roomId;

    }else {
      this.roomId = this.bookingInfo?.meetingRoomId || 0;
      this.formBookingData.meetingRoomId = this.roomId;

      this.timeStartSlotSelected = this.convertTime(this.bookingInfo?.startTime || '');
      this.timeEndSlotSelected = this.convertTime(this.bookingInfo?.endTime || '');

      this.formBookingData.title = this.bookingInfo?.title || '';
      this.formBookingData.description = this.bookingInfo?.description || '';
      this.dateSelected = new Date(this.bookingInfo?.startTime || this.getMinDate());
    }

    this.fetchRoomInfo();
    this.fetchTimeSlot();
  }

  ngAfterViewInit() {

    setTimeout(() => {
      document.getElementById('elmLoader')?.classList.add('d-none');
      this.changeStartTimeSlotSelected();
    }, 500);
  }

  convertTime(dateTimeStr: string): string {
    const date = new Date(dateTimeStr);
    return format(date, 'HH:mm');
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

  onDateSelectChange(date: FlatPickrOutputOptions)
  {
    if(this.isEdit){
      return;
    }
    this.dateSelected = date.selectedDates[0];
    this.fetchTimeSlot();
    this.changeStartTimeSlotSelected();
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
    let index_start = this.timeSlots.findIndex((slot) => slot.startTime === this.timeStartSlotSelected);
    let index_end = this.timeSlots.findIndex((slot) => slot.endTime === this.timeEndSlotSelected);
    if(index_start > 0 && index_end > 0 && index_start >= index_end)
    {
      this.timeEndSlotSelected = this.timeEndSlotSelectList[0].endTime;
    }
    this.formBookingData.endTime = this.timeEndSlotSelected;
  }

  onTimeEndSlotSelectChange(selectedEndTime: string) {
    this.timeEndSlotSelected = selectedEndTime;
    // this.timeStartSlotSelectList = this.timeSlots;
    // validate time slot
    this.calculateTotalHours(); // Recalculate hours
    this.cdr.detectChanges();

    this.formBookingData.endTime = this.timeEndSlotSelected;
  }

  fetchTimeSlot() {
    // YYYY-MM-DD
    const date = this.dateSelected.toISOString();
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
    if(!this.isEdit){
      this.formBookingData.title = '';
      this.formBookingData.description = '';
    }
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

    //
    if (slotDate.toDateString() !== selectedDate.toDateString()) {
      return false;
    }

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const selectedStart = new Date(`${date}T${this.timeStartSlotSelected}`);
    const selectedEnd = new Date(`${date}T${this.timeEndSlotSelected}`);

    // เช็คว่า slot ที่เลือกคาบเกี่ยวกับช่วงเวลาที่ต้องการไหม
    return selectedStart < end && selectedEnd > start;
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

    if(this.isEdit){
      this.bookingRoomService.createOrUpdateBookingRoom(formData, this.bookingId).subscribe({
        next: (response) => {
          this.toastr.success('อัพเดทข้อมูลสำเร็จ', 'Success');
          // this.openBookingRoomForm(false);
          this.fetchTimeSlot();
          Swal.fire({
            title: 'อัพเดทข้อมูลสำเร็จ',
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
    }else {
      this.bookingRoomService.createOrUpdateBookingRoom(formData).subscribe({
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
  }


  changeStartTimeSlotSelected() {
    const currentDate = new Date();
    // console.log(`${currentDate.getHours()}:${currentDate.getMinutes()}`);

    const currentDateStr = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
    const selectedDateStr = `${this.dateSelected.getFullYear()}-${this.dateSelected.getMonth() + 1}-${this.dateSelected.getDate()}`;

    // console.log(selectedDateStr, currentDateStr);
    if(currentDateStr === selectedDateStr)
    {
      const currentHour = currentDate.getHours() + 1;
      const currentMinute = currentDate.getMinutes();
      this.timeStartSlotSelectList = this.timeSlots.slice(
        this.timeSlots.findIndex((slot) => slot.startTime === `${String(currentHour).padStart(2, '0')}:${currentMinute < 30 ? '00' : '30'}`),
        this.timeSlots.length
      ); // Update start time options

      if(currentHour >= 17){
        this.timeStartSlotSelected = "";
        this.timeStartSlotSelectList = [];
      }else {
        const houreStr = String(currentHour).padStart(2, '0');
        const minuteStr = currentMinute < 30 ? '00' : '30';
        const formattedCurrentTime = `${houreStr}:${minuteStr}`;
        let currentTimeSlotIndex = this.timeSlots.findIndex((slot) => slot.startTime === formattedCurrentTime);
        currentTimeSlotIndex = currentTimeSlotIndex === -1 ? 0 : currentTimeSlotIndex;
        this.timeStartSlotSelectList = this.timeSlots.slice(currentTimeSlotIndex, this.timeSlots.length);
        // Update start time options
        if(this.timeStartSlotSelectList.length > 0) {
          this.timeStartSlotSelected = this.timeStartSlotSelectList[0].startTime;
        }
      }
    }else{
      // console.log("timeSlots :",this.timeSlots);
      if(this.timeSlots.length > 0){
        this.timeStartSlotSelectList = this.timeSlots.slice(0, this.timeSlots.length - 1);
        this.timeStartSlotSelected = this.timeStartSlotSelectList[0].startTime;
      }
    }
    // console.log("timeStartSlotSelectList : ",this.timeStartSlotSelectList);
    this.calculateTotalHours(); // Recalculate hours
    this.cdr.detectChanges();
  }

  /**
   * ---------------------------- Schedule ----------------------------
   */

}
