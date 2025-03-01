import {AfterViewInit, Component, OnInit} from '@angular/core';
import {BreadcrumbsComponent} from '../../../shared/breadcrumbs/breadcrumbs.component';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {BlogService} from '../../../core/services/blog.service';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-new',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    FormsModule,
    TranslatePipe,
    RouterLink
  ],
  templateUrl: './new.component.html',
  styleUrl: './new.component.scss'
})
export class NewComponent implements OnInit, AfterViewInit
{
  breadCrumbItems!: Array<{}>;
  constructor(private blogService:BlogService) {
    this.breadCrumbItems = [{ label: 'Administrator' }, { label: 'New', active: true }];
    document.getElementById('elmLoader')?.classList.remove('d-none');
  }
  linkCreate = '/admin/new/create';
  searchTerm: string = '';
  page = 1;
  pageSize = 10;
  ngOnInit(): void {
    this.fetchBlogs();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      document.getElementById('elmLoader')?.classList.add('d-none');
    }, 1000);
  }


  searchInput() {

  }

  fetchBlogs() {
    this.blogService.getBlogs(this.searchTerm, this.page, this.pageSize).subscribe(
      {
        next: (data) => {
          console.log(data);
        },
        error: (error) => {
          console.log(error);
        }
      });
  }
}
