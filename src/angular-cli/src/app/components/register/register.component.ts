import { Component, OnInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';

import { RegisterValidationService } from '../../services/register-validation.service';
import { RegisterCurrentUserService } from '../../services/register-current-user.service';

import { SendRegisterBody } from '../../models/sendRegisterBody';
import { responseBackEndRegisterCurrentUser } from '../../models/responseBackEndRegisterCurrentUser';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  name: string;
  email: string;
  username: string;
  password: string;
  validateEmail: boolean;
  validateUsername: boolean;
  registered: responseBackEndRegisterCurrentUser;


  constructor(
                private registerValidationServices: RegisterValidationService,
                private registerCurrentUserService: RegisterCurrentUserService,
                private flashMessages: FlashMessagesService,
                private router: Router
                ) { }

  ngOnInit() {
  }

  validationEmail(templateVar:any):void {
    if(templateVar.valid) this.registerValidationServices
                          .validationEmail(this.email)
                          .subscribe(res=>this.validateEmail = res.success,
                            err=>{
                            this.flashMessages.show('Algo falló, por favor intente de nuevo mas tarde o comuníquese con nosotros',
                                                  { cssClass: 'alert-danger', timeout: 3000 });
                            this.router.navigate(['']);
                          });
  }
  validationUsername(templateVar:any):void {
    if(templateVar.valid) this.registerValidationServices
                          .validationUsername(this.username)
                          .subscribe(res=>this.validateUsername = res.success,
                            err=>{
                            this.flashMessages.show('Algo falló, por favor intente de nuevo mas tarde o comuníquese con nosotros',
                                                  { cssClass: 'alert-danger', timeout: 3000 });
                            this.router.navigate(['']);
                          });
  }
  onSubmit(templateVar:any):void {
    if(templateVar.valid && this.validateEmail && this.validateUsername) {
      let body:SendRegisterBody = {
        name: this.name,
        email: this.email,
        username: this.username,
        password: this.password
      };
      this.registerCurrentUserService
      .createCurrentUser(body)
      .subscribe(res=>{
        this.registered=res;
        if(!this.registered.success) {
          if(this.registered.unique && this.registered.unique.email == false) this.validateEmail = false;
          if(this.registered.unique && this.registered.unique.username == false) this.validateUsername = false;
          this.flashMessages.show('Algo falló, por favor intente de nuevo mas tarde o comunicarce con nosotros',
                                  { cssClass: 'alert-danger', timeout: 3000 });
        } else {
          let successMessage = `Usuario registrado, favor seguir las instrucciones enviadas a su correo: ${body.email}`;
          this.flashMessages.show(successMessage, { cssClass: 'alert-success', timeout: 3000 });
          this.router.navigate(['']);
        }
      },err=>{
        this.flashMessages.show('Algo falló, por favor intente de nuevo mas tarde o comuníquese con nosotros',
                              { cssClass: 'alert-danger', timeout: 3000 });
        this.router.navigate(['']);
      });
    }
  }

}
