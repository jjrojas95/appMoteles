import { Component, OnInit, Input } from '@angular/core';

import { ActivatedRoute,Router } from '@angular/router';

import { FlashMessagesService } from 'angular2-flash-messages';
import { RegisterCurrentUserService } from '../../services/register-current-user.service';

import { responseBackEndRegisterCurrentUser } from '../../models/responseBackEndRegisterCurrentUser';

@Component({
  selector: 'register-current-user-validation',
  templateUrl: './register-current-user-validation.component.html',
  styleUrls: ['./register-current-user-validation.component.css']
})
export class RegisterCurrentUserValidationComponent implements OnInit {

  constructor(
    private _registerCurrentUserService: RegisterCurrentUserService,
    private _flashMessages: FlashMessagesService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getUserAuth();
  }

  getUserAuth():void {
    const token: string = this.route.snapshot.paramMap.get('token');
    this._registerCurrentUserService
        .activateWithToken(token)
        .subscribe(res=>{
          if(res.success){
            this._flashMessages.show(res.msg, { cssClass: 'alert-success', timeout: 3000 });
            this.router.navigate(['/login']);
          } else {
            this._flashMessages.show(res.msg, { cssClass: 'alert-danger', timeout: 3000 });
            this.router.navigate(['']);
          }
        }, err=> {
          this._flashMessages.show('Algo falló, por favor intente de nuevo mas tarde o comuníquese con nosotros',
                                { cssClass: 'alert-danger', timeout: 3000 });
          this.router.navigate(['']);
        });
  }
}
