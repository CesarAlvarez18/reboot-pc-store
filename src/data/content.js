// Copy y datos centralizados de la landing. Mantener el contenido separado
// de los componentes facilita futuras traducciones o integraciones con un CMS.

export const WHATSAPP_NUMBER = '573023966862'; // TODO: reemplazar por el número real del negocio

export const buildWhatsAppLink = (message) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const navLinks = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Tienda', href: '#tienda' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Testimonios', href: '#testimonios' },
];

export const services = [
  {
    icon: 'Home',
    title: 'Reparación a Domicilio',
    description:
      'Diagnosticamos y reparamos tu equipo en la comodidad de tu hogar u oficina, sin filas ni esperas en un local.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Mantenimiento Preventivo',
    description:
      'Limpieza física, cambio de pasta térmica y optimización de software para que tu equipo rinda como el primer día.',
  },
  {
    icon: 'Cpu',
    title: 'Ensamble a Medida',
    description:
      'Armamos el computador ideal para tus necesidades y presupuesto, con componentes seleccionados y garantizados.',
  },
  {
    icon: 'Network',
    title: 'Configuración de Redes',
    description:
      'Instalación y optimización de redes cableadas e inalámbricas para tu casa, oficina o negocio.',
  },
];

export const productCategories = [
  {
    id: 'nuevos',
    title: 'Computadores Nuevos',
    tagline: 'Última generación, listos para trabajar o jugar.',
    image:
      'https://placehold.co/640x480/0B0F1A/22D3EE?text=Computadores+Nuevos&font=raleway',
    items: [
      {
        name: 'Office Pro 24"',
        specs: 'Core i5, 8GB RAM, SSD 480GB',
        cta: 'Cotizar',
      },
      {
        name: 'Ultrabook Slim',
        specs: 'Ryzen 5, 16GB RAM, SSD 512GB',
        cta: 'Cotizar',
      },
    ],
  },
  {
    id: 'usados',
    title: 'Computadores Usados (Garantizados)',
    tagline: 'Revisados, certificados y con garantía real.',
    image:
      'https://placehold.co/640x480/0B0F1A/8B5CF6?text=Usados+Garantizados&font=raleway',
    items: [
      {
        name: 'Business Refurbished',
        specs: 'Core i7, 8GB RAM, SSD 256GB · Garantía 6 meses',
        cta: 'Cotizar',
      },
      {
        name: 'Home Ready',
        specs: 'Core i3, 8GB RAM, SSD 240GB · Garantía 3 meses',
        cta: 'Cotizar',
      },
    ],
  },
  {
    id: 'gaming',
    title: 'Typhoon Custom Builds',
    tagline: 'PCs gamer y workstations de alto rendimiento.',
    image:
      'https://placehold.co/640x480/0B0F1A/F472B6?text=Typhoon+Custom+Builds&font=raleway',
    items: [
      {
        name: 'Typhoon Interceptor',
        specs: 'Core i7, 16GB RAM, RTX 4060, 1TB NVMe',
        cta: 'Comprar',
      },
      {
        name: 'Typhoon Vortex',
        specs: 'Ryzen 7, 32GB RAM, RTX 4070, 2TB NVMe',
        cta: 'Comprar',
      },
    ],
  },
];

export const steps = [
  {
    number: '01',
    title: 'Escríbenos',
    description: 'Cuéntanos qué necesitas por WhatsApp: una reparación, mantenimiento o tu próximo PC.',
    icon: 'MessageCircle',
  },
  {
    number: '02',
    title: 'Agendamos la Visita o Envío',
    description: 'Coordinamos una visita técnica a domicilio o el envío/entrega de tu equipo nuevo.',
    icon: 'CalendarCheck',
  },
  {
    number: '03',
    title: 'Recibe tu Equipo Listo',
    description: 'Tu computador queda funcionando al 100%, revisado y con garantía de nuestro trabajo.',
    icon: 'PackageCheck',
  },
];

