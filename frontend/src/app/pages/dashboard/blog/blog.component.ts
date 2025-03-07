import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BlogService} from '../../../core/services/blog.service';
import {DashboardService} from '../../../core/services/dashboard.service';
import {BreadcrumbsComponent} from '../../../shared/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [
    BreadcrumbsComponent
  ],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent implements OnInit, AfterViewInit
{
  breadCrumbItems!: Array<{}>;
  id: number = 0;
  constructor(private route: ActivatedRoute, private dashboardService: DashboardService) {
    this.id = parseInt(this.route.snapshot.params['id'] || '0');
    this.breadCrumbItems = [{ label: 'Dashboard' }, { label: 'Blog', active: true }];
    document.getElementById('elmLoader')?.classList.remove('d-none');
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      document.getElementById('elmLoader')?.classList.add('d-none');
    }, 500);
  }
}
