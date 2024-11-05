import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  empId: string = ''
  password: string = ''
  constructor(private readonly authService: AuthService, private readonly router: Router)
  {}

  ngOnInit() {
  }

  login(){
    this.authService.login(this.empId, this.password).subscribe((res) => {
      if (res && res.token) {
        this.router.navigate(['/home']);
      }
    });
  }

}
