import { Component } from '@angular/core';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent {

  constructor() {
    document.getElementById('elmLoader')?.classList.remove('d-none');
  }

  ngOnInit() {
    // this.fetchRoles();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      document.getElementById('elmLoader')?.classList.add('d-none');
    }, 500);
  }
}
