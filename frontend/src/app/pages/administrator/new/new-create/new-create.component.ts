import {AfterViewInit, Component, OnInit} from '@angular/core';
import {BreadcrumbsComponent} from '../../../../shared/breadcrumbs/breadcrumbs.component';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-new-create',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    FormsModule,
    TranslatePipe,
    RouterLink
  ],
  templateUrl: './new-create.component.html',
  styleUrl: './new-create.component.scss'
})
export class NewCreateComponent implements OnInit, AfterViewInit
{
  breadCrumbItems!: Array<{}>;

  constructor() {
    this.breadCrumbItems = [{ label: 'Administrator' }, { label: 'New', active: true }];
    document.getElementById('elmLoader')?.classList.remove('d-none');
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      document.getElementById('elmLoader')?.classList.add('d-none');
    }, 1000);
  }
}
