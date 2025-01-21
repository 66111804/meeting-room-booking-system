import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GlobalComponent} from '../../global-component';
import {ValidateResponse} from '../../shared/utils/date-utils';


export interface RoomForm {
  name: {
    data: string,
    valid: boolean
  };
  capacity: {
    data: string,
    valid: boolean
  };
  description: {
    data: string,
    valid: boolean
  };
  status: {
    data: string,
    valid: boolean
  };
  features: {
    data: any[],
    valid: boolean
  };
  image: {
    data: string | ArrayBuffer | null,
    valid: boolean
  };
}

export interface MeetingRoomResponse {
  meetingRooms: MeetingRoom[]
  total: number
  totalPages: number
  current: number
}

export interface MeetingRoom {
  id: number
  name: string
  description: string
  capacity?: number
  imageUrl?: string
  status: string
  createdAt: string
  updatedAt: string
  roomHasFeatures: RoomHasFeature[]
}

export interface RoomHasFeature {
  id: number
  meetingRoomId: number
  featureId: number
  createdAt: string
  updatedAt: string
  feature: Feature
}

export interface Feature {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}


@Injectable({
  providedIn: 'root'
})

export class RoomMeetingService {

  constructor(private http: HttpClient) { }

  imageFile: File | null = null;

  /**
   * Validate meeting room name
   * @param name
   * @param id
   */
  validateName(name: string, id: number = 0) {
    if (id > 0) {
      return this.http.get<ValidateResponse>(`${GlobalComponent.API_URL}/admin/meeting-room/${id}/validate?name=${name}`);
    }
    return this.http.get<ValidateResponse>(`${GlobalComponent.API_URL}/admin/meeting-room-validate?name=${name}`);
  }


  /**
   * Get meeting room by id
   * @param id
   */
  getRoomById(id: number) {
    return this.http.get<MeetingRoom>(`${GlobalComponent.API_URL}/admin/meeting-room/${id}`);
  }


  /**
   * Create or update meeting room
   * @param datForm
   * @param id
   */
  updateRoom(datForm: RoomForm,id:number = 0) {
    let formData = new FormData();
    formData.append('name', datForm.name.data);
    formData.append('capacity',  datForm.capacity.data);
    formData.append('description',  datForm.description.data);
    formData.append('status',  datForm.status.data);
    if(this.imageFile !== null){
      formData.append('image', this.imageFile);
    }

    datForm.features.data.forEach((feature) => {
      formData.append('features[]', feature);
    });

    if (id > 0) {
      return this.http.put(`${GlobalComponent.API_URL}/admin/meeting-room/${id}/update`, formData);
    }
    return this.http.post(`${GlobalComponent.API_URL}/admin/meeting-room-create`, formData);
  }

  /**
   * Get all meeting rooms
   */
  getAll(page = 1, size = 10, searchTerm = '') {
    return this.http.get<MeetingRoomResponse>(`${GlobalComponent.API_URL}/admin/meeting-rooms?page=${page}&limit=${size}&search=${searchTerm}`)
  }

  /**
   * Get meeting room by id
   * @param id
   */
  deleteRoom(id: number) {
    return this.http.delete(`${GlobalComponent.API_URL}/admin/meeting-room/${id}/delete`);
  }


  // ----------------- Meeting Room Booking (booking-room)-----------------
  /**
   * Get all meeting room booking
   */
  getAllBooking(page = 1, size = 10, searchTerm = '') {
    return this.http.get<MeetingRoomResponse>(`${GlobalComponent.API_URL}/booking-room?page=${page}&limit=${size}&search=${searchTerm}`)
  }

}
