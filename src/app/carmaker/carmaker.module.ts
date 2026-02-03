import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CarmakerCadastroComponent } from './cadastro/carmaker-cadastro.component';

const routes: Routes = [
  { path: 'cadastro', component: CarmakerCadastroComponent },
  { path: '', redirectTo: 'cadastro', pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    CarmakerCadastroComponent
  ]
})
export class CarmakerModule { }
