import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RentalRoutingModule } from './rental-routing.module';
import { RulesComponent } from './rules/rules.component';
import { RentalReturnComponent } from './rental-return/rental-return.component';


@NgModule({
  declarations: [
    RulesComponent,
    RentalReturnComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RentalRoutingModule
  ]
})
export class RentalModule { }
