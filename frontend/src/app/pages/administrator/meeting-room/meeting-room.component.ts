import {Component, OnInit} from '@angular/core';
import {BreadcrumbsComponent} from "../../../shared/breadcrumbs/breadcrumbs.component";
import {NgbModal, NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslatePipe} from "@ngx-translate/core";
import {FeaturesComponent} from './features/features.component';

@Component({
  selector: 'app-meeting-room',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    NgbPagination,
    ReactiveFormsModule,
    TranslatePipe,
    FormsModule,
    FeaturesComponent
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
  isFeatures!: boolean;

  constructor(private modalService: NgbModal) {
    this.breadCrumbItems = [
      { label: 'Meeting Room' },
      { label: 'Meeting Room', active: true },
    ];
    this.isFeatures = true;
  }

  ngOnInit() {
    document.getElementById('elmLoader')?.classList.add('d-none');
  }
  addUser() {}

  searchUser(){}

  onSort(name: string) {}

  changePage() {}

  showFeatures(){
    this.isFeatures = !this.isFeatures
  }


  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
  }

}
