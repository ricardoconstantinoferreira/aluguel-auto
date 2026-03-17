import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';

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
    MatPaginatorModule,
    RentalRoutingModule
  ]
})
export class RentalModule { }
