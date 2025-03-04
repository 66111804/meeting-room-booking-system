import {AfterViewInit, Component, NO_ERRORS_SCHEMA, OnInit} from '@angular/core';
import {BreadcrumbsComponent} from '../../../../shared/breadcrumbs/breadcrumbs.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {ActivatedRoute, Route, Router, RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
import {BlogService, IFormBlog} from '../../../../core/services/blog.service';
import {ToastrService} from 'ngx-toastr';

declare var CKEDITOR: any;
@Component({
  selector: 'app-new-create',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    CommonModule,
    FormsModule,
    TranslatePipe,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './new-create.component.html',
  styleUrl: './new-create.component.scss',
})
export class NewCreateComponent implements OnInit, AfterViewInit
{
  breadCrumbItems!: Array<{}>;

  id: number | undefined;
  constructor(private blogService: BlogService,
              private route: ActivatedRoute,
              private toastr: ToastrService,
              private router: Router) {
    // get params from url
    this.id = parseInt(this.route.snapshot.params['id'] || '0');
    // console.log({id: this.id});
    this.breadCrumbItems = [{ label: 'Administrator' }, { label: 'New', active: true }];
    document.getElementById('elmLoader')?.classList.remove('d-none');
  }
  /** DB Schema
   *   id          Int      @id @default(autoincrement())
   *   title       String
   *   content     String
   *   contentHtml String   @db.LongText
   *   published   Boolean  @default(false)
   *   tags        String   @default("") // comma separated tags
   *   author      User?    @relation(fields: [authorId], references: [id])
   *   authorId    Int?
   *   createdAt   DateTime @default(now())
   *   updatedAt   DateTime @updatedAt
   *   */
  form: IFormBlog = {
    title: {data: '', valid: false},
    content: {data: '', valid: false},
    contentHtml: {data: '', valid: false},
    publish: {data: 0,valid: false},
    tag: { data: '', valid: false},
 }
  editorData:string = '';
  submitted:boolean = false;
  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      document.getElementById('elmLoader')?.classList.add('d-none');
    }, 1000);
    CKEDITOR.replace('editor-description');
    CKEDITOR.config.versionCheck = false;
    CKEDITOR.instances['editor-description'].on('change', () => {
      this.editorData = CKEDITOR.instances['editor-description'].getData();
      this.form.contentHtml.data = this.editorData;
    });

  }

  onSubmit(){
    this.submitted = true;

    // validate form
    // -------------------------------------
    if (this.form.title.data === '')
    {
      this.form.title.valid = false;
      this.toastr.error('Title is required');
    }else{
      this.form.title.valid = true;
    }
    // -------------------------------------
    if (this.form.contentHtml.data === '')
    {
      this.form.contentHtml.valid = false;
      this.toastr.error('Content is required');
    }else{
      this.form.contentHtml.valid = true;
    }
    // -------------------------------------
    if (this.form.tag.data === '')
    {
      this.form.tag.valid = false;
      this.toastr.error('Tag is required');
    }else{
      this.form.tag.valid = true;
    }
    // -------------------------------------
    if(this.form.content.data === ''){
      this.form.content.valid = false;
      this.toastr.error('Content is required');
    }else{
      this.form.content.valid = true;
    }
    console.log(this.form);
    if(!this.form.title.valid || !this.form.contentHtml.valid || !this.form.tag.valid || !this.form.content.valid)
    {
      return;
    }
    // submit form
    this.blogService.createBlogOrUpdate(this.form)
      .subscribe({
        next: (data) => {
          console.log(data);
          this.toastr.success('Blog created successfully');
          this.router.navigate(['/admin/new']).then();
        },
        error: (error) => {
          console.log(error);
          this.toastr.error('Error creating blog');
        }
      });
  }

  onEditorChange(event: any){
    this.form.contentHtml.data = event;
  }
  onPublishChange(event: any){
    this.form.publish.data = event.target.value;
  }
  onFileChange(event: any){
    // console.log(event);
    let files: any = (event.target as HTMLInputElement)
    if (files.files.length > 0) {
      let file: File = files.files[0];
      let reader: FileReader = new FileReader();
      reader.onloadend = (e) => {
          document.getElementById('image-review')?.setAttribute('src', reader.result as string);
          // console.log(reader.result);
          this.blogService.imageFile = file;
      };
      reader.readAsDataURL(file);

      document.getElementById('image-review-container')?.classList.remove('d-none');
    }
  }
}
