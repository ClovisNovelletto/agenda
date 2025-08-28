export interface Appointment {
  agenda_id: BigInteger;
  /*stitulo: string;*/
  descricao?: string;
  date: Date;
  hour: string;
  start: Date; // ou Date, se você converter na hora de usar
  alunoid: number;
  aluno: string;
  localid: number;
  local: string;
  personalid: number;
  statusid: number;
  servicoid: number;
  servico: string;
  equiptoid: number;
  equipto: string;
  /*personalid: number;*/
}
