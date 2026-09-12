# Reboot PC Store — Contexto del Proyecto

Plataforma web de e-commerce y servicios de soporte técnico para **Reboot PC Store**
(Medellín / Bello, Colombia). Arquitectura de doble propósito:

1. **Storefront (público):** conversión de clientes, exhibición de catálogo y
   agendamiento de servicios técnicos vía WhatsApp.
2. **Back-office (admin):** gestión de inventario para que el equipo técnico
   registre, valore y publique equipos (especialmente usados / refurbished)
   de forma estandarizada. **Aún no implementado** — ver "Dirección planeada".

---

## Estado actual del código (verificado)

Lo que existe hoy en el repo es **solo el storefront**: una landing page de una
sola página, estática, sin backend ni base de datos.

| Área | Realidad actual |
|---|---|
| Framework | **React 18 + Vite 6** (SPA, no Next.js) |
| Lenguaje | **JavaScript / JSX plano** (sin TypeScript) |
| Estilos | Tailwind CSS 3 + PostCSS |
| Iconos | `lucide-react` |
| Backend / API | **Ninguno** |
| Base de datos | **Ninguna** |
| Deploy | **Railway** con `Dockerfile` multi-etapa (`serve -s dist`) |
| Dominio | `rebootpcstore.com` (SEO ya configurado) |

### Estructura

```
index.html              meta tags / SEO / fuentes
src/main.jsx            entry point
src/App.jsx             ensambla las secciones en orden
src/components/         Navbar, Hero, Services, Store, HowItWorks,
                        Testimonials, PaymentMethods, Footer, WhatsAppButton
src/data/content.js     TODO el copy y los datos de la landing (centralizado)
src/index.css           directivas de Tailwind + estilos base
public/                 robots.txt, sitemap.xml
docs/specs/             especificaciones de features (YYYY-MM-DD-titulo.md)
.claude/launch.json     config del dev server para el preview (puerto 5173)
.claude/skills/         skills del proyecto: `brainstorming` (definir un feature),
                        `design-spec` (escribir el spec), `revision-final` (QA)
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
- **Navegación:** la landing es una sola página con anclas (`#servicios`,
  `#tienda`, `#nosotros`, `#testimonios`). No hay router.

### Deuda técnica conocida

- `WHATSAPP_NUMBER` tiene un comentario `TODO: reemplazar por el número real`
  que quedó **obsoleto**: el número `573023966862` ya es el real (commit
  `6bec8ab`). El comentario se puede borrar.
- Las imágenes del catálogo son **placeholders** de `placehold.co`. Falta
  reemplazarlas por fotos reales de los equipos.
- `socialLinks` apunta a las **home genéricas** de Instagram y TikTok
  (`https://instagram.com`, `https://tiktok.com`). Solo Facebook tiene URL real.
- Los testimonios son de ejemplo, no reales.

---

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

## Dirección planeada (aún no construido)

Estas son las decisiones de rumbo. **No asumas que ya existen en el código.**
Si vas a implementar algo de aquí, confirma primero el enfoque con el usuario,
porque implican añadir backend y persistencia a un proyecto que hoy es estático.

### Stack objetivo
- Backend / API: **Python + Django** (o API Routes si se migra a Next.js).
- Base de datos: **PostgreSQL** para catálogo e inventario.
- Frontend: continuar en React; migrar a Next.js está en evaluación —
  hoy el proyecto es Vite y el deploy en Railway depende de eso.

### Módulo administrativo (gestión de inventario)
Rutas `/admin` o `/dashboard`, **protegidas por autenticación**.

Formulario optimizado para carga rápida de equipos.
**Regla de UI:** priorizar listas desplegables (`<select>`) sobre campos de
texto libre, para mantener consistencia en la base de datos.

#### Modelo de datos — `EquipoComputo`

| Campo | Descripción |
|---|---|
| `registro_correo` | Email de quien registra |
| `responsable` | Nombre del técnico o almacén |
| `marca` | Opciones predefinidas |
| `procesador` | Opciones predefinidas |
| `ram` | Opciones predefinidas |
| `almacenamiento` | Tipo (HDD / SSD / NVMe) + capacidad |
| `estado_estetico` | Escala 1–5 (1: desgastado, 5: como nuevo) |
| `estado_bateria` | Opciones predefinidas |
| `costo_compra` | Valor interno — **oculto al público** |
| `precio_venta` | Valor sugerido al público |
| `fotos` | Array de imágenes (estado real del equipo) |
| `notas_fallas` | Detalles adicionales o fallas reportadas |

---

## Directrices de desarrollo

1. **Componentes reutilizables.** Para el formulario de inventario, crea
   componentes genéricos (`SelectDropdown`, `ImageUploader`, `RatingScale`);
   muchos campos comparten la misma lógica de selección.
2. **Seguridad.** Las rutas del módulo administrativo deben estar protegidas
   por autenticación antes de exponer cualquier dato de inventario.
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

```bash
npm run dev       # dev server en http://localhost:5173
npm run build     # build de producción a dist/
npm run preview   # sirve dist/ localmente
npm start         # preview en 0.0.0.0:$PORT (lo usa Railway)
```

Comandos del stack planeado (**no aplican todavía**):
`python manage.py runserver` para la API de Django.

### Verificación

Para ver la landing corriendo usa el preview del Browser pane con la config
`reboot-pc-store-dev` de `.claude/launch.json` — no arranques el dev server
con Bash.

---

## Skills del proyecto

Tres skills en `.claude/skills/` cubren el ciclo de trabajo de punta a punta:
definir → especificar → verificar. Úsalas; no improvises el proceso que ya
está documentado ahí.

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

Entra después de `brainstorming` (o cuando el usuario ya sabe qué quiere y pide
dejarlo por escrito). **Regla central: nada de implementación** — describe
comportamiento observable, no arquitectura, esquemas ni código. El documento
tiene que poder validarlo el usuario, no solo quien lee el repo.

No es el plan técnico de implementación; ese viene después de que el spec se
apruebe.

### `revision-final` — antes de **entregar** o desplegar

Audita la landing contra un checklist de 5 puntos: móvil, botones y links
rotos, textos de relleno, imágenes que no cargan, y consistencia de tono en
el copy. Entrega un reporte priorizado.

**Solo reporta** — no corrige nada sin aprobación explícita del usuario.
