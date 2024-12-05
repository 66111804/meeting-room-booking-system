import {Component, Input, OnInit} from '@angular/core';
import {NgClass} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [
    NgClass,
    TranslatePipe
  ],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.scss'
})
export class BreadcrumbsComponent implements OnInit
{
  @Input() title: string = '';
  @Input()
  breadcrumbItems!: Array<{
    active?: boolean;
    label?: string;
  }>;

  Item!: Array<{
    label?: string;
  }>;

  constructor() { }

  ngOnInit(): void {
  }
}
