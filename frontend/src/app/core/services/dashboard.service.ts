// noinspection SpellCheckingInspection

import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GlobalComponent} from '../../global-component';


export type IStateResponse = IStats[];


export interface IStats {
  title: string
  value: number
  icon: string
  persantage: string
  profit: string
  month: string
}

export interface Author {
  id: number;
  name: string;
}

export interface IBlog {
  id: number;
  title: string;
  image: string;
  content: string;
  contentHtml: string;
  published: boolean;
  tags: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
}

export interface IBlogResponseDahsboard {
  blogs: IBlog[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface IMeetingRoomDashboard
{
  id: number;
  name: string;
}

export interface IUser
{
  id: number;
  name: string;
}

export interface IMeetingDashboard
{
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "pending" | "cancelled" | undefined;
  MeetingRoom: IMeetingRoomDashboard;
  User: IUser;
}

export interface IMeetingDashboardResponse
{
  meetings: IMeetingDashboard[];
  total: number;
  totalPages: number;
  currentPage: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http:HttpClient ) { }

  getStats(){
    return this.http.get<IStateResponse>(GlobalComponent.API_URL + '/dashboard/stats');
  }

  getBlogs(searchTerm: string, page: number, pageSize: number) {
    return this.http.get<IBlogResponseDahsboard>(`${GlobalComponent.API_URL}/dashboard/blogs?page=${page}&limit=${pageSize}&search=${searchTerm}`);
  }

  getBlog(id: number) {
    return this.http.get<IBlog>(`${GlobalComponent.API_URL}/dashboard/blog/${id}/info`);
  }

  getBookings( page: number, pageSize: number, date: string) {
    return this.http.get<IMeetingDashboardResponse>(`${GlobalComponent.API_URL}/dashboard/bookings?date=${date}&page=${page}&limit=${pageSize}`);
  }
}
