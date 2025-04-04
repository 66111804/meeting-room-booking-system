import { Component } from '@angular/core';
import {BreadcrumbsComponent} from '../../../shared/breadcrumbs/breadcrumbs.component';
import {FeatherModule} from 'angular-feather';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    FeatherModule,
    RouterLink
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
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
