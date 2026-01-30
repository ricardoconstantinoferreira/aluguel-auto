import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: 'login', loadChildren: () => import('./auth/login.module').then(m => m.LoginModule) },
  { path: 'reset-password', loadChildren: () => import('./auth/reset-password.module').then(m => m.ResetPasswordModule) },
  { path: 'carmaker', loadChildren: () => import('./carmaker/carmaker.module').then(m => m.CarmakerModule) },
  { path: 'model', loadChildren: () => import('./model/model.module').then(m => m.ModelModule) },
  { path: 'clientes', loadChildren: () => import('./clientes/clientes.module').then(m => m.ClientesModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
