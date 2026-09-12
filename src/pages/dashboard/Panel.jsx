import { Link, useNavigate } from 'react-router-dom';
import { LogOut, MonitorCog, PackagePlus } from 'lucide-react';

import { api } from '../../lib/api';
import { panelContent } from '../../data/content';

const copy = panelContent.panel;

export default function Panel() {
  const navegar = useNavigate();

  async function salir() {
    await api.salir().catch(() => null);
    navegar('/dashboard/ingresar', { replace: true });
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 font-display font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-surface text-brand-cyan">
              <MonitorCog className="h-5 w-5" aria-hidden="true" />
            </span>
            {copy.titulo}
          </div>

          <button
            type="button"
            onClick={salir}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {copy.salir}
          </button>
        </div>
      </header>

      {/* El listado de equipos entra acá en la tarea 10 del plan. Mientras tanto se
          muestra el estado vacío que pide el spec, que es lo que ve un técnico que
          entra por primera vez. */}
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-surface text-brand-cyan">
            <PackagePlus className="h-7 w-7" aria-hidden="true" />
          </span>

          <h1 className="mt-6 font-display text-2xl font-bold">{copy.vacio.titulo}</h1>
          <p className="mt-3 text-slate-400">{copy.vacio.descripcion}</p>

          <Link
            to="/dashboard/equipos/nuevo"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-cyan px-5 py-3 font-semibold text-brand-darker transition hover:brightness-110"
          >
            <PackagePlus className="h-5 w-5" aria-hidden="true" />
            {copy.vacio.boton}
          </Link>
        </div>
      </main>
    </div>
  );
}
