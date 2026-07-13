import { ArrowRight } from 'lucide-react';
import { productCategories, buildWhatsAppLink } from '../data/content';

export default function Store() {
  return (
    <section id="tienda" className="relative overflow-hidden bg-brand-dark py-20 text-white sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_0%,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-brand-violet/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow text-brand-cyan">Tienda</span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Encuentra el computador ideal para ti</h2>
          <p className="mt-4 text-lg text-slate-300">
            Nuevos, usados con garantía o gamer a la medida: elige tu categoría y arma el equipo perfecto.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {productCategories.map((category) => (
            <div
              key={category.id}
              id={category.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-brand-surface"
            >
              <img
                src={category.image}
                alt={`Categoría ${category.title} en Reboot PC Store`}
                width="640"
                height="480"
                loading="lazy"
                className="h-48 w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-semibold">{category.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{category.tagline}</p>

                <ul className="mt-6 flex flex-1 flex-col gap-4">
                  {category.items.map((item) => (
                    <li
                      key={item.name}
                      className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <div>
                        <p className="font-display text-sm font-semibold text-white">{item.name}</p>
                        <p className="mt-1 text-xs text-slate-400">{item.specs}</p>
                      </div>
                      <a
                        href={buildWhatsAppLink(
                          `Hola, quiero comprar/cotizar el equipo "${item.name}" (${item.specs}).`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-brand-cyan px-3 py-2 text-xs font-semibold text-brand-darker transition hover:brightness-110"
                      >
                        {item.cta}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
