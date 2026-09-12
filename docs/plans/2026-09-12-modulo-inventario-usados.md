# Plan de implementación — Módulo de inventario de equipos usados

## 1. Objetivo

Construir el módulo interno de inventario en `/dashboard` y la sección pública
"Usados disponibles" de la landing, sobre un backend Django + PostgreSQL desplegado
en el **mismo servicio de Railway** que ya sirve el sitio.

**Se considera terminado cuando**, en el sitio desplegado: un técnico puede ingresar
con su cuenta desde el celular, registrar un equipo usado con varias fotos,
publicarlo, y ver ese equipo aparecer en la sección pública sin ningún despliegue de
por medio; el cliente puede abrirlo y escribir por WhatsApp con el equipo
identificado en el mensaje; y una inspección de todo lo que el sitio público recibe
—incluida la respuesta cruda de la API— no contiene el costo de compra por ningún
lado.

Este plan cubre la v1 completa del spec. No hay etapas posteriores planeadas acá.

## 2. Contexto del problema

Hoy no existe registro de inventario: lo que se sabe de cada equipo usado vive en la
cabeza del técnico y en fotos sueltas del celular. La sección Tienda del sitio
muestra tres categorías con equipos inventados y fotos de `placehold.co`, y cambiar
cualquier cosa del catálogo exige editar `src/data/content.js` y volver a desplegar.

### Qué hay hoy en el repo

- SPA de **React 18 + Vite 6**, JavaScript plano, sin router: `src/main.jsx` monta
  `src/App.jsx`, que apila las secciones una tras otra.
- Todo el copy y los datos centralizados en `src/data/content.js`, incluidos
  `productCategories` y `buildWhatsAppLink`.
- Tokens de diseño en `tailwind.config.js`: `brand.dark`, `brand.darker`,
  `brand.surface`, `brand.cyan`, `brand.violet`, `whatsapp`, y las fuentes
  `font-display` / `font-body`.
- Deploy en Railway con un `Dockerfile` de dos etapas que termina en
  `serve -s dist -l ${PORT}` sobre `node:20-alpine`.
- **No existe**: backend, base de datos, autenticación, router, ni manejo de archivos.

### Qué obliga a introducir este feature

Backend Django, PostgreSQL, autenticación de usuarios, `react-router` en el
frontend, y almacenamiento de archivos en Cloudflare R2. El `Dockerfile` se
reescribe por completo: la imagen final pasa de Node a Python, y Gunicorn sirve
tanto la API como el `dist/` compilado. `npm start` y `vite preview` dejan de ser el
proceso de producción y quedan solo como herramientas locales.

### Decisiones ya tomadas que restringen este plan

- **Approach B** (elegido en brainstorming): el inventario alimenta una **sección
  nueva**. Las categorías de `productCategories` en `src/data/content.js` **no se
  tocan** — el modelo de datos describe equipos usados y forzarlo a describir PCs
  nuevas o Typhoon Custom Builds lo deforma.
- **Un solo servicio** en Railway sirviendo frontend y backend. PostgreSQL es un
  plugin gestionado aparte, no un servicio que mantengamos.
- **Fotos en Cloudflare R2**, no en S3 ni en disco local: el disco de Railway es
  efímero y borraría las fotos en cada despliegue. Se eligió R2 sobre S3 por el costo
  de transferencia de salida, que en esta sección escala con las visitas al sitio.
- **El panel React va en `/dashboard`**, no en `/admin`: Django reserva esa ruta para
  su propio panel de administración, que acá se mueve a `/django-admin/` y se usa
  únicamente para crear las cuentas de los técnicos.
- **`CLAUDE.md`, directriz 4:** la lógica de precios vive estrictamente en el backend
  y el payload del frontend público **nunca** incluye `costo_compra`. Esto se
  implementa con serializers separados y se blinda con una prueba automática, no con
  un `delete` en el frontend.
- **`CLAUDE.md`, directriz 1:** los campos comparten lógica de selección, así que van
  contra componentes genéricos (`SelectDropdown`, `RatingScale`, `ImageUploader`), no
  contra formularios copiados.
- **`CLAUDE.md`, directriz 5:** el proyecto es JSX plano. Este plan **no introduce
  TypeScript**; migrar es una decisión aparte.

## 3. Spec de referencia

**`docs/specs/2026-09-12-modulo-inventario-usados.md`** (aprobado el 2026-09-12).