export const testimonials = [
  {
    name: 'Camila Restrepo',
    role: 'Diseñadora freelance, Bello',
    quote:
      'Llevaron el diagnóstico hasta mi casa y en un día ya tenía el computador funcionando de nuevo. Excelente servicio y muy honestos con el precio.',
    rating: 5,
  },
  {
    name: 'Andrés Gómez',
    role: 'Gamer y streamer, Medellín',
    quote:
      'Me armaron mi Typhoon Interceptor a la medida. Corre todo en ultra y el ensamble quedó impecable. 100% recomendados.',
    rating: 5,
  },
  {
    name: 'Laura Zapata',
    role: 'Gerente PYME, Bello',
    quote:
      'Contratamos el mantenimiento preventivo para los equipos de la oficina. Puntuales, profesionales y nuestros equipos no han vuelto a fallar.',
    rating: 5,
  },
];

export const paymentMethods = [
  'Efectivo',
  'Transferencia Bancaria',
  'Tarjeta de Crédito',
  'Tarjeta de Débito',
  'Nequi',
  'Daviplata',
];

export const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/people/Reboot-PC-Store/61564574731858/', icon: 'Facebook' },
  { label: 'Instagram', href: 'https://instagram.com', icon: 'Instagram' },
  { label: 'TikTok', href: 'https://tiktok.com', icon: 'Music2' },
];

// Copy del panel interno de inventario (/dashboard). Va acá por la misma razón que
// el resto: el texto se edita en un solo lugar, no dentro de los componentes.
export const panelContent = {
  ingreso: {
    titulo: 'Inventario Reboot',
    subtitulo: 'Ingresa con tu cuenta para registrar equipos.',
    correo: 'Correo',
    contrasena: 'Contraseña',
    boton: 'Ingresar',
    botonCargando: 'Ingresando…',
    sinCuenta: 'Las cuentas las crea el administrador. Si no tienes uno, pídeselo.',
    volver: 'Volver al sitio',
  },
  panel: {
    titulo: 'Inventario',
    salir: 'Cerrar sesión',
    vacio: {
      titulo: 'Todavía no hay equipos registrados',
      descripcion:
        'Acá quedan los computadores usados que entran a bodega, con sus fotos, su estado y su precio, listos para publicarse en la tienda.',
      boton: 'Registrar el primer equipo',
    },
  },
};

// Copy del formulario de registro de equipos. Igual que el resto del contenido,
// se edita acá y no dentro del componente.
export const formularioEquipo = {
  titulo: 'Registrar equipo usado',
  subtitulo: 'Queda guardado como borrador. Publicarlo es un paso aparte.',
  volver: 'Volver al inventario',
  campos: {
    responsable: 'Nombre del técnico o almacén',
    marca: 'Marca del equipo',
    marcaOtra: '¿Cuál marca?',
    procesador: 'Procesador',
    procesadorOtro: '¿Cuál procesador?',
    ram: 'Memoria RAM',
    almacenamientoTipo: 'Tipo de almacenamiento',
    almacenamientoCapacidad: 'Capacidad',
    estadoBateria: 'Estado de la batería',
    estadoEstetico: 'Estado estético del equipo',
    garantia: 'Garantía que se ofrece',
    costo: 'Costo del equipo (precio de compra)',
    costoAyuda: 'Dato interno. El cliente nunca lo ve.',
    precio: 'Precio sugerido de venta al público',
    notas: 'Detalles adicionales o posibles fallas reportadas',
    notasAyuda: 'Una tecla dura, una bisagra floja, un cargador que no es original.',
  },
  margen: {
    etiqueta: 'Margen de este equipo',
    perdida: 'Lo estás vendiendo por debajo de lo que costó.',
  },
  errores: {
    obligatorio: 'Este campo es obligatorio.',
    sinFotos: 'Agrega al menos una foto del equipo.',
    guardar: 'No pudimos guardar el equipo. Revisa los campos marcados.',
  },
  avisos: {
    perdidaTitulo: 'El precio queda por debajo del costo',
    perdidaTexto: 'Puede ser a propósito. Si es así, confirma para guardar.',
    duplicadoTitulo: 'Puede que este equipo ya esté registrado',
    duplicadoTexto: 'Hay uno con las mismas características de hace poco:',
    confirmar: 'Sí, guardar de todas formas',
  },
  fotos: {
    subiendo: 'Guardando las fotos…',
    fallaron: 'Algunas fotos no subieron. El equipo ya quedó guardado: reintenta solo las que fallaron.',
  },
  boton: 'Guardar equipo',
  botonGuardando: 'Guardando…',
  exito: 'Equipo guardado como borrador.',
};
