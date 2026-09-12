---
name: design-plan
description: Convierte un spec ya aprobado de Reboot PC Store en el plan técnico de implementación, y lo guarda en `docs/plans/YYYY-MM-DD-titulo.md` con cuatro secciones (Objetivo, Contexto del problema, Spec de referencia, Tareas a implementar). Úsalo cuando el usuario apruebe el spec escrito por `design-spec`, o cuando pida "armemos el plan", "cómo lo implementamos", "desglosa esto en tareas", "plan de implementación". Requiere un spec aprobado en `docs/specs/` — si no existe, corre `design-spec` primero. NO usar para empezar a codear: este skill entrega el plan, no la implementación.
---

# Plan de implementación

Este skill produce **un archivo**: `docs/plans/YYYY-MM-DD-titulo.md`. Es la contraparte técnica del spec: donde el spec dice *qué debe pasar para el usuario*, el plan dice *qué vamos a construir, en qué orden y cómo sabemos que cada paso quedó bien*.

## La diferencia con `design-spec`

Son documentos distintos a propósito, y el detalle técnico que el spec prohíbe es justamente lo que acá se espera.

| | `design-spec` | `design-plan` (este) |
|---|---|---|
| Punto de vista | El usuario | Quien implementa |
| Responde | Qué debe pasar y por qué | Cómo lo construimos y en qué orden |
| Lo valida | El dueño del negocio | Quien va a escribir el código |
| Archivos, dependencias, esquemas | Prohibidos | Obligatorios |

Un plan sin nombres de archivo, sin orden y sin forma de verificar cada paso no es un plan: es el spec repetido con otras palabras.

## Paso 1: Partir del spec aprobado

**Este skill requiere un spec aprobado.** Antes de escribir nada:

1. Ubica el spec en `docs/specs/`. Si el usuario no dijo cuál, busca el más reciente que corresponda al feature y **confirma con él que es ese** antes de seguir.
2. Léelo completo. El plan no reinterpreta el spec: lo traduce. Si vas a construir algo que el spec no pide, o a dejar afuera algo que sí pide, eso es un cambio de alcance y hay que decirlo en voz alta, no esconderlo en una tarea.
3. Si no hay spec, no improvises uno mentalmente: dilo y propón correr `design-spec`.
4. Lee `CLAUDE.md` y los archivos de `src/` que el feature va a tocar. El plan tiene que encajar con las convenciones que ya existen (copy centralizado en `src/data/content.js`, iconos por nombre, tokens de Tailwind, `buildWhatsAppLink`).

**Si al planear descubres que el spec tiene un hueco** — un comportamiento sin definir, una regla de negocio ambigua, dos secciones que se contradicen — páralo ahí. Nombra el hueco y propón volver a `design-spec` a cerrarlo. Rellenarlo por tu cuenta desde el plan es la forma más común de construir algo que el usuario no aprobó.

## Paso 2: Escribir el documento

**Ruta y nombre.** Obtén la fecha real con `date +%F` — nunca la adivines. **Usa el mismo slug del spec** para que los dos documentos se emparejen a simple vista: si el spec es `docs/specs/2026-03-14-modulo-inventario.md`, el plan es `docs/plans/2026-03-20-modulo-inventario.md` (la fecha del plan es la de hoy, no la del spec). Crea `docs/plans/` si no existe.

**Idioma:** español de Colombia. **Extensión:** lo que haga falta, pero sin relleno — el plan se lee mientras se trabaja.

Las cuatro secciones, en este orden:

### 1. Objetivo
Dos o tres frases: qué vamos a construir y cuándo se considera terminado. Un criterio de terminado verificable, no "que funcione bien". Si el feature se va a construir por etapas, di cuál es la que cubre este plan.

### 2. Contexto del problema
Por qué se está construyendo esto, en versión corta — el plan tiene que sostenerse solo, sin que haya que abrir el spec para entender de qué se trata. Agrega acá el contexto **técnico** que el spec no podía tener: qué existe hoy en el repo que se va a reusar o modificar, qué no existe y hay que crear, y si el feature obliga a introducir infraestructura nueva (backend, persistencia, router, autenticación), porque eso cambia el deploy en Railway y el mantenimiento.

Si hay decisiones ya tomadas que restringen el plan — el approach elegido en `brainstorming`, una regla de `CLAUDE.md` como que `costo_compra` nunca sale al frontend público — nómbralas acá.

### 3. Spec de referencia
La **ruta relativa exacta** del spec aprobado: `docs/specs/YYYY-MM-DD-titulo.md`. Agrega en dos o tres líneas qué cubre ese spec, y anota cualquier punto donde el plan se desvíe de él y por qué — si no hay desvíos, dilo explícitamente.

Si quedaron cosas pendientes de confirmar con el negocio (precios, garantías, quién responde el WhatsApp), repítelas acá: son las que pueden frenar la implementación a mitad de camino.

### 4. Tareas a implementar
El corazón del plan. Una lista **ordenada**, con estas reglas:

- **Cada tarea deja el sitio funcionando.** No planees estados intermedios rotos donde la landing no carga. Si algo no se puede hacer en un solo paso sin romper, di explícitamente cómo se mantiene funcional mientras dura.
- **Del tamaño de un commit.** Si una tarea necesita más de tres o cuatro subpuntos, pártela. Si es de una línea, únela con la vecina.
- **Empieza por lo que desbloquea.** Datos y estructura antes de la UI que los consume; lo que tenga más riesgo o más incertidumbre, temprano, no al final.
- **Numeradas**, para poder decir "vamos por la 3".

Para cada tarea escribe:

1. **Qué hace** — en una frase, en términos de lo que queda construido.
2. **Archivos** — rutas concretas: qué se crea, qué se modifica. Acá sí van nombres de componentes, funciones y campos de datos.
3. **Detalles** — lo que quien implementa necesita saber y no es obvio: la forma de los datos, el nombre de los campos, qué convención del proyecto aplica, dependencias nuevas (con el motivo de cada una), qué casos del spec cubre esta tarea.
4. **Cómo se verifica** — la parte que no se puede omitir. Qué mirar para saber que quedó: qué se ve en el preview, qué dejó de fallar, qué caso borde del spec ya responde bien. Si se verifica en el navegador, recuerda que se usa el Browser pane con la config `reboot-pc-store-dev` — **no se arranca el dev server con Bash**.
5. **Depende de** — el número de la tarea previa, si aplica.

Cierra la lista con dos ítems que casi siempre faltan:

- **Los estados vacíos y los errores del spec** (sección 6 del spec) como tareas propias o como parte explícita de una tarea. Si no aparecen en el plan, no se construyen.
- **Correr la skill `revision-final`** antes de dar por terminado el feature.

Si algo del plan es una **suposición técnica** que habría que validar antes (que un servicio gratuito alcance, que una librería sirva), márcalo como tal en la tarea en vez de darlo por hecho.

## Paso 3: Entregar

1. Escribe el archivo y di la ruta exacta.
2. Resume el plan en el chat: cuántas tareas son, por dónde arranca, y cuál es la de más riesgo o más incertidumbre.
3. Señala explícitamente cualquier **desvío del spec**, hueco que encontraste, o dependencia nueva que el plan introduce. Es lo que el usuario necesita aprobar con más cuidado.
4. Pregunta si arrancamos por la tarea 1.

**No implementes en el mismo turno**, salvo que el usuario lo pida. Si pide cambios al plan, edítalos en el mismo archivo — no crees una versión nueva con otra fecha. A medida que las tareas se completan, este archivo es el lugar donde se marca el avance.
