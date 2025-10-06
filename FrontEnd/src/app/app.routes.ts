
import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { AgendaComponent } from './agenda/agenda-grade/agenda.component';
import { AgendaIndividualComponent } from './agenda/agenda-individual/agenda-individual.component';
import { LoginComponent } from './login/login/login.component';
import { RegisterComponent } from './login/register/register.component';
import { EsqueciSenhaComponent } from './login/esqueci-senha/esqueci-senha.component';
import { ResetarSenhaComponent } from './login/resetar-senha/resetar-senha.component';
import { FinanceiroComponent } from './financeiro/financeiro.component';
import { AlunoListaComponent } from './aluno/aluno-lista/aluno-lista.component';
import { LocalListaComponent } from './local/local-lista/local-lista.component';
import { EquiptoListaComponent } from './equipto/equipto-lista/equipto-lista.component';
import { ConfiguracoesServicosComponent } from './configuracoes-servicos/configuracoes-servicos.component';
import { AnamneseListaComponent} from './anamnese/anamnese-lista/anamnese-lista.component'
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth.guard';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redireciona a rota raiz para /home
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  /*{ path: 'agenda', component: AgendaComponent, canActivate: [AuthGuard] },*/
  { path: 'agenda', canActivate: [AuthGuard], loadComponent: () => import('./agenda/agenda-grade/agenda.component').then(m => m.AgendaComponent)},
  { path: 'agendaIndividual', canActivate: [AuthGuard], loadComponent: () => import('./agenda/agenda-individual/agenda-individual.component').then(m => m.AgendaIndividualComponent)},
  { path: 'configuracoes',  canActivate: [AuthGuard], loadComponent: () => import('./configuracoes/configuracoes.component').then(m => m.ConfiguracoesComponent)},
  { path: 'alunoLista',  canActivate: [AuthGuard], loadComponent: () => import('./aluno/aluno-lista/aluno-lista.component').then(m => m.AlunoListaComponent)},
  { path: 'localLista',  canActivate: [AuthGuard], loadComponent: () => import('./local/local-lista/local-lista.component').then(m => m.LocalListaComponent)},
  { path: 'anamneseLista',  canActivate: [AuthGuard], loadComponent: () => import('./anamnese/anamnese-lista/anamnese-lista.component').then(m => m.AnamneseListaComponent)},
  { path: 'configuracoesServicos',  canActivate: [AuthGuard], loadComponent: () => import('./configuracoes-servicos/configuracoes-servicos.component').then(m => m.ConfiguracoesServicosComponent)},
  { path: 'equiptoLista',  canActivate: [AuthGuard], loadComponent: () => import('./equipto/equipto-lista/equipto-lista.component').then(m => m.EquiptoListaComponent)},
  { path: 'financeiro', component: FinanceiroComponent, canActivate: [AuthGuard]},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'esqueci-senha', component: EsqueciSenhaComponent },
  { path: 'resetar-senha', component: ResetarSenhaComponent },
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