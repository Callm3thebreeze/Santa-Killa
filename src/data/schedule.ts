export type ScheduleItem = {
  day: string;
  hours: string;
};

export const schedule: ScheduleItem[] = [
  { day: 'Lunes a viernes', hours: '09:00 - 19:00' },
  { day: 'Sábados', hours: '09:00 - 14:00' },
  { day: 'Domingos', hours: 'Consultar disponibilidad' },
];
