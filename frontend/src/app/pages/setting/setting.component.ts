import { Component } from '@angular/core';
import {BreadcrumbsComponent} from "../../shared/breadcrumbs/breadcrumbs.component";
import {TokenStorageService} from '../../core/services/token-storage.service';
import {LogInResponse} from '../../core/services/auth.service';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {User, UserProfileService} from '../../core/services/user.service';
import {GlobalComponent} from '../../global-component';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';

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
      this.toastr.error('Please fill all required fields');
      return;
    }

    this.toastr.info('Updating profile...');
    const currentUrl = this.router.url;
    localStorage.setItem('previousUrl', currentUrl);

    this.userProfileService.updateProfile(this.userForm.value).subscribe(
      {
        next: (res) => {
          setTimeout(() => {
           this.toastr.clear();
           this.toastr.success('Profile updated successfully');
           this.router.navigateByUrl('/back').then();
          }, 1000);
          this.tokenStorageService.saveUser(res);
        },
        error: (error) => {
          setTimeout(() => {
          this.toastr.clear();
            this.toastr.error('Profile update failed');
          }, 1000);
        }
      }
    );
  }
}
