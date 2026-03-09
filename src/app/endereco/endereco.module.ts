import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { EnderecoCadastroComponent } from './cadastro/endereco-cadastro.component';

const routes: Routes = [
  { path: 'cadastro', component: EnderecoCadastroComponent },
  { path: '', redirectTo: 'cadastro', pathMatch: 'full' }
];

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes), EnderecoCadastroComponent]
})
export class EnderecoModule {}
