export interface AlunoPlano {
  id: number;
  personalid: number;
  alunoid: number;
  aluno:string;
  planoid: number;
  plano: string;
  frequenciaid: number;
  frequencia: string;
  tapprecoid: number;
  valortabela: number;
  valordesconto: number;
  valorreceber: number;
  diavcto: number;
  dataini?: string;
  datafim?: string;
  formapagtoid: number;
  statusid: number;
  status: string
  ativo: boolean;
}