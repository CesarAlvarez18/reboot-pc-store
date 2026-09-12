---
name: verify-after-changes
description: Verifica en el navegador que un feature recién implementado de Reboot PC Store realmente cumple lo que prometían su plan y su spec — levanta el servidor local, elige 5 casos de prueba importantes, los prueba de verdad haciendo clic, contrasta el resultado contra `docs/plans/` y `docs/specs/`, arregla lo que falle y da luz verde solo cuando pasa todo. Úsalo cuando se considere terminada la implementación de un plan, o cuando el usuario diga "ya quedó", "termina y prueba", "verifica que funcione", "probemos los cambios", "listo, revisa". NO usar para QA general del sitio antes de un deploy (para eso está `revision-final`), ni a mitad de la implementación con tareas del plan todavía pendientes.
---

# Verificación después de implementar

Este skill cierra el ciclo de un feature. Su pregunta es una sola: **lo que se construyó, ¿hace lo que el spec prometió?** Y se responde probando en el navegador, no leyendo el código.

## La regla que define este skill

**Leer el código no es probar.** Que una función se vea correcta no dice nada sobre qué pasa cuando alguien hace clic. Cada caso de prueba de este skill se ejecuta de verdad en el Browser pane: navegar, hacer clic, escribir, mirar el resultado. Si un caso no se puede probar en el navegador, dilo explícitamente en vez de darlo por bueno.

**Y esto no es lo mismo que `revision-final`:**

| | `verify-after-changes` (este) | `revision-final` |
|---|---|---|
| Alcance | El feature que se acaba de implementar | Todo el sitio |
| Contra qué compara | Su plan y su spec | Un checklist fijo de calidad |
| ¿Arregla? | **Sí**, lo que falle dentro del alcance | No, solo reporta |
| Cuándo | Al terminar un plan | Antes de entregar o desplegar |

Van uno después del otro: primero este, y cuando el feature pase, `revision-final` antes del deploy.

## Paso 1: Recuperar el plan y el spec

No se puede verificar contra la memoria de la conversación. Antes de probar, lee los dos documentos:

- **El plan:** `docs/plans/YYYY-MM-DD-titulo.md` — de ahí sale la lista de tareas que debían quedar hechas y el criterio de terminado del Objetivo.
- **El spec:** `docs/specs/YYYY-MM-DD-titulo.md` — **mismo slug que el plan**, y su ruta exacta está en la sección "Spec de referencia" del plan. De ahí sale el comportamiento esperado (sección 5), el alcance de la v1 (sección 4) y los errores que debían estar cubiertos (sección 6).

Si hay varios y no está claro cuál corresponde, pregunta antes de seguir. Si no existe ninguno de los dos, dilo: se puede probar igual, pero será contra el criterio de quien prueba y no contra algo acordado — y eso hay que decirlo, no disimularlo.

Revisa también que las tareas del plan estén efectivamente todas hechas. Si quedaron pendientes, este skill es prematuro: dilo y termina ahí.

## Paso 2: Levantar el servidor

Usa el Browser pane: `preview_start` con `{"name": "reboot-pc-store-dev"}` (config en `.claude/launch.json`, puerto 5173). **Nunca arranques el dev server con Bash.**

Si ya estaba corriendo, reutilízalo. Confirma que la página cargó con `read_page` antes de probar nada, y revisa la consola de una vez: un error de arranque cambia todo lo que sigue.

## Paso 3: Elegir 5 casos de prueba

Exactamente **5**, elegidos por importancia, no por facilidad. Escríbelos en el chat **antes** de ejecutarlos, para que el usuario pueda decir "falta este" mientras todavía sirve.

Salvo que el feature justifique otra cosa, repártelos así — esta distribución cubre lo que de verdad se rompe:

