# Módulo de inventario de equipos usados

## 1. Overview

Una herramienta interna donde el equipo técnico registra cada computador usado que
entra al negocio — sus características, su estado real, sus fotos y su precio — y
decide con un clic si se publica en el sitio. Lo que se publica aparece de inmediato
en una sección nueva de rebootpcstore.com llamada "Usados disponibles", donde el
cliente ve el equipo con fotos reales, su precio y su garantía, y escribe por
WhatsApp para comprarlo.

Hoy el catálogo del sitio es fijo y genérico. Con esto pasa a mostrar el inventario
que de verdad hay en bodega, en el momento en que lo hay.

## 2. Usuarios objetivo

**El técnico** es quien más lo usa. Está en bodega, con el equipo abierto al frente y
el celular en la mano, y acaba de terminar la revisión. Necesita registrar lo que
acaba de comprobar antes de que se le olvide o antes de pasar al siguiente equipo.
Lo que le importa es velocidad: pocos toques, casi todo elegido de listas, sin tener
que pensar cómo escribir una especificación para que quede igual que la del equipo
anterior. No está sentado en un escritorio y no va a llenar un formulario largo.

**El dueño del negocio** entra a ver qué hay, qué se vendió y a qué precio. Le
importa saber en cuánto se compró cada equipo y cuánto se ganó — información que
solo él y los técnicos pueden ver.

**El cliente final** llega desde redes o desde el buscador, casi siempre en celular.
Quiere ver equipos de verdad, no categorías: fotos del computador que le van a
vender, en qué estado está, cuánto cuesta y qué garantía tiene. Si le sirve, escribe
por WhatsApp.

Los tres quieren cosas distintas del mismo dato y hay una tensión real: el técnico
quiere registrar rápido, el cliente quiere ver completo. El formulario tiene que
resolver esa tensión pidiendo lo mínimo indispensable para que una publicación se
vea bien.

## 3. Contexto del problema

Hoy no existe ningún registro de inventario. Lo que se sabe de un equipo usado vive
en la cabeza del técnico que lo revisó, en fotos sueltas en el celular y en
conversaciones de WhatsApp. Cuando un cliente pregunta "¿qué portátiles usados
tienen?", alguien tiene que acordarse, buscar las fotos y armar la respuesta a mano,
cada vez.

Del lado del sitio, la sección Tienda muestra tres categorías con ejemplos inventados
y fotos de relleno. Un cliente que entra buscando un usado no ve ni un solo equipo
real: ve "Business Refurbished, Core i7, 8GB RAM" y una imagen gris. Tiene que
escribir para enterarse de lo básico, y muchos no escriben.

Además, cada cambio del catálogo obliga hoy a modificar el código y volver a
desplegar el sitio. Nadie del equipo técnico puede publicar un equipo por su cuenta.

**Cómo sabremos si funcionó:** que los equipos usados se publiquen el mismo día en
que entran a bodega, y que las conversaciones de WhatsApp empiecen con el cliente
preguntando por un equipo concreto en vez de preguntando qué hay disponible.

## 4. Alcance v1

**Entra:**

- Acceso privado al módulo con usuario y contraseña. Cada técnico tiene el suyo.
- Formulario de registro de un equipo usado, pensado para celular, con casi todos los
  campos como listas desplegables.
- Subida de varias fotos por equipo, tomadas o elegidas desde el celular.
- Registro del costo de compra y del precio de venta, con el margen a la vista de
  quien está adentro.
- Listado interno de todos los equipos, con búsqueda y filtro por estado.
- Publicar o despublicar un equipo, y marcarlo como vendido.
- Sección pública nueva "Usados disponibles" en la landing, alimentada por lo que esté
  publicado, con enlace directo a WhatsApp por equipo.

**Queda fuera:**

- Reemplazar las categorías actuales de la Tienda (nuevos y Typhoon Custom Builds
  siguen como están) — el modelo de datos está hecho para usados y forzarlo a
  describir equipos nuevos lo deforma.
- Carrito y pago en línea — el cierre sigue siendo por WhatsApp, como todo el sitio.
- Reportes, métricas o historial de ventas — primero hay que tener datos que reportar.
- Editar el copy de la landing desde el módulo — no es un CMS.
- Que el cliente reserve o aparte un equipo — exige manejar disponibilidad en tiempo
  real y compromisos que hoy nadie puede sostener.

## 5. Comportamiento esperado

### El técnico registra un equipo

