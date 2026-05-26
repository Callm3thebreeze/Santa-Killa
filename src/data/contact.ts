export type ContactInfo = {
  businessName: string;
  phone: string;
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
  phone: '+34 600 000 000',
  email: 'hola@santakilla.com',
  whatsapp: 'https://wa.me/34600000000',
  location: 'P.º Marítimo, 11159 El Palmar de Vejer, Cádiz',
  mapUrl: 'https://www.google.com/maps?q=P.%C2%BA%20Mar%C3%ADtimo%2C%2011159%20El%20Palmar%20de%20Vejer%2C%20C%C3%A1diz&output=embed',
  mapsExternalUrl:
    'https://www.google.com/maps/search/?api=1&query=P.%C2%BA%20Mar%C3%ADtimo%2C%2011159%20El%20Palmar%20de%20Vejer%2C%20C%C3%A1diz',
  latitude: 36.2246,
  longitude: -6.0617,
};
