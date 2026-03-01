import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlugarCarrosComponent } from './alugar-carros/alugar-carros.component';
import { CarBuyComponent } from './car-buy/car-buy.component';

const routes: Routes = [
  { path: 'alugar-carros', component: AlugarCarrosComponent },
  { path: 'car-buy', component: CarBuyComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuyRoutingModule { }
