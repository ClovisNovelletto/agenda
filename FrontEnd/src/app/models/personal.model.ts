export interface Personal {
  id: number;
  nome: string;
  hora_inicio: number;
  hora_fim: number;
  intervalo_minutos: number;
  dia0?: boolean;
  dia1?: boolean;
  dia2?: boolean;
  dia3?: boolean;
  dia4?: boolean;
  dia5?: boolean;
  dia6?: boolean;
  mostrarLocal: boolean;
  mostrarServico: boolean;
  mostrarEquipto: boolean;
}