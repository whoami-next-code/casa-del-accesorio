import { Product, ShopSettings, whatsappUrl } from '@/lib/product';

export default function SiteFooter({
  product,
  settings,
}: {
  product: Product;
  settings: ShopSettings;
}) {
  const link = whatsappUrl(settings.whatsapp, product);

  return (
    <footer id="contacto" className="relative border-t border-line bg-bay px-6 py-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cta via-sun to-transparent" />
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <img src="/logo.png" alt="La Casa del Accesorio" className="h-16 w-auto" />
          <p className="muted text-sm mt-4 max-w-sm">
            Lunes a sábado, 10:00 a 19:00. TikTok @lacasadelaccesorio1. Fotos y giro 360 de muestra.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-steel [&_a]:hover:text-sun">
          <a href="https://www.tiktok.com/@lacasadelaccesorio1" target="_blank" rel="noreferrer">
            TikTok
          </a>
          {link ? (
            <a href={link} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          ) : (
            <span className="muted">WhatsApp pendiente</span>
          )}
          <a href="/admin" className="text-steel">
            Administración
          </a>
        </div>
      </div>
    </footer>
  );
}
