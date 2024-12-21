import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GlobalComponent} from '../../global-component';
import {IBookingRoom, ITimeSlot} from '../../pages/booking-room/room.module';

@Injectable({
  providedIn: 'root'
})
export class BookingRoomService {

  constructor(private http: HttpClient) { }

  getTimeSlot(id: number, date: string) {
    return this.http.get<ITimeSlot[]>(`${GlobalComponent.API_URL}/booking-room/list-time-slot/${id}?date=${date}`);
  }

  createBooking(data: IBookingRoom) {
    return this.http.post(`${GlobalComponent.API_URL}/booking-room/create`, data);
  }
}
