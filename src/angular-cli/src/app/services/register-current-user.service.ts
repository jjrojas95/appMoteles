import { Injectable,Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { SendRegisterBody } from '../models/sendRegisterBody';
import { responseBackEndRegisterCurrentUser } from '../models/responseBackEndRegisterCurrentUser';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class RegisterCurrentUserService {
  private url:string  = 'http://localhost:3000/register';

  constructor(
    private http:HttpClient,
    @Inject(DOCUMENT) private document
  ) { }

  createCurrentUser(body:SendRegisterBody):Observable<responseBackEndRegisterCurrentUser> {
    let query = this.url+'?host='+document.location.host;
    return this.http.post<responseBackEndRegisterCurrentUser>(query,body,httpOptions)
  }
  activateWithToken(token:string):Observable<responseBackEndRegisterCurrentUser> {
    let query = this.url +'/'+ token + '?host=' + document.location.host;
    return this.http.get<responseBackEndRegisterCurrentUser>(query)
  }
}
