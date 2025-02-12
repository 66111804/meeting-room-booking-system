import { Injectable } from '@angular/core';
import {GlobalComponent} from '../../global-component';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, catchError, map, Observable, of, throwError} from 'rxjs';
import {Store} from '@ngrx/store';
import {logout} from '../../store/Authentication/authentication.actions';
import {getFirebaseBackend} from '../../authUtils';
import {Router} from '@angular/router';
import {TokenStorageService} from './token-storage.service';
import {User} from '../../store/Authentication/auth.models';

export const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
}

export interface LogInResponse {
  message: string;
  user:    User;
  token:   string;
}

@Injectable({ providedIn: 'root' })

/**
 * Auth-service Component
 */
export class AuthenticationService {
    user!: User;
    currentUserValue: any;

    private currentUserSubject: BehaviorSubject<User>;
    // public currentUser: Observable<any>;

    constructor(private http: HttpClient, private store: Store, private router: Router, private tokenStorageService:TokenStorageService) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('currentUser')!));
        // this.currentUser = this.currentUserSubject.asObservable();
     }

    /**
     * Performs the auth
     * @param employeeId email of user
     * @param password password of user
     */

    login(employeeId: string, password: string) {
      return this.http.post<LogInResponse>(GlobalComponent.AUTH_API + '/sign-in', {
              employeeId,
              password
            }, httpOptions);
    }

    /**
     * Returns the current user
     */
    public currentUser(): any {
        return getFirebaseBackend()!.getAuthenticatedUser();
    }

    /**
     * Logout the user
     */
    logout() {
        // const headerToken = { 'x-access-token': `` + sessionStorage.getItem('token') };
        this.store.dispatch(logout());

        this.tokenStorageService.sigOut();
        // this.http.post(GlobalComponent.AUTH_API + '/sign-out', {}, { headers: headerToken }).subscribe();
        this.currentUserSubject.next(null!);
        return of(undefined).pipe();
    }

    /**
     * Check if the user is authenticated
     */
    isAuthenticated() {
      const headerToken = { 'x-access-token': ""+this.tokenStorageService.getToken() };
      return this.http.get<LogInResponse>(GlobalComponent.AUTH_API + '/is-login', { headers: headerToken });
    }

    /**
     * Get the token
     */
    getToken() {
      return this.tokenStorageService.getToken();
    }

    /**
     * Set the token
     */
    setToken(token: string) {
      this.tokenStorageService.saveToken(token);
    }

    /**
     * Get the user
     */
    getUser() {
      return this.tokenStorageService.getUser();
    }

    getRole() {
      return this.tokenStorageService.getRole();
    }

    getPermissions() {
      return this.tokenStorageService.getPermissions();
    }
}

