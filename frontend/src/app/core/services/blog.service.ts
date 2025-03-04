import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GlobalComponent} from '../../global-component';

export interface FormField<T> {
  data: T;
  valid: boolean;
}

export interface IFormBlog {
  title: FormField<string>;
  content: FormField<string>;
  contentHtml: FormField<string>;
  publish: FormField<number>;
  tag: FormField<string>;
}


@Injectable({
  providedIn: 'root'
})
export class BlogService {

  constructor(private http: HttpClient) { }
  imageFile: File | null = null;

  getBlogs(searchTerm: string, page: number, pageSize: number) {
    return this.http.get(`${GlobalComponent.API_URL}/admin/blogs?page=${page}&limit=${pageSize}&search=${searchTerm}`);
  }

  getBlogById(id: number) {
    return this.http.get(`${GlobalComponent.API_URL}/admin/blogs/${id}`);
  }

  createBlogOrUpdate(data: IFormBlog, id: number = 0) {
    let formData = new FormData();
    formData.append('title', data.title.data);
    formData.append('content', data.content.data);
    formData.append('contentHtml', data.contentHtml.data);
    formData.append('publish', data.publish.data.toString());
    formData.append('tag', data.tag.data);
    if (this.imageFile !== null) {
      formData.append('image', this.imageFile);
    }

    if (id > 0) {
      return this.http.post(`${GlobalComponent.API_URL}/admin/blog/${id}/update`, formData);
    }
    return this.http.post(`${GlobalComponent.API_URL}/admin/blog-create`, formData);
  }
}
