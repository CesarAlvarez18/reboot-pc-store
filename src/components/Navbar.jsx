import { useState } from 'react';
import { Menu, X, MonitorCog } from 'lucide-react';
import { navLinks } from '../data/content';
import WhatsAppButton from './WhatsAppButton';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-cyan focus:px-4 focus:py-2 focus:text-brand-darker"
      >
        Saltar al contenido principal
      </a>
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
      >
        <a href="#" className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-dark text-brand-cyan">
            <MonitorCog className="h-5 w-5" aria-hidden="true" />
          </span>
          Reboot PC Store
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-slate-600 transition hover:text-brand-violet"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <WhatsAppButton />
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 md:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </nav>

      {isOpen && (
        <div id="mobile-menu" className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
          <ul className="flex flex-col gap-3 pt-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-1 text-sm font-medium text-slate-700 hover:text-brand-violet"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <WhatsAppButton className="w-full" />
          </div>
        </div>
      )}
    </header>
  );
}
