import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GlobalComponent} from '../../global-component';

// ------------- Top Booking -------------
export interface ITopBooking {
  booking: ITopBookingData[]
  total: number
  totalPages: number
  current: number
}

export interface ITopBookingData {
  roomId: number
  name: string
  description: string
  capacity: number
  imageUrl: string
  totalBookings: number
}

// ------------- Top Department Booking -------------
export interface ITopDepartmentBooking {
  data: ITopDepartmentBookingData[]
  total: number
  totalPages: number
  current: number
}

export interface ITopDepartmentBookingData {
  department: string
  totalBookings: number
}

// ------------- Hourly Booking -------------
export interface IHourlyBooking {
  data: IHourlyBookingData[]
  total: number
  totalPages: number
  current: number
}

export interface IHourlyBookingData {
  hour: string
  totalBookings: number
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: HttpClient) { }

  getTopBooks(searchTerm: string, page: number, pageSize: number,startDate: string, endDate: string,sort: string = 'desc', roomName:string = '') {
    let URL = `${GlobalComponent.API_URL}/admin/report/top-booking?page=${page}&limit=${pageSize}&search=${searchTerm}&startDate=${startDate}&endDate=${endDate}&sort=${sort}&roomName=${roomName}`;
    if(roomName === '') {
      URL = `${GlobalComponent.API_URL}/admin/report/top-booking?page=${page}&limit=${pageSize}&search=${searchTerm}&startDate=${startDate}&endDate=${endDate}&sort=${sort}`;
      // return this.http.get<ITopBooking>(URL);
    }

    return this.http.get<ITopBooking>(URL);
  }
  getTopDepartmentBooks(searchTerm: string, page: number, pageSize: number,startDate: string, endDate: string, sort: string = 'desc', roomName:string = '')
  {
    let URL = `${GlobalComponent.API_URL}/admin/report/top-department-booking?page=${page}&limit=${pageSize}&search=${searchTerm}&startDate=${startDate}&endDate=${endDate}&sort=${sort}&roomName=${roomName}`;
    if(roomName === '') {
      URL = `${GlobalComponent.API_URL}/admin/report/top-department-booking?page=${page}&limit=${pageSize}&search=${searchTerm}&startDate=${startDate}&endDate=${endDate}&sort=${sort}`;
    }
    return this.http.get<ITopDepartmentBooking>(URL);
  }

  getHourlyBooking(startDate: string, endDate: string,roomName:string = '')
  {
      // return this.http.get<IHourlyBooking>(`${GlobalComponent.API_URL}/admin/report/hourly-booking?startDate=${startDate}&endDate=${endDate}`);

    let URL = `${GlobalComponent.API_URL}/admin/report/hourly-booking?startDate=${startDate}&endDate=${endDate}`;
    if(roomName !== '') {
      URL = `${GlobalComponent.API_URL}/admin/report/hourly-booking?startDate=${startDate}&endDate=${endDate}&roomName=${roomName}`;
    }
    return this.http.get<IHourlyBooking>(URL);
  }
}

