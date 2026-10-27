'use client';

import { useState } from 'react';
import Link from 'next/link';

const LINKS = [
  { href: '/#inicio', label: 'Plaza' },
  { href: '/#producto', label: 'Alerón' },
  { href: '/#catalogo', label: 'Piezas' },
  { href: '/#compatibilidad', label: 'Cotizar' },
];

export default function Header({ whatsapp }: { whatsapp: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-plaza/85 backdrop-blur-md border-b border-line">
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex justify-between items-center">
        <Link href="/" className="font-display font-bold text-lg text-ink">
          LCDA
          <span className="ml-2 font-medium text-steel text-sm">La Casa del Accesorio</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-steel">
          {LINKS.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-ink">
              {item.label}
            </a>
          ))}
          <a
            href={whatsapp || '#compatibilidad'}
            target={whatsapp ? '_blank' : undefined}
            rel={whatsapp ? 'noreferrer' : undefined}
            className="redbtn py-2 px-4"
          >
            WhatsApp
          </a>
        </nav>
        <button className="md:hidden pill py-1.5" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((v) => !v)}>
          {open ? 'Cerrar' : 'Menú'}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="md:hidden mx-4 mb-3 glass rounded-2xl px-4 py-3 flex flex-col gap-3 text-ink">
          {LINKS.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <a href={whatsapp || '#compatibilidad'} onClick={() => setOpen(false)}>
            WhatsApp
          </a>
        </nav>
      )}
    </header>
  );
}
