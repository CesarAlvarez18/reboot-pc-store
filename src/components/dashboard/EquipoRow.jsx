import { useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';

import { formatearPesos } from '../../lib/formato';
import { panelContent } from '../../data/content';

const copy = panelContent.listado;

const ESTILO_ESTADO = {
  borrador: 'bg-white/10 text-slate-300',
  publicado: 'bg-brand-cyan/15 text-brand-cyan',
  vendido: 'bg-brand-violet/20 text-brand-violet',
};

// Una fila del inventario interno. Es el único lugar donde el costo de compra y el
// margen se muestran: nunca salen de acá hacia el sitio público.
export default function EquipoRow({ equipo, onCambiarEstado, cambiando, error }) {
  const [fotoRota, setFotoRota] = useState(false);
  const portada = equipo.fotos?.[0];

  const acciones = {
    borrador: [{ estado: 'publicado', texto: copy.acciones.publicar }],
    publicado: [
      { estado: 'vendido', texto: copy.acciones.marcarVendido },
      { estado: 'borrador', texto: copy.acciones.despublicar },
    ],
    vendido: [{ estado: 'publicado', texto: copy.acciones.volverAPublicar }],
  }[equipo.estado];

  return (
    <li className="rounded-2xl border border-white/10 bg-brand-surface p-4">
      <div className="flex gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white/5">
          {portada && !fotoRota ? (
            <img
              src={portada.miniatura || portada.imagen}
              alt={`Foto de ${equipo.marca_visible}`}
              loading="lazy"
              onError={() => setFotoRota(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-600">
              <ImageOff className="h-6 w-6" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words font-display font-semibold">{equipo.marca_visible}</h3>
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                ESTILO_ESTADO[equipo.estado]
              }`}
            >
              {equipo.estado}
            </span>
          </div>

          <p className="mt-1 truncate text-sm text-slate-400">{equipo.resumen_specs}</p>

          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs">
            <div>
              <dt className="inline text-slate-500">{copy.precio}: </dt>
              <dd className="inline font-semibold text-white">
                ${formatearPesos(equipo.precio_venta)}
              </dd>
            </div>
            <div>
              <dt className="inline text-slate-500">{copy.costo}: </dt>
              <dd className="inline text-slate-300">${formatearPesos(equipo.costo_compra)}</dd>
            </div>
            <div>
              <dt className="inline text-slate-500">{copy.margen}: </dt>
              <dd
                className={`inline font-semibold ${
                  Number(equipo.margen) < 0 ? 'text-amber-300' : 'text-brand-cyan'
                }`}
              >
                ${formatearPesos(equipo.margen)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {acciones.map((accion) => (
          <button
            key={accion.estado}
            type="button"
            disabled={Boolean(cambiando)}
            onClick={() => onCambiarEstado(equipo.id, accion.estado)}
            className="inline-flex min-h-[2.5rem] items-center gap-2 rounded-lg border border-white/10 px-3 text-sm font-medium text-slate-200 transition hover:border-brand-cyan hover:text-white disabled:opacity-50"
          >
            {cambiando === accion.estado && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {accion.texto}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}
    </li>
  );
}