Cubre el recorrido completo del técnico (ingreso, registro, publicación, marcado de
vendido), el recorrido del cliente en la sección pública, los estados vacíos de
ambos lados, y catorce casos de error con su mitigación.

### Desvíos del plan respecto al spec

**Uno solo, y es de interpretación:** el spec dice que "la primera foto es la que se
ve como portada". Este plan lo implementa con un campo de orden y un botón explícito
"Hacer portada" en cada foto, en vez de reordenar arrastrando. Arrastrar para
reordenar en un celular con guantes de trabajo es peor experiencia que un botón, y
sale más barato. El comportamiento observable que promete el spec —que el técnico
decida cuál es la portada— se cumple igual.

Fuera de eso, el plan no agrega ni quita nada del alcance aprobado.

### Pendiente de confirmar con el negocio

Esto puede frenar la implementación a mitad de camino:

1. **Las opciones exactas de cada lista desplegable** (marcas, procesadores, rangos
   de RAM, capacidades de almacenamiento, estados de batería, responsables). Las
   necesita la **tarea 3**. El plan arranca con un set propuesto, pero publicar con
   listas que no reflejan la bodega real hace inútil la consistencia de datos que
   justifica todo el módulo.
2. **Los meses de garantía que se ofrecen** y si dependen del estado del equipo.
   `src/data/content.js:70` ya promete públicamente "Garantía 6 meses" y "Garantía 3
   meses" sin que ese compromiso esté registrado en ninguna parte.
3. **Si el precio publicado es firme o negociable** — cambia el copy de la tarjeta y
   el mensaje prellenado de WhatsApp (tarea 11).
4. **Quién responde el WhatsApp** cuando suba el volumen de mensajes.

---

## 4. Tareas a implementar

### Tarea 1 — Esqueleto del backend Django, sin tocar el frontend

**Qué hace:** deja un proyecto Django corriendo localmente contra PostgreSQL, con un
endpoint de salud, sin que la landing cambie en absoluto.

**Archivos:**
- Crea `backend/manage.py`, `backend/config/{__init__,settings,urls,wsgi}.py`,
  `backend/inventario/` (app vacía), `backend/requirements.txt`, `backend/.env.example`.
- Modifica `.gitignore`: agrega `backend/.env`, `__pycache__/`, `*.pyc`,
  `backend/staticfiles/`.

**Detalles:**
- Dependencias: `Django~=5.1`, `djangorestframework`, `psycopg[binary]`,
  `django-environ` (configuración por variables de entorno, para que Railway inyecte
  `DATABASE_URL` sin cambiar código), `gunicorn`, `whitenoise`.
- `settings.py` lee todo de entorno: `SECRET_KEY`, `DEBUG`, `DATABASE_URL`,
  `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`. Ningún secreto en el repo.
- `ALLOWED_HOSTS` y `CSRF_TRUSTED_ORIGINS` deben cubrir lo mismo que hoy declara
  `vite.config.js`: `.up.railway.app`, `rebootpcstore.com`, `www.rebootpcstore.com`.
- El panel de Django se monta en `/django-admin/`, no en `/admin/`.
- Endpoint `GET /api/health/` que responde `{"ok": true}`.

**Cómo se verifica:** `python manage.py migrate` corre limpio contra una base local, y
`curl http://localhost:8000/api/health/` devuelve el JSON. La landing sigue
funcionando igual en el preview con la config `reboot-pc-store-dev` — no debe haber
cambiado nada visible.

---

### Tarea 2 — Un solo servicio: Django sirve la API y el `dist/` de Vite

**Qué hace:** reescribe el despliegue para que un único contenedor sirva el sitio
estático y la API, y lo pone a correr en Railway.

**Archivos:**
- Reescribe `Dockerfile` (tres etapas: `node:20-alpine` compila `dist/` →
  `python:3.12-slim` instala dependencias → imagen final con Gunicorn).
- Modifica `railway.json` si cambia el comando de arranque.
- Modifica `backend/config/settings.py` (WhiteNoise, `STATICFILES_DIRS` apuntando al
  `dist/` copiado) y `backend/config/urls.py` (catch-all de SPA).
- Modifica `vite.config.js`: agrega `server.proxy` de `/api` a `http://localhost:8000`
  para que el dev server de Vite siga siendo el flujo local de trabajo.

