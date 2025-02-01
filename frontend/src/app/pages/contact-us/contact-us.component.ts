import {Component, OnInit} from '@angular/core';
import {BreadcrumbsComponent} from '../../shared/breadcrumbs/breadcrumbs.component';
import {ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {LogInResponse} from '../../core/services/auth.service';
import {TokenStorageService} from '../../core/services/token-storage.service';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    ReactiveFormsModule
  ],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss'
})
export class ContactUsComponent implements OnInit
{
  breadCrumbItems: Array<{}>;
  email: string = '';
  address: string = '';
  phone: string = '';
  contactForm: UntypedFormGroup;
  userInfo: LogInResponse;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private tokenStorageService: TokenStorageService) {
    this.breadCrumbItems = [{ label: 'Home', path: '/' }, { label: 'Contact Us', active: true }];
    this.email = 'amin@company.com';
    this.address = '1234 Street Name, City Name, Country Name';
    this.phone = '+123-456-7890';

    this.userInfo = this.tokenStorageService.getUser();

    this.contactForm = this.formBuilder.group({
      subject: ['', [Validators.required]],
      message: ['', [Validators.required]]
    });
  }

  ngOnInit() {}

  submitForm() {
    console.log(this.contactForm.value);
  }
}
