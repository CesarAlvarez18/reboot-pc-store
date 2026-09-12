# Reboot PC Store — Contexto del Proyecto

Plataforma web de e-commerce y servicios de soporte técnico para **Reboot PC Store**
(Medellín / Bello, Colombia). Arquitectura de doble propósito:

1. **Storefront (público):** conversión de clientes, exhibición de catálogo y
   agendamiento de servicios técnicos vía WhatsApp.
2. **Back-office (`/dashboard`):** gestión de inventario para que el equipo técnico
   registre, valore y publique equipos usados de forma estandarizada.
   **Implementado** — ver "Módulo de inventario".

---

## Estado actual del código (verificado)

El repo tiene dos mitades: la landing pública y el módulo de inventario, servidas
por **un solo proceso**.

| Área | Realidad actual |
|---|---|
| Framework | **React 18 + Vite 6** (SPA, no Next.js) con `react-router` |
| Lenguaje | **JavaScript / JSX plano** (sin TypeScript) |
| Estilos | Tailwind CSS 3 + PostCSS |
| Iconos | `lucide-react` |
| Backend / API | **Django 5 + Django REST Framework** en `backend/` |
| Base de datos | **PostgreSQL** |
| Fotos | **Cloudflare R2** (S3-compatible) vía `django-storages` |
| Deploy | **Railway, un solo servicio**: `Dockerfile` de dos etapas donde Node compila el frontend y Gunicorn sirve API + `dist/` |
| Dominio | `rebootpcstore.com` (SEO ya configurado) |

**El despliegue del backend a Railway todavía no se ha hecho.** Todo lo anterior
está verificado en local y en el contenedor de producción, pero el servicio en
Railway sigue sirviendo la versión estática anterior.

### Estructura

```
index.html              meta tags / SEO / fuentes
src/main.jsx            entry point (BrowserRouter)
src/App.jsx             mapa de rutas: / y /dashboard
src/pages/Landing.jsx   ensambla las secciones publicas en orden
src/pages/dashboard/    Ingresar, EquiposList, EquipoForm
src/dashboard/          RutaProtegida
src/components/         Navbar, Hero, Services, Store, UsadosDisponibles,
                        UsadoCard, UsadoDetalle, HowItWorks, Testimonials,
                        PaymentMethods, Footer, WhatsAppButton
src/components/ui/      SelectDropdown, RatingScale, ImageUploader, CampoMoneda
src/components/dashboard/  EquipoRow, VacioPanel
src/lib/api.js          cliente de la API (sesion + CSRF en un solo lugar)
src/lib/formato.js      formato de pesos colombianos
src/data/content.js     TODO el copy y los datos (centralizado)
src/index.css           directivas de Tailwind + estilos base
backend/config/         settings, urls, vistas de infraestructura
backend/inventario/     modelos, choices, serializers, views, tests
public/                 robots.txt, sitemap.xml
docs/specs/             especificaciones de features (YYYY-MM-DD-titulo.md)
docs/plans/             planes de implementación (mismo slug que su spec)
.claude/launch.json     config del dev server para el preview (puerto 5173)
.claude/skills/         skills del proyecto: `brainstorming`, `design-spec`,
                        `design-plan`, `verify-after-changes`, `revision-final`
Dockerfile              build de producción para Railway
railway.json            builder = DOCKERFILE
vite.config.js          `allowedHosts` para Railway + dominio propio
tailwind.config.js      paleta `brand` y fuentes del sistema de diseño
```

### Convenciones ya establecidas — respétalas

- **Todo el contenido va en `src/data/content.js`**, nunca hardcodeado en los
  componentes. Los componentes importan y renderizan; el copy se edita en un
  solo lugar (pensado para futuras traducciones o un CMS).
- **Iconos por nombre string:** `content.js` guarda `icon: 'Home'` y el
  componente resuelve el componente de `lucide-react`. No importes iconos
  directamente dentro de los datos.
- **WhatsApp:** usa siempre `buildWhatsAppLink(mensaje)` de `content.js`.
  El número vive en la constante `WHATSAPP_NUMBER` (una sola fuente de verdad).
