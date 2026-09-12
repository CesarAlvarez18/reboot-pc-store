// Cliente de la API del inventario.
//
// Centraliza la URL base, la cookie de sesión y el token CSRF, igual que
// buildWhatsAppLink centraliza el enlace de WhatsApp en data/content.js: una sola
// fuente de verdad, para no repetir el manejo de credenciales en cada pantalla.

const BASE = '/api';

function leerCookie(nombre) {
  const encontrada = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${nombre}=`));

  return encontrada ? decodeURIComponent(encontrada.split('=')[1]) : null;
}

// Django exige el token CSRF en todo lo que no sea GET. El endpoint /auth/yo/ es
// el que deja la cookie en el navegador, así que se llama antes de cualquier
// escritura si todavía no la tenemos.
async function asegurarCsrf() {
  if (leerCookie('csrftoken')) return;
  await fetch(`${BASE}/auth/yo/`, { credentials: 'same-origin' });
}

export class ErrorDeApi extends Error {
  constructor(mensaje, { estado, campos } = {}) {
    super(mensaje);
    this.estado = estado;
    this.campos = campos ?? {};
  }
}

async function pedir(ruta, { metodo = 'GET', datos, formulario } = {}) {
  const opciones = {
    method: metodo,
    credentials: 'same-origin',
    headers: {},
  };

  if (metodo !== 'GET') {
    await asegurarCsrf();
    opciones.headers['X-CSRFToken'] = leerCookie('csrftoken') ?? '';
  }

  if (formulario) {
    opciones.body = formulario;
  } else if (datos !== undefined) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(datos);
  }

  let respuesta;
  try {
    respuesta = await fetch(`${BASE}${ruta}`, opciones);
  } catch {
    // Sin internet en bodega, o el servidor caído: el mensaje tiene que decir qué
    // hacer, no mostrar el error técnico.
    throw new ErrorDeApi('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.');
  }

  if (respuesta.status === 204) return null;

  const cuerpo = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new ErrorDeApi(cuerpo.detalle ?? cuerpo.detail ?? 'No pudimos completar la acción.', {
      estado: respuesta.status,
      campos: cuerpo,
    });
  }

  return cuerpo;
}

export const api = {
  yo: () => pedir('/auth/yo/'),
  ingresar: (correo, contrasena) =>
    pedir('/auth/ingresar/', { metodo: 'POST', datos: { correo, contrasena } }),
  salir: () => pedir('/auth/salir/', { metodo: 'POST' }),
  opciones: () => pedir('/opciones/'),
  equipos: () => pedir('/equipos/'),
  equiposPublicos: () => pedir('/publico/equipos/'),
};
