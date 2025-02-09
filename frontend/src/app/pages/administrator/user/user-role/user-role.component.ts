import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UserProfileService} from '../../../../core/services/user.service';
import {BreadcrumbsComponent} from '../../../../shared/breadcrumbs/breadcrumbs.component';
import {
  IRole,
  IRolesAdnPermissionResponse,
  RolePermissionService
} from '../../../../core/services/role-permission.service';
import {ToastrService} from 'ngx-toastr';
import {DatePipe} from '@angular/common';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';
import {User} from '../../../../store/Authentication/auth.models';

@Component({
  selector: 'app-user-role',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    NgbPagination
  ],
  templateUrl: './user-role.component.html',
  styleUrl: './user-role.component.scss'
})
export class UserRoleComponent implements OnInit
{
@Input() userRoleSelected!: User;
@Output() backToUserListChanged = new EventEmitter<boolean>();

  page: number = 1;
  limit: number = 10;
  roleName: string = '';
  rolesResponse: IRolesAdnPermissionResponse = {message: '', data: {roles: [],permissions:[], total: 0, totalPages: 0, currentPage: 0, limit: 0}};
  searchTerm: string = '';
  searchSubject: Subject<string> = new Subject<string>();

  breadCrumbItems: Array<{}>;
  constructor(
    private toastr: ToastrService,
    private rolePermissionService: RolePermissionService,
    private userProfileService: UserProfileService
  ) {

    this.breadCrumbItems = [
      {label: 'Administrator'},
      {label: 'User'},
      {label: 'Role', active: true},
    ];

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((searchTerm) => {
      this.searchTerm = searchTerm;
      this.fetchRoles();
    });
  }

  ngOnInit() {

    this.fetchUser();
    this.fetchRoles();
  }

  fetchUser() {
    this.userProfileService.getUserById(this.userRoleSelected.id).subscribe(
      {
        next: (response) => {
          console.log(response);
        },
        error: (error) => {
          console.log(error);
        }
      });
  }

  fetchRoles() {
    this.rolePermissionService.getRoles(this.page,this.limit, this.roleName).subscribe(
      {
        next: (response) => {
          this.rolesResponse = response;
          console.log(this.rolesResponse);
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  backToUserList() {
    this.backToUserListChanged.emit(true);
  }

  assignRoleToUser(role: IRole) {
    this.rolePermissionService.assignRoleToUser(role.id, this.userRoleSelected.id).subscribe({
      next: (response) => {
        this.toastr.success('Role assigned to user successfully');
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  revokeRoleFromUser(role: IRole) {
  }

  searchInput() {
    this.searchSubject.next(this.roleName);
  }

  isUserHasRole(role: IRole) {}

}
