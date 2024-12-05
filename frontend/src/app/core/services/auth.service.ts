import { Injectable } from '@angular/core';
import {GlobalComponent} from '../../global-component';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, catchError, map, of, throwError} from 'rxjs';
import {Store} from '@ngrx/store';
import {loginFailure, loginSuccess, logout} from '../../store/Authentication/authentication.actions';
import {getFirebaseBackend} from '../../authUtils';
import Swal from 'sweetalert2';
import {Router} from '@angular/router';
import {TokenStorageService} from './token-storage.service';

// export const AUTH_API = GlobalComponent.AUTH_API;

export const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
}

export interface LogInResponse {
  message: string;
  user:    User;
  token:   string;
}

export interface User {
  employeeId:     string;
  email:          string;
  name:           string;
  lastName:       string;
  avatar:         null;
  dateEmployment: Date;
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
      // Login Api
      return this.http.post<LogInResponse>(GlobalComponent.AUTH_API + 'sign-in', {
              employeeId,
              password
            }, httpOptions);

      //
      //   .subscribe({
      //     next: (res:LogInResponse) => {
      //     this.store.dispatch(loginSuccess({ user: res.user }));
      //     // this.currentUserSubject.next(res);
      //     this.tokenStorageService.saveToken(res.token);
      //     this.tokenStorageService.saveUser(res);
      //     Swal.fire(
      //       {
      //         icon: 'success',
      //         title: 'Success!',
      //         text: 'Logged in successfully!',
      //         timer: 1500,
      //         showConfirmButton: true
      //       }
      //     )
      //       .then(() => {
      //         this.router.navigateByUrl('app').then();
      //       });
      //   },
      //   error: error => {
      //     Swal.fire({
      //       icon: 'error',
      //       title: 'Oops...',
      //       text: `Invalid Credentials! ${error.error.message}`,
      //     }).then(()=>{
      //       return this.store.dispatch(loginFailure({ error: error.error.message }));
      //     });
      //   },
      //   complete: () => {
      //     console.log('complete');
      //   }
      // });
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

        this.tokenStorageService.sigOut();
        this.http.post(GlobalComponent.AUTH_API + 'sign-out', {}, { headers: headerToken }).subscribe();
        this.currentUserSubject.next(null!);
        return of(undefined).pipe();
    }

    /**
     * Check if the user is authenticated
     */
    isAuthenticated() {
      const headerToken = { 'Authorization': `Bearer ` + this.tokenStorageService.getToken() };
      return this.http.get(GlobalComponent.AUTH_API + 'is-login');
    }
}

