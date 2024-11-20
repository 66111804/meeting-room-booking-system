import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {LanguageService} from './core/services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    TranslateModule
  ],
  providers: [
    LanguageService
  ],

  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit
{
  title = 'Booking meeting room';
  lang = 'en';

  token: string = '';
  username: string = '';
  employeeId: string = '';
  userId: string = '';
  role: string = '';


  constructor(private translate: TranslateService, private languageService: LanguageService) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit() {
    this.languageService.setLanguage(this.lang);
  }
}
