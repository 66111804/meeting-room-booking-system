import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {GlobalComponent} from '../../global-component';
import {TokenStorageService} from './token-storage.service';
import {ValidateResponse} from '../../shared/utils/date-utils';
export interface UserList {
  users:      User[];
  total:      number;
  totalPages: number;
  current:    number;
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
    imageFile: File | null = null;
    constructor(private http: HttpClient, private tokenStorageService:TokenStorageService) { }
    // /***
    //  * Get All User
    //  */
    getAll(page = 1, size = 10,searchTerm = '') {
       return this.http.get<UserList>(`${GlobalComponent.API_URL}/admin/users?page=${page}&limit=${size}&search=${searchTerm}`);
    }

    employeeIdValidation(employeeId: string, id: number = 0) {
        // /api/admin/user/:employeeId/validate
        if (id > 0) {
            return this.http.get<ValidateResponse>(`${GlobalComponent.API_URL}/admin/users/${id}/validate?employeeId=${employeeId}`);
        }
        return this.http.get<ValidateResponse>(`${GlobalComponent.API_URL}/admin/user-validate?employeeId=${employeeId}`);
    }

    /**
     * Create or Update User
     * @param dataForm
     * @param id
     */
    updateUser(dataForm: any, id: number = 0) {
      let formData = new FormData();
      formData.append('name', dataForm.name);
      formData.append('lastName', dataForm.lastName);
      formData.append('employeeId', dataForm.employeeId);
      formData.append('email', dataForm.email);
      formData.append('password', dataForm.password);
      formData.append('position', dataForm.position);
      formData.append('department', dataForm.department);
      formData.append('status', dataForm.status || 'active');
      if (this.imageFile !== null) {
        formData.append('avatar', this.imageFile);
      }

      dataForm.roles?.forEach((role: any) => {
        formData.append('roles[]', role);
      });

      if (id > 0) {
        return this.http.put(`${GlobalComponent.API_URL}/admin/user/${id}/update`, formData);
      }
      return this.http.post(`${GlobalComponent.API_URL}/admin/user-create`, formData);
    }
}
