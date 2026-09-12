// Lista desplegable del formulario de inventario.
//
// Casi todos los campos del equipo se eligen de una lista y no se escriben: es lo
// que hace que dos técnicos registrando el mismo modelo produzcan exactamente la
// misma descripción. Este componente existe para no repetir esa lógica ocho veces.

export default function SelectDropdown({
  id,
  etiqueta,
  opciones = [],
  valor,
  onChange,
  error,
  ayuda,
  obligatorio = false,
  placeholder = 'Selecciona una opción',
}) {
  const idError = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {etiqueta}
        {obligatorio && <span className="ml-1 text-brand-cyan">*</span>}
      </label>

      <select
        id={id}
        value={valor ?? ''}
        onChange={(evento) => onChange(evento.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={idError}
        // min-h-[3rem] y text-base: área cómoda para el pulgar, y 16px evita que
        // el navegador del celular haga zoom al enfocar el campo.
        className={`min-h-[3rem] rounded-xl border bg-brand-surface px-4 text-base text-white outline-none transition focus:border-brand-cyan ${
          error ? 'border-red-400' : 'border-white/10'
        }`}
      >
        <option value="">{placeholder}</option>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>

      {ayuda && !error && <p className="text-xs text-slate-500">{ayuda}</p>}
      {error && (
        <p id={idError} className="text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
