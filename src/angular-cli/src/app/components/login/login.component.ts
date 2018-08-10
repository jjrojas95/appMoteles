import { Component, OnInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';

import { BodyLoginRoute } from '../../models/bodyLoginRoute';
import { LoginResponseRoute } from '../../models/loginResponse';

import { LoginService } from '../../services/login.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string;
  password: string;
  loginResponse: LoginResponseRoute;

  constructor(
    private _loginService:LoginService,
    private _flashMessages:FlashMessagesService,
    private router:Router
   ) { }

  ngOnInit() {
  }
  onSubmitLogin():boolean {
    if(!this.email || !this.password){
      this._flashMessages.show('Por favor llene todos los campos',
                            { cssClass: 'alert-danger', timeout: 5000 });
                            return true;
    }
    const user: BodyLoginRoute = {
      email: this.email,
      password: this.password
    };
    this._loginService.loginPost(user).subscribe(res=>{
      if(res.success) {
        let successmsg = `Bienvenido ${res.user.name}`;
        this._loginService.storeUserData(res.token,res.user);
        this._flashMessages.show(successmsg,{ cssClass: 'alert-success', timeout: 5000 });
        this.router.navigate(['']);
      } else {
        this._flashMessages.show(res.msg,{ cssClass: 'alert-danger', timeout: 5000 });
      }
    }, err => {
      this._flashMessages.show('Algo falló, por favor intente de nuevo mas tarde o comuníquese con nosotros',
                            { cssClass: 'alert-danger', timeout: 5000 });
    });
    return true
  }
}
