import { Navigate, Route, Routes } from 'react-router-dom';

import Landing from './pages/Landing';
import Ingresar from './pages/dashboard/Ingresar';
import EquiposList from './pages/dashboard/EquiposList';
import EquipoForm from './pages/dashboard/EquipoForm';
import RutaProtegida from './dashboard/RutaProtegida';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* El panel del inventario va en /dashboard y no en /admin: esa ruta la
          reserva Django para su propio panel de administración. */}
      <Route path="/dashboard/ingresar" element={<Ingresar />} />
      <Route
        path="/dashboard"
        element={
          <RutaProtegida>
            <EquiposList />
          </RutaProtegida>
        }
      />
      <Route
        path="/dashboard/equipos/nuevo"
        element={
          <RutaProtegida>
            <EquipoForm />
          </RutaProtegida>
        }
      />

      {/* Cualquier otra ruta vuelve a la landing en lugar de dejar la pantalla en
          blanco. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
