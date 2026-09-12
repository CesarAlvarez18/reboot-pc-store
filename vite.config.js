import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // En local el frontend corre en el 5173 y Django en el 8000. El proxy hace que
    // las llamadas a /api/ salgan del mismo origen que en producción, donde ambos
    // los sirve el mismo servicio; así el manejo de sesión y CSRF se comporta igual
    // acá y allá.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: false,
      },
    },
  },
  preview: {
    // Railway assigns a *.up.railway.app subdomain and proxies the custom
    // domain; both must be explicitly allowed or Vite's preview server
    // rejects the request with "Blocked request".
    allowedHosts: ['.up.railway.app', 'rebootpcstore.com', 'www.rebootpcstore.com'],
  },
});
