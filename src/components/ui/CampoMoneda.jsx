// Campo de dinero en pesos colombianos.
//
// El técnico escribe solo dígitos y ve los separadores de miles mientras teclea:
// sin eso, distinguir 1450000 de 145000 en la pantalla de un celular es fácil de
// equivocar, y ese error se publica como precio.

const formateador = new Intl.NumberFormat('es-CO');

export function formatearPesos(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || valor === '' || valor === null) return '';
  return formateador.format(numero);
}

export default function CampoMoneda({
  id,
  etiqueta,
  valor,
  onChange,
  error,
  ayuda,
  obligatorio = false,
}) {
  const idError = error ? `${id}-error` : undefined;

  function alEscribir(evento) {
    // Se guarda el número pelado; el formato es solo presentación.
    const soloDigitos = evento.target.value.replace(/\D/g, '');
    onChange(soloDigitos);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {etiqueta}
        {obligatorio && <span className="ml-1 text-brand-cyan">*</span>}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-slate-500">
          $
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={formatearPesos(valor)}
          onChange={alEscribir}
          aria-invalid={Boolean(error)}
          aria-describedby={idError}
          className={`min-h-[3rem] w-full rounded-xl border bg-brand-surface pl-8 pr-4 text-base text-white outline-none transition focus:border-brand-cyan ${
            error ? 'border-red-400' : 'border-white/10'
          }`}
        />
      </div>

      {ayuda && !error && <p className="text-xs text-slate-500">{ayuda}</p>}
      {error && (
        <p id={idError} className="text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
