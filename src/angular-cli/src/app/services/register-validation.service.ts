import { Injectable, Inject } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class RegisterValidationService {

  private url:string = 'http://localhost:3000/user/verify';

  constructor(
    private http: HttpClient
  ) {}
  validationEmail(email:string):Observable<response>{
    let query:string = this.url+'?email='+ email;
    return  this.http.get<response>(query);
  }
  validationUsername(username:string):Observable<response>{
    let query:string = this.url+'?username='+ username;
    return  this.http.get<response>(query)
  }
}
interface response {
    success: boolean
}
