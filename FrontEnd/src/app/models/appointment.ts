export interface Appointment {
  agenda_id: BigInteger;
  titulo: string;
  descricao?: string;
  date: Date;
  hour: string;
  start: Date; // ou Date, se você converter na hora de usar
  alunoId: number;
  aluno: string;
  localId: number;
  local: string;
  statusid: number;
  /*personalId: number;*/
}
