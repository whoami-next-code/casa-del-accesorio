export type PaintOption = { id: string; name: string; hex: string };

export const PAINTS: PaintOption[] = [
  { id: 'volt', name: 'Azul Eléctrico', hex: '#1763e8' },
  { id: 'passion', name: 'Rojo Pasión', hex: '#c4121f' },
  { id: 'pearl', name: 'Blanco Perla', hex: '#f4f6f8' },
  { id: 'nardo', name: 'Gris Nardo', hex: '#9aa1ab' },
  { id: 'racing', name: 'Amarillo Racing', hex: '#f2c200' },
  { id: 'silver', name: 'Plata', hex: '#c5ccd4' },
];

export type CameraView = 'orbit' | 'rear' | 'spoiler' | 'side';

export const CAMERA_VIEWS: { id: CameraView; label: string }[] = [
  { id: 'orbit', label: 'Tres cuartos' },
  { id: 'side', label: 'Lateral' },
  { id: 'rear', label: 'Trasera' },
  { id: 'spoiler', label: 'Alerón' },
];

export const RELATED = [
  {
    sku: 'LCDA-RIN-017',
    name: 'Rines forjados cóncavos',
    blurb: 'Juego de 4 cóncavos como los del auto de muestra. Se cotiza según buje real.',
    price: 'Desde S/ 1,280',
  },
  {
    sku: 'LCDA-LED-001',
    name: 'Kit de luces LED',
    blurb: 'Faros y neblineros con tono frío de taller, no de vitrina genérica.',
    price: 'Desde S/ 320',
  },
  {
    sku: 'LCDA-KIT-002',
    name: 'Faldones laterales',
    blurb: 'Cierran la línea del alerón por los costados. Requiere prueba en el auto.',
    price: 'Desde S/ 590',
  },
  {
    sku: 'LCDA-ESC-090',
    name: 'Catback doble salida',
    blurb: 'Puntas duales en el difusor. Sonido y calce se confirman por generación.',
    price: 'Desde S/ 180',
  },
];

export const STEPS = [
  {
    title: 'Envías año y versión',
    body: 'Usamos el formulario o WhatsApp. Sin eso no prometemos que la pieza calce.',
  },
  {
    title: 'Confirmamos pieza y precio',
    body: 'Te devolvemos compatibilidad, tiempo de llegada e instalación en taller.',
  },
  {
    title: 'Montaje en el auto',
    body: 'Se instala en maletero. No es un accesorio que se pone y se saca en casa.',
  },
];

export const FAQS = [
  {
    q: '¿El auto 3D es un Corolla exacto?',
    a: 'Las fotos y el giro 360 son de muestra (sin marca). El calce real se confirma con fotos de tu auto y el año.',
  },
  {
    q: '¿El precio incluye instalación?',
    a: 'El monto en pantalla es demostrativo de la pieza. Instalación, pintura y pernos se cotizan aparte según el vehículo.',
  },
  {
    q: '¿Sirve para cualquier generación?',
    a: 'Hay diferencias entre E170 y E210. Por eso pedimos año y versión antes de separar el alerón.',
  },
  {
    q: '¿Puedo ir al taller a verlo?',
    a: 'Sí. Escríbenos por WhatsApp o TikTok (@lacasadelaccesorio1) y coordinamos visita.',
  },
];

export const COROLLA_YEARS = ['2014-2018', '2019', '2020-2022', '2023-2024', '2025-2026'];
export const COROLLA_TRIMS = ['1.8', '2.0', 'Hybrid', 'SE', 'XLE', 'Otra versión'];
