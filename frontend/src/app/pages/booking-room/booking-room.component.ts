import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
} from '@angular/core';
import {BreadcrumbsComponent} from '../../shared/breadcrumbs/breadcrumbs.component';
import {TranslatePipe} from '@ngx-translate/core';
import {NgClass} from '@angular/common';
import {RouterLink} from '@angular/router';
import {FlatpickrDirective} from 'angularx-flatpickr';


@Component({
  selector: 'app-booking-room',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    TranslatePipe,
    NgClass,
    RouterLink,
    FlatpickrDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './booking-room.component.html',
  styleUrl: './booking-room.component.scss',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class BookingRoomComponent implements OnInit
{
  breadCrumbItems!: Array<{}>;
  flatpickrOptions: any = {
    enableTime: true,
    noCalendar: true,
    time24hr: true,
    dateFormat: 'H:i',
  };
  constructor() {
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'Booking Room', active: true }
    ];


  }


  ngOnInit() {
  }
}
