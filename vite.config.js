import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    // Railway assigns a *.up.railway.app subdomain and proxies the custom
    // domain; both must be explicitly allowed or Vite's preview server
    // rejects the request with "Blocked request".
    allowedHosts: ['.up.railway.app', 'rebootpcstore.com', 'www.rebootpcstore.com'],
  },
});
