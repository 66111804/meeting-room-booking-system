import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BreadcrumbsComponent} from '../../../shared/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    BreadcrumbsComponent
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class RoomComponent implements OnInit {
  roomId: number = 0;
  breadCrumbItems!: Array<{}>;
  constructor(private route: ActivatedRoute) {
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'Booking Room'},
      { label: 'Room', active: true }
    ];

  }

  ngOnInit() {
    this.roomId = Number(this.route.snapshot.paramMap.get('id'));


  }
}
