import {Component, OnInit} from '@angular/core';
import {BreadcrumbsComponent} from "../../../shared/breadcrumbs/breadcrumbs.component";
import {NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-meeting-room',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    NgbPagination,
    ReactiveFormsModule,
    TranslatePipe,
    FormsModule
  ],
  templateUrl: './meeting-room.component.html',
  styleUrl: './meeting-room.component.scss'
})
export class MeetingRoomComponent implements OnInit
{
  breadCrumbItems!: Array<{}>;
  searchTerm: string = '';
  page = 1;
  pageSize = 10;
  constructor() {
    this.breadCrumbItems = [
      { label: 'Meeting Room' },
      { label: 'Meeting Room', active: true },
    ];
  }

  ngOnInit() {
    document.getElementById('elmLoader')?.classList.add('d-none');
  }
  addUser() {}

  searchUser(){}

  onSort(name: string) {}

  changePage() {}
}
