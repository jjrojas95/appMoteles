import { Component, OnInit } from '@angular/core';

import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';

import { LoginService } from '../../services/login.service';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(
    private _loginService:LoginService,
    private _flashMessages:FlashMessagesService,
    private router:Router
  ) { }

  ngOnInit() {
  }

  onLogOut():void {
    this._loginService.logOut();
    this._flashMessages.show('Hasta luego, Gracias por visitarnos',{ cssClass: 'alert-success', timeout: 5000 });
    this.router.navigate(['']);
  }
}
