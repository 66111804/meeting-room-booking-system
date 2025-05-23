import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GlobalComponent} from '../../global-component';
import {ValidateResponse} from '../../shared/utils/date-utils';
import {Feature} from './room-meeting.service';

export interface RoomFeaturesResponse
{
  features: Feature[]
  total: number
  totalPages: number
  current: number
}




@Injectable({
  providedIn: 'root'
})
export class RoomFeaturesService {

  constructor(private http: HttpClient,) { }

  getAll(page = 1, size = 10, searchTerm = '') {
    return this.http.get<RoomFeaturesResponse>(`${GlobalComponent.API_URL}/admin/features?page=${page}&limit=${size}&search=${searchTerm}`)
  }

  validateFeature(name: string, id: number = 0) {
    if (id > 0) {
      return this.http.get<ValidateResponse>(`${GlobalComponent.API_URL}/admin/feature/${id}/validate?name=${name}`);
    }
    return this.http.get<ValidateResponse>(`${GlobalComponent.API_URL}/admin/feature-validate?name=${name}`);
  }

  createFeature(name: string) {
    return this.http.post(`${GlobalComponent.API_URL}/admin/feature-create`, {name});
  }

  deleteFeature(id: number) {
    return this.http.delete(`${GlobalComponent.API_URL}/admin/feature-delete/${id}`);
  }

  updateFeature(id: number, name: string) {
    return this.http.put(`${GlobalComponent.API_URL}/admin/feature-update/${id}`, {name});
  }

  getFeatureWithRoom(page = 1, size = 10, searchTerm = '',id: number) {
    return this.http.get<RoomFeaturesResponse>(`${GlobalComponent.API_URL}/admin/meeting-room/${id}/feature?page=${page}&limit=${size}&search=${searchTerm}`)
  }
}
