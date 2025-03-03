import { Injectable } from '@angular/core';
import {LogInResponse} from './auth.service';
import {HasRole} from '../../store/Authentication/auth.models';

const TOKEN_KEY = "auth-token";
const USER_KEY = "currentUser";

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  constructor() { }

  sigOut(): void {
    window.sessionStorage.clear();
  }

  public saveToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY,token);
  }

  public getToken(): string | null {
    return window.sessionStorage.getItem(TOKEN_KEY);
  }

  public saveUser(user: any): void {
    console.log({saveUser:true,user});
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): LogInResponse {
    const user = window.sessionStorage.getItem(USER_KEY);
    if(user){
      return JSON.parse(user);
    }
    return {} as LogInResponse;
  }

  /**
   * Update user from backend
   * @param user
   */
  public updateUser(user: LogInResponse): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getRole():HasRole[] {
   const user = window.sessionStorage.getItem(USER_KEY);
    if(user){
      return JSON.parse(user).user.hasRole;
    }
    return [];
  }

  public getPermissions() {
    const user = window.sessionStorage.getItem(USER_KEY);
    if(user){
      return JSON.parse(user).user.permissions;
    }
    return [];
  }
}
