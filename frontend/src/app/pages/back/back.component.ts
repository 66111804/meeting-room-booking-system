import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-back',
  standalone: true,
  imports: [],
  templateUrl: './back.component.html',
  styleUrl: './back.component.scss'
})
export class BackComponent implements OnInit
{
  constructor(
    private route: Router,
  ) {}

  ngOnInit() {
    // back to previous page
    const previousUrl = localStorage.getItem('previousUrl');
    if (previousUrl) {
      this.route.navigateByUrl(previousUrl).then();
    } else {
      this.route.navigateByUrl('/').then();
    }
  }
}
