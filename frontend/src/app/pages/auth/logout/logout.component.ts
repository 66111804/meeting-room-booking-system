import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../../core/services/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent implements OnInit
{

  constructor(private router: Router, private service: AuthenticationService) {
  }

  ngOnInit(): void {
    this.service.logout().subscribe(
      {
        next: (response) => {
          this.router.navigateByUrl('login').then();
        },
        error: (error) => {
          console.log(error);
        }
      }
    );
  }
}
