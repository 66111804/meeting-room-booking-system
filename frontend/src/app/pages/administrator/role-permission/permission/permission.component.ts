import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {
  IRole,
  IRolesAdnPermissionResponse,
  RolePermissionService
} from '../../../../core/services/role-permission.service';
import {BreadcrumbsComponent} from '../../../../shared/breadcrumbs/breadcrumbs.component';
import {ToastrService} from 'ngx-toastr';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-permission',
  standalone: true,
  imports: [
    BreadcrumbsComponent
  ],
  templateUrl: './permission.component.html',
  styleUrl: './permission.component.scss',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class PermissionComponent implements OnInit
{
  @Input() role!: IRole;
  @Output() roleChange = new EventEmitter<IRole>();

  breadCrumbItems!: Array<{}>;

  permissions: IRolesAdnPermissionResponse = {message: '', data: {roles: [], permissions: [], total: 0, totalPages: 0, currentPage: 0, limit: 0}};

  @Output() backToRoleListChange = new EventEmitter();
  constructor(
    private rolePermissionService:RolePermissionService,
    private toastr: ToastrService
  ) {
    this.breadCrumbItems = [{ label: 'Administrator' }, { label: 'Role' }, { label: 'Permission', active: true }];
  }

  ngOnInit() {
    console.log(this.role);
    this.fetchPermissions();
  }

  fetchPermissions() {
    this.rolePermissionService.getPermissions().subscribe(
      {
        next: (response) => {
          this.permissions = response;
          console.log(this.permissions);
        },
        error: (error) => {
          console.log(error);
        }
      });

  }

  backToRoleList() {
    this.backToRoleListChange.emit(0);
  }

  isRoleHasPermission(permission: string) {
    return this.role.permissions.includes(permission);
  }

  togglePermission(permission: string,id: number) {
    if(this.role.id === 1){
      this.toastr.error('You cannot change permission for this role');
      return;
    }
    if (this.isRoleHasPermission(permission)) {
      // remove permission
      this.rolePermissionService.revokePermission(this.role.id, id).subscribe({
        next: (response) => {
          this.fetchPermissions();

          // remove permission from role
          this.role.permissions = this.role.permissions.filter((p) => p !== permission);

          this.roleChange.emit(this.role);
        },
        error: (error) => {
          console.log(error);
        }});
    } else {
      // assign permission
      this.rolePermissionService.assignPermission(this.role.id, id).subscribe({
        next: (response) => {
          this.fetchPermissions();
          // add permission to role
          this.role.permissions.push(permission);
        },
        error: (error) => {
          console.log(error);
        }});

    }
  }


  selectAllPermissions(){
    if (!this.permissions.data || !this.permissions.data.permissions) {
      return;
    }

    const permissionsRequest = this.permissions.data.permissions.map((perm) => {
      if (!this.isRoleHasPermission(perm.name)) {
        return this.rolePermissionService.assignPermission(this.role.id, perm.id);
      }
      return null;
    });

    forkJoin(permissionsRequest.filter(req => req !== null)).subscribe({
      next: (response) => {
        this.fetchPermissions();
        // add permission to role
        (this.permissions.data?.permissions ?? []).forEach((perm) => {
          if (!this.isRoleHasPermission(perm.name)) {
            this.role.permissions.push(perm.name);
          }
        });
        this.roleChange.emit(this.role);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {}});
  }

  unselectAllPermissions(){
    if (!this.permissions.data || !this.permissions.data.permissions) {
      return;
    }

    // this.permissions.data?.permissions.forEach((perm) => {
    //   if (this.isRoleHasPermission(perm.name)) {
    //     this.rolePermissionService.revokePermission(this.role.id, perm.id).subscribe({
    //       next: (response) => {
    //         this.fetchPermissions();
    //         // remove permission from role
    //         this.role.permissions = this.role.permissions.filter((p) => p !== perm.name);
    //         this.roleChange.emit(this.role);
    //       },
    //       error: (error) => {
    //         console.log(error);
    //       }});
    //   }
    // });

    const permissionsRequest = this.permissions.data.permissions.map((perm) => {
      if (this.isRoleHasPermission(perm.name)) {
        return this.rolePermissionService.revokePermission(this.role.id, perm.id);
      }
      return null;
    });

    forkJoin(permissionsRequest.filter(req => req !== null)).subscribe({
      next: (response) => {
        this.fetchPermissions();
        // remove permission from role
        (this.permissions.data?.permissions ?? []).forEach((perm) => {
          if (this.isRoleHasPermission(perm.name)) {
            this.role.permissions = this.role.permissions.filter((p) => p !== perm.name);
          }
        });
        this.roleChange.emit(this.role);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {}});

  }
}