- **Paleta y tipografía:** usa los tokens de `tailwind.config.js`
  (`brand.dark`, `brand.darker`, `brand.surface`, `brand.cyan`, `brand.violet`,
  `whatsapp`; fuentes `font-display` y `font-body`). No metas hex codes sueltos.
- **Idioma:** todo el contenido de cara al usuario en **español de Colombia**.
  Los comentarios del código también están en español; mantén ese estilo.
- **Navegación:** la landing sigue siendo una sola página con anclas
  (`#servicios`, `#tienda`, `#usados-disponibles`, `#nosotros`, `#testimonios`).
  El router solo separa `/` de `/dashboard`. **No uses el id `usados`**: ya lo
  ocupa la categoría del catálogo que sale de `productCategories`.
- **Opciones del inventario:** van en `backend/inventario/choices.py` y el
  formulario las pide por `/api/opciones/`. Nunca las repitas en el frontend.
- **Llamadas a la API:** usa `src/lib/api.js`, que centraliza la cookie de sesión
  y el token CSRF, igual que `buildWhatsAppLink` centraliza el enlace de WhatsApp.
- **Formato de pesos:** `formatearPesos` de `src/lib/formato.js`, compartido entre
  el panel y la vitrina.

### Deuda técnica conocida

Auditada con la skill `revision-final` el 2026-09-12. Ninguna está corregida:

- **`og:image` y `twitter:image` apuntan a `placehold.co`, que devuelve SVG.**
  WhatsApp y Facebook no renderizan SVG en las vistas previas, así que compartir
  el link no muestra imagen. Duele especialmente en un negocio cuyo canal de
  cierre *es* WhatsApp. (`index.html:25` y `:35`)
- **Los testimonios son inventados** y se presentan como clientes reales.
- **Instagram y TikTok apuntan a las home genéricas** (`https://instagram.com`,
  `https://tiktok.com`). Solo Facebook tiene URL real.
- **Las imágenes del catálogo son placeholders** de `placehold.co`. Ahora se nota
  más: conviven con la sección de usados, que sí muestra fotos reales.
- **`WHATSAPP_NUMBER` tiene un comentario `TODO` obsoleto** (`content.js:4`): el
  número `573023966862` ya es el real (commit `6bec8ab`).
- **`RESPONSABLES` en `backend/inventario/choices.py` trae nombres de relleno**
  ("Técnico 1 (reemplazar por el nombre real)") que el técnico ve en el formulario.
- **La garantía que ofrece el negocio no está confirmada.** El catálogo promete 3
  y 6 meses, y el inventario ofrece 3/6/12, sin que nadie lo haya decidido.
- **Dos secciones de usados conviven** en la landing: la categoría fija de la
  Tienda y la sección alimentada por el inventario. Es consecuencia aceptada del
  approach elegido, pero el cliente ve dos listas distintas de lo mismo.

## Storefront: contenido funcional

**Servicios técnicos:** reparación a domicilio, mantenimiento preventivo,
ensamble a medida, configuración de redes.

**Catálogo — 3 categorías** (ids en `productCategories`):
- `nuevos` — Computadores Nuevos
- `usados` — Computadores Usados (Garantizados)
- `gaming` — Typhoon Custom Builds (gamers / workstations)

**Checkout / contacto:** no hay carrito ni pasarela. Todo cierre de venta o
agendamiento sale por **WhatsApp**. Los medios de pago se *informan* nada más
(Efectivo, Transferencia, TC, TD, Nequi, Daviplata).

---

## Módulo de inventario (implementado)

Especificado en `docs/specs/2026-09-12-modulo-inventario-usados.md` y construido
según `docs/plans/2026-09-12-modulo-inventario-usados.md`.

### Cómo está montado

- **`/dashboard`** es el panel de los técnicos, protegido por sesión. **No uses
  `/admin`**: esa ruta la reserva Django, y su panel vive en `/django-admin/`,
  usado solo para crear las cuentas.
- **Autenticación por cookie de sesión con CSRF**, no por token en el navegador:
  frontend y backend comparten origen.
- **WhiteNoise sirve el `dist/` desde la raíz del dominio**, no desde `/static/`.
  Es lo que mantiene vivos `/robots.txt` y `/sitemap.xml`. Un catch-all en
  `config/urls.py` devuelve `index.html` en cualquier ruta que no sea de la API
  ni del panel de Django.
