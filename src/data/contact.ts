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
  location: 'El Palmar, Cádiz',
  mapUrl: 'https://www.google.com/maps?q=El%20Palmar%2C%20Cadiz&output=embed',
  mapsExternalUrl: 'https://www.google.com/maps/search/?api=1&query=El%20Palmar%2C%20Cadiz',
  latitude: 36.2246,
  longitude: -6.0617,
};
