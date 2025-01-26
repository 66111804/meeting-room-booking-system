import {Component, OnInit} from '@angular/core';
import {BookingRoomService} from '../../../core/services/booking-room.service';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute} from '@angular/router';
import {BreadcrumbsComponent} from '../../../shared/breadcrumbs/breadcrumbs.component';
import {DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {GlobalComponent} from '../../../global-component';
import {MeetingRoom} from '../../../core/services/room-meeting.service';
import {IBookingRoom} from '../../booking-room/room.module';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-booking',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    DatePipe,
    FormsModule
  ],
  templateUrl: './edit-booking.component.html',
  styleUrl: './edit-booking.component.scss'
})
export class EditBookingComponent implements OnInit
{
  breadCrumbItems!: Array<{}>;

  bookingId: number;
  roomInfo: any;
  roomId: number;
  constructor(private bookingRoomService: BookingRoomService,
              private toastr: ToastrService,
              private route: ActivatedRoute) {

    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'My Booking'},
      { label: 'Edit Booking', active: true }
    ];

    // Get booking id from url
    this.bookingId = Number(this.route.snapshot.paramMap.get('id'))
    this.roomId = 0;
  }

  ngOnInit() {
    console.log(this.bookingId);
    this.fetchBookingInfo();
  }

  fetchBookingInfo() {
    this.bookingRoomService.getBookingInfo(this.bookingId).subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (error) => {
        console.log(error);
      }
    });

  }

  protected readonly GlobalComponent = GlobalComponent;



  fetchRoomInfo() {
    // this.roomMeetingService.getRoomById(this.roomId).subscribe(
    //   {
    //     next: (room: MeetingRoom) => {
    //       this.roomInfo = room;
    //     },
    //     error: (error: any) => {
    //       console.error('Error:', error);
    //     }
    //   });

  }
  ngAfterViewInit() {
  }
  calculateTotalHours() {
    // const startTime = this.timeStartSlotSelected.split(':');
    // const endTime = this.timeEndSlotSelected.split(':');
    // const startHour = parseInt(startTime[0], 10);
    // const startMinute = parseInt(startTime[1], 10); // Fix: Use base 10
    // const endHour = parseInt(endTime[0], 10);
    // const endMinute = parseInt(endTime[1], 10); // Fix: Use base 10
    // const totalHours = endHour - startHour;
    // const totalMinutes = endMinute - startMinute;
    // this.totalHours = totalHours + totalMinutes / 60;
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
    // this.dateSelected = new Date(date.dateString);
    // this.fetchTimeSlot();
  }

  onTimeStartSlotSelectChange(selectedStartTime: string) {
    // this.timeStartSlotSelected = selectedStartTime;
    //
    // this.timeEndSlotSelectList = this.timeSlots.slice(
    //   this.timeSlots.findIndex((slot) => slot.endTime === this.timeStartSlotSelected) + 1,
    //   this.timeSlots.length
    // ); // Update end time options
    //
    // // validate time slot
    // this.calculateTotalHours(); // Recalculate hours
    // this.cdr.detectChanges();
    //
    // this.formBookingData.startTime = this.timeStartSlotSelected;
  }

  onTimeEndSlotSelectChange(selectedEndTime: string) {
    // this.timeEndSlotSelected = selectedEndTime;
    // this.timeStartSlotSelectList = this.timeSlots.slice(
    //   0,
    //   this.timeSlots.findIndex((slot) => slot.startTime === this.timeEndSlotSelected)
    // ); // Update start time options
    // // validate time slot
    // this.calculateTotalHours(); // Recalculate hours
    // this.cdr.detectChanges();
    //
    // this.formBookingData.endTime = this.timeEndSlotSelected;
  }

  fetchTimeSlot() {
    // YYYY-MM-DD
    // const date = this.dateSelected.toISOString().split('T')[0];
    // this.slotTimeService.getTimeSlot(date, this.roomId).subscribe({
    //   next: (response) => {
    //     this.timeSlotsAvailable = response;
    //     this.timeSlots = []; // Clear time slots
    //     this.timeSlots.push(...response.timeSlots);
    //
    //     this.onSelectTimeStartChange({target: {value: this.timeStartSlotSelected}});
    //     this.onSelectTimeEndChange({target: {value: this.timeEndSlotSelected}});
    //   },
    //   error: (error) => {
    //     console.error('Error:', error);
    //   }
    // });
  }

  openBookingRoomForm(isVisible: boolean) {
    // this.isFormBookingVisible = isVisible;
    // this.formBookingData.title = '';
    // this.formBookingData.description = '';
  }

  onSelectTimeStartChange($event: any) {
    this.onTimeStartSlotSelectChange($event.target.value);
  }

  onSelectTimeEndChange($event: any) {
    this.onTimeEndSlotSelectChange($event.target.value);
  }

  IsSlotTimeSelectedInRanges(date: string, startTime: string, endTime: string) {
    // const slotDate = new Date(date);
    // const selectedDate = new Date(this.dateSelected);
    //
    // // ถ้าต่างวันกัน return false
    // if (slotDate.toDateString() !== selectedDate.toDateString()) {
    //   return false;
    // }
    //
    // const start = new Date(`${date}T${startTime}`);
    // const end = new Date(`${date}T${endTime}`);
    // const selectedStart = new Date(`${date}T${this.timeStartSlotSelected}`);
    // const selectedEnd = new Date(`${date}T${this.timeEndSlotSelected}`);
    //
    // // เช็คว่า slot ที่เลือกคาบเกี่ยวกับช่วงเวลาที่ต้องการไหม
    // return selectedStart <= end && selectedEnd >= start;
  }

  onSubmitBookingRoom() {
    //
    // const date = new Date(this.dateSelected); // type: Date
    // date.setHours(0, 0, 0, 0);
    // // this.timeStartSlotSelected = 8:00
    // // this.timeEndSlotSelected = 8:30
    // const [startHours, startMinutes] = this.timeStartSlotSelected.split(':').map(Number);
    // const [endHours, endMinutes] = this.timeEndSlotSelected.split(':').map(Number);
    //
    // const startTime = new Date(date);
    // startTime.setHours(startHours, startMinutes, 0, 0);
    //
    // const endTime = new Date(date);
    // endTime.setHours(endHours, endMinutes, 0, 0);
    //
    // const formData:IBookingRoom = this.formBookingData;
    // formData.startTime = startTime.toISOString();
    // formData.endTime = endTime.toISOString();
    //
    // // option toasts position center display
    //
    // // Validate form title and description
    // if (!formData.title || !formData.description) {
    //   this.toastr.error('กรุณากรอกข้อมูลให้ครบถ้วน', 'Error');
    //   Swal.fire({
    //     title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
    //     icon: 'error',
    //     confirmButtonText: 'ปิด'
    //   });
    //   return;
    // }



    // this.bookingRoomService.createBookingRoom(formData).subscribe({
    //   next: (response) => {
    //     this.toastr.success('การจองห้องสำเร็จ', 'Success');
    //     this.openBookingRoomForm(false);
    //     this.fetchTimeSlot();
    //     Swal.fire({
    //       title: 'การจองห้องสำเร็จ',
    //       icon: 'success',
    //       confirmButtonText: 'ปิด',
    //       timer: 2000
    //     });
    //   },
    //   error: (error) => {
    //     console.error('Error:', error);
    //     this.toastr.error('การจองห้องไม่สำเร็จ กรุณาตรวจสอบข้อมูล', 'Error');
    //     Swal.fire({
    //       title: 'การจองห้องไม่สำเร็จ กรุณาตรวจสอบข้อมูล',
    //       icon: 'error',
    //       confirmButtonText: 'ปิด'
    //     });
    //   } // Fix: Add error handling
    // });
  }


}
