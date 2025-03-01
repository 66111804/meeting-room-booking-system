// Authentication.effects.ts
import {Injectable, inject} from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, catchError, exhaustMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthenticationService } from '../../core/services/auth.service';
import { logout, logoutSuccess} from './authentication.actions';
import { Router } from '@angular/router';
import * as AuthActions from './authentication.actions';
import Swal from 'sweetalert2';
import {TokenStorageService} from '../../core/services/token-storage.service';

@Injectable()
export class AuthenticationEffects {

  private actions$ = inject(Actions);

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
                  // this.router.navigateByUrl('/app').then();
                  window.location.href = '/app';
                });
              return AuthActions.loginSuccess({user});
            }else{
              Swal.fire(
                {
                  icon: 'error',
                  title: 'Error',
                  text: 'เข้าสู่ระบบไม่สำเร็จ!',
                  timer: 1500,
                  showConfirmButton: true
                }
              ).then();
              return AuthActions.loginFailure({ error: user.message });
            }
          }),
          catchError((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Login Failed',
              text: 'เกิดข้อผิดพลาด! ไม่สามารถเข้าสู่ระบบได้',
              timer: 1500,
              showConfirmButton: true
            });

            return of(AuthActions.loginFailure({ error: error.message || 'Unknown error' }));
          })

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
    private authenticationService: AuthenticationService,
    private tokenStorageService:TokenStorageService,
    private router: Router) { }

}
