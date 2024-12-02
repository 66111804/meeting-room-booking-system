import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {NgClass} from '@angular/common';
import Swal from 'sweetalert2';
import {AuthenticationService} from '../../../core/services/auth.service';

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

  constructor(private formBuilder: UntypedFormBuilder, private router: Router, private service: AuthenticationService) { }

  ngOnInit(): void {

    /**
     * Form Validatyion
     */
    this.loginForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      password: ['', Validators.required],
    });

    this.service.isAuthenticated().subscribe(
      {
        next: (response) => {
          this.router.navigateByUrl('app').then();
        },
        error: (error) => {
          console.log(error);
        }
      }
    );
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
    // Swal.fire('Success!', 'Logged in successfully!', 'success')
    //   .then(() => {
    //     this.router.navigateByUrl('app').then();
    //   });

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    console.log(this.loginForm.value);
    this.service.login(this.loginForm.value.employeeId, this.loginForm.value.password).subscribe({
        next: (res:any) => {
            console.log(res);
            const { token, user } = res;
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('currentUser', JSON.stringify(user));

            Swal.fire(
              {
                icon: 'success',
                title: 'Success!',
                text: 'Logged in successfully!',
                timer: 1500,
                showConfirmButton: true
              }
            )
            .then(() => {
                this.router.navigateByUrl('app').then();
            });
        },
        error: error => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Invalid Credentials! ${error.error.message}`,
          }).then(()=>{
            // reset the password field
            this.loginForm.get('password')?.reset();
          });
        },
        complete: () => {
          console.log('complete');
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
