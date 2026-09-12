---
name: brainstorming
description: Clarifica un feature nuevo de Reboot PC Store antes de escribir una sola línea de código — hace preguntas para eliminar la ambigüedad del objetivo y termina proponiendo 2 o 3 approaches concretos para que el usuario elija cómo armar el plan. Úsalo siempre que el usuario esté arrancando algo nuevo en este proyecto: "quiero agregar", "vamos a hacer", "necesito una sección/módulo/página", "se me ocurrió que el sitio podría", "cómo hago para que el sitio haga X", o cuando traiga una idea de feature a medio formar. También cuando pida un plan para algo que todavía no está definido. NO usar para bugs, ajustes de copy o cambios cosméticos de algo que ya existe, ni una vez el approach ya está elegido (ahí se pasa directo a implementar).
---

# Brainstorming de un feature nuevo

Este skill convierte una idea vaga de feature en una decisión tomada. Hace preguntas hasta que el objetivo quede sin ambigüedad, y cierra con 2 o 3 approaches concretos entre los que el usuario elige. **No escribe código ni edita archivos de `src/` durante todo el proceso.**

## Por qué existe

En este proyecto el costo de arrancar a codear sin definir es alto, por una razón estructural: hoy el repo es una SPA de Vite **estática, sin backend y sin base de datos**. Muchos features que suenan simples ("que el cliente pueda dejar sus datos", "que se puedan subir fotos de los equipos", "un panel para ver el inventario") en realidad obligan a decidir si se abre persistencia — y esa decisión cambia el deploy, el hosting y el mantenimiento. Si se descubre a mitad de la implementación, hay que botar trabajo.

El segundo motivo: el usuario es quien decide el rumbo del producto. El rol de este skill es poner las opciones sobre la mesa con sus costos reales, no elegir por él.

## Paso 1: Anclar en la realidad del proyecto

Antes de preguntar nada, lee `CLAUDE.md` y los archivos que el feature tocaría (típicamente `src/data/content.js`, `src/App.jsx` y los componentes de `src/components/`). Nunca preguntes algo que el código ya responde — es la forma más rápida de quemar la paciencia del usuario.

Clasifica mentalmente el feature en uno de estos tres tipos, porque determina qué preguntar:

- **Tipo A — Cabe en lo que ya existe.** Contenido o secciones nuevas que salen con `content.js` + un componente. Sin infraestructura nueva.
- **Tipo B — Necesita guardar o recibir datos.** Formularios, inventario, subida de fotos, cualquier cosa con estado que sobreviva al refresh. Obliga a decidir backend/persistencia.
- **Tipo C — Cambia la arquitectura.** Router y varias páginas, autenticación, migración a Next.js, cambio de deploy.

Si es Tipo B o C, dilo explícitamente al usuario en una frase desde el arranque: que lo que pide implica añadir algo que el proyecto hoy no tiene. Esa frase suele reencuadrar la conversación entera.

## Paso 2: Preguntar para eliminar la ambigüedad

Usa la herramienta `AskUserQuestion` con opciones concretas, no preguntas abiertas de ensayo — el usuario elige más rápido de lo que redacta. Máximo 4 preguntas por tanda, y **máximo 2 tandas**. Si después de eso sigue habiendo huecos, asume lo más razonable, dilo en voz alta y sigue; no interrogues sin parar.

Prioriza las preguntas cuya respuesta **cambia el approach**. Ignora las que solo cambian detalles que se resuelven después.

Ejes de ambigüedad ordenados por cuánto muerden en este proyecto:

1. **¿Público o back-office?** ¿Lo ve un cliente que entra a `rebootpcstore.com`, o es una herramienta interna para el técnico? Define seguridad, tono y si la ruta va protegida.
2. **¿Los datos tienen que persistir?** ¿Basta con que viva en `content.js` y se edite por commit, o alguien necesita cambiarlo sin tocar código? Esta es *la* pregunta que define si el feature es estático o abre backend.
3. **¿Qué hace el usuario final con esto?** Pide el recorrido concreto: qué ve, qué toca, qué pasa después. Si el feature no termina en una acción clara (típicamente: escribir por WhatsApp), probablemente el objetivo todavía está difuso.
4. **¿Reemplaza o alimenta el flujo de WhatsApp?** Hoy todo cierre de venta sale por WhatsApp. Un feature que intente cerrar la venta dentro del sitio es un cambio de modelo de negocio, no un feature — hay que nombrarlo como tal.
5. **¿Cuál es el mínimo que ya sirve?** Qué versión recortada del feature ya le resuelve algo al negocio esta semana. Casi siempre existe y casi nunca es lo primero que el usuario describe.
6. **¿Cómo sabremos si funcionó?** Más conversaciones de WhatsApp, menos tiempo cargando un equipo al inventario, menos preguntas repetidas de clientes. Si no hay forma de saberlo, vale la pena decirlo antes de construir.

Si el usuario responde algo que contradice lo que está en el código o en `CLAUDE.md`, señálalo en el momento con el archivo y la línea. No lo dejes pasar para "aclararlo después".

## Paso 3: Presentar 2 o 3 approaches

Este es el entregable del skill. Reglas:

- **Entre 2 y 3 opciones, nunca más.** Si solo hay un camino razonable, di eso y explica por qué los otros no aplican — inventar alternativas de relleno es peor que ofrecer una sola.
- **Cada approach debe diferenciarse en un eje real**, no en detalles de implementación. Ejes que suelen ordenar bien las opciones en este proyecto: *estático vs. con persistencia*, *manual vs. automatizado*, *ahora recortado vs. después completo*, *dentro de Vite vs. servicio externo*.
- **Ninguna opción puede ser un hombre de paja.** Si una la pondrías solo para que la otra se vea bien, sácala.

Para cada approach escribe, en este orden y en prosa breve (no una tabla por opción):

1. **Qué es** — en una o dos frases, en términos de lo que el usuario vería funcionando.
2. **Qué se toca** — archivos y piezas concretas del repo, y qué dependencia o servicio nuevo entra (si entra alguno).
3. **Qué cuesta** — esfuerzo relativo (una tarde / unos días / un proyecto aparte) y qué se complica después: deploy, costos mensuales, mantenimiento.
4. **Qué se sacrifica** — el trade-off honesto, y la deuda técnica que deja.

Cierra con una **recomendación explícita y argumentada**: cuál elegirías y por qué, dada la etapa del negocio. No te escondas en "depende de lo que prefieras" — el usuario está pidiendo una opinión técnica. Pero que quede claro que la decisión es suya.

Presenta los approaches en el chat como texto, y luego usa `AskUserQuestion` para que elija, poniendo tu recomendación como primera opción.

## Paso 4: Cerrar

Cuando el usuario elija:

1. Resume en 3 o 4 líneas el acuerdo: **objetivo** (una frase, sin ambigüedad), **approach elegido**, **alcance de esta primera versión**, y **lo que queda explícitamente fuera**.
2. Ofrece armar el plan de implementación paso a paso.
3. Si el feature es Tipo B o C, recuerda que `CLAUDE.md` pide confirmar el enfoque antes de añadir backend o persistencia — y que si el acuerdo cambia el rumbo del proyecto (backend, router, autenticación, base de datos), vale la pena registrarlo en la sección "Dirección planeada" de `CLAUDE.md`.

No empieces a implementar en el mismo turno en que el usuario elige, salvo que lo pida explícitamente. El skill termina con la decisión tomada y el plan ofrecido.
