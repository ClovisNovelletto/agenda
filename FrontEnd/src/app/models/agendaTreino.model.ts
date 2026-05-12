import { AgendaTreinoItem } from './agendaTreinoItem.model';

export interface AgendaTreino {
  id: number;
  agendaid: number;
  alunoid: number;
  aluno: string;
  treino:string;
  servicoid: number;
  concluido: boolean;
  items: AgendaTreinoItem[];
}