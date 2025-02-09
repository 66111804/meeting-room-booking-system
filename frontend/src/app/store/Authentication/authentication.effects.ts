import {Injectable, Inject, inject} from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, catchError, exhaustMap, tap } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { AuthenticationService } from '../../core/services/auth.service';
import { login, loginSuccess, loginFailure, logout, logoutSuccess} from './authentication.actions';
import { Router } from '@angular/router';
import {environment} from '../../../environments/environment';
import * as AuthActions from './authentication.actions';
import Swal from 'sweetalert2';
import {TokenStorageService} from '../../core/services/token-storage.service';

@Injectable()
export class AuthenticationEffects {

  // Register$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(Register),
  //     exhaustMap(({ email, first_name, password }) =>
  //       this.AuthenticationService.register(email, first_name, password).pipe(
  //         map((user) => {
  //           this.router.navigate(['/auth/login']);
  //           return loginSuccess({ user });
  //         }),
  //         catchError((error) => of(loginFailure({ error })))
  //       )
  //     )
  //   )
  // );
  private actions$ = inject(Actions);

 //  login$ = createEffect(() =>{
 // return  this.actions$.pipe(
 //    ofType(login),
 //    exhaustMap(({ employeeId, password }) => {
 //      if (environment.defaultauth === "fakebackend") {
 //        return this.AuthenticationService.login(employeeId, password).pipe(
 //          map((user) => {
 //            console.log("success login", user);
 //            if (user.message === 'success') {
 //              sessionStorage.setItem('toast', 'true');
 //              sessionStorage.setItem('currentUser', JSON.stringify(user.user));
 //              sessionStorage.setItem('token', user.token);
 //              this.router.navigate(['/app']);
 //            }
 //            return loginSuccess(user);
 //          }),
 //          catchError((error) => of(loginFailure({ error })), // Closing parenthesis added here
 //        ));
 //      } else if (environment.defaultauth === "firebase") {
 //        return of(); // Return an observable, even if it's empty
 //      } else {
 //        return of(); // Return an observable, even if it's empty
 //      }
 //    })
 //  )});

  login$ = createEffect(() =>{
    return  this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap((action) =>
        this.authenticationService.login(action.employeeId, action.password).pipe(
          map((user) => {
            if (user.message === 'success') {
              sessionStorage.setItem('toast', 'true');
              // sessionStorage.setItem('currentUser', JSON.stringify(user.user));
              sessionStorage.setItem('token', user.token ?? '');
              this.tokenStorageService.saveToken(user.token);
              this.tokenStorageService.saveUser(user);
              // this.router.navigate(['/app']);
              Swal.fire(
                {
                  icon: 'success',
                  title: 'Success',
                  text: 'เข้าสู่ระบบสำเร็จ!',
                  timer: 1500,
                  showConfirmButton: true
                }
              )
                .then(() => {
                  this.router.navigateByUrl('/app').then();
                });
            }
            return AuthActions.loginSuccess({user});
          }),
          catchError((error) => of(AuthActions.loginFailure({ error })))
        )
      )
    )

  });
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      tap(() => {
        // Perform any necessary cleanup or side effects before logging out
      }),
      exhaustMap(() => of(logoutSuccess()))
    )
  );

  constructor(
    // @Inject(Actions) private actions$: Actions,

    private authenticationService: AuthenticationService,
    private tokenStorageService:TokenStorageService,
    private router: Router) { }

}