El técnico entra a la dirección del módulo desde el navegador del celular y encuentra
una pantalla de ingreso. Escribe su correo y su contraseña. No hay registro abierto:
las cuentas las crea el dueño del negocio. Si se equivoca, puede reintentar; el módulo
no es accesible de ninguna forma sin haber ingresado.

Adentro ve el listado de equipos y un botón claro para agregar uno nuevo.

El formulario pide, en este orden: marca, procesador, memoria RAM, tipo y capacidad de
almacenamiento, estado de la batería, estado estético, meses de garantía, costo de
compra, precio de venta, fotos y notas. Salvo los tres últimos, todo se elige de una
lista — el técnico no escribe texto libre, toca una opción. Esto es deliberado: dos
técnicos distintos registrando el mismo modelo tienen que producir exactamente la
misma descripción.

El estado estético se califica del 1 al 5, donde 1 es un equipo desgastado y 5 es uno
como nuevo. La escala se muestra con su significado escrito al lado, no como un número
suelto.

El costo de compra se pide siempre y queda registrado a nombre de quien lo ingresó,
junto con su correo. Al lado del precio de venta, el técnico ve en vivo cuánto es el
margen de ese equipo, para no publicar por debajo de lo que costó sin darse cuenta.

Las fotos se suben desde la galería o tomándolas en el momento. Se pueden cargar hasta
seis por equipo; la primera es la que se ve como portada en el sitio. Mientras suben,
el técnico ve el avance de cada una y puede quitar la que salió mal. Las fotos se
guardan livianas sin que el técnico tenga que hacer nada: sube la foto original del
celular y el sistema se encarga de que el sitio no se ponga lento por eso.

Las notas son el único campo de texto libre, y están para lo que las listas no cubren:
una tecla dura, una bisagra floja, un cargador que no es original.

Al guardar, el equipo queda registrado **sin publicar**. Aparece en el listado interno
marcado como borrador. Publicar es un segundo paso y una decisión aparte: nada llega
al sitio público por accidente.

Son obligatorios la marca, el procesador, la RAM, el almacenamiento, el estado
estético, el costo de compra, el precio de venta y al menos una foto. Un equipo sin
foto no se puede publicar, porque el valor de la sección es que el cliente vea el
equipo real.

### El técnico publica, despublica y marca vendido

Desde el listado, cada equipo tiene tres estados posibles y el técnico los cambia
directamente: **borrador** (registrado, invisible al público), **publicado** (visible
en el sitio) y **vendido**.

Publicar tiene efecto inmediato: el equipo aparece en el sitio sin que nadie tenga que
desplegar nada. Despublicar lo saca igual de rápido.

Al marcar un equipo como vendido no desaparece del sitio: queda visible con un sello de
"Vendido" que lo distingue claramente, ya no se puede escribir por WhatsApp sobre él, y
se retira solo del sitio a los siete días. Esto muestra movimiento del negocio sin
dejar a un cliente escribiendo por algo que ya no existe.

El listado interno permite buscar por marca o procesador y filtrar por estado. Cada
fila muestra la foto de portada, las características resumidas, el precio de venta y
—solo aquí adentro— el costo de compra y el margen.

### El cliente ve los equipos en el sitio

En la página principal, debajo de la sección Tienda, aparece una sección nueva titulada
"Usados disponibles". Muestra los equipos publicados, los más recientes primero, cada
uno como una tarjeta con su foto de portada, la marca, las características en una línea
legible, el estado estético expresado en palabras ("Como nuevo", "Muy buen estado",
"Buen estado", "Con marcas de uso"), los meses de garantía y el precio de venta en
pesos colombianos.

**El precio de costo nunca se muestra ni llega de ninguna forma al sitio público.** No
está oculto en la página ni disponible para quien sepa dónde mirar: sencillamente no
sale del módulo interno. Esta es la regla más importante del feature.

Al tocar una tarjeta, el cliente ve el equipo completo: todas sus fotos, las
características desglosadas, el estado de la batería, las notas del técnico si las hay,
la garantía y el precio.

El botón principal lo lleva a WhatsApp con un mensaje ya escrito que identifica el
equipo, para que quien responda sepa de cuál se trata sin preguntar. Por ejemplo:
"Hola, me interesa el Lenovo ThinkPad T480 (Core i5, 16GB RAM, SSD 512GB) que vi en la
página por $1.450.000."

En celular las tarjetas se ven una debajo de otra, a lo ancho de la pantalla, y las
fotos del detalle se pasan deslizando. Los botones son lo suficientemente grandes para
el pulgar. La sección carga primero lo visible y las fotos de más abajo se cargan a
medida que el cliente baja, para no gastarle datos ni hacerlo esperar.

