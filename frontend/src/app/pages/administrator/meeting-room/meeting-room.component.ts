import {Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, OnInit} from '@angular/core';
import {BreadcrumbsComponent} from "../../../shared/breadcrumbs/breadcrumbs.component";
import {NgbModal, NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslatePipe} from "@ngx-translate/core";
import {FeaturesComponent} from './features/features.component';
import {CommonModule} from '@angular/common';
import {RoomFeaturesResponse, RoomFeaturesService} from '../../../core/services/room-features.service';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';


import {
  MeetingRoom,
  MeetingRoomResponse,
  RoomForm,
  RoomMeetingService
} from '../../../core/services/room-meeting.service';
import {GlobalComponent} from '../../../global-component';
import Swal from 'sweetalert2';
import {MatRadioModule} from '@angular/material/radio';

import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';


import {CKEditorModule} from '@ckeditor/ckeditor5-angular';
import {Code} from 'angular-feather/icons';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';

@Component({
  selector: 'app-meeting-room',
  standalone: true,
  imports: [
    CommonModule,
    CKEditorModule,
    BreadcrumbsComponent,
    NgbPagination,
    ReactiveFormsModule,
    TranslatePipe,
    FormsModule,
    FeaturesComponent,
    MatRadioModule,
    CKEditorModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './meeting-room.component.html',
  styleUrl: './meeting-room.component.scss'
})
export class MeetingRoomComponent implements OnInit
{
  public Editor = ClassicEditor;
  public editorData:string = '';
  // config + image
  public editorConfig = {
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        'link',
        '|',
        'bulletedList',
        'numberedList',
        '|',
        'insertTable',
        '|',
        'undo',
        'redo'
      ],
      shouldNotGroupWhenFull: true
    }
  };

  breadCrumbItems!: Array<{}>;
  searchTerm: string = '';
  page = 1;
  pageSize = 10;
  isFeatures!: boolean;
  description: string = '';
  serverUrl = GlobalComponent.SERVE_URL;
  features: RoomFeaturesResponse;

  roomFormControls:RoomForm = {
    name: {data: '', valid: false},
    capacity: {data: '', valid: false},
    description: {data: '', valid: false},
    status: {data: 'active', valid: false},
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
  searchSubject: Subject<string> = new Subject<string>();
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
    this.editorData = '';

    // this.Editor = ClassicEditor;
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

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((value) => {
      this.page = 1;
      this.fetchMeetingRooms();
    });
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

  searchInput(){
    this.searchSubject.next(this.searchTerm);
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
    this.meetingRoomEdit = undefined;
    this.isFeatures = false;
    this.imagePreviewSrc = 'assets/images/dummy-image-square.jpg';
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
    this.checkFormErrors();

    if(!this.roomFormError){
      if(this.meetingRoomEdit){
        this.roomMeetingService.updateRoom(this.roomFormControls,this.meetingRoomEdit.id).subscribe({
          next: (response) => {
            this.fetchMeetingRooms();
          },
          error: (error) => {
            console.log(error);
          }
        });
      }else {
        this.roomMeetingService.updateRoom(this.roomFormControls).subscribe({
          next: (response) => {
            // console.log(response);
            this.fetchMeetingRooms();
          },
          error: (error) => {
            console.log(error);
          }
        });
      }
    }else{
      Swal.fire({
        title: 'Error!',
        text: 'Please fill all required fields',
        icon: 'error',
        confirmButtonText: 'Ok'
      }).then();
    }
    this.modalService.dismissAll();
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
  }
  meetingRoomEdit: MeetingRoom | undefined;
  imagePreviewSrc: string = 'assets/images/dummy-image-square.jpg';
  edit(editMeetingRoom: any, room: MeetingRoom) {
    this.meetingRoomEdit = room;
    this.isFeatures = false;
    if(this.meetingRoomEdit.imageUrl){
      this.imagePreviewSrc = `${this.serverUrl}/files/uploads/${room.imageUrl}`;
    }else{
      this.imagePreviewSrc = 'assets/images/dummy-image-square.jpg';
    }

    this.roomFormControls.name.data = room.name;
    this.roomFormControls.capacity.data = room.capacity ? room.capacity.toString() : '';
    this.roomFormControls.description.data = room.description;
    this.roomFormControls.status.data = room.status;
    this.roomFeaturesService.getFeatureWithRoom(1,50,'',room.id).subscribe({
      next: (response) => {
        this.features = response;
        this.roomFormControls.features.data = room.roomHasFeatures.map((feature) => feature.featureId);
      },
      error: (error) => {
        console.log(error);
      }
    });

    this.editorData = room.description;
    this.modalService.open(editMeetingRoom, { size: 'lg', centered: true });
  }

  meetingRoomDelete: MeetingRoom | undefined;
  confirm(content: any, room: MeetingRoom) {
    this.meetingRoomDelete = room;
    this.modalService.open(content, { centered: true });
  }

  deleteRoom(modal: any) {
    modal.close('Close click');
    const triggerButton = document.getElementById('triggerButton');
    if (triggerButton) {
      triggerButton.focus();
    }

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

  meetingRoomInformation: MeetingRoom | undefined;
  showInformation(room: MeetingRoom) {
    this.isFeatures = false;
   this.meetingRoomInformation = room;
  }

  showImage(content:any) {
    this.modalService.open(content, { size: 'lg', centered: true ,fullscreen: true});
  }

  statusChange(event: any) {
    this.roomFormControls.status.data = event.value;
  }

  onEditorChange(event: any){
    const editorData = event.editor.getData();
    // console.log('Editor data:', editorData);
    this.roomFormControls.description.data = editorData;
    // console.log(this.editorData);
  }
}