1. **El camino principal completo**, de punta a punta, tal como lo describe la sección 5 del spec. Si el flujo termina en WhatsApp, verifica el link y el mensaje prellenado.
2. **El mismo flujo en móvil**, con `resize_window` en preset `mobile` (375px). La mayoría del tráfico del negocio llega desde el celular.
3. **Un estado vacío** — categoría sin equipos, filtro sin resultados, lista sin cargar todavía.
4. **Un caso de error o borde** de la sección 6 del spec: campo incompleto, doble envío, dato raro, imagen que no carga.
5. **La regla de negocio más crítica**, o el punto de mayor riesgo que el plan haya marcado. En este proyecto, cuando el feature toca inventario, lo primero es confirmar que **`costo_compra` no llega nunca al frontend público** — verifícalo en el payload real con `read_network_requests`, no en el código.

Para cada caso di qué esperas que pase **antes** de ejecutarlo. Si no lo escribes primero, es demasiado fácil mirar lo que salió y decidir que eso era lo esperado.

## Paso 4: Probar y recoger evidencia

Ejecuta cada caso en el navegador y guarda la evidencia mientras pruebas:

- `computer` para navegar, hacer clic y escribir; `read_page` para confirmar contenido y estructura.
- `read_console_messages` para errores de JavaScript.
- `read_network_requests` para peticiones fallidas, imágenes en 404 y para inspeccionar payloads.
- Capturas de las zonas problemáticas, y de móvil.

Un caso pasa solo si el resultado coincide con lo que escribiste que esperabas. "Se ve más o menos bien" no es un caso que pasa.

## Paso 5: Contrastar contra el plan y el spec

Recoge el feedback de las 5 pruebas y compáralo punto por punto. Reporta en el chat con este veredicto por caso: **cumple**, **cumple parcial**, **no cumple**, o **no se pudo probar** (con el motivo).

Después, dos revisiones que no salen de los 5 casos:

- **Contra el plan:** ¿quedaron hechas todas las tareas? ¿el criterio de terminado del Objetivo se cumple?
- **Contra el spec:** ¿todo lo que estaba en "Entra" de la v1 está funcionando? ¿se coló algo de la lista "Queda fuera"?

Clasifica cada hallazgo, porque de eso depende qué hacer con él:

- **Defecto** — está construido pero funciona mal. Se arregla ahora.
- **Faltante** — el plan o el spec lo pedían y no está. Se construye ahora, si cabe en el alcance de la v1.
- **Hueco del spec** — el caso no estaba contemplado y no hay respuesta acordada. **No lo inventes:** nómbralo y pregunta.
- **Fuera de alcance** — es de la lista "Queda fuera". No se arregla; se anota y sigue.

## Paso 6: Arreglar o dar luz verde

**Si hay defectos o faltantes:** arréglalos. Trabaja sobre `src/` respetando las convenciones de `CLAUDE.md` (copy en `src/data/content.js`, tokens de Tailwind, `buildWhatsAppLink`). Después de arreglar, **vuelve a correr los casos afectados** — un arreglo sin volver a probar no cuenta como arreglado. Repite hasta que pasen.

Dos límites que no se cruzan solos:
- Si el arreglo implica **cambiar el alcance** o contradecir el spec, para y pregunta. Eso es una decisión del usuario, no del que prueba.
- Si después de dos intentos un caso sigue fallando, deja de insistir: explica qué está pasando y qué opciones hay.

**Luz verde** solo cuando se cumplan las cuatro:
1. Los 5 casos pasan.
2. No hay errores en consola ni peticiones fallidas relacionadas con el feature.
3. Todas las tareas del plan están hechas.
4. Todo lo de "Entra" en la v1 del spec funciona.

Si falta alguna, no hay luz verde: dilo con precisión y di qué falta. Una verificación que siempre aprueba no sirve para nada.

Al dar luz verde, cierra con: qué se probó, qué se arregló en el camino, lo que quedó anotado como fuera de alcance, y la recomendación de correr **`revision-final`** antes de desplegar.
