---
name: design-spec
description: Escribe el documento de especificación de un feature de Reboot PC Store desde el punto de vista del usuario, y lo guarda en `docs/specs/YYYY-MM-DD-titulo.md` con seis secciones fijas (Overview, Usuarios objetivo, Contexto del problema, Alcance v1, Comportamiento esperado, Posibles errores y mitigaciones). Úsalo cuando ya hay claridad sobre el problema y sobre qué se quiere construir — típicamente justo después de la skill `brainstorming`, o cuando el usuario pida "escribe el spec", "documenta este feature", "armemos la especificación", "déjalo por escrito antes de codear". NO usar cuando el objetivo todavía está difuso (ahí va `brainstorming` primero), ni para escribir el plan técnico de implementación — este documento describe comportamiento observable, no arquitectura ni código.
---

# Especificación de un feature

Este skill produce **un archivo**: `docs/specs/YYYY-MM-DD-titulo.md`. El documento describe el feature desde la perspectiva de quien lo va a usar — el cliente que entra a `rebootpcstore.com` o el técnico que carga inventario — no desde la perspectiva de quien lo va a construir.

## La regla que define este skill

**Nada de implementación.** Si una frase solo la entiende alguien que leyó el código, no va en este documento.

| Va | No va |
|---|---|
| "El cliente ve los equipos disponibles con su precio y puede pedir más información" | "Se renderiza un `.map()` sobre `productCategories`" |
| "Si la foto pesa demasiado, se le avisa antes de guardar" | "Comprimir la imagen antes de subirla al storage" |
| "El técnico no puede guardar un equipo sin precio de venta" | "Validar el payload en el handler del POST" |
| "El precio de costo nunca es visible para un cliente" | "Excluir `costo_compra` del serializer" |

Esto no es formalidad: el valor del documento es que el usuario pueda leerlo, entenderlo completo y decir "sí, eso es lo que quiero" **antes** de que se escriba código. Un spec lleno de detalle técnico no se puede validar así, y congela decisiones de implementación antes de tiempo, cuando todavía conviene dejarlas abiertas.

Nombres de archivos o componentes del repo solo se mencionan si aclaran de qué parte del sitio se habla (por ejemplo "la sección Tienda"), nunca como instrucción de implementación.

## Paso 1: Reunir el insumo

Este skill asume que el problema ya está claro. Antes de escribir:

1. Lee `CLAUDE.md` para el contexto del negocio y el estado real del proyecto.
2. Revisa la conversación previa: si viene de `brainstorming`, ahí está el objetivo sin ambigüedad, el approach elegido, el alcance de la v1 y lo que quedó fuera. Reúsalo — **no repitas el interrogatorio**.
3. Si el feature toca algo que ya existe, míralo en `src/` para no especificar comportamiento que contradiga lo que hay.

Si falta información imprescindible para una sección (típicamente el alcance de la v1, o quién es el usuario exacto), pregunta con `AskUserQuestion` — **máximo 3 preguntas, una sola tanda**. Si el objetivo resulta estar más difuso de lo que parecía, dilo y propón correr `brainstorming` en vez de inventar un spec sobre arena.

## Paso 2: Escribir el documento

**Ruta y nombre.** Obtén la fecha real con `date +%F` — nunca la adivines ni la deduzcas de la conversación. El título es un slug corto en kebab-case, en español, que se entienda solo: `2026-03-14-modulo-inventario.md`, `2026-03-14-filtro-catalogo.md`. Crea `docs/specs/` si no existe.

**Idioma:** español de Colombia, como el resto del proyecto.

**Extensión:** entre una y tres páginas. Un spec que nadie lee completo no sirve para validar nada. Prosa breve; listas solo donde de verdad son listas.

Las seis secciones, en este orden exacto:

### 1. Overview
Dos o tres frases: qué es el feature y qué cambia para quien lo usa. Alguien que no estuvo en la conversación debería entender de qué se trata leyendo solo esto. Sin preámbulo ni justificación — eso va en la sección 3.

### 2. Usuarios objetivo
Quién lo usa, en concreto. En este proyecto los perfiles reales son: **el cliente final** (busca reparación o quiere comprar un equipo, llega por redes o buscador, casi siempre desde el celular), **el técnico** (carga y actualiza inventario, necesita rapidez y consistencia) y **el dueño del negocio** (quiere ver qué hay, qué se vendió y a qué precio).

Si hay más de un perfil, di qué necesita cada uno del feature — suelen querer cosas distintas y a veces en tensión. Si es uno solo, dilo explícitamente: acota igual de bien.

### 3. Contexto del problema
Qué duele hoy y por qué vale la pena resolverlo. Cómo se hace actualmente (aunque sea "por WhatsApp a mano" o "no se hace") y qué cuesta eso: tiempo perdido, ventas que no se cierran, datos inconsistentes, clientes que preguntan lo mismo una y otra vez.

