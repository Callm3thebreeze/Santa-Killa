export type PricingItem = {
  title: string;
  description: string;
  price: string;
  duration: string;
};

export const pricing: PricingItem[] = [
  {
    title: 'Clase en grupo',
    description: 'Aprende con más personas en un ambiente cuidado, seguro y muy dinámico.',
    price: '35 € / per',
    duration: '1h 30min',
  },
  {
    title: 'Clase privada',
    description: 'Sesión personalizada para avanzar a tu ritmo con atención cercana del instructor.',
    price: '60 €',
    duration: '1h 30min',
  },
  {
    title: 'Bono 4 clases',
    description: 'Perfecto para progresar durante varios días y consolidar técnica sobre la tabla.',
    price: '115 €',
    duration: '4 sesiones',
  },
];
