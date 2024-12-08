import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {BreadcrumbsComponent} from "../../../shared/breadcrumbs/breadcrumbs.component";
import {NgbModal, NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {TranslatePipe} from "@ngx-translate/core";
import {FeaturesComponent} from './features/features.component';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {CKEditorModule} from '@ckeditor/ckeditor5-angular';
import {CommonModule} from '@angular/common';
import {RoomFeaturesResponse, RoomFeaturesService} from '../../../core/services/room-features.service';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';
import {
  MeetingRoom,
  MeetingRoomResponse,
  RoomForm,
  RoomMeetingService
} from '../../../core/services/room-meeting.service';



@Component({
  selector: 'app-meeting-room',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbsComponent,
    NgbPagination,
    ReactiveFormsModule,
    TranslatePipe,
    FormsModule,
    FeaturesComponent,
    CKEditorModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
  description: string = '';

  public Editor = ClassicEditor;
  features: RoomFeaturesResponse;

  roomFormControls:RoomForm = {
    name: {data: '', valid: false},
    capacity: {data: '', valid: false},
    description: {data: '', valid: false},
    features: {data: [], valid: false},
    image: {data: '', valid: false}
  };

  meetingRooms: MeetingRoomResponse = {
    meetingRooms: [],
    total: 0,
    totalPages: 0,
    current: 0
  }

  roomFormError!: boolean;
  nameSubject: Subject<string> = new Subject<string>();

  constructor(private modalService: NgbModal, private roomFeaturesService:RoomFeaturesService, private roomMeetingService:RoomMeetingService) {
    this.breadCrumbItems = [
      { label: 'Meeting Room' },
      { label: 'Meeting Room', active: true },
    ];
    this.isFeatures = false;
    this.features = {
      features: [],
      total: 0,
      totalPages: 0,
      current: 0
    }
  }



  ngOnInit() {
    document.getElementById('elmLoader')?.classList.add('d-none');

    this.nameSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((value) => {
      console.log(value);
      if(value.length > 0)
      {
        this.roomMeetingService.validateName(value).subscribe({
        next: (response) => {
            this.roomFormControls.name.valid = response.valid;
            this.roomFormError = response.valid;
          },
          error: (error) => {
            console.log(error);
            this.roomFormError = true;
          }
        });
      }else{

      }
    });

    this.fetchMeetingRooms();
  }

  checkFormErrors(){
    this.roomFormError = false;
    if(this.roomFormControls.name.data.length === 0){
      this.roomFormControls.name.valid = true;
      this.roomFormError = true;
    }else{
      this.roomFormControls.name.valid = false;
    }

    if(this.roomFormControls.capacity.data.length === 0){
      this.roomFormControls.capacity.valid = true;
      this.roomFormError = true;
    }else{
      this.roomFormControls.capacity.valid = false;
    }

    if(this.roomFormControls.description.data.length === 0){
      this.roomFormControls.description.valid = true;
      this.roomFormError = true;
    }else{
      this.roomFormControls.description.valid = false;
    }
  }

  fetchMeetingRooms() {
    this.roomMeetingService.getAll(this.page, this.pageSize, this.searchTerm).subscribe({
      next: (response) => {
        this.meetingRooms = response;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }


  fetchFeatures(){
    this.roomFeaturesService.getAll(1,50).subscribe({
      next: (response) => {
        this.features = response;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  changePage() {
    this.fetchMeetingRooms();
  }

  showFeatures(){
    this.isFeatures = !this.isFeatures
  }


  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.fetchFeatures();
    this.roomFormControls.name.data = '';
    this.roomFormControls.capacity.data = '';
    this.roomFormControls.description.data = '';
    this.roomFormControls.features.data = [];
    this.roomFormControls.image.data = '';

    this.modalService.open(content, { size: 'lg', centered: true });
  }

  imageURL: string | undefined;
  fileChange(event: any){
    let files: any = (event.target as HTMLInputElement)
    if (files.files.length > 0) {
      let file: File = files.files[0];
      this.roomMeetingService.imageFile = file;

      let reader: FileReader = new FileReader();
      reader.onloadend = (e) => {
        this.imageURL = reader.result?.toString();
        if(this.imageURL){
          document.getElementById('imagePreview')?.setAttribute('src', this.imageURL);
        }else{
          document.getElementById('imagePreview')?.setAttribute('src', 'assets/images/dummy-image-square.jpg');
        }
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Form data get
   */

  formSubmitCreate() {
    console.log('Create form submit');
    console.log(this.roomFormControls);
    this.checkFormErrors();
    if(!this.roomFormError){
      this.roomMeetingService.updateRoom(this.roomFormControls).subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (error) => {
          console.log(error);
        }
      });
    }
  }

  roomFormChange() {
    console.log('Form change');
    if(this.roomFormControls.name.data.length > 0){
      this.nameSubject.next(this.roomFormControls.name.data);
    }
  }

  /**
   * Feature change
   */
  featureChange(event: any) {
    const status = event.target.checked;
    const featureId = event.target.value;
    if(status){
      this.roomFormControls.features.data.push(featureId);
    }else {
      this.roomFormControls.features.data = this.roomFormControls.features.data.filter((id) => id !== featureId);
    }
    //
    // console.log(status, featureId);
    // console.log(this.roomFormControls);

  }

  edit(editMeetingRoom: any, room: any) {

  }

  meetingRoomDelete: MeetingRoom | undefined;
  confirm(content: any, room: MeetingRoom) {
    this.meetingRoomDelete = room;
    this.modalService.open(content, { centered: true });
  }

  deleteRoom(modal: any) {
    console.log('Delete room');
    modal.close('Close click');
    const triggerButton = document.getElementById('triggerButton');
    if (triggerButton) {
      triggerButton.focus();
    }

    console.log(this.meetingRoomDelete);
    if(this.meetingRoomDelete){
      this.roomMeetingService.deleteRoom(this.meetingRoomDelete.id).subscribe({
        next: (response) => {
          console.log(response);
          this.fetchMeetingRooms();
        },
        error: (error) => {
          console.log(error);
        }
      });
    }
  }
}
