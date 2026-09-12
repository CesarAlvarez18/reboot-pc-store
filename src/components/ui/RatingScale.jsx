// Escala de 1 a 5 para el estado estético del equipo.
//
// El spec pide que cada nivel diga qué significa: un "3" desnudo no le dice nada
// al técnico que califica ni queda consistente entre dos personas distintas. Por
// eso el significado del nivel elegido se muestra escrito debajo.

export default function RatingScale({
  id,
  etiqueta,
  opciones = [],
  valor,
  onChange,
  error,
  obligatorio = false,
}) {
  const seleccionada = opciones.find((opcion) => String(opcion.valor) === String(valor));
  const idError = error ? `${id}-error` : undefined;

  return (
    // data-error permite al formulario subir la pantalla hasta acá cuando falta.
    <div className="flex flex-col gap-1.5" data-error={error ? 'true' : undefined}>
      <span className="text-sm font-medium text-slate-300">
        {etiqueta}
        {obligatorio && <span className="ml-1 text-brand-cyan">*</span>}
      </span>

      <div
        role="radiogroup"
        aria-label={etiqueta}
        aria-describedby={idError}
        className="flex gap-2"
      >
        {opciones.map((opcion) => {
          const activa = String(opcion.valor) === String(valor);

          return (
            <button
              key={opcion.valor}
              type="button"
              role="radio"
              aria-checked={activa}
              aria-label={`${opcion.valor}: ${opcion.etiqueta}`}
              onClick={() => onChange(Number(opcion.valor))}
              className={`h-12 flex-1 rounded-xl border text-base font-semibold transition ${
                activa
                  ? 'border-brand-cyan bg-brand-cyan text-brand-darker'
                  : 'border-white/10 bg-brand-surface text-slate-300'
              }`}
            >
              {opcion.valor}
            </button>
          );
        })}
      </div>

      <p className={`text-xs ${error ? 'text-red-300' : 'text-slate-400'}`} id={idError}>
        {error ?? seleccionada?.etiqueta ?? '1 es un equipo desgastado; 5, uno como nuevo.'}
      </p>
    </div>
  );
}