**Detalles:**
- El catch-all devuelve `index.html` para cualquier ruta que **no** empiece por
  `/api/`, `/django-admin/` ni `/static/`. Sin esto, entrar directo a
  `rebootpcstore.com/dashboard` da 404.
- WhiteNoise sirve los assets con hash de Vite con caché larga; `index.html` sin caché.
- Railway inyecta `PORT`: Gunicorn debe escucharlo, igual que hoy lo hace `serve`.

**Cómo se verifica:** `docker build` local y `docker run -p 8080:8080` sirven la
landing completa en `/` y responden el health en `/api/health/`. Entrar directo a una
ruta inventada como `/dashboard` devuelve la landing y no un 404. Después, deploy a
Railway y comprobar que `rebootpcstore.com` sigue igual que antes del cambio.

**Riesgo:** es la tarea de más incertidumbre de todo el plan. Si el mono-servicio no
funciona, todo lo demás queda varado — por eso va segunda y no al final.

**Depende de:** 1.

---

### Tarea 3 — Modelo de datos y catálogo de opciones

**Qué hace:** crea `EquipoComputo` y `FotoEquipo` con sus opciones predefinidas, y los
deja administrables desde `/django-admin/`.

**Archivos:**
- Crea `backend/inventario/models.py`, `backend/inventario/choices.py`,
  `backend/inventario/admin.py`, y la migración inicial.

**Detalles:**
- `EquipoComputo`: `registro_correo` (email de quien registra, se llena solo desde la
  sesión), `responsable`, `marca`, `procesador`, `ram`, `almacenamiento_tipo`
  (HDD/SSD/NVMe), `almacenamiento_capacidad`, `estado_bateria`, `estado_estetico`
  (entero 1–5), `garantia_meses`, `costo_compra` y `precio_venta` (decimales),
  `notas_fallas` (texto libre, opcional), `estado` (`borrador` / `publicado` /
  `vendido`), `fecha_venta` (nulo hasta que se marque vendido), `creado_en`,
  `actualizado_en`.
- `FotoEquipo`: relación al equipo, `imagen`, `orden`, `creado_en`. El campo `orden`
  es lo que define la portada.
- **Todas las listas viven en `backend/inventario/choices.py`**, en un solo lugar. Es
  el equivalente backend de la convención de `src/data/content.js`: el formulario no
  las hardcodea, las pide.
- `garantia_meses` no está en el modelo que describe `CLAUDE.md`; se agrega acá por la
  decisión tomada en el spec.
- El set inicial de opciones es **una propuesta pendiente de confirmar** (ver sección
  3, punto 1).

**Cómo se verifica:** desde `/django-admin/` se puede crear un equipo eligiendo todas
sus opciones de listas, y `python manage.py makemigrations --check` no reporta
cambios sin migrar.

**Depende de:** 1.

---

### Tarea 4 — Fotos en Cloudflare R2 con optimización al subir

**Qué hace:** que una foto subida quede guardada en R2, liviana, con una versión de
portada más pequeña, y sobreviva a los despliegues.

**Archivos:**
- Modifica `backend/config/settings.py` (backend de almacenamiento), crea
  `backend/inventario/imagenes.py` (optimización), modifica
  `backend/inventario/models.py` (invocar la optimización al guardar la foto).
- Modifica `backend/requirements.txt`: `django-storages[s3]`, `boto3`, `Pillow`.

**Detalles:**
- R2 habla el protocolo de S3, así que se usa el backend S3 de `django-storages`
  apuntando `AWS_S3_ENDPOINT_URL` al endpoint de R2 de la cuenta.
- **Suposición técnica a validar en esta tarea, antes de seguir:** R2 no soporta ACLs
  de objeto al estilo S3. Hay que configurar `AWS_DEFAULT_ACL = None` y
  `AWS_QUERYSTRING_AUTH = False`, y exponer el bucket por su dominio público de R2.
  Si esto no sale en la primera, confírmalo antes de construir el formulario encima.
- Al subir: se redimensiona el lado mayor a 1600px y se convierte a WebP para la vista
  de detalle, y se genera una versión de 640px para las tarjetas. Esto cumple la
  directriz 3 de `CLAUDE.md` (optimizar antes de guardar) y la promesa del spec de que
  el técnico no tiene que hacer nada.
- Credenciales solo por variables de entorno, documentadas en `backend/.env.example`.

