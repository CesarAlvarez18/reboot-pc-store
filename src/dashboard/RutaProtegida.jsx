import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { api } from '../lib/api';

// Este guardia es comodidad, no seguridad: la verificación de verdad la hace el
// backend, que responde 403 a cualquier endpoint del inventario sin sesión. Acá
// solo evitamos mostrarle una pantalla vacía a quien no ha ingresado.
export default function RutaProtegida({ children }) {
  const [usuario, setUsuario] = useState(undefined);

  useEffect(() => {
    let vigente = true;

    api
      .yo()
      .then((datos) => {
        if (vigente) setUsuario(datos.autenticado ? datos : null);
      })
      .catch(() => {
        if (vigente) setUsuario(null);
      });

    return () => {
      vigente = false;
    };
  }, []);

  if (usuario === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-dark text-slate-300">
        <Loader2 className="h-6 w-6 animate-spin text-brand-cyan" aria-hidden="true" />
        <span className="sr-only">Verificando tu sesión…</span>
      </div>
    );
  }

  if (usuario === null) {
    return <Navigate to="/dashboard/ingresar" replace />;
  }

  return typeof children === 'function' ? children(usuario) : children;
}
