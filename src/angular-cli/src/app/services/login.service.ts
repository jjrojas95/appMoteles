import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { BodyLoginRoute } from '../models/bodyLoginRoute';
import { LoginResponseRoute } from '../models/loginResponse';

import { JwtHelperService } from '@auth0/angular-jwt';

const helper = new JwtHelperService();

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class LoginService {
  private url:string = 'http://localhost:3000/login';
  authToken: any;
  user: any;
  constructor( private http: HttpClient) { }

  loginPost(bodyLoginRoute:BodyLoginRoute):Observable<LoginResponseRoute>{
    return this.http.post<LoginResponseRoute>(this.url,bodyLoginRoute,httpOptions)
  }
  storeUserData(token,user):void{
    localStorage.setItem('id_token',token);
    localStorage.setItem('user', JSON.stringify(user) );
    this.authToken = token;
    this.user = user;
  }
  logOut():void {
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }
  loggedIn():boolean {
    this.loadToken();
    return helper.isTokenExpired(this.authToken);
  }
  loadToken():void {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }
}
