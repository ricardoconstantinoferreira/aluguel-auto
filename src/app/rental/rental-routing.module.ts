import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RentalReturnComponent } from './rental-return/rental-return.component';
import { RulesComponent } from './rules/rules.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'rules',
    pathMatch: 'full'
  },
  {
    path: 'rules',
    component: RulesComponent
  },
  {
    path: 'devolucao',
    component: RentalReturnComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RentalRoutingModule { }