**Cómo se verifica:** subir una foto de 4 MB desde `/django-admin/`, confirmar en el
panel de Cloudflare que el objeto quedó en el bucket pesando una fracción de eso, y
que su URL pública abre la imagen en el navegador. Luego redesplegar en Railway y
comprobar que la foto **sigue** ahí — esa es la prueba de que el problema del disco
efímero quedó resuelto.

**Depende de:** 3.

---

### Tarea 5 — API interna autenticada

**Qué hace:** expone al panel las operaciones sobre equipos, las opciones de los
desplegables y la subida de fotos, todo detrás de sesión iniciada.

**Archivos:**
- Crea `backend/inventario/serializers.py`, `backend/inventario/views.py`,
  `backend/inventario/urls.py`. Modifica `backend/config/urls.py`.

**Detalles:**
- Autenticación **por sesión con cookie y CSRF**, no por token en el navegador: como
  frontend y backend comparten origen (tarea 2), la cookie es más simple y más segura
  que guardar un token en el navegador.
- Endpoints: `POST /api/auth/login/`, `POST /api/auth/logout/`, `GET /api/auth/yo/`;
  `GET|POST /api/equipos/`, `GET|PATCH /api/equipos/<id>/`,
  `POST /api/equipos/<id>/fotos/`, `DELETE /api/fotos/<id>/`,
  `PATCH /api/equipos/<id>/estado/`; `GET /api/opciones/` devolviendo el contenido de
  `choices.py` para que el formulario arme sus desplegables desde una sola fuente.
- El serializer interno **sí** incluye `costo_compra` y un `margen` calculado en el
  backend — nunca en el frontend.
- Al marcar `vendido`, la vista estampa `fecha_venta`. Al volver a `publicado`, la
  limpia.
- Todo responde 403 sin sesión, incluida la lista de equipos: el spec exige que ni
  siquiera se sepa qué hay.

**Cómo se verifica:** con la sesión iniciada, crear y modificar un equipo por la API
funciona; sin sesión, cada uno de esos endpoints responde 403 y no filtra datos en el
cuerpo de la respuesta.

**Depende de:** 3, 4.

---

### Tarea 6 — API pública sin costo de compra, blindada con prueba

**Qué hace:** expone los equipos publicados al sitio, sin información interna, y deja
una prueba automática que impide que eso se rompa después.

**Archivos:**
- Modifica `backend/inventario/serializers.py`, `views.py`, `urls.py`.
- Crea `backend/inventario/tests/test_api_publica.py`.

**Detalles:**
- `GET /api/publico/equipos/` es abierto y devuelve un serializer **distinto**, con
  una lista explícita de campos permitidos: nunca `exclude`. Un campo nuevo en el
  modelo no debe volverse público por olvido.
- Devuelve los equipos en estado `publicado`, más los `vendido` cuya `fecha_venta`
  sea de hace menos de 7 días, marcados con una bandera para el sello. **El retiro a
  los siete días se resuelve filtrando en la consulta**, no con una tarea programada:
  menos piezas móviles y nada que se quede colgado.
- Incluye `estado_estetico` como número **y** su etiqueta en palabras, calculada en el
  backend, para que el frontend no duplique esa traducción.
- Orden: más recientes primero. Paginado de 9 en 9, que es lo que muestra la sección.
- **La prueba** pide la respuesta pública de un equipo con costo conocido y afirma que
  la cadena del costo no aparece en ninguna parte del cuerpo crudo de la respuesta.
  Cubre el error más grave de la sección 6 del spec.

**Cómo se verifica:** `python manage.py test inventario` pasa. Pedir
`/api/publico/equipos/` sin sesión devuelve los equipos publicados y ningún campo de
costo. Un equipo en borrador no aparece; uno vendido hace 10 días tampoco.

**Depende de:** 5.

---

### Tarea 7 — Router en el frontend y ruta `/dashboard` protegida

**Qué hace:** parte la SPA en dos rutas —la landing y el panel— y deja el ingreso
funcionando, sin cambiar nada de lo que el visitante ve hoy.

**Archivos:**
- Modifica `src/main.jsx` (envolver en `BrowserRouter`), `src/App.jsx` (pasa a ser el
  mapa de rutas).
- Crea `src/pages/Landing.jsx` (recibe el contenido que hoy está en `App.jsx`, tal
  cual), `src/pages/dashboard/Login.jsx`, `src/dashboard/RutaProtegida.jsx`,
  `src/lib/api.js` (cliente de la API con el manejo de CSRF).
- Modifica `package.json`: `react-router-dom`.