- **Las opciones de los desplegables viven en `backend/inventario/choices.py`**,
  y el formulario las pide por `/api/opciones/`. Es el equivalente backend de
  `content.js`: se agregan ahí y en ningún otro lado.
- **Las fotos se optimizan al guardarse**: 1600px para el detalle y 640px para la
  tarjeta, en WebP, con corrección de orientación EXIF (sin eso, una foto tomada
  en vertical con el celular se publica acostada).

### Modelo `EquipoComputo`

Campos del formulario provisional del negocio, más `garantia_meses`,
`marca_otra` / `procesador_otro` (obligatorios solo al elegir "Otra"/"Otro"),
`estado` (borrador / publicado / vendido) y `fecha_venta`.

Reglas que ya están en el backend: un equipo nace en **borrador**, no se publica
sin fotos ni con precio en cero, y marcarlo vendido estampa la fecha que decide
cuándo se retira solo de la vitrina (a los 7 días, filtrando en la consulta).

### La regla que no se negocia

**`costo_compra` y el margen nunca salen al frontend público.** Hay dos
serializers separados, y el público lista sus campos uno por uno — nunca
`exclude`, porque con `exclude` un campo nuevo del modelo se volvería público por
olvido. Está blindado con `backend/inventario/tests/test_api_publica.py`, que
compara contra el cuerpo crudo de la respuesta. Si tocas el serializer público,
corre esa prueba.

### Lo que falta

- **Desplegar a Railway**: agregar el plugin de PostgreSQL y configurar
  `SECRET_KEY`, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS` y las cuatro variables de
  R2. El `Dockerfile` nuevo reemplaza al que sirve el sitio hoy.
- **Verificar R2 contra un bucket real.** El código cae a disco local si no hay
  credenciales, y el disco de Railway es efímero: sin esa verificación, las fotos
  se borrarían en cada despliegue.

## Directrices de desarrollo

1. **Componentes reutilizables.** Los genéricos del formulario ya existen en
   `src/components/ui/` (`SelectDropdown`, `RatingScale`, `ImageUploader`,
   `CampoMoneda`). Reúsalos en vez de escribir campos nuevos a mano.
2. **Seguridad.** Toda la API del inventario responde 403 sin sesión, incluida la
   lista de equipos. El guardia de `/dashboard` en React es comodidad, no
   seguridad: quien verifica es el backend.
3. **Manejo de imágenes.** Las fotos subidas desde el admin se optimizan
   *antes* de guardarse, para no degradar los tiempos de carga del catálogo
   público.
4. **Separación de lógica.** La lógica de precios (costo vs. venta) vive
   **estrictamente en el backend**. El payload del frontend público **NUNCA**
   debe incluir `costo_compra`.
5. **Estilo de código.** Código modular. Si se introduce TypeScript, tipar
   estrictamente `EquipoComputo`. Mantén las clases de Tailwind legibles.
   Hoy el proyecto es JSX plano: no mezcles `.ts`/`.tsx` sin acordar la
   migración primero.

---

## Comandos

Para trabajar hacen falta **los dos procesos**: Vite sirve el frontend en el 5173
y hace proxy de `/api` y `/media` al backend en el 8000.

```bash
npm run dev       # frontend en http://localhost:5173
npm run build     # build de producción a dist/
npm run preview   # sirve dist/ localmente
```

```bash
# Backend (desde backend/, con el venv activado)
python manage.py runserver          # API en http://localhost:8000
python manage.py migrate
python manage.py test inventario    # incluye la prueba de fuga de costo_compra
python manage.py createsuperuser    # crear cuentas de técnicos
```

La base de datos local corre en Docker. **Ojo:** si ya hay un PostgreSQL
instalado en la máquina ocupando el 5432, usa otro puerto y ajústalo en
`backend/.env` (ver `backend/.env.example`).

```bash
docker run -d --name reboot-postgres -e POSTGRES_USER=reboot -e POSTGRES_PASSWORD=reboot -e POSTGRES_DB=reboot -p 5433:5432 postgres:16-alpine
```

### Verificación

Para ver la landing corriendo usa el preview del Browser pane con la config
`reboot-pc-store-dev` de `.claude/launch.json` — no arranques el dev server
con Bash.

---

## Skills del proyecto

Cinco skills en `.claude/skills/` cubren el ciclo de trabajo de punta a punta:

```
idea difusa → brainstorming → design-spec → [aprobación] → design-plan
            → código → verify-after-changes → revision-final → deploy
