export interface Aluno {
  id: number;
  nome: string;
  telefone: string;
  aludias: string;
  local: string,
  servico: string,
  email?: string;
  datanasc?: string;
  datainicio?: string;
  cpf?: string;
  ativo: boolean;
  diasAula: [];
  planoid: number;
  plano: string;
  frequenciaid: number;
  frequencia: string;
  mostrarEquipto: boolean;
}