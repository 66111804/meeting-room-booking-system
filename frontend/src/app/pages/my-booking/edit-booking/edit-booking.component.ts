import {Component, OnInit} from '@angular/core';
import {BookingRoomService} from '../../../core/services/booking-room.service';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute} from '@angular/router';
import {BreadcrumbsComponent} from '../../../shared/breadcrumbs/breadcrumbs.component';
import {DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {GlobalComponent} from '../../../global-component';

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
}
