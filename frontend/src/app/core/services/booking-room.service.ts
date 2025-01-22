import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GlobalComponent} from '../../global-component';
import {
  IBookingRoom,
  IBookingRoomValidation,
  IMyBookingsResponse,
  ITimeSlot
} from '../../pages/booking-room/room.module';

@Injectable({
  providedIn: 'root'
})
export class BookingRoomService {

  constructor(private http: HttpClient) { }

  getTimeSlot(id: number, date: string) {
    return this.http.get<ITimeSlot[]>(`${GlobalComponent.API_URL}/booking-room/list-time-slot/${id}?date=${date}`);
  }

  createBookingRoom(data: IBookingRoom) {
    return this.http.post(`${GlobalComponent.API_URL}/booking-room/create`, data);
  }

  updateBooking(id: number, data: IBookingRoom) {
    return this.http.put(`${GlobalComponent.API_URL}/booking-room/update/${id}`, data);
  }

  deleteBooking(id: number) {
    return this.http.delete(`${GlobalComponent.API_URL}/booking-room/delete/${id}`);
  }

  listBooking() {
    return this.http.get<IBookingRoom[]>(`${GlobalComponent.API_URL}/booking-room`);
  }

  validateBooking(data: IBookingRoomValidation) {
    return this.http.get(`${GlobalComponent.API_URL}/booking-room/validate`);
  }

  // ---------- My Booking ------------
  listMyBooking(page = 1, size = 10,searchTerm = '') {
    return this.http.get<IMyBookingsResponse>(`${GlobalComponent.API_URL}/booking-room/my-booking?page=${page}&size=${size}&searchTerm=${searchTerm}`);
  }

  cancelBooking(id: number) {
     // /api/booking-room/my-booking/:id/cancel
    return this.http.delete(`${GlobalComponent.API_URL}/booking-room/my-booking/${id}/cancel`);
  }
}
