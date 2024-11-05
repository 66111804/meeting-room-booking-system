import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of} from 'rxjs';
import config from '../../config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }


  login(empId:string, password:string):Observable<any>{
    return this.http.post<any>(`${config.apiUrl}/api/login`, {empId, password}).pipe(
      map((res: any) => {
        if (res && res.token) {
          localStorage.setItem('token', res.token);
        }
        return res;
      }),
      catchError((err) => of(err))
    );
  }

  logout(){
    localStorage.removeItem('token');
  }

  isLoggedIn(){
    return !!localStorage.getItem('token');
  }
}
