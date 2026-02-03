import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ResetPasswordRoutingModule } from './reset-password-routing.module';
import { ResetPasswordComponent } from './reset-password.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, ResetPasswordRoutingModule, ResetPasswordComponent]
})
export class ResetPasswordModule { }
