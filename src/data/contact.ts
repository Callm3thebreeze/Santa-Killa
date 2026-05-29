export type ContactInfo = {
  businessName: string;
  phones: string[];
  email: string;
  whatsapp: string;
  location: string;
  mapUrl: string;
  mapsExternalUrl: string;
  latitude: number;
  longitude: number;
};

export const contact: ContactInfo = {
  businessName: 'Santa Killa',
  phones: ['+34 667899977', '+34 643889980'],
  email: 'santakilla.surfschool@gmail.com',
  whatsapp: 'https://wa.me/34667899977',
  location: 'P.º Marítimo, 11159 El Palmar de Vejer, Cádiz',
  mapUrl: 'https://www.google.com/maps?q=P.%C2%BA%20Mar%C3%ADtimo%2C%2011159%20El%20Palmar%20de%20Vejer%2C%20C%C3%A1diz&output=embed',
  mapsExternalUrl:
    'https://www.google.com/maps/place//data=!4m2!3m1!1s0xd0c390069bf0fe9:0x6813918320a477b4?sa=X&ved=1t:8290&hl=es-ES&ictx=111',
  latitude: 36.2246,
  longitude: -6.0617,
};
