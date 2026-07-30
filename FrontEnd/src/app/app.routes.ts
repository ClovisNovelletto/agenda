
import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { AgendaComponent } from './agenda/agenda-grade/agenda.component';
import { AgendaIndividualComponent } from './agenda/agenda-individual/agenda-individual.component';
import { LoginComponent } from './login/login/login.component';
import { RegisterComponent } from './login/register/register.component';
import { EsqueciSenhaComponent } from './login/esqueci-senha/esqueci-senha.component';
import { ResetarSenhaComponent } from './login/resetar-senha/resetar-senha.component';
import { VerifyEmailComponent } from './login/verify-email/verify-email.component';
import { FinanceiroComponent } from './financeiro/financeiro.component';
import { TabelaPrecoListaComponent } from './tabelaPreco/tabelaPreco-lista/tabelaPreco-lista.component';
import { AlunoPlanoListaComponent } from './financeiro/alunoplano/alunoPlano-lista/alunoPlano-lista.component';
import { AlunoListaComponent } from './aluno/aluno-lista/aluno-lista.component';
import { LocalListaComponent } from './local/local-lista/local-lista.component';
import { TreinoListaComponent } from './treino/treino-lista/treino-lista.component';
import { AlunoTreinoListaComponent } from './treino/alunoTreino/alunoTreino-lista/alunoTreino-lista.component';
import { EquiptoListaComponent } from './equipto/equipto-lista/equipto-lista.component';
import { ConfiguracoesServicosComponent } from './configuracoes-servicos/configuracoes-servicos.component';
import { ConfiguracoesContaComponent } from './configuracoes-conta/configuracoes-conta.component';
import { AnamneseListaComponent} from './anamnese/anamnese-lista/anamnese-lista.component'
import { RecebGeralListaComponent} from './financeiro/recebimentos/geral/recebGeral-lista/recebGeral-lista.component'
import { RecebIndividualListaComponent} from './financeiro/recebimentos/individual/recebIndividual-lista.component'
import { AgendaAlunoComponent} from './acessoAluno/agenda-aluno/agenda-aluno.component'
import { RecebimentoAlunoComponent} from './acessoAluno/recebimento-aluno/recebimento-aluno.component'
import { TreinoAlunoComponent} from './acessoAluno/treino-aluno/treino-aluno.component'
import { AnamneseAlunoListaComponent} from './acessoAluno/anamnese-aluno/anamnese-lista/anamnese-lista.component'
import { ConfiguracoesAlunoComponent} from './acessoAluno/configuracoes-aluno/configuracoes-aluno.component'
import { AssinaturaComponent} from './assinatura/assinatura.component'

