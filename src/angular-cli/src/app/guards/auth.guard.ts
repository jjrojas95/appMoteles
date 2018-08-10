import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { FlashMessagesService } from 'angular2-flash-messages';
import { LoginService } from '../services/login.service';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
      private _loginService: LoginService,
      private _flashMessages: FlashMessagesService,
      private router: Router){
    }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if(!this._loginService.loggedIn()) return true
      this._flashMessages.show('Para acceder debe primero ingresar con una cuenta de usuario',
                            { cssClass: 'alert-danger', timeout: 3000 });
      this.router.navigate(['/login']);
      return false
  }
}
