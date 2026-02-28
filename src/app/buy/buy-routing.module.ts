import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlugarCarrosComponent } from './alugar-carros/alugar-carros.component';

const routes: Routes = [
  { path: 'alugar-carros', component: AlugarCarrosComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuyRoutingModule { }
