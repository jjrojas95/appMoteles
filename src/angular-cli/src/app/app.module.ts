import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FlashMessagesModule,FlashMessagesService } from 'angular2-flash-messages';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';

import { RegisterValidationService } from './services/register-validation.service';
import { RegisterCurrentUserService } from './services/register-current-user.service';
import { LoginService } from './services/login.service';

import { AuthGuard } from './guards/auth.guard';
import { RegisterCurrentUserValidationComponent } from './components/register-current-user-validation/register-current-user-validation.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    RegisterComponent,
    LoginComponent,
    RegisterCurrentUserValidationComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    FlashMessagesModule.forRoot()
  ],
  providers: [RegisterValidationService,
              RegisterCurrentUserService,
              LoginService,
              FlashMessagesService,
              AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