Aquí va también, en una frase, **cómo sabremos si funcionó**. Si no hay forma de saberlo, decirlo es más honesto que inventar una métrica.

### 4. Alcance v1
Dos listas explícitas:

- **Entra** — lo mínimo que ya le sirve al negocio.
- **Queda fuera** — lo que se consideró y se decidió dejar para después, con la razón en media línea.

La segunda lista importa tanto como la primera: es la que evita que el alcance se infle mientras se construye. Si `brainstorming` ya definió esto, respétalo tal cual; no lo amplíes por iniciativa propia.

### 5. Comportamiento esperado
El corazón del documento. Describe el recorrido completo: qué ve el usuario, qué hace, qué pasa después. Usa el orden en que ocurre, no el orden en que se programaría.

Cubre siempre:
- El **camino principal**, paso a paso, de principio a fin.
- Los **estados vacíos**: qué se ve cuando no hay nada todavía (una categoría sin equipos, un filtro sin resultados). Se olvidan casi siempre y son lo primero que encuentra el usuario real.
- **En móvil**, si el comportamiento cambia. La mayoría del tráfico de este negocio llega desde el celular; un comportamiento que solo funciona en escritorio está incompleto.
- **Dónde termina.** Si desembocar en WhatsApp es parte del flujo, cuál es el mensaje prellenado y qué contexto lleva.
- Qué se **guarda** o cambia de forma permanente, descrito como dato del negocio ("el equipo queda registrado con sus fotos"), no como esquema.

Si el feature tiene reglas de negocio, van acá en lenguaje llano: qué es obligatorio, qué combinaciones no tienen sentido, qué nunca debe ver un cliente.

### 6. Posibles errores y mitigaciones
No es una sección de relleno. Piensa en lo que de verdad se va a romper, y para cada caso di **qué ve el usuario** y **qué puede hacer al respecto** — no cómo lo maneja el código.

Recorre al menos estas familias:
- **El usuario se equivoca:** campos incompletos, datos raros, doble envío del mismo formulario.
- **Algo falla afuera:** sin internet, la foto no sube, WhatsApp no está instalado en el equipo, una imagen del catálogo no carga.
- **Casos borde de los datos:** un equipo cargado dos veces, un precio en cero, una categoría vacía, textos mucho más largos de lo previsto.
- **Riesgos del negocio:** información que no debería ser pública (el precio de costo nunca llega al cliente), un equipo ya vendido que sigue apareciendo disponible, promesas de garantía que el spec dé por sentadas sin que nadie las haya confirmado.

Una mitigación que sea "mostrar un error" no es una mitigación: di qué dice el mensaje y cuál es la salida para el usuario.

## Paso 3: Entregar

1. Escribe el archivo y dile al usuario la ruta exacta.
2. Resume en 3 o 4 líneas las decisiones que tomaste por tu cuenta al redactar — los supuestos que llenaron huecos de la conversación. Es lo que el usuario necesita revisar con más cuidado.
3. Señala lo que quedó **pendiente de confirmar** con el negocio, si algo quedó así (precios, tiempos de garantía, quién responde el WhatsApp).

## Paso 4: Approval gate

El spec no avanza solo. Después de entregarlo, **pregunta explícitamente con `AskUserQuestion`** si lo aprueba, con estas tres opciones:

- **Aprobar y armar el plan** — el spec refleja lo que quiere.
- **Iterar el spec** — hay algo que cambiar, quitar o agregar.
- **Dejarlo ahí por ahora** — queda escrito para revisarlo después.

Qué hacer con cada respuesta:

**Si aprueba:** corre la skill `design-plan`, que traduce este spec en el plan técnico de implementación (`docs/plans/YYYY-MM-DD-titulo.md`). Pásale la ruta del spec aprobado. No empieces a implementar directamente: entre el spec y el código va el plan.

**Si pide iterar:** edita **el mismo archivo** — no crees una versión nueva con otra fecha, o terminan cinco specs del mismo feature sin saber cuál rige. Aplica los cambios, di en una o dos líneas qué quedó distinto, y **vuelve a preguntar**. El gate se repite tantas veces como haga falta; el spec no se da por aprobado por cansancio ni porque el usuario dejó de objetar.

**Si lo deja pendiente:** confirma que el archivo queda guardado en su ruta y no hagas nada más.

**Nunca des el spec por aprobado implícitamente.** Un "está bien" o "dale" ambiguo en medio de otra conversación no es la aprobación: si hay duda, pregunta de nuevo. Y **no implementes nada en el mismo turno** — este skill entrega un documento para validar, no el feature.
