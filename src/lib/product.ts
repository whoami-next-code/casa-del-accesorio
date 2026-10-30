import { BRAND } from './brand';

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  price: number;
  available: boolean;
  published: boolean;
  features: string[];
  images: string[];
};

export const DEMO_PRODUCT: Product = {
  id: 'demo',
  sku: 'LCDA-ALE-001',
  name: 'Alerón Deportivo GT para Toyota Corolla',
  category: 'Alerones y spoilers',
  description:
    'Alerón elevado de línea GT para el maletero del Corolla. Cambia la silueta trasera y se cotiza según año, versión e instalación en taller.',
  price: 450,
  available: true,
  published: true,
  features: [
    'Tipo: alerón deportivo elevado',
    'Acabado demo: blanco con labio negro',
    'Ubicación: maletero posterior',
    'Compatibilidad: se confirma por año y versión',
    'Instalación: montaje en taller, no es un clip-on',
  ],
    images: ['/photos/sedan-spoiler.jpg', '/photos/sedan-rear.jpg', '/photos/sedan-orbit.jpg'],
};

export type ShopSettings = { whatsapp: string };
export const DEFAULT_SETTINGS: ShopSettings = { whatsapp: BRAND.whatsapp };

export const whatsappMessage = (name: string, sku: string) =>
  `Hola, estoy interesado en el ${name}, código ${sku}, que vi en su showroom 3D. Quisiera confirmar precio, disponibilidad e instalación.`;

export function whatsappUrl(number: string, product: Product, extra?: string) {
  const digits = number.replace(/\D/g, '');
  const text = extra || whatsappMessage(product.name, product.sku);
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : null;
}

export function compatibilityMessage(product: Product, year: string, version: string) {
  return `Hola, quiero cotizar el ${product.name}, código ${product.sku}, para un Toyota Corolla ${year} ${version}. ¿Me confirman compatibilidad, precio e instalación?`;
}
