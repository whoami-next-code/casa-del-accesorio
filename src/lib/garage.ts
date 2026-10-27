export type GaragePartId =
  | 'spoiler'
  | 'luces'
  | 'rines'
  | 'splitter'
  | 'faldones'
  | 'difusor'
  | 'escape'
  | 'capo';

export type GarageVariant = { name: string; price: number; hex: string };

export type GaragePart = {
  id: GaragePartId;
  sku: string;
  name: string;
  category: string;
  tag: string;
  blurb: string;
  specs: string[];
  variants: GarageVariant[];
  chip: string;
  photo: string;
};

export const GARAGE_PARTS: GaragePart[] = [
  {
    id: 'spoiler',
    sku: 'LCDA-ALE-001',
    name: 'Alerón GT elevado',
    category: 'Alerones',
    tag: 'Equipo montado',
    chip: 'Alerón GT',
    photo: '/photos/parts/spoiler.jpg',
    blurb:
      'Ala tipo pista con pedestales altos y labio de carbono. Ya está sobre el maletero de muestra; el calce se confirma con tu auto.',
    specs: ['Soportes elevados', 'Labio de carbono', 'Ángulo 0–12°', 'Montaje en taller'],
    variants: [
      { name: 'GT Negro', price: 450, hex: '#1a1c20' },
      { name: 'GT Carbono', price: 520, hex: '#3a3d44' },
      { name: 'Pista Rojo', price: 490, hex: '#d81b2a' },
      { name: 'Pista Azul', price: 490, hex: '#1763e8' },
    ],
  },
  {
    id: 'luces',
    sku: 'LCDA-LED-001',
    name: 'Faros LED Matrix + DRL',
    category: 'Iluminación',
    tag: 'Equipo montado',
    chip: 'Faros LED',
    photo: '/photos/parts/luces.jpg',
    blurb: 'Proyector aftermarket con cuchilla DRL. El frente de muestra ya lleva el kit; el calce se confirma con tu generación.',
    specs: ['6500K', 'DRL en tira', 'IP67', 'Secuencial opcional'],
    variants: [
      { name: 'Blanco Frío', price: 260, hex: '#f4fbff' },
      { name: 'Ice Blue', price: 290, hex: '#66e0ff' },
      { name: 'Ámbar Rally', price: 280, hex: '#ffb300' },
      { name: 'Verde Neón', price: 310, hex: '#39ff88' },
    ],
  },
  {
    id: 'rines',
    sku: 'LCDA-RIN-017',
    name: 'Rines forjados cóncavos',
    category: 'Rines',
    tag: 'Equipo montado',
    chip: 'Rines',
    photo: '/photos/parts/rines.jpg',
    blurb: 'Juego de 4 forjados cóncavos, perfil bajo. Medida y centrado se confirman con fotos del buje.',
    specs: ['17x8 cóncavo', '5x100 / 5x114.3 a cotizar', 'Juego de 4', 'Neumático 225/40'],
    variants: [
      { name: 'Gunmetal', price: 1280, hex: '#8b93a0' },
      { name: 'Dorado Racing', price: 1390, hex: '#d4a017' },
      { name: 'Plata Pulida', price: 1320, hex: '#cfd6e0' },
      { name: 'Blanco Rally', price: 1280, hex: '#f3f5f8' },
    ],
  },
  {
    id: 'splitter',
    sku: 'LCDA-SPL-010',
    name: 'Splitter y canards',
    category: 'Body kit',
    tag: 'Equipo montado',
    chip: 'Splitter',
    photo: '/photos/parts/splitter.jpg',
    blurb: 'Labio frontal con canards laterales. Baja la línea del parachoques del auto de muestra.',
    specs: ['ABS / carbono', 'Canards incluidos', 'Montaje con tornillos', 'Pintable'],
    variants: [
      { name: 'Negro Satinado', price: 320, hex: '#3e424a' },
      { name: 'Rojo Acento', price: 290, hex: '#d81b2a' },
      { name: 'Cian Acento', price: 290, hex: '#00b8d4' },
    ],
  },
  {
    id: 'faldones',
    sku: 'LCDA-KIT-002',
    name: 'Faldones laterales',
    category: 'Body kit',
    tag: 'Equipo montado',
    chip: 'Faldones',
    photo: '/photos/parts/faldones.jpg',
    blurb: 'Juego izq/der que cierra el kit entre splitter y difusor. Requiere prueba en el umbral.',
    specs: ['ABS reforzado', 'Juego izq/der', 'Línea continua del kit', 'Pintable'],
    variants: [
      { name: 'Negro Satinado', price: 210, hex: '#3e424a' },
      { name: 'Rojo Acento', price: 230, hex: '#d81b2a' },
      { name: 'Blanco', price: 210, hex: '#f4f6f8' },
    ],
  },
  {
    id: 'difusor',
    sku: 'LCDA-DIF-005',
    name: 'Difusor de aletas',
    category: 'Body kit',
    tag: 'Equipo montado',
    chip: 'Difusor',
    photo: '/photos/parts/difusor.jpg',
    blurb: 'Difusor con aletas verticales y corte para doble salida. El hueco se confirma en taller.',
    specs: ['5 aletas', 'ABS / carbono', 'Corte para doble salida', 'Bajo el parachoques'],
    variants: [
      { name: 'ABS Negro', price: 240, hex: '#3e424a' },
      { name: 'Carbono', price: 460, hex: '#2c2f36' },
    ],
  },
  {
    id: 'escape',
    sku: 'LCDA-ESC-090',
    name: 'Catback doble salida',
    category: 'Escape',
    tag: 'Equipo montado',
    chip: 'Escape',
    photo: '/photos/parts/escape.jpg',
    blurb: 'Catback inox con puntas negras duales en el difusor. Sonido y calce se confirman por generación.',
    specs: ['Tubo 2.5–3"', 'Inox 304', 'Puntas duales negras', 'Válvula opcional'],
    variants: [
      { name: 'Puntas Negras', price: 710, hex: '#3a3a3a' },
      { name: 'Puntas Cromo', price: 690, hex: '#dde3ee' },
      { name: 'Puntas Quemadas', price: 740, hex: '#8a7ad4' },
    ],
  },
  {
    id: 'capo',
    sku: 'LCDA-CAP-020',
    name: 'Capó carbono con ventilas',
    category: 'Capós',
    tag: 'Equipo montado',
    chip: 'Capó',
    photo: '/photos/parts/capo.jpg',
    blurb: 'Capó twill con dos extractores. El cierre y los seguros se prueban en el auto.',
    specs: ['Twill de carbono', 'Dos extractores', 'Peso menor al original', 'Pestillos de taller'],
    variants: [
      { name: 'Carbono Twill', price: 980, hex: '#2a2a2e' },
      { name: 'Blanco', price: 620, hex: '#f4f6f8' },
      { name: 'Rojo', price: 680, hex: '#c4121f' },
    ],
  },
];

export const GARAGE_PAINTS = [
  { id: 'volt', name: 'Azul Eléctrico', hex: '#1763e8' },
  { id: 'passion', name: 'Rojo Pasión', hex: '#c4121f' },
  { id: 'pearl', name: 'Blanco Perla', hex: '#f4f6f8' },
  { id: 'nardo', name: 'Gris Nardo', hex: '#9aa1ab' },
  { id: 'racing', name: 'Amarillo Racing', hex: '#f2c200' },
  { id: 'silver', name: 'Plata', hex: '#c5ccd4' },
];

export function partById(id: GaragePartId) {
  return GARAGE_PARTS.find((item) => item.id === id)!;
}
