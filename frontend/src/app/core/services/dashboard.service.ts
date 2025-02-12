// noinspection SpellCheckingInspection

import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GlobalComponent} from '../../global-component';


export type IStateResponse = IStats[];

export interface IStats {
  title: string
  value: number
  icon: string
  persantage: string
  profit: string
  month: string
}


@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http:HttpClient ) { }

  getStats(){
    return this.http.get<IStateResponse>(GlobalComponent.API_URL + '/dashboard/stats');
  }
}