import { HomeComponent } from './home/home.component';
import { PdfListaComponent } from './pdfs/pdf-lista.component';
import { AuthGuard } from './auth.guard';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: 'verify-email', component: VerifyEmailComponent },
 // { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redireciona a rota raiz para /home
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  /*{ path: 'agenda', component: AgendaComponent, canActivate: [AuthGuard] },*/
  { path: 'agenda', canActivate: [AuthGuard], loadComponent: () => import('./agenda/agenda-grade/agenda.component').then(m => m.AgendaComponent)},
  { path: 'agendaIndividual', canActivate: [AuthGuard], loadComponent: () => import('./agenda/agenda-individual/agenda-individual.component').then(m => m.AgendaIndividualComponent)},
  { path: 'configuracoes',  canActivate: [AuthGuard], loadComponent: () => import('./configuracoes/configuracoes.component').then(m => m.ConfiguracoesComponent)},
  { path: 'tabelaPrecoLista',  canActivate: [AuthGuard], loadComponent: () => import('./tabelaPreco/tabelaPreco-lista/tabelaPreco-lista.component').then(m => m.TabelaPrecoListaComponent)},
  { path: 'alunoPlanoLista',  canActivate: [AuthGuard], loadComponent: () => import('./financeiro/alunoplano/alunoPlano-lista/alunoPlano-lista.component').then(m => m.AlunoPlanoListaComponent)},
  { path: 'recebGeralLista',  canActivate: [AuthGuard], loadComponent: () => import('./financeiro/recebimentos/geral/recebGeral-lista/recebGeral-lista.component').then(m => m.RecebGeralListaComponent)},  
  { path: 'recebIndividualLista',  canActivate: [AuthGuard], loadComponent: () => import('./financeiro/recebimentos/individual/recebIndividual-lista.component').then(m => m.RecebIndividualListaComponent)},  
  { path: 'alunoLista',  canActivate: [AuthGuard], loadComponent: () => import('./aluno/aluno-lista/aluno-lista.component').then(m => m.AlunoListaComponent)},
  { path: 'localLista',  canActivate: [AuthGuard], loadComponent: () => import('./local/local-lista/local-lista.component').then(m => m.LocalListaComponent)},
  { path: 'treinoLista',  canActivate: [AuthGuard], loadComponent: () => import('./treino/treino-lista/treino-lista.component').then(m => m.TreinoListaComponent)},
  { path: 'treinoAlunoLista',  canActivate: [AuthGuard], loadComponent: () => import('./treino/alunoTreino/alunoTreino-lista/alunoTreino-lista.component').then(m => m.AlunoTreinoListaComponent)},
  { path: 'anamneseLista',  canActivate: [AuthGuard], loadComponent: () => import('./anamnese/anamnese-lista/anamnese-lista.component').then(m => m.AnamneseListaComponent)},
  { path: 'pdfsLista',  canActivate: [AuthGuard], loadComponent: () => import('./pdfs/pdf-lista.component').then(m => m.PdfListaComponent)},
  { path: 'configuracoesServicos',  canActivate: [AuthGuard], loadComponent: () => import('./configuracoes-servicos/configuracoes-servicos.component').then(m => m.ConfiguracoesServicosComponent)},
  { path: 'configuracoesConta',  canActivate: [AuthGuard], loadComponent: () => import('./configuracoes-conta/configuracoes-conta.component').then(m => m.ConfiguracoesContaComponent)},
  { path: 'assinaturaCriarPgtoPix',  canActivate: [AuthGuard], loadComponent: () => import('./assinatura/assinatura.component').then(m => m.AssinaturaComponent)},
  { path: 'equiptoLista',  canActivate: [AuthGuard], loadComponent: () => import('./equipto/equipto-lista/equipto-lista.component').then(m => m.EquiptoListaComponent)},
  { path: 'financeiro', component: FinanceiroComponent, canActivate: [AuthGuard]},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'esqueci-senha', component: EsqueciSenhaComponent },
  { path: 'resetar-senha', component: ResetarSenhaComponent },

  /*acessos do aluno*/
  { path: 'agenda-Aluno', canActivate: [AuthGuard], loadComponent: () => import('./acessoAluno/agenda-aluno/agenda-aluno.component').then(m => m.AgendaAlunoComponent)},
  { path: 'recebimento-Aluno',  canActivate: [AuthGuard], loadComponent: () => import('./acessoAluno/recebimento-aluno/recebimento-aluno.component').then(m => m.RecebimentoAlunoComponent)},  
  { path: 'treino-Aluno',  canActivate: [AuthGuard], loadComponent: () => import('./acessoAluno/treino-aluno/treino-aluno.component').then(m => m.TreinoAlunoComponent)},  
  { path: 'anamnese-Aluno',  canActivate: [AuthGuard], loadComponent: () => import('./acessoAluno/anamnese-aluno/anamnese-lista/anamnese-lista.component').then(m => m.AnamneseAlunoListaComponent)},  
  { path: 'configuracoes-Aluno',  canActivate: [AuthGuard], loadComponent: () => import('./acessoAluno/configuracoes-aluno/configuracoes-aluno.component').then(m => m.ConfiguracoesAlunoComponent)},  
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

