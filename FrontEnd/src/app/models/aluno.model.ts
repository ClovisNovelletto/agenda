export interface Aluno {
  id: number;
  nome: string;
  telefone: string;
  aludias: string;
  local: string,
  servico: string,
  email?: string;
  datanasc?: string;
  cpf?: string;
  ativo: boolean;
  diasAula: [];
  mostrarEquito: boolean;
}