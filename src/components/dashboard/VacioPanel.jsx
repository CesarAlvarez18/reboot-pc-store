import { Link } from 'react-router-dom';
import { PackagePlus } from 'lucide-react';

// Lo que ve un técnico que entra al módulo por primera vez. El spec pide
// explícitamente que no sea una tabla vacía: una tabla sin filas no explica nada
// ni dice qué hacer.
export default function VacioPanel({ titulo, descripcion, boton }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-surface text-brand-cyan">
        <PackagePlus className="h-7 w-7" aria-hidden="true" />
      </span>

      <h2 className="mt-6 font-display text-2xl font-bold">{titulo}</h2>
      <p className="mt-3 text-slate-400">{descripcion}</p>

      <Link
        to="/dashboard/equipos/nuevo"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-cyan px-5 py-3 font-semibold text-brand-darker transition hover:brightness-110"
      >
        <PackagePlus className="h-5 w-5" aria-hidden="true" />
        {boton}
      </Link>
    </div>
  );
}
