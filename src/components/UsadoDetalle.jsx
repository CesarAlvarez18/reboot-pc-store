import { useEffect, useState } from 'react';
import { ImageOff, MessageCircle, ShieldCheck, X } from 'lucide-react';

import { usadosContent as copy, buildWhatsAppLink } from '../data/content';
import { formatearPesos } from '../lib/formato';

export default function UsadoDetalle({ equipo, onCerrar }) {
  const [rotas, setRotas] = useState({});

  // Cerrar con Escape, y no dejar que la página de atrás se mueva mientras el
  // detalle está abierto.
  useEffect(() => {
    function alTeclear(evento) {
      if (evento.key === 'Escape') onCerrar();
    }

    document.addEventListener('keydown', alTeclear);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = overflowPrevio;
    };
  }, [onCerrar]);

  const mensaje = `Hola, me interesa el ${equipo.marca} (${equipo.resumen_specs}) que vi en la página por $${formatearPesos(equipo.precio_venta)}.`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${equipo.marca} ${equipo.resumen_specs}`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-darker/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onCerrar}
    >
      <div
        onClick={(evento) => evento.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/10 bg-brand-surface sm:rounded-3xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-brand-surface/95 px-5 py-4 backdrop-blur">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-bold text-white">{equipo.marca}</h3>
            <p className="truncate text-xs text-slate-400">{equipo.resumen_specs}</p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label={copy.cerrar}
            // 44px es el mínimo cómodo para el pulgar; con p-2 quedaba en 36.
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* En celular las fotos se pasan deslizando; en escritorio se ven en fila. */}
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto p-5">
          {equipo.fotos.length === 0 ? (
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-white/5 text-slate-600">
              <ImageOff className="h-8 w-8" aria-hidden="true" />
            </div>
          ) : (
            equipo.fotos.map((foto, indice) => (
              <div
                key={foto.id}
                className="aspect-[4/3] w-[85%] shrink-0 snap-center overflow-hidden rounded-xl bg-white/5 sm:w-[60%]"
              >
                {rotas[foto.id] ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-600">
                    <ImageOff className="h-8 w-8" aria-hidden="true" />
                    <span className="text-xs">{copy.fotoNoDisponible}</span>
                  </div>
                ) : (
                  <img
                    src={foto.imagen}
                    alt={`Foto ${indice + 1} de ${equipo.marca}`}
                    loading="lazy"
                    onError={() => setRotas((previas) => ({ ...previas, [foto.id]: true }))}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            ))
          )}
        </div>

        <div className="px-5 pb-5">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Dato etiqueta="Procesador" valor={equipo.procesador} />
            <Dato etiqueta="Memoria RAM" valor={equipo.ram} />
            <Dato etiqueta={copy.almacenamiento} valor={equipo.almacenamiento} />
            <Dato etiqueta={copy.bateria} valor={equipo.estado_bateria} />
            <Dato etiqueta="Estado" valor={equipo.estado_estetico_texto} />
            <Dato
              etiqueta="Garantía"
              valor={`${equipo.garantia_meses} meses`}
              icono={<ShieldCheck className="h-4 w-4 text-brand-cyan" aria-hidden="true" />}
            />
          </dl>

          {equipo.notas_fallas && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {copy.notas}
              </p>
              <p className="mt-2 whitespace-pre-line break-words text-sm text-slate-300">
                {equipo.notas_fallas}
              </p>
            </div>
          )}

          <p className="mt-6 font-display text-3xl font-bold text-brand-cyan">
            ${formatearPesos(equipo.precio_venta)}
          </p>

          {/* Un equipo vendido no ofrece el botón: escribir por algo que ya no
              existe es peor que no ver el equipo. */}
          {equipo.vendido ? (
            <p className="mt-4 rounded-xl bg-brand-violet/15 px-4 py-3 text-center text-sm font-semibold text-brand-violet">
              {copy.vendido}
            </p>
          ) : (
            <a
              href={buildWhatsAppLink(mensaje)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp px-5 py-3.5 font-semibold text-white transition hover:brightness-110"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              {copy.whatsapp}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Dato({ etiqueta, valor, icono }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-2.5">
      <dt className="text-xs text-slate-500">{etiqueta}</dt>
      <dd className="mt-0.5 flex items-center gap-1.5 text-sm text-white">
        {icono}
        {valor}
      </dd>
    </div>
  );
}
