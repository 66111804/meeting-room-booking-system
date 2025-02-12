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
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-user-role',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    NgbPagination,
    FormsModule
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
          this.userRoleSelected.roles = response.user.roles;
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  fetchRoles() {
    this.rolePermissionService.getRoles(this.page,this.limit, this.roleName).subscribe(
      {
        next: (response) => {
          this.rolesResponse = response;
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
        this.toastr.success('บทบาทถูกกำหนดให้ผู้ใช้เรียบร้อยแล้ว');
        // Refresh the user
        this.fetchUser();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  assignRoleToUserAll(){
    this.rolePermissionService.assignRoleToUserAll(this.userRoleSelected.id).subscribe({
      next: (response) => {
        this.toastr.success('บทบาทถูกกำหนดให้ผู้ใช้เรียบร้อยแล้ว');
        // Refresh the user
        this.fetchUser();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  revokeRoleFromUser(role: IRole) {
    this.rolePermissionService.revokeRoleFromUser(role.id, this.userRoleSelected.id).subscribe({
      next: (response) => {
        this.toastr.success('เพิกถอนบทบาทจากผู้ใช้เรียบร้อยแล้ว');

        // Refresh the user
        this.fetchUser();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  revokeRoleFromUserAll(){
    this.rolePermissionService.revokeRoleFromUserAll(this.userRoleSelected.id).subscribe({
      next: (response) => {
        this.toastr.success('เพิกถอนบทบาทจากผู้ใช้เรียบร้อยแล้ว');
        // Refresh the user
        this.fetchUser();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  searchInput() {
    this.searchSubject.next(this.roleName);
  }

  isUserHasRole(role: IRole) {
    if(this.userRoleSelected.roles){
      return this.userRoleSelected.roles.some((userRole) => userRole.roleId === role.id);
    }
    return false;
  }

}
