import { Home, ShieldCheck, Cpu, Network } from 'lucide-react';
import { services } from '../data/content';

const icons = { Home, ShieldCheck, Cpu, Network };

export default function Services() {
  return (
    <section id="servicios" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">Soporte y Mantenimiento</span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Servicios técnicos en los que puedes confiar
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Cobertura completa para que tu equipo funcione siempre a tiempo, sin sorpresas.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon, title, description }) => {
            const Icon = icons[icon];
            return (
              <article
                key={title}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-brand-violet/40 hover:shadow-xl hover:shadow-violet-500/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-dark text-brand-cyan transition group-hover:bg-brand-violet group-hover:text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
