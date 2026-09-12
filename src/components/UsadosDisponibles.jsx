import { useEffect, useState } from 'react';
import { Loader2, MessageCircle } from 'lucide-react';

import { api } from '../lib/api';
import { usadosContent as copy, buildWhatsAppLink } from '../data/content';
import UsadoCard from './UsadoCard';
import UsadoDetalle from './UsadoDetalle';

const POR_TANDA = 9;

// El id de la sección no puede ser "usados": esa ancla ya la ocupa la categoría
// "Computadores Usados" que Store.jsx saca de productCategories, y dos elementos
// con el mismo id rompen la navegación por anclas del menú.

export default function UsadosDisponibles() {
  const [equipos, setEquipos] = useState(null);
  const [error, setError] = useState(false);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [abierto, setAbierto] = useState(null);

  useEffect(() => {
    let vigente = true;

    api
      .equiposPublicos()
      .then((datos) => {
        if (vigente) setEquipos(datos.results ?? []);
      })
      .catch(() => {
        // Que esta sección falle no puede tumbar el resto de la landing: servicios,
        // tienda y testimonios no dependen de la API.
        if (vigente) {
          setEquipos([]);
          setError(true);
        }
      });

    return () => {
      vigente = false;
    };
  }, []);

  const visibles = mostrarTodos ? equipos : equipos?.slice(0, POR_TANDA);

  return (
    <section id="usados-disponibles" className="bg-brand-darker py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow text-brand-violet">{copy.eyebrow}</span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{copy.titulo}</h2>
          <p className="mt-4 text-lg text-slate-300">{copy.descripcion}</p>
        </div>

        {equipos === null ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-cyan" aria-hidden="true" />
            <span className="sr-only">Cargando los equipos disponibles…</span>
          </div>
        ) : error ? (
          <Invitacion
            titulo={copy.error.titulo}
            descripcion={copy.error.descripcion}
            boton={copy.error.boton}
            mensaje={copy.error.mensaje}
          />
        ) : equipos.length === 0 ? (
          // No quedarse en blanco: sin inventario, la sección sigue siendo una
          // oportunidad de conversación en vez de un hueco en la página.
          <Invitacion
            titulo={copy.vacio.titulo}
            descripcion={copy.vacio.descripcion}
            boton={copy.vacio.boton}
            mensaje={copy.vacio.mensaje}
          />
        ) : (
          <>
            <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibles.map((equipo) => (
                <UsadoCard key={equipo.id} equipo={equipo} onAbrir={setAbierto} />
              ))}
            </ul>

            {!mostrarTodos && equipos.length > POR_TANDA && (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => setMostrarTodos(true)}
                  className="rounded-xl border border-white/15 px-6 py-3 font-semibold text-white transition hover:border-brand-cyan"
                >
                  {copy.verMas}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {abierto && <UsadoDetalle equipo={abierto} onCerrar={() => setAbierto(null)} />}
    </section>
  );
}

function Invitacion({ titulo, descripcion, boton, mensaje }) {
  return (
    <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-white/10 bg-brand-surface p-8 text-center">
      <h3 className="font-display text-xl font-semibold">{titulo}</h3>
      <p className="mt-3 text-slate-400">{descripcion}</p>

      <a
        href={buildWhatsAppLink(mensaje)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-whatsapp px-5 py-3 font-semibold text-white transition hover:brightness-110"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        {boton}
      </a>
    </div>
  );
}
