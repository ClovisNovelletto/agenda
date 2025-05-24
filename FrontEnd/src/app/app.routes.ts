
import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { AgendaComponent } from './agenda/agenda.component';
import { LoginComponent } from './login/login.component';
import { FinanceiroComponent } from './financeiro/financeiro.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth.guard';
import { AppComponent } from './app.component';


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redireciona a rota raiz para /home
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  /*{ path: 'agenda', component: AgendaComponent, canActivate: [AuthGuard] },*/
  {
    path: 'agenda',
    canActivate: [AuthGuard],
    loadComponent: () => import('./agenda/agenda.component').then(m => m.AgendaComponent)
  },
  { path: 'financeiro', component: FinanceiroComponent, canActivate: [AuthGuard]},
  { path: 'login', component: LoginComponent },
];


/*
export const routes: Routes = [
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'agenda', component: AgendaComponent, canActivate: [AuthGuard] },
  { path: 'financeiro', component: FinanceiroComponent, canActivate: [AuthGuard]},
  { path: 'login', component: LoginComponent },
];
*/
/*
{ path: 'agenda', component: AgendaComponent, canActivate: [AuthGuard] },
{ path: 'financeiro', component: FinanceiroComponent, canActivate: [AuthGuard]},
{ path: '', redirectTo: '/home', pathMatch: 'full' },
{ path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
{ path: 'login', component: LoginComponent },
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