**Detalles:**
- `/` monta la landing **exactamente como está hoy**; esta tarea no debe cambiar un
  pixel de lo público.
- `/dashboard/*` exige sesión: sin ella redirige al ingreso. La verificación real la
  hace el backend (tarea 5); el guardia del frontend es comodidad, no seguridad.
- `src/lib/api.js` centraliza la URL base y el token CSRF, igual que
  `buildWhatsAppLink` centraliza el enlace de WhatsApp: una sola fuente de verdad.

**Cómo se verifica:** en el preview con `reboot-pc-store-dev`, `/` se ve idéntica a
antes (comparar contra el sitio en producción), `/dashboard` redirige al ingreso, e
ingresar con una cuenta creada en `/django-admin/` deja entrar. Recargar el navegador
en `/dashboard` no rompe.

**Depende de:** 2, 5.

---

### Tarea 8 — Componentes genéricos del formulario

**Qué hace:** construye las tres piezas reutilizables que el formulario usa una y otra
vez, antes de construir el formulario.

**Archivos:**
- Crea `src/components/ui/SelectDropdown.jsx`, `src/components/ui/RatingScale.jsx`,
  `src/components/ui/ImageUploader.jsx`, `src/components/ui/CampoMoneda.jsx`.

**Detalles:**
- Es la directriz 1 de `CLAUDE.md`: casi todos los campos comparten la misma lógica de
  selección y no deben escribirse ocho veces.
- `SelectDropdown` recibe sus opciones desde `/api/opciones/`, muestra el error del
  campo y se dimensiona para el pulgar (área táctil cómoda, no controles de escritorio
  encogidos).
- `RatingScale` muestra el 1–5 **con su significado escrito al lado**, como exige el
  spec, no un número suelto.
- `ImageUploader` acepta cámara o galería, tope de 6 fotos, avance por foto, quitar una
  foto, reintentar solo la que falló, y botón "Hacer portada". Valida tipo y tamaño
  **antes** de intentar subir.
- Tokens de `tailwind.config.js` únicamente; nada de hex sueltos.

**Cómo se verifica:** en el preview con el viewport en móvil, los tres componentes se
usan cómodo con el pulgar, `ImageUploader` sube dos fotos y permite quitar una, y al
soltar un archivo que no es imagen avisa sin intentar subirlo.

**Depende de:** 7.

---

### Tarea 9 — Formulario de registro de equipo

**Qué hace:** la pantalla donde el técnico registra un equipo completo desde el
celular.

**Archivos:**
- Crea `src/pages/dashboard/EquipoForm.jsx`.
- Modifica `src/data/content.js`: agrega el copy del formulario (etiquetas, ayudas,
  mensajes de error) siguiendo la convención de contenido centralizado.

**Detalles:**
- Orden de campos exacto del spec: marca, procesador, RAM, almacenamiento, batería,
  estado estético, garantía, costo, precio, fotos, notas.
- **Margen en vivo** al lado del precio de venta, calculado con lo que devuelve la API.
- Obligatorios: marca, procesador, RAM, almacenamiento, estado estético, costo,
  precio, y al menos una foto.
- Al guardar, el equipo nace en **borrador**. Publicar es otra acción (tarea 10).
- Casos del spec que cubre esta tarea: campos incompletos (señalados, con la pantalla
  subiendo al primero), doble envío (botón desactivado mientras guarda), **fallo de
  conexión conservando todo lo escrito**, precio bajo el costo (advertencia que obliga
  a confirmar, no bloqueo), precio en cero, y aviso de posible duplicado.

**Cómo se verifica:** en el preview en viewport móvil, registrar un equipo completo de
punta a punta. Luego, con el servidor apagado, intentar guardar: debe avisar del fallo
y **conservar los quince campos llenos**. Ese es el caso que decide si el técnico usa o
abandona el módulo.

**Depende de:** 8.

---

### Tarea 10 — Listado interno y cambios de estado

**Qué hace:** la pantalla donde el técnico ve todo el inventario, lo busca, y publica,
despublica o marca vendido.

**Archivos:**
- Crea `src/pages/dashboard/EquiposList.jsx`,
  `src/components/dashboard/EquipoRow.jsx`, `src/components/dashboard/VacioPanel.jsx`.

**Detalles:**
- Cada fila: foto de portada, características resumidas, precio de venta y —solo acá
  adentro— costo de compra y margen.
