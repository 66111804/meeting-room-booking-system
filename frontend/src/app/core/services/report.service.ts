import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
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
  roomNames: string
}
export interface IChartDataset {
  label: string;
  data: number[];
}

export interface IMultiRoomTopBooking {
  labels: string[];         //  ["12-Mar", "13-Mar"]
  datasets: IChartDataset[]; // { label: "ห้อง A", data: [2, 3] }
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

  getTopBooks(searchTerm: string, page: number, pageSize: number,startDate: string, endDate: string,sort: string = 'desc') {
    let URL = `${GlobalComponent.API_URL}/admin/report/top-booking?page=${page}&limit=${pageSize}&search=${searchTerm}&startDate=${startDate}&endDate=${endDate}&sort=${sort}`;
    return this.http.get<ITopBooking>(URL);
  }

  getTopBooksByRooms(roomNames:string[]= [],startDate: string, endDate: string,sort: string = 'desc') {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('sort', sort)
      .set('roomNames', roomNames.join(','));
    const url = `${GlobalComponent.API_URL}/admin/report/top-booking`;
    return this.http.get<IMultiRoomTopBooking>(url, {params});
  }

  getTopDepartmentBooks(searchTerm: string, page: number, pageSize: number,startDate: string, endDate: string, sort: string = 'desc', roomName:string = '')
  {
    let URL = `${GlobalComponent.API_URL}/admin/report/top-department-booking?page=${page}&limit=${pageSize}&search=${searchTerm}&startDate=${startDate}&endDate=${endDate}&sort=${sort}&roomName=${roomName}`;
    if(roomName === '') {
      URL = `${GlobalComponent.API_URL}/admin/report/top-department-booking?page=${page}&limit=${pageSize}&search=${searchTerm}&startDate=${startDate}&endDate=${endDate}&sort=${sort}`;
    }
    return this.http.get<ITopDepartmentBooking>(URL);
  }

  getTopDepartmentBooksByRooms(roomNames:string[]= [],startDate: string, endDate: string,sort: string = 'desc') {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('sort', sort)
      .set('roomNames', roomNames.join(','));
    const url = `${GlobalComponent.API_URL}/admin/report/top-department-booking-rooms`;
    return this.http.get<ITopDepartmentBooking>(url, {params});
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