```

Úsalas en ese orden; no improvises el proceso que ya está documentado ahí. Y no
te saltes pasos: un feature nuevo no arranca en código.

### `brainstorming` — al **empezar** un feature

Cuando el usuario traiga una idea nueva a medio formar ("quiero agregar…",
"vamos a hacer…", "necesito una sección/módulo/página"), corre este skill
**antes de escribir código**. Hace preguntas para eliminar la ambigüedad del
objetivo y cierra proponiendo 2 o 3 approaches concretos, con sus costos y
trade-offs, para que el usuario elija cómo armar el plan.

Existe porque el proyecto es hoy una SPA estática: features que suenan simples
("que el cliente deje sus datos", "subir fotos del inventario") obligan a
decidir si se abre backend y persistencia. Descubrirlo a mitad de la
implementación significa botar trabajo.

No aplica para bugs, ajustes de copy o cambios cosméticos de algo que ya
existe, ni cuando el approach ya está elegido.

> No confundir con la skill global `anthropic-skills:brainstorming`, que es
> ideación genérica. La del proyecto es específica de features de este repo y
> siempre termina en una decisión de approach.

### `design-spec` — cuando el objetivo ya está **claro**

Escribe la especificación del feature **desde el punto de vista del usuario** y
la guarda en `docs/specs/YYYY-MM-DD-titulo.md`, con seis secciones fijas:
Overview, Usuarios objetivo, Contexto del problema, Alcance v1, Comportamiento
esperado, y Posibles errores y mitigaciones.

**Regla central: nada de implementación** — describe comportamiento observable,
no arquitectura, esquemas ni código. El documento tiene que poder validarlo el
dueño del negocio, no solo quien lee el repo.

Termina en un **approval gate**: el usuario aprueba (y se pasa a `design-plan`),
pide iterar (se edita el mismo archivo y se vuelve a preguntar), o lo deja
pendiente. El spec **nunca** se da por aprobado implícitamente.

### `design-plan` — una vez el spec está **aprobado**

Traduce el spec en el plan técnico de implementación, en
`docs/plans/YYYY-MM-DD-titulo.md` (mismo slug que su spec, fecha del día), con
cuatro secciones: Objetivo, Contexto del problema, Spec de referencia, y Tareas
a implementar.

Es la contraparte del spec: acá **sí** van rutas de archivos, nombres de
componentes, dependencias y esquemas. Las tareas van ordenadas, del tamaño de
un commit, cada una dejando el sitio funcionando y con su forma de verificarse.

Requiere un spec aprobado. Si al planear aparece un hueco en el spec, se vuelve
a `design-spec` a cerrarlo — no se rellena desde el plan.

### `verify-after-changes` — al **terminar** de implementar el plan

Cierra el ciclo del feature: levanta el servidor local, elige 5 casos de prueba
importantes y los prueba **de verdad en el navegador** (leer el código no es
probar), contrasta el resultado contra el plan y el spec, arregla lo que falle
y da luz verde solo cuando pasa todo.

Los 5 casos se reparten en camino principal, móvil, un estado vacío, un caso de
error de la sección 6 del spec, y la regla de negocio más crítica — cuando el
feature toca inventario, que `costo_compra` no llegue nunca al frontend público.

A diferencia de `revision-final`, este skill **sí arregla** lo que encuentre,
pero solo dentro del alcance de la v1: si el arreglo cambia el alcance o
contradice el spec, para y pregunta.


### `revision-final` — antes de **entregar** o desplegar

Audita la landing contra un checklist de 5 puntos: móvil, botones y links
rotos, textos de relleno, imágenes que no cargan, y consistencia de tono en
el copy. Entrega un reporte priorizado.

**Solo reporta** — no corrige nada sin aprobación explícita del usuario.