Si hay muchos equipos publicados, la sección muestra los nueve más recientes y un botón
para ver el resto.

### Estados vacíos

Si no hay ningún equipo publicado, la sección "Usados disponibles" **no se muestra en
blanco ni con un mensaje de error**: se muestra una invitación a escribir por WhatsApp
contando qué equipo está buscando, para que la ausencia de inventario siga siendo una
oportunidad de conversación y no un hueco en la página.

Si el técnico entra al módulo y todavía no hay ningún equipo registrado, ve una pantalla
que explica en una frase para qué sirve el módulo y un botón grande para registrar el
primero, no una tabla vacía.

Si una búsqueda o un filtro del listado interno no arroja resultados, se dice que no hay
coincidencias y se ofrece limpiar el filtro.

### Qué queda guardado

Cada equipo queda registrado de forma permanente con todas sus características, sus
fotos, su costo, su precio, quién lo registró y cuándo. Marcarlo como vendido no lo
borra: el negocio conserva el historial de lo que pasó por sus manos.

## 6. Posibles errores y mitigaciones

**El técnico deja campos sin llenar.** Al intentar guardar, los campos que faltan quedan
señalados y la pantalla sube hasta el primero de ellos, con el mensaje de qué falta. No
se pierde nada de lo ya escrito.

**El técnico toca guardar dos veces.** El botón se desactiva mientras se guarda y muestra
que está trabajando. No se crean dos equipos por un doble toque impaciente.

**Se le va el internet en bodega a media carga.** Si la conexión falla al guardar, se le
avisa que no se pudo guardar y que puede reintentar, y **el formulario conserva todo lo
que había llenado**. Perder quince campos por una barra de señal es la forma más rápida
de que deje de usar el módulo.

**Una foto no sube.** Se marca esa foto específica como fallida, con opción de reintentar
solo esa, sin afectar las que sí subieron ni obligar a empezar de nuevo. Si el archivo es
demasiado pesado o no es una imagen, se le dice antes de intentar subirlo.

**El precio de venta queda por debajo del costo, o en cero.** El módulo no lo bloquea —a
veces se vende a pérdida a propósito— pero muestra una advertencia visible que obliga a
confirmar. Un precio en cero nunca se puede publicar.

**El mismo equipo se registra dos veces.** Si se intenta guardar un equipo con marca,
procesador, RAM y almacenamiento idénticos a uno registrado en los últimos días, se avisa
que puede ser un duplicado y se muestra cuál, dejando al técnico decidir si continúa. Dos
equipos iguales existen de verdad; el aviso informa, no bloquea.

**Un equipo vendido sigue apareciendo disponible.** Es el riesgo más caro para la
reputación del negocio. Se mitiga con el sello de "Vendido", con el retiro automático a
los siete días, y porque marcar vendido tiene efecto inmediato en el sitio. Aun así,
depende de que el técnico lo marque: si esto empieza a fallar en la práctica, hay que
revisarlo antes de agregar cualquier otra cosa.

**El precio de costo se filtra al público.** Es la falla más grave posible. La mitigación
no es un mensaje de error: la información de costos no forma parte de lo que el sitio
público recibe, en ninguna circunstancia, ni siquiera de forma oculta. Debe verificarse
explícitamente antes de dar el feature por terminado.

**El sitio público no logra traer los equipos.** El cliente no ve una pantalla rota: ve la
sección con el mensaje de que los equipos no se pudieron cargar en este momento y el botón
de WhatsApp para preguntar directamente. El resto de la landing — servicios, tienda,
testimonios — funciona con normalidad, porque no depende de esto.

**Una foto no carga en el sitio.** Se muestra un marcador de imagen no disponible en lugar
de un espacio roto, y el resto de la tarjeta sigue completa y utilizable.

**El cliente no tiene WhatsApp en ese equipo.** El enlace abre WhatsApp Web en computadores
sin la aplicación instalada, igual que el resto de los botones del sitio.

**Textos más largos de lo previsto.** Notas muy extensas se recortan en la tarjeta con
opción de ver el detalle completo, y nunca desarman el diseño de la sección.

**Alguien ajeno intenta entrar al módulo.** Las direcciones del módulo no son accesibles
sin haber ingresado, y ninguna información de inventario —ni siquiera la lista de
equipos— se entrega a quien no tenga sesión iniciada.
