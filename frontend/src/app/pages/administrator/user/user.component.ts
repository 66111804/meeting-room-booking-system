// noinspection DuplicatedCode

import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {BreadcrumbsComponent} from '../../../shared/breadcrumbs/breadcrumbs.component';
import {TranslatePipe} from '@ngx-translate/core';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {UserProfileService} from '../../../core/services/user.service';
import {debounceTime, distinctUntilChanged, of, Subject} from 'rxjs';
import {DatePipe, NgClass} from '@angular/common';
import {GlobalComponent} from '../../../global-component';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {ToastrService} from 'ngx-toastr';
import {AuthenticationService} from '../../../core/services/auth.service';
import {UserRoleComponent} from './user-role/user-role.component';
import {User, UserList} from '../../../store/Authentication/auth.models';
import {NgOptionComponent} from '@ng-select/ng-select';

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
    MatRadioGroup,
    UserRoleComponent,
    NgOptionComponent
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
  selectUserId = 0;
  useList: UserList = {
    users: [],
    total: 0,
    totalPages: 0,
    current: 0
  }
  userForm: UntypedFormGroup;
  protected readonly GlobalComponent = GlobalComponent;
  userShow:User | null = null;
  userEdit:User | null = null;
  imageSrc: any = 'assets/images/users/user-dummy-img.jpg';
  searchSubject: Subject<string> = new Subject<string>();
  employeeSubject: Subject<string> = new Subject<string>();

  userRoleSelected!: User | null;
  positions =[
    'ผู้จัดการฝ่ายขาย',
    'ผู้จัดการฝ่ายจัดซื้อ',
    'ผู้จัดการฝ่ายบุคคล',
    'พนักงานทั่วไป',
    'เลขา',
    'แอดมิน',
    'ผู้ช่วย',
    'ผู้จัดการฝ่ายควบคุมการผลิต'
  ]

  departments =[
    'Engineer',
    "HR",
    "QA",
    "QC",
    "Sales",
    "Store",
    "Production",
    "Purchasing",
    "Accounting",
    "IT"
  ]
  constructor(private userProfileService: UserProfileService,
              private modalService: NgbModal,
              private formBuilder: UntypedFormBuilder,
              private toastr: ToastrService,
              private authenticationService:AuthenticationService
              ) {
    this.breadCrumbItems = [
      {label: 'Administrator'},
      {label: 'User', active: true},
    ];
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
  }

  ngOnInit() {
    document.getElementById('elmLoader')?.classList.add('d-none');

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

  updateUser(content: any) {
    this.imageSrc = 'assets/images/users/user-dummy-img.jpg';
    this.userForm.reset({
      position: '',
      department: '',
    });
    this.submitted = false;
    this.empHasValid = false;
    this.userProfileService.imageFile = null; // reset image file
    this.userEdit = null;
    this.selectUserId = 0;
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
      if(this.userForm.value.password === ''){
        delete this.userForm.value.password;
      }else {
          if (this.userForm.value.password !== this.userForm.value.confirmPassword) {
            this.userForm.get('confirmPassword')?.setErrors({notMatch: true});
            this.toastr.error('รหัสผ่านไม่ตรงกัน');
            return;
        }
      }
      this.userProfileService.updateUser(this.userForm.value, this.userEdit.id).subscribe({
        next: (res) => {
          modal.close('Close click');
          const triggerButton = document.getElementById('triggerButton');
          if (triggerButton) {
            triggerButton.focus();
          }
          this.toastr.success('อัพเดทข้อมูลสำเร็จ');
          this.fetchUsers();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
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
          // console.log(res);
          modal.close('Close click');

          const triggerButton = document.getElementById('triggerButton');
          if (triggerButton) {
            triggerButton.focus();
          }
          this.toastr.success('เพิ่มผู้ใช้งานสำเร็จ');
          this.fetchUsers();
        },
        error: (err) => {
          console.log(err);
          this.toastr.error('เกิดข้อผิดพลาดในการเพิ่มผู้ใช้งาน');
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

    // check if employeeId is empty

    if(employeeId === ''){
      this.userForm.get('employeeId')?.setErrors({invalid: true});

      const employeeIdDiv = document.getElementById('employeeId-invalid');
      if (employeeIdDiv) {
        employeeIdDiv.innerHTML = 'กรุณากรอกรหัสพนักงาน';
      }
      return;
    }
    // check if employeeId is valid
    const id = this.userEdit ? this.userEdit.id : 0;
    this.userProfileService.employeeIdValidation(employeeId,id).subscribe({
      next: (res) => {
        if(res.valid){
          this.userForm.get('employeeId')?.setErrors(null);
        }else{
          this.userForm.get('employeeId')?.setErrors({invalid: true});
          const employeeIdDiv = document.getElementById('employeeId-invalid');
          if (employeeIdDiv)
          {
            employeeIdDiv.innerHTML = 'รหัสพนักงานซ้ำ!';
          }
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
  editUser(content: any,user: User) {
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
      role: user.roles,
    });
    this.statusState = user.status === 'active' ? true : false;
    this.selectUserId = user.id;
    this.modalService.open(content, {size: 'lg', centered: true});
  }

  statusState: boolean = true;
  statusChange(event: any) {
    this.userForm.patchValue({
      status: event.value
    });

    if(!this.statusState) {
      this.userForm.patchValue({
        status: 'active'
      });

      this.userForm.get('status')?.setErrors(null);
    } else {
      this.userForm.patchValue({
        status: 'inactive'
      });
      this.userForm.get('status')?.setErrors(null);
    }
    this.statusState = !this.statusState;
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
        // console.log(err);
      },
      complete: () => {
        this.userDelete = null;
        this.modalService.dismissAll();
      }
    });
  }

  isSuperAdmin(): boolean {
    // true if user is super admin or user is the same as selected user
    return this.authenticationService.getUser().user.id === 1 && this.selectUserId === 1;
  }

  roleChange(user: User) {
    this.userRoleSelected = user;
  }

  backToUserList(event: any) {
    this.userRoleSelected = null;
    this.fetchUsers();
  }
}
