import { MapPin, Mail, Phone, Facebook, Instagram, Music2, MonitorCog } from 'lucide-react';
import { socialLinks, buildWhatsAppLink } from '../data/content';

const socialIcons = { Facebook, Instagram, Music2 };

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-darker text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <a href="#" className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-cyan text-brand-darker">
                <MonitorCog className="h-5 w-5" aria-hidden="true" />
              </span>
              Reboot PC Store
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Venta y soporte técnico de computadores en Medellín y Bello. Rápidos, confiables y siempre a tu
              servicio.
            </p>
            <ul className="mt-6 flex gap-4">
              {socialLinks.map(({ label, href, icon }) => {
                const Icon = socialIcons[icon];
                return (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-brand-cyan hover:text-brand-cyan"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <nav aria-label="Enlaces del sitio">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white">Navegación</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href="#servicios" className="hover:text-brand-cyan">
                  Servicios
                </a>
              </li>
              <li>
                <a href="#tienda" className="hover:text-brand-cyan">
                  Tienda
                </a>
              </li>
              <li>
                <a href="#nosotros" className="hover:text-brand-cyan">
                  Nosotros
                </a>
              </li>
              <li>
                <a href="#testimonios" className="hover:text-brand-cyan">
                  Testimonios
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white">Contacto</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" aria-hidden="true" />
                Bello, Antioquia — Medellín, Colombia
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-brand-cyan" aria-hidden="true" />
                <a href="mailto:contacto@rebootpcstore.com" className="hover:text-brand-cyan">
                  contacto@rebootpcstore.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-brand-cyan" aria-hidden="true" />
                <a
                  href={buildWhatsAppLink('Hola, quiero más información de Reboot PC Store.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-cyan"
                >
                  +57 300 123 4567
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          © {year} Reboot PC Store. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
