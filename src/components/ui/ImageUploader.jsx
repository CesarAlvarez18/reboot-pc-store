import { useRef } from 'react';
import { AlertTriangle, Camera, Check, Loader2, Star, X } from 'lucide-react';

// Selección de fotos del equipo, pensada para el celular del técnico en bodega.
//
// Valida tipo y tamaño ANTES de intentar subir, muestra el avance por foto, deja
// quitar la que salió mal y reintentar solo esa. La portada se elige con un botón
// y no arrastrando: arrastrar en un celular, de pie y con prisa, es peor.

export const MAXIMO_FOTOS = 6;
const PESO_MAXIMO_MB = 10;

export function validarArchivo(archivo) {
  if (!archivo.type.startsWith('image/')) {
    return `"${archivo.name}" no es una imagen.`;
  }

  if (archivo.size > PESO_MAXIMO_MB * 1024 * 1024) {
    const pesa = (archivo.size / 1024 / 1024).toFixed(1);
    return `"${archivo.name}" pesa ${pesa} MB y el máximo son ${PESO_MAXIMO_MB} MB.`;
  }

  return null;
}

export default function ImageUploader({
  fotos = [],
  onAgregar,
  onQuitar,
  onHacerPortada,
  onReintentar,
  error,
  maximo = MAXIMO_FOTOS,
}) {
  const entrada = useRef(null);
  const lleno = fotos.length >= maximo;

  function alElegir(evento) {
    const elegidos = Array.from(evento.target.files ?? []);
    onAgregar(elegidos.slice(0, maximo - fotos.length));
    // Permite volver a elegir el mismo archivo si el técnico lo quitó por error.
    evento.target.value = '';
  }

  return (
    <div className="flex flex-col gap-3" data-error={error ? 'true' : undefined}>
      <span className="text-sm font-medium text-slate-300">
        Fotos del estado del equipo
        <span className="ml-1 text-brand-cyan">*</span>
      </span>

      {fotos.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {fotos.map((foto, indice) => (
            <li
              key={foto.id}
              className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-brand-surface"
            >
              <img
                src={foto.preview}
                alt={`Foto ${indice + 1} del equipo`}
                className="h-full w-full object-cover"
              />

              {foto.estado === 'subiendo' && (
                <div className="absolute inset-0 flex items-center justify-center bg-brand-darker/70">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-cyan" aria-hidden="true" />
                  <span className="sr-only">Subiendo…</span>
                </div>
              )}

              {foto.estado === 'error' && (
                <button
                  type="button"
                  onClick={() => onReintentar(foto.id)}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-950/80 px-1 text-[11px] font-semibold text-red-200"
                >
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  Reintentar
                </button>
              )}

              {foto.estado === 'lista' && (
                <span className="absolute right-1 top-1 rounded-full bg-brand-cyan p-1 text-brand-darker">
                  <Check className="h-3 w-3" aria-hidden="true" />
                  <span className="sr-only">Subida</span>
                </span>
              )}

              {indice === 0 ? (
                <span className="absolute bottom-1 left-1 rounded-md bg-brand-cyan px-1.5 py-0.5 text-[10px] font-bold text-brand-darker">
                  Portada
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onHacerPortada(foto.id)}
                  className="absolute bottom-1 left-1 rounded-md bg-brand-darker/80 p-1 text-slate-200"
                  aria-label={`Hacer portada la foto ${indice + 1}`}
                >
                  <Star className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}

              <button
                type="button"
                onClick={() => onQuitar(foto.id)}
                className="absolute right-1 bottom-1 rounded-md bg-brand-darker/80 p-1 text-slate-200"
                aria-label={`Quitar la foto ${indice + 1}`}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={entrada}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={alElegir}
        className="sr-only"
      />

      <button
        type="button"
        disabled={lleno}
        onClick={() => entrada.current?.click()}
        className="inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-4 text-sm font-medium text-slate-300 transition hover:border-brand-cyan hover:text-white disabled:opacity-50"
      >
        <Camera className="h-5 w-5" aria-hidden="true" />
        {lleno ? `Máximo ${maximo} fotos` : 'Tomar o elegir fotos'}
      </button>

      <p className={`text-xs ${error ? 'text-red-300' : 'text-slate-500'}`}>
        {error ?? `Hasta ${maximo} fotos. La primera es la portada que ve el cliente.`}
      </p>
    </div>
  );
}
