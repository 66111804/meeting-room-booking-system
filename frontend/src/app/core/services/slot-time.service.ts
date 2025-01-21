import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GlobalComponent} from '../../global-component';
export interface ITimeSlotResponse {
  date: string
  timeSlots: TimeSlot[]
  totalSlots: number
  availableSlots: number
  bookedSlots: number
}

export interface TimeSlot {
  id: number
  startTime: string
  endTime: string
  isAvailable: boolean
  bookings: any[]
}

export interface Slot{
  startTime: string
  endTime: string
}
@Injectable({
  providedIn: 'root'
})
export class SlotTimeService {

  constructor(private http: HttpClient) { }

    getTimeSlot(date: string,id: number = 0) {
    let url = `${GlobalComponent.API_URL}/slot-time/available-slots?date=${date}`;
    if (id > 0) {
      url += `&meetingRoomId=${id}`;
    }
    return this.http.get<ITimeSlotResponse>(url);
  }

  storeSlotTimeTemp(slotTime:Slot) {
      localStorage.setItem('slotTime',JSON.stringify(slotTime));
  }

  getSlotTimeTemp():Slot | null
  {
  const slotTime = localStorage.getItem('slotTime');
    if (slotTime) {
      return JSON.parse(slotTime);
    }
    return null;
  }
}
