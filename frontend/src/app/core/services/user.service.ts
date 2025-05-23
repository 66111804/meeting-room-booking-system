import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {GlobalComponent} from '../../global-component';
import {TokenStorageService} from './token-storage.service';
import {ValidateResponse} from '../../shared/utils/date-utils';
import {LogInResponse} from './auth.service';
import {IUserResponse, UserList} from '../../store/Authentication/auth.models';

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
            return this.http.get<ValidateResponse>(`${GlobalComponent.API_URL}/admin/user/${id}/validate?employeeId=${employeeId}`);
        }
        return this.http.get<ValidateResponse>(`${GlobalComponent.API_URL}/admin/user-validate?employeeId=${employeeId}`);
    }

    /**
     * Create or Update User (admin)
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

    /**
     * Get User by ID
     * @param id
     */
    getUserById(id: number) {
      return this.http.get<IUserResponse>(`${GlobalComponent.API_URL}/admin/user/${id}`);
    }

    /**
     * Delete User
     * @param id
     */
    deleteUser(id: number) {
      return this.http.delete(`${GlobalComponent.API_URL}/admin/user/${id}/delete`);
    }

    // ------------------ User Profile ------------------
    /**
     * update user profile
     * @param dataForm
     *
     */
    updateProfile(dataForm: any) {
      let formData = new FormData();
      formData.append('name', dataForm.name);
      formData.append('lastName', dataForm.lastName);
      if (this.imageFile !== null) {
        formData.append('avatar', this.imageFile);
      }
      return this.http.post<LogInResponse>(`${GlobalComponent.API_URL}/user-profile/update`, formData);
    }

    /**
     * update Password
     * @param dataForm
     */
    updatePassword(dataForm: any) {
      const body = {
        password: dataForm.password,
        newPassword: dataForm.newPassword
      };
      return this.http.post(`${GlobalComponent.API_URL}/user-profile/update-password`, body);
    }
}
