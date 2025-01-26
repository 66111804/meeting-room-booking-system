// noinspection DuplicatedCode

import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {BookingRoomService} from '../../../core/services/booking-room.service';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute} from '@angular/router';
import {BreadcrumbsComponent} from '../../../shared/breadcrumbs/breadcrumbs.component';
import {DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {GlobalComponent} from '../../../global-component';
import {MeetingRoom, RoomHasFeature, RoomMeetingService} from '../../../core/services/room-meeting.service';
import {IBookingRoom} from '../../booking-room/room.module';
import Swal from 'sweetalert2';
import {ITimeSlotResponse, SlotTimeService, TimeSlot} from '../../../core/services/slot-time.service';
import {TokenStorageService} from '../../../core/services/token-storage.service';
import {IBookingInfo} from './edit-booking.module';
import {RoomComponent} from '../../booking-room/room/room.component';

@Component({
  selector: 'app-edit-booking',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    FormsModule,
    RoomComponent
  ],
  templateUrl: './edit-booking.component.html',
  styleUrl: './edit-booking.component.scss'
})
export class EditBookingComponent implements OnInit
{
  breadCrumbItems!: Array<{}>;
  bookingId: number = 0;
  constructor(private route: ActivatedRoute,
              private roomMeetingService:RoomMeetingService,
              private cdr: ChangeDetectorRef,
              private slotTimeService:SlotTimeService,
              private tokenStorageService:TokenStorageService,
              private bookingRoomService:BookingRoomService,
              private toastr: ToastrService
  )
  {
    // Breadcrumb items
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'My Booking'},
      { label: 'Edit Booking', active: true }
    ];
    this.fetchBookingInfo();

  }
  bookingInfo: IBookingInfo | null = null;
  ngOnInit() {

  }

  fetchBookingInfo() {
    const bookingId = this.route.snapshot.paramMap.get('id');
    if (bookingId === null) {
      return;
    }
    this.bookingId = Number(bookingId);
    this.bookingRoomService.getBookingInfo(this.bookingId).subscribe({
      next: (data) => {
        // console.log(data);
        this.bookingInfo = data.booking;
        this.isShowEditForm = true;
      },
      error: (error) => {
        console.log(error);
        this.toastr.error('Error while fetching booking info');
      }
    });
  }
  isShowEditForm = false;
  ngAfterViewInit() {

    this.cdr.detectChanges();
  }

}
