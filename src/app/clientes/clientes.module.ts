import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ClientesCadastroComponent } from './cadastro/clientes-cadastro.component';

const routes: Routes = [
  { path: 'cadastro', component: ClientesCadastroComponent },
  { path: '', redirectTo: 'cadastro', pathMatch: 'full' }
];

@NgModule({
  declarations: [ClientesCadastroComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class ClientesModule { }
