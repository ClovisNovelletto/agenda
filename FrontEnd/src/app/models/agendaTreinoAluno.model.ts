import { AgendaTreinoItem } from './agendaTreinoItem.model';

export interface AgendaTreinoAluno {
  id: number;
  agendaid: number;
  data: Date;
  hour: string;
  treino:string;
  ordem: number;
  concluido: boolean;
  aluno: string;
}