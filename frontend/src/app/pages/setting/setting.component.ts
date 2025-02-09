import { Component } from '@angular/core';
import {BreadcrumbsComponent} from "../../shared/breadcrumbs/breadcrumbs.component";
import {TokenStorageService} from '../../core/services/token-storage.service';
import {LogInResponse} from '../../core/services/auth.service';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {UserProfileService} from '../../core/services/user.service';
import {GlobalComponent} from '../../global-component';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})
export class SettingComponent {

  breadCrumbItems!: Array<{}>;
  imageSrc: any = 'assets/images/users/user-dummy-img.jpg';
  userInfo: LogInResponse;
  userForm: UntypedFormGroup;
  passwordForm: UntypedFormGroup;
  constructor(private tokenStorageService: TokenStorageService,
              private userProfileService: UserProfileService,
              private formBuilder: UntypedFormBuilder,
              private toastr: ToastrService,
              private router: Router
  ) {
    this.breadCrumbItems = [{ label: 'Home', path: '/' }, { label: 'Setting', active: true }];
    this.userInfo = this.tokenStorageService.getUser();
    this.userForm = this.formBuilder.group({
      name: [this.userInfo.user.name, [Validators.required]],
      lastName: [this.userInfo.user.lastName, [Validators.required]],
    });
    this.imageSrc = this.userInfo.user.avatar ? `${GlobalComponent.SERVE_URL}/files/uploads/${this.userInfo.user.avatar}` : 'assets/images/users/user-dummy-img.jpg';

    this.passwordForm = this.formBuilder.group({
      password: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  // noinspection DuplicatedCode
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

  updateProfile() {
    this.toastr.clear();
    if(this.userForm.invalid) {
      this.toastr.error('ข้อมูลไม่ครบ');
      return;
    }

    this.toastr.info('กำลังอัพเดทข้อมูล...');
    const currentUrl = this.router.url;
    localStorage.setItem('previousUrl', currentUrl);

    this.userProfileService.updateProfile(this.userForm.value).subscribe(
      {
        next: (res) => {
          setTimeout(() => {
           this.toastr.clear();
           this.toastr.success('อัพเดทข้อมูลสำเร็จ');
           this.router.navigateByUrl('/back').then();
          }, 1000);
          this.tokenStorageService.saveUser(res);
        },
        error: (error) => {
          setTimeout(() => {
          this.toastr.clear();
            this.toastr.error('มีข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
          }, 1000);
        }
      }
    );
  }


  changePassword() {

    this.toastr.clear();
    if(this.passwordForm.invalid) {
      this.toastr.error('ข้อมูลไม่ครบ');
      return;
    }

    if(this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
      this.toastr.error('รหัสผ่านไม่ตรงกัน');
      return;
    }

    this.toastr.info('กำลังเปลี่ยนรหัสผ่าน...');
    const currentUrl = this.router.url;
    localStorage.setItem('previousUrl', currentUrl);

    this.userProfileService.updatePassword(this.passwordForm.value).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.toastr.clear();
          this.toastr.success('เปลี่ยนรหัสผ่านสำเร็จ');
          // clear form
          // this.passwordForm.reset();
        }, 1000);
        Swal.fire({
          title: 'สำเร็จ!',
          text: 'เปลี่ยนรหัสผ่านสำเร็จ',
          icon: 'success',
          confirmButtonText: 'Ok',
          timer: 3000
        }).then();
      },
      error: (error) => {
        setTimeout(() => {
          this.toastr.clear();
          this.toastr.error('เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        }, 1000);

        this.passwordForm.reset();
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: 'เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
          icon: 'error',
          confirmButtonText: 'Ok',
          timer: 3000
        }).then();
      }
    });

  }

}
