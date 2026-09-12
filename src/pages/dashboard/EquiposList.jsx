import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, LogOut, MonitorCog, PackagePlus, Search } from 'lucide-react';

import { api } from '../../lib/api';
import { panelContent } from '../../data/content';
import EquipoRow from '../../components/dashboard/EquipoRow';
import VacioPanel from '../../components/dashboard/VacioPanel';

const copy = panelContent;

export default function EquiposList() {
  const navegar = useNavigate();

  const [equipos, setEquipos] = useState(null);
  const [errorCarga, setErrorCarga] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [cambiando, setCambiando] = useState({});
  const [erroresFila, setErroresFila] = useState({});

  async function cargar() {
    setErrorCarga(null);
    try {
      setEquipos(await api.equipos());
    } catch (fallo) {
      setEquipos([]);
      setErrorCarga(fallo.message ?? copy.listado.errorCargar);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const visibles = useMemo(() => {
    if (!equipos) return [];

    const termino = busqueda.trim().toLowerCase();

    return equipos.filter((equipo) => {
      if (filtro !== 'todos' && equipo.estado !== filtro) return false;
      if (!termino) return true;

      return (
        equipo.marca_visible.toLowerCase().includes(termino) ||
        equipo.procesador_visible.toLowerCase().includes(termino)
      );
    });
  }, [equipos, busqueda, filtro]);

  async function cambiarEstado(id, estado) {
    setCambiando((previos) => ({ ...previos, [id]: estado }));
    setErroresFila((previos) => ({ ...previos, [id]: undefined }));

    try {
      const actualizado = await api.cambiarEstado(id, estado);
      // Se refleja al instante, sin recargar: publicar tiene que sentirse inmediato
      // porque el equipo aparece en el sitio en ese mismo momento.
      setEquipos((previos) =>
        previos.map((equipo) => (equipo.id === id ? actualizado : equipo))
      );
    } catch (fallo) {
      const delServidor = fallo.campos?.estado;
      setErroresFila((previos) => ({
        ...previos,
        [id]: Array.isArray(delServidor) ? delServidor[0] : fallo.message,
      }));
    } finally {
      setCambiando((previos) => ({ ...previos, [id]: undefined }));
    }
  }

  async function salir() {
    await api.salir().catch(() => null);
    navegar('/dashboard/ingresar', { replace: true });
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 font-display font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-surface text-brand-cyan">
              <MonitorCog className="h-5 w-5" aria-hidden="true" />
            </span>
            {copy.panel.titulo}
          </div>

          <button
            type="button"
            onClick={salir}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{copy.panel.salir}</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {equipos === null ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-brand-cyan" aria-hidden="true" />
            <span className="sr-only">Cargando el inventario…</span>
          </div>
        ) : errorCarga ? (
          <div className="py-20 text-center">
            <p className="text-slate-300">{errorCarga}</p>
            <button
              type="button"
              onClick={cargar}
              className="mt-6 rounded-xl bg-brand-cyan px-5 py-3 font-semibold text-brand-darker transition hover:brightness-110"
            >
              {copy.listado.reintentar}
            </button>
          </div>
        ) : equipos.length === 0 ? (
          <VacioPanel
            titulo={copy.panel.vacio.titulo}
            descripcion={copy.panel.vacio.descripcion}
            boton={copy.panel.vacio.boton}
          />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={busqueda}
                    onChange={(evento) => setBusqueda(evento.target.value)}
                    placeholder={copy.listado.buscar}
                    aria-label={copy.listado.buscar}
                    className="min-h-[2.75rem] w-full rounded-xl border border-white/10 bg-brand-surface pl-9 pr-4 text-base text-white outline-none transition focus:border-brand-cyan"
                  />
                </div>

                <Link
                  to="/dashboard/equipos/nuevo"
                  className="inline-flex min-h-[2.75rem] shrink-0 items-center gap-2 rounded-xl bg-brand-cyan px-4 font-semibold text-brand-darker transition hover:brightness-110"
                >
                  <PackagePlus className="h-5 w-5" aria-hidden="true" />
                  <span className="hidden sm:inline">{copy.listado.nuevo}</span>
                </Link>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {copy.listado.filtros.map((opcion) => (
                  <button
                    key={opcion.valor}
                    type="button"
                    onClick={() => setFiltro(opcion.valor)}
                    className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      filtro === opcion.valor
                        ? 'bg-brand-cyan text-brand-darker'
                        : 'border border-white/10 text-slate-300'
                    }`}
                  >
                    {opcion.etiqueta}
                  </button>
                ))}
              </div>
            </div>

            {visibles.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-slate-300">{copy.listado.sinResultados.titulo}</p>
                <button
                  type="button"
                  onClick={() => {
                    setBusqueda('');
                    setFiltro('todos');
                  }}
                  className="mt-4 text-sm font-semibold text-brand-cyan hover:underline"
                >
                  {copy.listado.sinResultados.boton}
                </button>
              </div>
            ) : (
              <ul className="mt-6 flex flex-col gap-3">
                {visibles.map((equipo) => (
                  <EquipoRow
                    key={equipo.id}
                    equipo={equipo}
                    onCambiarEstado={cambiarEstado}
                    cambiando={cambiando[equipo.id]}
                    error={erroresFila[equipo.id]}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}
