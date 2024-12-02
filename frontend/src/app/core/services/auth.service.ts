import { Injectable } from '@angular/core';
import {User} from '../../store/Authentication/auth.models';
import {GlobalComponent} from '../../global-component';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, catchError, map, of, throwError} from 'rxjs';
import {Store} from '@ngrx/store';
import {loginFailure, logout} from '../../store/Authentication/authentication.actions';
import {getFirebaseBackend} from '../../authUtils';

export const AUTH_API = GlobalComponent.AUTH_API;

export const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
}

@Injectable({ providedIn: 'root' })

/**
 * Auth-service Component
 */
export class AuthenticationService {
    user!: User;
    currentUserValue: any;

    private currentUserSubject: BehaviorSubject<User>;
    // public currentUser: Observable<User>;

    constructor(private http: HttpClient, private store: Store) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('currentUser')!));
        // this.currentUser = this.currentUserSubject.asObservable();
     }

    /**
     * Performs the auth
     * @param employeeId email of user
     * @param password password of user
     */

    login(employeeId: string, password: string) {
      // Login Api
      return this.http.post(AUTH_API + 'sign-in', {
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
        const headerToken = { 'Authorization': `Bearer ` + sessionStorage.getItem('token') };
        this.store.dispatch(logout());
        // logout the user
        // return getFirebaseBackend()!.logout();
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('token');
        this.http.post(AUTH_API + 'sign-out', {}, { headers: headerToken }).subscribe();
        this.currentUserSubject.next(null!);
        return of(undefined).pipe();
    }

    /**
     * Check if the user is authenticated
     */
    isAuthenticated() {

      const headerToken = { 'Authorization': `Bearer ` + sessionStorage.getItem('token') };
      return this.http.get(GlobalComponent.AUTH_API + 'is-login', { headers: headerToken });
    }
}

