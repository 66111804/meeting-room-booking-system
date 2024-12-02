import {ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit,} from '@angular/core';
import {BreadcrumbsComponent} from '../../shared/breadcrumbs/breadcrumbs.component';
import {TranslatePipe} from '@ngx-translate/core';
import {DatePipe, NgForOf, SlicePipe} from '@angular/common';
import {FlatpickrDirective} from 'angularx-flatpickr';
import {FormsModule} from '@angular/forms';
import {RoomInfo} from './room.module';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';




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
  timeSlots: string[] = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '23:30',
  ];


  timeStartSlotSelected = '08:00';
  timeStartSlotSelectList = this.timeSlots.slice(0, this.timeSlots.length - 1);
  timeEndSlotSelected = '23:30';
  timeEndSlotSelectList = this.timeSlots.slice(1);
  totalHours = 0;

  dateSelected!:Date;

  // Room list example 12 rooms
  roomList: Array<RoomInfo> = [
    {
      id: 1,
      name: '101',
      imageUrl: 'assets/images/room1.jpg',
      description: 'This is a meeting room 1'
    },
    {
      id: 2,
      name: '102',
      imageUrl: 'assets/images/room2.jpg',
      description: 'This is a meeting room 2'
    },
    {
      id: 3,
      name: '103',
      imageUrl: 'assets/images/room3.jpg',
      description: 'This is a meeting'
    },
    {
      id: 4,
      name: '104',
      imageUrl: 'assets/images/room4.jpg',
      description: 'This is a meeting room 4'
    },
    {
      id: 5,
      name: '105',
      imageUrl: 'assets/images/room5.jpg',
      description: 'This is a meeting room 5'
    },
    {
      id: 6,
      name: '106',
      imageUrl: 'assets/images/room6.jpg',
      description: 'This is a meeting room 6'
    },
    {
      id: 7,
      name: '107',
      imageUrl: 'assets/images/room7.jpg',
      description: 'This is a meeting room 7'
    },
    {
      id: 8,
      name: '108',
      imageUrl: 'assets/images/room8.jpg',
      description: 'This is a meeting room 8'
    },
    {
      id: 9,
      name: '109',
      imageUrl: 'assets/images/room9.jpg',
      description: 'This is a meeting room 9'
    },
    {
      id: 10,
      name: '110',
      imageUrl: 'assets/images/room10.jpg',
      description: 'This is a meeting room 10'
    },
    {
      id: 11,
      name: '111',
      imageUrl: 'assets/images/room11.jpg',
      description: 'This is a meeting room 11'
    },
    {
      id: 12,
      name: '112',
      imageUrl: 'assets/images/room12.jpg',
      description: 'This is a meeting room 12'
    }
  ]

  page:number = 1;
  limit:number = 5;
  constructor() {
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'Booking Room', active: true }
    ];

    this.timeSlots = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      '17:00', '17:30', '18:00'
    ];

    this.dateSelected = new Date();
  }
  ngOnInit() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Find the nearest time slot for the current time
    const formattedCurrentTime = `${String(currentHour).padStart(2, '0')}:${currentMinute < 30 ? '00' : '30'}`;
    const currentTimeSlotIndex = this.timeSlots.indexOf(formattedCurrentTime);

    if (currentTimeSlotIndex === -1) {
      // If the current time is not in the timeSlots list, set default to the first slot
      this.timeStartSlotSelected = this.timeSlots[0];
      this.timeEndSlotSelected = this.timeSlots[1];
    } else {
      // Set start time to the current time slot and end time to the next slot
      this.timeStartSlotSelected = this.timeSlots[currentTimeSlotIndex];
      this.timeEndSlotSelected = this.timeSlots[currentTimeSlotIndex + 1] || this.timeSlots[this.timeSlots.length - 1];
    }

    // Initialize the selectable time slot lists
    this.timeStartSlotSelectList = this.timeSlots.slice(0, this.timeSlots.length - 1);
    this.timeEndSlotSelectList = this.timeSlots.slice(1);

    console.log('Start Time:', this.timeStartSlotSelected);
    console.log('End Time:', this.timeEndSlotSelected);

    // Calculate the initial total hours
    this.calculateTotalHours();
  }

  onTimeStartSlotSelectChange(selectedStartTime: string) {
    this.timeStartSlotSelected = selectedStartTime;
    this.timeEndSlotSelectList = this.timeSlots.slice(
      this.timeSlots.indexOf(selectedStartTime) + 1
    ); // Update end time options
    this.calculateTotalHours(); // Recalculate hours
  }


  onTimeEndSlotSelectChange(selectedEndTime: string) {
    this.timeEndSlotSelected = selectedEndTime;
    this.timeStartSlotSelectList = this.timeSlots.slice(
      0,
      this.timeSlots.indexOf(selectedEndTime)
    ); // Update start time options
    this.calculateTotalHours(); // Recalculate hours
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

    console.log('Start Time:', startHour, startMinute);
    console.log('End Time:', endHour, endMinute);
    console.log('Total Hours:', this.totalHours);
  }

  onSubmit() {
    console.log('Submit');
  }

  onDateSelectChange(date: any) {
    // this.dateSelected = date;

    console.log('Date:', date);

  }
  changePage() {
    console.log('Page changed');
  }
}
