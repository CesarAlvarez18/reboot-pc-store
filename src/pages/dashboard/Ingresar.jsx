import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, MonitorCog } from 'lucide-react';

import { api } from '../../lib/api';
import { panelContent } from '../../data/content';

const copy = panelContent.ingreso;

export default function Ingresar() {
  const navegar = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();

    // El botón queda bloqueado mientras se envía: un doble toque impaciente no
    // dispara dos ingresos.
    if (enviando) return;

    setEnviando(true);
    setError(null);

    try {
      await api.ingresar(correo, contrasena);
      navegar('/dashboard', { replace: true });
    } catch (fallo) {
      setError(fallo.message);
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 font-display text-lg font-bold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-surface text-brand-cyan">
            <MonitorCog className="h-5 w-5" aria-hidden="true" />
          </span>
          {copy.titulo}
        </div>

        <p className="mt-2 text-sm text-slate-400">{copy.subtitulo}</p>

        <form onSubmit={enviar} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-300">
            {copy.correo}
            <input
              type="email"
              required
              autoComplete="username"
              value={correo}
              onChange={(evento) => setCorreo(evento.target.value)}
              className="rounded-xl border border-white/10 bg-brand-surface px-4 py-3 text-base text-white outline-none transition focus:border-brand-cyan"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-300">
            {copy.contrasena}
            <input
              type="password"
              required
              autoComplete="current-password"
              value={contrasena}
              onChange={(evento) => setContrasena(evento.target.value)}
              className="rounded-xl border border-white/10 bg-brand-surface px-4 py-3 text-base text-white outline-none transition focus:border-brand-cyan"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-cyan px-4 py-3 font-semibold text-brand-darker transition hover:brightness-110 disabled:opacity-60"
          >
            {enviando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {enviando ? copy.botonCargando : copy.boton}
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-500">{copy.sinCuenta}</p>

        <Link to="/" className="mt-4 inline-block text-sm text-brand-cyan hover:underline">
          {copy.volver}
        </Link>
      </div>
    </div>
  );
}
