// noinspection DuplicatedCode

import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {BreadcrumbsComponent} from '../../../shared/breadcrumbs/breadcrumbs.component';
import {TranslatePipe} from '@ngx-translate/core';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {User, UserList, UserProfileService} from '../../../core/services/user.service';
import {debounceTime, distinctUntilChanged, of, Subject} from 'rxjs';
import {formatDateGlobal} from '../../../shared/utils/date-utils';
import {DatePipe, NgClass} from '@angular/common';
import {switchMap} from 'rxjs/operators';
import {GlobalComponent} from '../../../global-component';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    TranslatePipe,
    FormsModule,
    NgbPagination,
    DatePipe,
    ReactiveFormsModule,
    NgClass,
    MatRadioButton,
    MatRadioGroup
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  submitted = false;
  empHasValid = false;
  searchTerm: string = '';
  page = 1;
  pageSize = 10;
  users: User[] = [];
  totalUsers = 0;

  useList: UserList = {
    users: [],
    total: 0,
    totalPages: 0,
    current: 0
  }
  userForm!: UntypedFormGroup;

  protected readonly GlobalComponent = GlobalComponent;

  userShow:User | null = null;
  userEdit:User | null = null;

  imageSrc: any = 'assets/images/users/user-dummy-img.jpg';
  searchSubject: Subject<string> = new Subject<string>();
  employeeSubject: Subject<string> = new Subject<string>();
  constructor(private userProfileService: UserProfileService,
              private modalService: NgbModal,
              private formBuilder: UntypedFormBuilder,
              private toastr: ToastrService
              ) {
    this.breadCrumbItems = [
      {label: 'Administrator'},
      {label: 'User', active: true},
    ];
  }

  ngOnInit() {
    document.getElementById('elmLoader')?.classList.add('d-none');
    this.userForm = this.formBuilder.group({
      _id: [''],
      name: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      employeeId: ['', [Validators.required]],
      email: [''],
      password: [''],
      confirmPassword: [''],
      image: [''],
      position: ['', [Validators.required]],
      department: ['', [Validators.required]],
      role: ['', ],
      status: ['active'],
    });
    this.fetchUsers();

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((searchTerm: string) => {
      this.fetchUsers();
    });

    this.employeeSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((employeeId: string) => {
      this.employeeIdValidation(employeeId);
    });
  }

  fetchUsers() {
    this.userProfileService.getAll(this.page, this.pageSize,this.searchTerm).subscribe({
      next: (res: UserList) => {
        this.users = res.users;
        this.totalUsers = res.total;
        this.useList = res;
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
      }
    });
  }

  formatDate(date: string) {
    return formatDateGlobal(date);
  }

  updateUser(content: any) {
    this.imageSrc = 'assets/images/users/user-dummy-img.jpg';
    this.userForm.reset();
    this.submitted = false;
    this.empHasValid = false;
    this.userProfileService.imageFile = null; // reset image file
    this.userEdit = null;
    this.modalService.open(content, {size: 'lg', centered: true});
  }

  searchUser() {
    this.searchSubject.next(this.searchTerm);
  }

  changePage() {
    this.fetchUsers();
  }

  onSubmit(modal: any) {
    this.submitted = true;
    if (this.userForm.invalid) {
      return;
    }
    if(this.userEdit !== null){
      // Update user
      this.userProfileService.updateUser(this.userForm.value, this.userEdit.id).subscribe({
        next: (res) => {
          modal.close('Close click');
          const triggerButton = document.getElementById('triggerButton');
          if (triggerButton) {
            triggerButton.focus();
          }

          this.fetchUsers();
        },
        error: (err) => {
          console.error(err);
        }
      });

    }else {
      // password validation
      if (this.userForm.value.password === '' || this.userForm.value.confirmPassword === '') {
        this.userForm.get('password')?.setErrors({required: true});
        this.userForm.get('confirmPassword')?.setErrors({required: true});
        return;
      }
      if (this.userForm.value.password !== this.userForm.value.confirmPassword) {
        this.userForm.get('confirmPassword')?.setErrors({notMatch: true});
        return;
      }

      this.userProfileService.updateUser(this.userForm.value).subscribe({
        next: (res) => {
          console.log(res);
          modal.close('Close click');

          const triggerButton = document.getElementById('triggerButton');
          if (triggerButton) {
            triggerButton.focus();
          }

          this.fetchUsers();
        },
        error: (err) => {
          console.log(err);
        }
      });
    }
  }

  fileChange(event: any) {
    if(event.target.files.length === 0) {
      return;
    }
    const reader = new FileReader();
    this.userProfileService.imageFile = event.target.files[0];
    reader.onload = (e: any) => {
      this.imageSrc = e.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
  }
  employeeIdChange(event: any) {
    const employeeId = event.target.value;
    this.employeeSubject.next(employeeId);
  };
  employeeIdValidation(employeeId: string) {
    if(this.userEdit && this.userEdit.employeeId === employeeId){
      this.empHasValid = true;
      this.userForm.get('employeeId')?.setErrors(null);
      return;
    }
    this.userProfileService.employeeIdValidation(employeeId).subscribe({
      next: (res) => {
        if(res.valid){
          this.userForm.get('employeeId')?.setErrors(null);
        }else{
          this.userForm.get('employeeId')?.setErrors({invalid: true});
        }
        this.empHasValid = true;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  get form() {
    return this.userForm.controls;
  }

  editUser(content: any,user: User,) {
    this.imageSrc = user.avatar ? `${GlobalComponent.SERVE_URL}/files/uploads/${user.avatar}` : 'assets/images/users/user-dummy-img.jpg';
    this.userEdit = user;
    this.userForm.reset();
    this.userForm.patchValue({
      _id: user.id,
      name: user.name,
      lastName: user.lastName,
      employeeId: user.employeeId,
      email: user.email,
      position: user.position,
      department: user.department,
      status: user.status,
      role: user.roles.map(role => role.id),
    });
    console.log(this.userForm.get('status')?.value);
    console.log(this.form['status'].value);
    this.modalService.open(content, {size: 'lg', centered: true});
  }

  statusChange(event: any) {
    // this.roomFormControls.status.data = event.value;
    this.userForm.patchValue({
      status: event.value
    });

  }

  userShowClick(user: User)
  {
    this.userShow = user;
  }

  userDelete: User | null = null;
  confirm(content: any, user: User) {
    if(user.id === 1){
      return;
    }
    this.userDelete = user;
    this.modalService.open(content, {centered: true});
  }

  deleteUser() {
    if(this.userDelete === null){
      return;
    }

    this.userProfileService.deleteUser(this.userDelete.id).subscribe({
      next: (res) => {
        this.toastr.success('User deleted successfully');
        this.fetchUsers();
      },
      error: (err) => {
        this.toastr.error('Error deleting user');
        console.log(err);
      },
      complete: () => {
        this.userDelete = null;
        this.modalService.dismissAll();
      }
    });
  }
}
