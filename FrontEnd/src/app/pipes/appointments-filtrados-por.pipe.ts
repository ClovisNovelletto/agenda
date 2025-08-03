import { Pipe, PipeTransform } from '@angular/core';
import { Appointment } from '../models/appointment';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Pipe({
  name: 'appointmentsFiltradosPor',
  standalone: true,
  pure: false
})
export class AppointmentsFiltradosPorPipe implements PipeTransform {
  transform(appointments: Appointment[], day: Date, hour: string, minute: number): Appointment[] {
    if (!appointments || !day || !hour) return [];

    const [h] = hour.split(':');
    const target = dayjs(day).hour(+h).minute(minute).second(0).millisecond(0);

    const filtrados = appointments.filter(appt => {
      const apptDate = dayjs(appt.start);
      return apptDate.isSame(target, 'minute');
    });

    //console.log(`[Pipe] ${filtrados.length} encontrados para ${target.format('YYYY-MM-DD HH:mm')}`);
    return filtrados;
  }
}
