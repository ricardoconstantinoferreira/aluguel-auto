import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';


const routes: Routes = [
  { 
    path: 'login', 
    loadChildren: () => import('./auth/login.module').then(m => m.LoginModule) 
  },
  { 
    path: 'reset-password', 
    loadChildren: () => import('./auth/reset-password.module').then(m => m.ResetPasswordModule) 
  },
  { 
    path: 'carmaker', 
    loadChildren: () => import('./carmaker/carmaker.module').then(m => m.CarmakerModule) ,
    canActivate: [AuthGuard]
  },
  { 
    path: 'model', 
    loadChildren: () => import('./model/model.module').then(m => m.ModelModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'clientes', 
    loadChildren: () => import('./clientes/clientes.module').then(m => m.ClientesModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
