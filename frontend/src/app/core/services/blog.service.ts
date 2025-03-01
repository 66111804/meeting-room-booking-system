import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GlobalComponent} from '../../global-component';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  constructor(private http: HttpClient) { }

  getBlogs(searchTerm: string, page: number, pageSize: number) {
    return this.http.get(`${GlobalComponent.API_URL}/admin/blogs?page=${page}&limit=${pageSize}&search=${searchTerm}`);
  }
}
