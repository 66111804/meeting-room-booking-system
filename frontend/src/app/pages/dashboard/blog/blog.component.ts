import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {DashboardService, IBlog} from '../../../core/services/dashboard.service';
import {BreadcrumbsComponent} from '../../../shared/breadcrumbs/breadcrumbs.component';
import {TranslatePipe} from '@ngx-translate/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    RouterLink,
    TranslatePipe,
    DatePipe
  ],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent implements OnInit, AfterViewInit
{
  breadCrumbItems!: Array<{}>;
  id: number = 0;
  safeContentHtml!: SafeHtml;

  blog: IBlog = {
    id: 0,
    title: '',
    content: '',
    contentHtml: '',
    published: false,
    tags:'',
    image:'',
    author: {
      id: 0,
      name: ''
    },
    createdAt: '',
    updatedAt: ''
  };
  constructor(private route: ActivatedRoute,
              private dashboardService: DashboardService,
              private router: Router,
              private sanitizer: DomSanitizer) {
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

    if(this.id > 0) {
      this.fetchBlogs();
    }else {
      this.router.navigateByUrl('/app').then();
    }
  }

  fetchBlogs() {
    this.dashboardService.getBlog(this.id).subscribe(
      {
        next: (response) => {
          this.blog = response;
          this.safeContentHtml = this.sanitizer.bypassSecurityTrustHtml(this.blog.contentHtml);
        },
        error: (error) => {
          console.error(error);
          this.router.navigateByUrl('/app').then();
        }
      }
    );
  }
}
