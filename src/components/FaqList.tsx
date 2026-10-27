'use client';

import { useState } from 'react';
import { FAQS } from '@/lib/catalog';

export default function FaqList() {
  const [open, setOpen] = useState(0);

  return (
    <section id="preguntas" className="max-w-3xl mx-auto px-6 py-20">
      <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-8">Antes de escribir</h2>
      <div>
        {FAQS.map((item, index) => {
          const isOpen = open === index;
          return (
            <div key={item.q} className="border-t border-line">
              <button className="w-full text-left py-5 flex justify-between gap-6" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : index)}>
                <span className="font-display text-xl">{item.q}</span>
                <span aria-hidden>{isOpen ? '–' : '+'}</span>
              </button>
              {isOpen && <p className="pb-5 text-steel leading-relaxed">{item.a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
