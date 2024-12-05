import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {GlobalComponent} from '../../global-component';
import {TokenStorageService} from './token-storage.service';
export interface UserList {
  users:      User[];
  total:      number;
  totalPages: number;
}
export interface User {
  id:             number;
  employeeId:     string;
  email:          string;
  name:           string;
  lastName:       string;
  password:       string;
  avatar:         null;
  dateEmployment: Date;
  position:       null;
  department:     null;
  status:         string;
  createdAt:      Date;
  updatedAt:      Date;
  roles:          any[];
  permissions:    any[];
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
    constructor(private http: HttpClient, private tokenStorageService:TokenStorageService) { }
    // /***
    //  * Get All User
    //  */
    getAll(page = 1, size = 10,searchTerm = '') {
      const token = this.tokenStorageService.getToken();
        return this.http.get<UserList>(`${GlobalComponent.API_URL}admin/users?page=${page}&limit=${size}&search=${searchTerm}`)
          // ,
          // {
          //   headers: {
          //     'Authorization': `Bearer ${token}`
          //   }
          // }
    }

    // /***
    //  * Facked User Register
    //  */
    // register(user: User) {
    //     return this.http.post(`/users/register`, user);
    // }
}
