/*
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AgendaComponent } from './agenda/agenda.component';
import { LoginComponent } from './login/login.component';
import { FinanceiroComponent } from './financeiro/financeiro.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth.guard';
import { AppComponent } from './app.component';


const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'agenda', component: AgendaComponent, canActivate: [AuthGuard]} ,
  { path: 'financeiro', component: FinanceiroComponent, canActivate: [AuthGuard]} ,
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '/login' },
];
*/

/*
export const routes: Routes = [
  { path: '', component: AppComponent,
    children: [
      { path: '', component: HomeComponent, canActivate: [AuthGuard]},
      { path: 'agenda', component: AgendaComponent, canActivate: [AuthGuard] },
      { path: 'financeiro', component: FinanceiroComponent, canActivate: [AuthGuard]},
      { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '/login' },
];
*/
/*

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' } // Redireciona para /login como padrão
];
*/
/*
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
*/