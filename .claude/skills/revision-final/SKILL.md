---
name: revision-final
description: Revisa el sitio completo de Reboot PC Store (landing en React/Vite) contra un checklist de calidad antes de dar por lista una entrega — móvil, botones/links rotos, textos de relleno tipo "lorem ipsum", imágenes que no cargan, y consistencia de tono en el copy. Úsalo siempre que el usuario pida una "revisión final", "revisión antes de publicar/entregar", "chequeo del sitio", "QA de la landing", o quiera confirmar que el sitio está listo antes de un deploy. Este skill SOLO reporta problemas priorizados — nunca corrige nada hasta que el usuario apruebe explícitamente los arreglos.
---

# Revisión final del sitio

Este skill audita la landing de Reboot PC Store contra un checklist fijo de 5 puntos y entrega una lista de problemas priorizada. No corrige nada por su cuenta: el usuario decide qué arreglar y cuándo.

## Por qué existe esta separación

Mezclar "encontrar problemas" con "arreglar problemas" hace que sea fácil corregir algo que en realidad era intencional (por ejemplo, un texto breve que parece placeholder pero es la voz de la marca), o que el usuario pierda el control de qué cambia justo antes de un deploy. Por eso el resultado de este skill es siempre un reporte, nunca un diff.

## Paso 1: Levantar el sitio

Usa el Browser pane (`preview_start` con `{"name": "reboot-pc-store-dev"}`) para levantar el servidor local (`npm run dev`, puerto 5173 según `.claude/launch.json`). Esta revisión corre siempre contra el servidor local, no contra producción — así se pueden detectar problemas antes de desplegar.

Si el servidor ya estaba corriendo, reutilízalo; no hace falta reiniciarlo. Espera a que cargue y confirma con `read_page` o una captura antes de seguir.

## Paso 2: Recorrer el checklist

Revisa cada punto en orden. El sitio es una sola página con estas secciones (ver `src/components/`): Navbar, Hero, Services, Store, HowItWorks, Testimonials, PaymentMethods, Footer, WhatsAppButton. El copy vive centralizado en `src/data/content.js`.

### 1. Se ve bien en móvil
Usa `resize_window` con el preset `mobile` (375px de ancho) y recorre toda la página con scroll. Busca: texto cortado o superpuesto, elementos que se salen del viewport (scroll horizontal no deseado), botones o tarjetas que colapsan mal, imágenes que no escalan. Toma capturas de las zonas problemáticas para poder describirlas con precisión en el reporte.

### 2. Todos los botones y links llevan a donde deben
Usa `read_page` para listar todos los elementos interactivos (CTAs, links del Navbar, botones de Services/Store, el botón de WhatsApp, links del Footer). Para cada uno, compara el texto visible contra su destino real (`href`, `onClick`, ancla `#seccion`). Un botón que dice "Ver productos" debe llevar a la sección o link correcto, no a `#` o a un destino vacío. Presta especial atención al botón de WhatsApp: confirma que el número y el mensaje prellenado (si existe) tengan sentido.

### 3. No hay textos de relleno
Revisa `src/data/content.js` y cada componente en `src/components/` buscando "lorem ipsum", "TODO", "texto de ejemplo", "Company Name", direcciones o teléfonos claramente inventados, o cualquier copy que se sienta como placeholder olvidado en vez de contenido real del negocio.

### 4. Las imágenes cargan
Usa `read_network_requests` para detectar imágenes con error (404, tipo de contenido roto) y `read_console_messages` para warnings de recursos faltantes. Revisa también que ningún `<img>` esté usando un alt vacío en una imagen que aporta información (no confundir con imágenes puramente decorativas).

### 5. El copy usa el tono de la marca
No existe todavía una guía de marca documentada para Reboot PC Store, así que evalúa el tono por **consistencia interna**: lee todo `src/data/content.js` de corrido primero para calibrar el tono predominante (cercano/formal, técnico/casual, con humor o serio), y luego señala los fragmentos que se sientan fuera de ese tono — por ejemplo, una sección de pronto muy formal cuando el resto es cercana, o un texto genérico de plantilla que no suena a como habla el resto del sitio.

## Paso 3: Entregar el reporte

Devuelve la lista de problemas directamente en el chat, en texto plano (no artifact), agrupada por prioridad:

- **Alta**: rompe la experiencia o dice algo falso/roto (link muerto, imagen caída, layout roto en móvil, placeholder visible al usuario).
- **Media**: funciona pero se ve mal o desentona (tono inconsistente, espaciado raro en móvil que no rompe nada).
- **Baja**: detalles menores, cosméticos.

Para cada problema incluye: qué está mal, dónde (componente/archivo o sección visible), y por qué importa. Si no hay problemas en algún punto del checklist, dilo explícitamente ("sin problemas encontrados") en vez de omitirlo — así el usuario sabe que ese punto sí se revisó.

Termina siempre preguntando si quiere que arregles alguno de los problemas reportados. No toques código de `src/` hasta que el usuario apruebe explícitamente cuáles arreglar.
