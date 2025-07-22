import { Pipe, PipeTransform } from '@angular/core';
import { Appointment } from '../models/appointment';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Pipe({
  name: 'appointmentsFiltradosPor',
  standalone: true // se estiver usando standalone components
})
export class AppointmentsFiltradosPorPipe implements PipeTransform {

  transform(appointments: Appointment[], day: Date, hour: string, minute: number): Appointment[] {
    if (!appointments || !day || !hour) return [];

    const target = dayjs.utc(day).tz('America/Sao_Paulo').toDate();
    const [h] = hour.split(':');
    target.setHours(+h, minute, 0, 0);

    return appointments.filter(appt => {
      const apptDate = dayjs.utc(appt.start).tz('America/Sao_Paulo').toDate();
      return apptDate.getTime() === target.getTime();
    });
  }
}
