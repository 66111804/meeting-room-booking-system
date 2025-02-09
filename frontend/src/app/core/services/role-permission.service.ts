import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GlobalComponent} from '../../global-component';


export interface IRolesAdnPermissionResponse {
  message: string
  data: IDataResponse
}

export interface IDataResponse {
  roles: IRole[]
  permissions: Permission[]
  total: number
  totalPages: number
  currentPage: number
  limit: number
}

export interface Permission {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface IRole {
  id: number
  name: string
  createdAt: string
  updatedAt: string
  permissions: string[]
}


@Injectable({
  providedIn: 'root'
})
export class RolePermissionService {
  constructor(private http: HttpClient) { }
  getRoles(page = 1, size = 10,searchTerm = '') {
    return this.http.get<IRolesAdnPermissionResponse>(GlobalComponent.API_URL + '/admin/roles?page=' + page + '&limit=' + size + '&search=' + searchTerm);
  }
  getPermissions(page = 1, size = 50,searchTerm = '') {
    return this.http.get<IRolesAdnPermissionResponse>(GlobalComponent.API_URL + '/admin/permissions?page=' + page + '&limit=' + size + '&search=' + searchTerm);
  }

  createRole(name: string) {
    return this.http.post(GlobalComponent.API_URL + '/admin/role-create', {name});
  }

  assignPermission(roleId: number, permissionId: number) {
    return this.http.post(GlobalComponent.API_URL + '/admin/role-assign-permission', {roleId, permissionId});
  }

  revokePermission(roleId: number, permissionId: number) {
    return this.http.post(GlobalComponent.API_URL + '/admin/role-revoke-permission', {roleId, permissionId});
  }

  assignRoleToUser(roleId: number, userId: number) {
    return this.http.post(GlobalComponent.API_URL + '/admin/role-assign-user', {roleId, userId});
  }

  revokeRoleFromUser(roleId: number, userId: number) {
    return this.http.post(GlobalComponent.API_URL + '/admin/role-revoke-user', {roleId, userId});
  }
}
