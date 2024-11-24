import {Component, Input, OnInit} from '@angular/core';
import {FeatherModule} from 'angular-feather';
import {CommonModule, NgClass} from '@angular/common';
import {CountUpModule} from 'ngx-countup';
import {CountUpOptions} from 'countup.js';

@Component({
  selector: 'app-stat',
  standalone: true,
  imports: [
    CommonModule,
    FeatherModule,
    NgClass,
    CountUpModule,
  ],
  templateUrl: './stat.component.html',
  styleUrl: './stat.component.scss',

})
export class StatComponent implements OnInit
{
  @Input() title: string | undefined;
  @Input() value: any | undefined;
  @Input() icon: string | undefined;
  @Input() persantage: string | undefined;
  @Input() profit: string | undefined;
  @Input() month: string | undefined;

  constructor() { }

  ngOnInit(): void {
  }

  num: number = 0;
  option:CountUpOptions = {
    startVal: this.num,
    useEasing: true,
    duration: 2,
    decimalPlaces: 0,
  };
}
