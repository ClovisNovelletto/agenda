export interface AlunoTreino {
  id: number;
  personalid: number;
  alunoid: number;
  aluno:string;
  treinoid: number;
  treino: string;
  dataini?: string;
  datafim?: string;
  ativo: boolean;
  ordem: number;
}