import { Star, Quote } from 'lucide-react';
import { testimonials } from '../data/content';

export default function Testimonials() {
  return (
    <section id="testimonios" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">Testimonios</span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">Clientes que confían en nosotros</h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map(({ name, role, quote, rating }) => (
            <figure
              key={name}
              className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
            >
              <Quote className="h-8 w-8 text-brand-violet/40" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-700">
                “{quote}”
              </blockquote>
              <div
                className="mt-4 flex gap-0.5"
                role="img"
                aria-label={`Calificación: ${rating} de 5 estrellas`}
              >
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                ))}
              </div>
              <figcaption className="mt-4 border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold text-slate-900">{name}</p>
                <p className="text-xs text-slate-500">{role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
