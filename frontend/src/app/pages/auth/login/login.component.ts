import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {NgClass} from '@angular/common';
import Swal from 'sweetalert2';
import {AuthenticationService, LogInResponse} from '../../../core/services/auth.service';
import {loginFailure, loginSuccess} from '../../../store/Authentication/authentication.actions';
import {Store} from '@ngrx/store';
import {TokenStorageService} from '../../../core/services/token-storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit,AfterViewInit
{
  // Login Form
  loginForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType!: boolean;
  error = '';
  returnUrl!: string;
  // set the current year
  year: number = new Date().getFullYear();

  constructor(private formBuilder: UntypedFormBuilder, private router: Router, private service: AuthenticationService,private store: Store,private tokenStorageService:TokenStorageService) { }

  isDisabled = false;
  ngOnInit(): void {

    /**
     * Form Validatyion
     */
    this.loginForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      password: ['', Validators.required],
    });

    try {
      this.service.isAuthenticated().subscribe(
        {
          next: (res) => {
            this.store.dispatch(loginSuccess({ user: res.user }));
            this.tokenStorageService.saveToken(res.token);
            this.tokenStorageService.saveUser(res);
            this.router.navigateByUrl('app').then();
          },
          error: (error) => {
            // console.log(error);
          }
        }
      );

    }catch (error) {
      console.error(error);
    }
  }

  ngAfterViewInit(){
    (document.getElementById("preloader") as HTMLElement).style.visibility = "hidden";
  }
  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.isDisabled = true;
    this.service.login(this.loginForm.value.employeeId, this.loginForm.value.password)
      .subscribe({
        next: (res:LogInResponse) => {
          this.store.dispatch(loginSuccess({ user: res.user }));
          this.tokenStorageService.saveToken(res.token);
          this.tokenStorageService.saveUser(res);
          // this.currentUserSubject.next(res);
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
              this.isDisabled = false;
              this.router.navigateByUrl('app').then();
            });
        },
        error: error => {
          Swal.fire({
            icon: 'error',
            title: 'เข้าสู่ระบบไม่สำเร็จ!',
            text: `มีข้อผิดพลาด: ${error.error.message}`,
          }).then(()=>{
            this.isDisabled = false;
            return this.store.dispatch(loginFailure({ error: error.error.message }));
          });
        },
        complete: () => {
          console.log('complete');
          this.isDisabled = false;
        }
      });

    // display form values on success
  }

  /**
   * Password Hide/Show
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
