import {AfterViewInit, Component, NO_ERRORS_SCHEMA, OnInit} from '@angular/core';
import {BreadcrumbsComponent} from '../../../../shared/breadcrumbs/breadcrumbs.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {ActivatedRoute, Route, Router, RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
import {BlogService, IFormBlog} from '../../../../core/services/blog.service';
import {ToastrService} from 'ngx-toastr';
import {GlobalComponent} from '../../../../global-component';
import Swal from 'sweetalert2';

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

  id: number = 0;
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
    publish: {data: 1,valid: false},
    tag: { data: '', valid: false},
 }
  editorData:string = '';
  submitted:boolean = false;
  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      document.getElementById('elmLoader')?.classList.add('d-none');
      if(this.id > 0) {
        this.fetchBlog();
      }
    }, 500);
    CKEDITOR.replace('editor-description');
    CKEDITOR.config.versionCheck = false;
    CKEDITOR.instances['editor-description'].on('change', () => {
      this.editorData = CKEDITOR.instances['editor-description'].getData();
      this.form.contentHtml.data = this.editorData;
    });


  }

  fetchBlog(){
    this.blogService.getBlogById(this.id)
      .subscribe({
        next: (data) => {
          this.form = {
            title: {data: data.title, valid: true},
            content: {data: data.content, valid: true},
            contentHtml: {data: data.contentHtml, valid: true},
            publish: {data: data.published ? 1 : 0, valid: true},
            tag: {data: data.tags, valid: true}
          };
          CKEDITOR.instances['editor-description'].setData(this.form.contentHtml.data);

          if(data.image !== ''){
            document.getElementById('image-review')?.setAttribute('src', GlobalComponent.SERVE_URL+'/files/uploads/'+data.image);
            document.getElementById('image-review-container')?.classList.remove('d-none');
            }
        },
        error: (error) => {
          console.error(error);
        }
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

    if(!this.form.title.valid || !this.form.contentHtml.valid || !this.form.tag.valid || !this.form.content.valid)
    {
      return;
    }

    // ------------------ Update-------------------
    if(this.id > 0){
      this.blogService.createBlogOrUpdate(this.form, this.id).subscribe(
        {
          next: (data) => {
            this.toastr.success('Blog updated successfully');
            // this.router.navigate(['/admin/new']).then();
            Swal.fire({
              title: 'สำเร็จ',
              text: 'อัพเดทบล็อกสำเร็จ',
              icon: 'success',
              confirmButtonText: 'OK'
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/admin/new']).then();
              }
            });
          },
          error: (error) => {
            console.log(error);
            this.toastr.error('Error updating blog');
          }
        }
      );
      return;
    }
    // ------------------ Create -------------------
    // submit form
    this.blogService.createBlogOrUpdate(this.form)
      .subscribe({
        next: (data) => {
          this.toastr.success('Blog created successfully');
          Swal.fire({
            title: 'สำเร็จ',
            text: 'สร้างบล็อกสำเร็จ',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/admin/new']).then();
            }
          });

        },
        error: (error) => {
          console.error(error);
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
    let files: any = (event.target as HTMLInputElement)
    if (files.files.length > 0) {
      let file: File = files.files[0];
      let reader: FileReader = new FileReader();
      reader.onloadend = (e) => {
          document.getElementById('image-review')?.setAttribute('src', reader.result as string);
          this.blogService.imageFile = file;
      };
      reader.readAsDataURL(file);
      document.getElementById('image-review-container')?.classList.remove('d-none');
    }
  }
}
