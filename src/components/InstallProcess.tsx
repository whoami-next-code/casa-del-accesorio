import { STEPS } from '@/lib/catalog';

export default function InstallProcess() {
  return (
    <section id="instalacion" className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight max-w-xl">Cómo llega al maletero</h2>
      <ol className="grid md:grid-cols-3 gap-8 mt-12">
        {STEPS.map((step, index) => (
          <li key={step.title}>
            <span className="font-display text-sun text-3xl">{index + 1}</span>
            <h3 className="font-display text-2xl mt-3">{step.title}</h3>
            <p className="muted text-sm mt-3 leading-relaxed">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
