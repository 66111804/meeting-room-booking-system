import {AfterViewInit, ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BreadcrumbsComponent} from '../../../shared/breadcrumbs/breadcrumbs.component';
import {TranslatePipe} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {FlatpickrDefaultsInterface, FlatpickrDirective} from 'angularx-flatpickr';
import {MeetingRoom, RoomMeetingService} from '../../../core/services/room-meeting.service';
import {DatePipe} from '@angular/common';
import {GlobalComponent} from '../../../global-component';
import {ITimeSlot} from '../room.module';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    TranslatePipe,
    FormsModule,
    FlatpickrDirective,
    DatePipe
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class RoomComponent implements OnInit, AfterViewInit
{
  roomId: number = 0;
  breadCrumbItems!: Array<{}>;

  searchTerm: string = '';
  dateSelected!:Date;
  datePickerOptions: FlatpickrDefaultsInterface = {
    minDate: new Date(),
    maxDate: this.getMaxDate(),
    dateFormat: 'Y-m-d',
  };

  roomInfo!: MeetingRoom;
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

  timeStartSlotSelected = '08:00';
  timeStartSlotSelectList = this.timeSlots.slice(0, this.timeSlots.length - 1);
  timeEndSlotSelected = '23:30';
  timeEndSlotSelectList = this.timeSlots.slice(1);
  totalHours = 0;
  constructor(private route: ActivatedRoute,
              private roomMeetingService:RoomMeetingService,
              private cdr: ChangeDetectorRef) {
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'Booking Room'},
      { label: 'Room'},
      { label: 'Detail', active: true }
    ];
  }


  ngOnInit() {
    this.roomId = Number(this.route.snapshot.paramMap.get('id'));
    this.dateSelected = new Date();
    // get query params from URL date
    const date = this.route.snapshot.queryParamMap.get('date');
    if(date){
      this.dateSelected = new Date(date);
    }else{
      this.dateSelected = new Date();
    }

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
    console.log('Room ID:', this.roomId);
  }

  searchInput() {
    console.log('Search Term:', this.searchTerm);
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
  private getMaxDate(): Date {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 3);
    return currentDate;
  }
  onDateSelectChange(date: any)
  {
    console.log('Date Selected:', date);
  }

  protected readonly GlobalComponent = GlobalComponent;

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
}
