import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BreadcrumbsComponent} from '../../../shared/breadcrumbs/breadcrumbs.component';
import {FeatherModule} from 'angular-feather';
import {RouterLink} from '@angular/router';
import {MatFormField} from '@angular/material/form-field';
import {
  MatDatepickerActions, MatDatepickerApply, MatDatepickerCancel,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker
} from '@angular/material/datepicker';
import {MatButton} from '@angular/material/button';
import {provideNativeDateAdapter} from '@angular/material/core';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    FeatherModule,
    RouterLink,
    MatFormField,
    MatDateRangeInput,
    MatDatepickerToggle,
    MatDateRangePicker,
    MatDatepickerActions,
    MatButton,
    MatDatepickerCancel,
    MatDatepickerApply
  ],
  providers:[provideNativeDateAdapter()],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class ReportComponent {
  breadCrumbItems!: Array<{}>;
  constructor() {
    document.getElementById('elmLoader')?.classList.remove('d-none');
    this.breadCrumbItems = [
      {label: 'Administrator'},
      {label: 'Report', active: true}
    ];
  }


  ngOnInit() {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      document.getElementById('elmLoader')?.classList.add('d-none');
    }, 500);
  }
}
