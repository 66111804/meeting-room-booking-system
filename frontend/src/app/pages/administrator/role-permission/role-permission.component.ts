// noinspection SpellCheckingInspection

import {AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {BreadcrumbsComponent} from '../../../shared/breadcrumbs/breadcrumbs.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {
  IRole,
  IRolesAdnPermissionResponse,
  RolePermissionService
} from '../../../core/services/role-permission.service';
import {DatePipe, NgForOf} from '@angular/common';
import {ToastrService} from 'ngx-toastr';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';
import {PermissionComponent} from './permission/permission.component';

@Component({
  selector: 'app-role-permission',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    NgbPagination,
    PermissionComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './role-permission.component.html',
  styleUrl: './role-permission.component.scss'
})
export class RolePermissionComponent  implements OnInit, AfterViewInit
{
  breadCrumbItems!: Array<{}>;
  searchTerm: string = '';
  searchSubject: Subject<string> = new Subject<string>();

  page: number = 1;
  limit: number = 10;
  roleName: string = '';
  rolesResponse: IRolesAdnPermissionResponse = {message: '', data: {roles: [],permissions:[], total: 0, totalPages: 0, currentPage: 0, limit: 0}};

  roleSelected?: IRole | null;

  // noinspection JSUnusedLocalSymbols
  constructor(
    private modalService: NgbModal,
    private rolePermissionService: RolePermissionService,
    private toastr: ToastrService
  )
  {
    this.breadCrumbItems = [{ label: 'Administrator' }, { label: 'Role', active: true }];
    document.getElementById('elmLoader')?.classList.remove('d-none');

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((searchTerm) => {
      // this.searchTerm = searchTerm;
      this.fetchRoles();
    });
  }

  ngOnInit() {
    this.fetchRoles();
  }
  fetchRoles() {
    this.rolePermissionService.getRoles(this.page,this.limit, this.searchTerm).subscribe(
      {
        next: (response) => {
          this.rolesResponse = response;
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  ngAfterViewInit() {
    document.getElementById('elmLoader')?.classList.add('d-none');
  }

  searchInput() {
    this.searchSubject.next(this.searchTerm);
  }

  openModal(content: any) {
    this.roleName = '';
    this.modalService.open(content, { centered: true });
  }

  onCreateRole() {
    if (this.roleName === '') {
      this.toastr.error('Role name is required');
      return;
    }
    this.rolePermissionService.createRole(this.roleName).subscribe({
      next: (response) => {
        console.log(response);
        this.modalService.dismissAll();
        this.fetchRoles();
        this.toastr.success('Role created successfully');
      },
      error: (error) => {
        console.error(error.error.message);
        this.toastr.error(error.error.message);
      }
    });

  }

  getRoles(event: any) {
    console.log(event);

    this.fetchRoles();
  }

  selectRole(role: IRole) {
    this.roleSelected = role;
  }

  backToRoleListChange() {
    this.roleSelected = null;
    this.searchSubject.next(this.searchTerm);
  }

  roleChange(role: IRole) {
    this.roleSelected = role;
    // this.fetchRoles();
  }
}
