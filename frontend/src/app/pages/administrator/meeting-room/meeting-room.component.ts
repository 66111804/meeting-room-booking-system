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
  IRoomForm,
  RoomMeetingService,
  Feature
} from '../../../core/services/room-meeting.service';
import {GlobalComponent} from '../../../global-component';
import Swal from 'sweetalert2';
import {MatRadioModule} from '@angular/material/radio';
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
    MatRadioModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './meeting-room.component.html',
  styleUrl: './meeting-room.component.scss'
})
export class MeetingRoomComponent implements OnInit
{
  public editorData:string = '';
  breadCrumbItems!: Array<{}>;
  searchTerm: string = '';
  page = 1;
  pageSize = 10;
  isFeatures!: boolean;
  description: string = '';
  serverUrl = GlobalComponent.SERVE_URL;
  features: RoomFeaturesResponse;

  roomFormControls:IRoomForm = {
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
  constructor(private modalService: NgbModal,
              private roomFeaturesService:RoomFeaturesService,
              private roomMeetingService:RoomMeetingService
  ) {
    this.breadCrumbItems = [
      { label: 'Administrator' },
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

  /**
   * Form data change
   */
  timeOut: any;
  roomFormNameChange() {
    if(this.timeOut){
      clearTimeout(this.timeOut);
    }

    this.timeOut = setTimeout(() => {
      if(this.roomFormControls.name.data.length > 0){
        this.featureValidateName(this.roomFormControls.name.data);
      }else {
        this.roomFormControls.name.valid = false;
        this.roomFormError = false;
      }
    }, 500);
  }

  featureValidateName(name: string){
    const id = this.meetingRoomEdit ? this.meetingRoomEdit.id : 0;
    this.roomMeetingService.validateName(name,id).subscribe({
      next: (response) => {
        this.roomFormControls.name.valid = response.valid;
        this.roomFormError = response.valid;

        const roomNameErrorDiv = document.getElementById('roomNameError');
        if (roomNameErrorDiv) {
          if (this.roomFormControls.name.valid) {
            roomNameErrorDiv.innerHTML = "ชื่อห้องประชุมซ้ำ";
          }
        }
      },
      error: (error) => {
        console.log(error);
        this.roomFormError = true;
      }
    });
  }

  /**
   * Feature change
   */
  featureChange(event: any, feature: Feature) {
    const status = event.target.checked;
    const featureId = event.target.value;
    if(status){
      // add feature to array
      const data = {
        id: feature.id,
        name: feature.name,
        quantity: feature.quantity
      }
      this.roomFormControls.features.data.push(data);
    }else {
      // remove feature from array
      this.roomFormControls.features.data = this.roomFormControls.features.data.filter((id:Feature) => id.id !== featureId);
    }

    console.log(this.roomFormControls.features);
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
        // this.roomFormControls.features.data = room.roomHasFeatures.map((feature) => feature.featureId);
        this.roomFormControls.features.data = room.roomHasFeatures.map((feature) => {
          return {
            id: feature.featureId,
            name: feature.feature.name,
            quantity: feature.quantity
          }
        });
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
    this.roomFormControls.status.data = event.target.value == 'active'? 'inactive' : 'active';
  }

  // onEditorChange(event: any){
  //   const editorData = event.editor.getData();
  //   this.roomFormControls.description.data = editorData;
  // }


  /**
   * Increase quantity
   * @param feature
   */
  increaseQuantity(feature: Feature)
  {
    // Quantity++
    feature.quantity ++;
    if(feature.quantity >= 100) {
      feature.quantity = 1;
    }
    // add this.roomFormControls.features
    const findIndex = this.roomFormControls.features.data.findIndex((item: Feature) => item.id === feature.id);
    if(findIndex !== -1){
      this.roomFormControls.features.data[findIndex].quantity = feature.quantity;
    }
    console.log(this.roomFormControls.features)
  }
  /**
   * Decrease quantity
   * @param feature
   */
  decreaseQuantity(feature: Feature)
  {
    // Quantity--
    feature.quantity --;
    if(feature.quantity <= 0) {
      feature.quantity = 100;
    }
    // add this.roomFormControls.features
    const findIndex = this.roomFormControls.features.data.findIndex((item: Feature) => item.id === feature.id);
    if(findIndex !== -1){
      this.roomFormControls.features.data[findIndex].quantity = feature.quantity;
    }
    console.log(this.roomFormControls.features)
  }
}
