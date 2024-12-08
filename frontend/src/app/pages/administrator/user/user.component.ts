import {Component, OnInit} from '@angular/core';
import {BreadcrumbsComponent} from '../../../shared/breadcrumbs/breadcrumbs.component';
import {TranslatePipe} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {User, UserList, UserProfileService} from '../../../core/services/user.service';
import {of} from 'rxjs';
import {formatDateGlobal} from '../../../shared/utils/date-utils';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    TranslatePipe,
    FormsModule,
    NgbPagination,
    DatePipe
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit {
  breadCrumbItems!: Array<{}>;

  constructor(private userProfileService:UserProfileService) {
    this.breadCrumbItems = [
      { label: 'Administrator' },
      { label: 'User', active: true },
    ];
  }
  searchTerm: string = '';
  page = 1;
  pageSize = 10;
  users: User[] = [];
  totalUsers = 0;

  ngOnInit() {
    document.getElementById('elmLoader')?.classList.add('d-none');
    this.fetchUsers();
  }

  fetchUsers() {
    this.userProfileService.getAll(this.page,this.pageSize).subscribe({
      next: (res: UserList) => {
        console.log(res);
        this.users = res.users;
        this.totalUsers = res.total;
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {}
    });
  }

  formatDate(date: string) {
    return formatDateGlobal(date);
  }

  addUser() {}

  searchUser(){}

  onSort(name: string) {}

  changePage() {
    this.fetchUsers();
  }

  protected readonly of = of;
}
