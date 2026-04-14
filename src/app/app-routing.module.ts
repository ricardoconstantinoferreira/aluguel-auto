import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { environment } from '../environments/environment';


const routes: Routes = [
  { 
    path: '', 
    loadChildren: () => import('./auth/login.module').then(m => m.LoginModule) 
  },
  { 
    path: 'login', 
    loadChildren: () => import('./auth/login.module').then(m => m.LoginModule) 
  },
  { 
    path: 'reset-password', 
    loadChildren: () => import('./auth/reset-password.module').then(m => m.ResetPasswordModule) 
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'carmaker', 
    loadChildren: () => import('./carmaker/carmaker.module').then(m => m.CarmakerModule) ,
    canActivate: [AuthGuard]
  },
   { 
    path: 'categoria', 
    loadChildren: () => import('./categoria/categoria.module').then(m => m.CategoriaModule) ,
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
  },
  { 
    path: 'buy', 
    loadChildren: () => import('./buy/buy.module').then(m => m.BuyModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'endereco',
    loadChildren: () => import('./endereco/endereco.module').then(m => m.EnderecoModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'rental',
    loadChildren: () => import('./rental/rental.module').then(m => m.RentalModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: environment.production })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