- Búsqueda por marca o procesador, filtro por estado.
- Cambiar estado tiene efecto inmediato y la fila lo refleja sin recargar.
- Estados vacíos del spec: sin ningún equipo registrado, una pantalla que explica el
  módulo en una frase y un botón grande para el primero — no una tabla vacía. Con
  filtro sin resultados, decirlo y ofrecer limpiar el filtro.

**Cómo se verifica:** en el preview, publicar un equipo y confirmar que aparece en la
sección pública (tarea 11) sin desplegar nada. Marcar vendido y ver el sello. Filtrar
por algo inexistente y ver el mensaje con la opción de limpiar.

**Depende de:** 9.

---

### Tarea 11 — Sección pública "Usados disponibles"

**Qué hace:** la sección de la landing que muestra los equipos publicados y lleva a
WhatsApp.

**Archivos:**
- Crea `src/components/UsadosDisponibles.jsx`,
  `src/components/UsadoCard.jsx`, `src/components/UsadoDetalle.jsx`.
- Modifica `src/App.jsx` / `src/pages/Landing.jsx` para insertar la sección **debajo de
  `<Store />`**.
- Modifica `src/data/content.js`: títulos, copy del estado vacío, copy del error de
  carga y la plantilla del mensaje de WhatsApp.

**Detalles:**
- `productCategories` **no se toca**. Conviven dos fuentes de catálogo y eso es
  deliberado (approach B).
- El enlace de WhatsApp se arma con `buildWhatsAppLink` de `src/data/content.js`, nunca
  con una URL escrita a mano.
- Un equipo con sello "Vendido" **no ofrece** el botón de WhatsApp.
- El precio se muestra formateado en pesos colombianos.
- Fotos con carga diferida, igual que ya hace `src/components/Store.jsx`.
- Nueve equipos y un botón para ver el resto.
- En móvil: tarjetas a lo ancho, una debajo de otra; fotos del detalle deslizables.
- Estado vacío: **no** un espacio en blanco ni un error, sino la invitación a escribir
  por WhatsApp contando qué equipo busca.

**Cómo se verifica:** en el preview, con equipos publicados la sección los muestra y el
enlace de WhatsApp abre con el equipo identificado en el mensaje. Sin ningún equipo
publicado, aparece la invitación. En viewport móvil todo es usable con el pulgar.

**Depende de:** 6, 10.

---

### Tarea 12 — Repaso explícito de errores y casos borde

**Qué hace:** recorre la sección 6 del spec caso por caso y cierra los que las tareas
anteriores no hayan cubierto ya.

**Archivos:** los que haga falta ajustar, principalmente
`src/components/UsadosDisponibles.jsx`, `src/pages/dashboard/EquipoForm.jsx` y
`src/lib/api.js`.

**Detalles:** los que quedan sueltos después de las tareas anteriores son
principalmente del lado público — que la API no responda (la sección muestra el aviso
y el botón de WhatsApp, y **el resto de la landing sigue funcionando**), que una foto
no cargue (marcador, no hueco roto), y notas más largas de lo previsto (recorte con
opción de ver el detalle completo, sin desarmar el diseño).

**Por qué es una tarea propia:** si estos casos no están en el plan, no se construyen.
Son exactamente los que aparecen en producción y no en desarrollo.

**Cómo se verifica:** apagar el backend con la landing abierta y comprobar que las
secciones Servicios, Tienda y Testimonios siguen intactas y solo "Usados disponibles"
muestra su aviso. Romper a propósito la URL de una foto y ver el marcador.

**Depende de:** 11.

---

### Tarea 13 — Verificación en navegador y revisión final

**Qué hace:** corre las dos skills de cierre del ciclo antes de dar el feature por
terminado.

**Detalles:**
- `verify-after-changes` contra este plan y el spec: prueba real en el navegador, con
  la regla de negocio crítica incluida — que `costo_compra` no llegue nunca al
  frontend público.
- Luego `revision-final` sobre la landing completa: móvil, links, textos de relleno,
  imágenes e inconsistencias de tono en el copy nuevo.
- Actualizar `CLAUDE.md`: la sección "Dirección planeada" pasa a ser estado actual
  (backend Django, PostgreSQL, R2, router, `/dashboard`, mono-servicio), y se corrige
  la mención de `/admin`.

**Cómo se verifica:** ambas skills dan luz verde, y `CLAUDE.md` describe el proyecto
que quedó, no el que se planeaba.

**Depende de:** 12.
