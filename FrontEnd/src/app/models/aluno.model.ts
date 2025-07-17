export interface Aluno {
  id: number;
  nome: string;
  telefone: string;
  aludias: string;
  local: string,
  email?: string;
  datanasc?: string;
  cpf?: string;
  ativo: boolean;
  diasAula: [];
}