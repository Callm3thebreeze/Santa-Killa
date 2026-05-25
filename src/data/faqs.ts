export type FaqItem = {
  question: string;
  answer: string;
};

export const faqs: FaqItem[] = [
  {
    question: '¿Dónde está la escuela de surf Santa Killa?',
    answer: 'Santa Killa está en El Palmar, Cádiz, junto a una de las playas más reconocidas para aprender surf en Andalucía.',
  },
  {
    question: '¿Hay clases para principiantes?',
    answer: 'Sí. Organizamos clases de surf para principiantes y también sesiones para personas que quieren mejorar técnica y confianza en el agua.',
  },
  {
    question: '¿Qué necesito llevar a mi primera clase de surf?',
    answer: 'Trae bañador o ropa cómoda, toalla, protección solar y ganas de aprender. Te orientaremos sobre el material necesario para la sesión.',
  },
  {
    question: '¿Los horarios dependen de las mareas?',
    answer: 'Sí. Ajustamos los horarios según mareas, viento y condiciones del mar para priorizar seguridad y aprendizaje.',
  },
  {
    question: '¿Puedo reservar por WhatsApp?',
    answer: 'Sí. Puedes escribirnos por WhatsApp para consultar disponibilidad, nivel, horarios y condiciones previstas para tu clase.',
  },
];
