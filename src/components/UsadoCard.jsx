import { useState } from 'react';
import { ImageOff, ShieldCheck } from 'lucide-react';

import { usadosContent as copy } from '../data/content';
import { formatearPesos } from '../lib/formato';

export default function UsadoCard({ equipo, onAbrir }) {
  const [fotoRota, setFotoRota] = useState(false);
  const portada = equipo.fotos?.[0];

  return (
    <li>
      <button
        type="button"
        onClick={() => onAbrir(equipo)}
        className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-brand-surface text-left transition hover:border-brand-cyan/50"
      >
        <div className="relative aspect-[4/3] w-full bg-white/5">
          {portada && !fotoRota ? (
            <img
              src={portada.miniatura || portada.imagen}
              alt={`${equipo.marca} ${equipo.resumen_specs}`}
              // Las fotos de más abajo se cargan a medida que el cliente baja: en
              // celular, con datos móviles, cargarlas todas de entrada se siente.
              loading="lazy"
              onError={() => setFotoRota(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-600">
              <ImageOff className="h-8 w-8" aria-hidden="true" />
              <span className="text-xs">{copy.fotoNoDisponible}</span>
            </div>
          )}

          {equipo.vendido && (
            <span className="absolute right-3 top-3 rounded-lg bg-brand-violet px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
              {copy.vendido}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-lg font-semibold text-white">{equipo.marca}</h3>
          <p className="mt-1 text-sm text-slate-400">{equipo.resumen_specs}</p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-lg bg-white/5 px-2.5 py-1 text-slate-300">
              {equipo.estado_estetico_texto}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-cyan" aria-hidden="true" />
              {equipo.garantia_meses} meses {copy.garantiaSufijo}
            </span>
          </div>

          <p className="mt-auto pt-5 font-display text-2xl font-bold text-brand-cyan">
            ${formatearPesos(equipo.precio_venta)}
          </p>
        </div>
      </button>
    </li>
  );
}
