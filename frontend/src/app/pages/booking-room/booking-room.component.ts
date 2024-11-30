import {ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit,} from '@angular/core';
import {BreadcrumbsComponent} from '../../shared/breadcrumbs/breadcrumbs.component';
import {TranslatePipe} from '@ngx-translate/core';
import {NgForOf} from '@angular/common';
import {FlatpickrDirective} from 'angularx-flatpickr';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-booking-room',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    TranslatePipe,
    FlatpickrDirective,
    NgForOf,
    FormsModule,
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

  roomData = []

  timeStartSlotSelected = '08:00';
  timeStartSlotSelectList = this.timeSlots.slice(0, this.timeSlots.length - 1);
  timeEndSlotSelected = '23:30';
  timeEndSlotSelectList = this.timeSlots.slice(1);
  totalHours = 0;

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
}
