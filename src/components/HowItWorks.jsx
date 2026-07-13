import { MessageCircle, CalendarCheck, PackageCheck } from 'lucide-react';
import { steps } from '../data/content';

const icons = { MessageCircle, CalendarCheck, PackageCheck };

export default function HowItWorks() {
  return (
    <section id="nosotros" className="bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">Proceso</span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            ¿Cómo funciona nuestro servicio?
          </h2>
          <p className="mt-4 text-lg text-slate-600">Simple, rápido y sin complicaciones. Tres pasos y listo.</p>
        </div>

        <ol className="mt-16 grid gap-10 sm:grid-cols-3">
          {steps.map(({ number, title, description, icon }, index) => {
            const Icon = icons[icon];
            return (
              <li key={number} className="relative flex flex-col items-center text-center">
                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-8 hidden h-0.5 w-full -translate-y-1/2 bg-gradient-to-r from-brand-violet/40 to-brand-cyan/40 sm:block"
                    style={{ left: '60%' }}
                  />
                )}
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-dark text-brand-cyan shadow-lg">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-cyan text-xs font-bold text-brand-darker">
                    {number}
                  </span>
                </span>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-600">{description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
