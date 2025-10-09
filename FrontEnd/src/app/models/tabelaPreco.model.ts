export interface TabelaPreco {
  id: number;
  personalid: number;
  servicoid: number;
  servico: string;
  localid: number;
  local:string;
  valor: number;
  planoid: number;
  plano: string;
  frequenciaid: number;
  frequencia: string;
  ativo: boolean;
}