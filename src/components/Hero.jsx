import { ShieldCheck, Wrench, Zap } from 'lucide-react';
import { buildWhatsAppLink } from '../data/content';

const trustBadges = [
  { icon: ShieldCheck, label: 'Garantía en repuestos y servicios' },
  { icon: Zap, label: 'Atención rápida en Medellín y Bello' },
  { icon: Wrench, label: 'Técnicos certificados' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:px-8">
        <div className="flex flex-col justify-center">
          <span className="section-eyebrow">Venta &amp; Soporte Técnico de Computadores</span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
            Tu PC en las mejores manos. Compra, repara y optimiza con{' '}
            <span className="bg-gradient-to-r from-brand-violet to-brand-cyan bg-clip-text text-transparent">
              Reboot PC Store
            </span>
            .
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-600">
            Desde reparaciones a domicilio hasta computadores gamer a la medida: un solo equipo de confianza para
            todo lo que tu PC necesita, en Medellín y Bello.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a href="#tienda" className="btn-primary">
              Ver Computadores
            </a>
            <a
              href={buildWhatsAppLink('Hola, quiero solicitar soporte técnico para mi computador.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Solicitar Soporte Técnico
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
            {trustBadges.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Icon className="h-5 w-5 text-brand-violet" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-center">
          <img
            src="https://placehold.co/640x560/0B0F1A/22D3EE?text=Reboot+PC+Store&font=raleway"
            alt="Técnico de Reboot PC Store revisando un computador de escritorio en su taller"
            width="640"
            height="560"
            loading="eager"
            className="w-full max-w-lg rounded-3xl shadow-2xl shadow-slate-900/20"
          />
        </div>
      </div>
    </section>
  );
}
