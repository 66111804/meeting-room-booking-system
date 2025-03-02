import {AfterViewInit, Component, NO_ERRORS_SCHEMA, OnInit} from '@angular/core';
import {BreadcrumbsComponent} from '../../../../shared/breadcrumbs/breadcrumbs.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';

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

  constructor() {
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
  form: any = {
    title: {data: '', valid: false},
    content: {data: '', valid: false},
    contentHtml: {data: '', valid: false},
    published: {data: false, valid: false},
    tags: {data: '', valid: false},
  }
  editorData:string = '';

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
      // console.log('Updated Content:', this.editorData);
      this.form.contentHtml.data = this.editorData;
    });

  }

  onSubmit(){}

  onEditorChange(event: any){
    this.form.contentHtml.data = event;
    console.log(event);
  }
}
