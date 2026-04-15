import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TipoDespesaComponent } from './tipo-despesa/tipo-despesa.component';

const routes: Routes = [
  { path: 'tipo-despesas', component: TipoDespesaComponent },
  { path: '', redirectTo: 'tipo-despesas', pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TipoDespesaComponent
  ]
})
export class DespesasModule { }
