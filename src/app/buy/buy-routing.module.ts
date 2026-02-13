import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComprarCarrosComponent } from './comprar-carros/comprar-carros.component';

const routes: Routes = [
  { path: 'comprar-carros', component: ComprarCarrosComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuyRoutingModule { }
