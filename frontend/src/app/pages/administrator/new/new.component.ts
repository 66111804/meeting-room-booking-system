import {AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {BreadcrumbsComponent} from '../../../shared/breadcrumbs/breadcrumbs.component';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {BlogService, IBlogResponse} from '../../../core/services/blog.service';
import {Router, RouterLink} from '@angular/router';
import {GlobalComponent} from '../../../global-component';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-new',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    FormsModule,
    TranslatePipe,
    RouterLink,
    NgbPagination
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './new.component.html',
  styleUrl: './new.component.scss'
})
export class NewComponent implements OnInit, AfterViewInit
{
  breadCrumbItems!: Array<{}>;
  constructor(private blogService:BlogService,
              private router:Router,
              private modalService: NgbModal)
  {
    this.breadCrumbItems = [{ label: 'Administrator' }, { label: 'New', active: true }];
    document.getElementById('elmLoader')?.classList.remove('d-none');
  }
  linkCreate = '/admin/new/create';
  linkEdit = '/admin/new/:id/edit';
  searchTerm: string = '';
  page = 1;
  pageSize = 10;
  newResponse: IBlogResponse =
    {
      blogs: [],
      total: 0,
      totalPages: 0,
    };
  ngOnInit(): void {
    this.fetchBlogs();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      document.getElementById('elmLoader')?.classList.add('d-none');
    }, 500);
  }

  searchInput() {

  }

  fetchBlogs() {
    this.blogService.getBlogs(this.searchTerm, this.page, this.pageSize).subscribe(
      {
        next: (data) => {
          this.newResponse = data;
        },
        error: (error) => {
          console.log(error);
          this.newResponse = {
            blogs: [],
            total: 0,
            totalPages: 0
          }
        }
      });
  }

  protected readonly GlobalComponent = GlobalComponent;

  editNew(id: number) {
    this.router.navigate([this.linkEdit.replace(':id', id.toString())]).then();
  }

  changePage(){
    this.fetchBlogs();
  }

  idSelected: number = 0;
  deleteBlog(){
    if(this.idSelected > 0){
      this.blogService.deleteBlog(this.idSelected).subscribe({
        next: (response) => {
          this.fetchBlogs();
          this.modalService.dismissAll();
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }

  confirm(content: any,id:number) {
    this.idSelected = id;
    this.modalService.open(content,{ centered: true})
  }
}

