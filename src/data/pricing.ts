export type PricingItem = {
  title: string;
  description: string;
  price: string;
  duration: string;
};

export const pricing: PricingItem[] = [
  {
    title: 'Clase individual',
    description: 'Sesión personalizada para avanzar a tu ritmo con atención cercana del instructor.',
    price: '45 €',
    duration: '1h 30min',
  },
  {
    title: 'Clase en grupo',
    description: 'Aprende con más personas en un ambiente cuidado, seguro y muy dinámico.',
    price: '30 €',
    duration: '1h 30min',
  },
  {
    title: 'Bono 5 clases',
    description: 'Perfecto para progresar durante varios días y consolidar técnica sobre la tabla.',
    price: '140 €',
    duration: '5 sesiones',
  },
];
