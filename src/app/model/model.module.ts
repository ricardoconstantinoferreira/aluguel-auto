import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ModelCadastroComponent } from './cadastro/model-cadastro.component';
import { ListagemComponent } from './listagem/listagem.component';

const routes: Routes = [
  { path: 'cadastro', component: ModelCadastroComponent },
  { path: '', redirectTo: 'cadastro', pathMatch: 'full' },
  { path: 'listagem', component: ListagemComponent},
  { path: '', redirectTo: 'listagem', pathMatch: 'full' },
];

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes), ModelCadastroComponent]
})
export class ModelModule { }
