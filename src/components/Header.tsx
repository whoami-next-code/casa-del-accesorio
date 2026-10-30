'use client';

import { useState } from 'react';
import Link from 'next/link';

const LINKS = [
  { href: '/#inicio', label: 'Plaza' },
  { href: '/#catalogo', label: 'Piezas' },
  { href: '/#resultados', label: 'Resultados' },
  { href: '/#compatibilidad', label: 'Cotizar' },
];

export default function Header({ whatsapp }: { whatsapp: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-plaza border-b border-line">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cta to-sun" />
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-[5.25rem] flex justify-between items-center">
        <Link href="/" className="flex items-center shrink-0">
          <img src="/logo.png" alt="La Casa del Accesorio" className="h-14 md:h-[4.25rem] w-auto" />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-steel">
          {LINKS.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-sun">
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
