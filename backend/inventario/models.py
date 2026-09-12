"""
Modelo del inventario de equipos usados.

Regla que atraviesa todo este módulo: `costo_compra` y el margen son datos
internos. Viven acá y en el serializer interno; el serializer público nunca los
nombra. Ver la directriz 4 de CLAUDE.md.
"""

from django.core.exceptions import ValidationError
from django.db import models

from . import choices, imagenes


class EquipoComputo(models.Model):
    """Un computador usado que entró al negocio, en cualquiera de sus estados."""

    class Estado(models.TextChoices):
        BORRADOR = 'borrador', 'Borrador'
        PUBLICADO = 'publicado', 'Publicado'
        VENDIDO = 'vendido', 'Vendido'

    # Quién lo registró. El correo se llena solo desde la sesión del técnico.
    registro_correo = models.EmailField('correo de quien registra')
    responsable = models.CharField(
        'técnico o almacén responsable',
        max_length=40,
        choices=choices.RESPONSABLES,
    )

    marca = models.CharField(max_length=20, choices=choices.MARCAS)
    # Solo se usa cuando la marca es "Otra": sin esto, la vitrina mostraría
    # literalmente "Otra" como marca del equipo.
    marca_otra = models.CharField(
        'marca (si eligió Otra)', max_length=40, blank=True
    )

    procesador = models.CharField(max_length=20, choices=choices.PROCESADORES)
    procesador_otro = models.CharField(
        'procesador (si eligió Otro)', max_length=60, blank=True
    )

    ram = models.CharField('memoria RAM', max_length=10, choices=choices.RAMS)
    almacenamiento_tipo = models.CharField(
        'tipo de almacenamiento', max_length=10, choices=choices.ALMACENAMIENTO_TIPOS
    )
    almacenamiento_capacidad = models.CharField(
        'capacidad de almacenamiento',
        max_length=10,
        choices=choices.ALMACENAMIENTO_CAPACIDADES,
    )

    estado_bateria = models.CharField(
        'estado de la batería', max_length=20, choices=choices.ESTADOS_BATERIA
    )
    estado_estetico = models.PositiveSmallIntegerField(
        'estado estético (1 a 5)', choices=choices.ESTADOS_ESTETICOS
    )
    garantia_meses = models.PositiveSmallIntegerField(
        'garantía', choices=choices.GARANTIAS_MESES
    )

    # Pesos colombianos: sin centavos.
    costo_compra = models.DecimalField(
        'costo de compra (interno)', max_digits=12, decimal_places=0
    )
    precio_venta = models.DecimalField(
        'precio de venta al público', max_digits=12, decimal_places=0
    )

    notas_fallas = models.TextField('detalles adicionales o fallas', blank=True)

    estado = models.CharField(
        max_length=10, choices=Estado.choices, default=Estado.BORRADOR
    )
    fecha_venta = models.DateTimeField('fecha en que se marcó vendido', null=True, blank=True)

    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'equipo de cómputo'
        verbose_name_plural = 'equipos de cómputo'
        ordering = ['-creado_en']

    def __str__(self):
        return f'{self.marca_visible} {self.procesador_visible} · {self.ram_legible}'

    # --- Cómo se nombra el equipo ---

    @property
    def marca_visible(self):
        """La marca escrita a mano gana cuando se eligió 'Otra'."""
        if self.marca == 'otra' and self.marca_otra:
            return self.marca_otra
        return self.get_marca_display()

    @property
    def procesador_visible(self):
        if self.procesador == 'otro' and self.procesador_otro:
            return self.procesador_otro
        return self.get_procesador_display()

    @property
    def ram_legible(self):
        return self.get_ram_display()

    @property
    def almacenamiento_legible(self):
        return f'{self.get_almacenamiento_tipo_display()} {self.get_almacenamiento_capacidad_display()}'

    @property
    def resumen_specs(self):
        """La línea que ve el cliente en la tarjeta y que viaja en el WhatsApp."""
        return f'{self.procesador_visible}, {self.ram_legible} RAM, {self.almacenamiento_legible}'

    @property
    def estado_estetico_publico(self):
        """El estado estético dicho en palabras, como lo lee el cliente."""
        return choices.ESTADOS_ESTETICOS_PUBLICOS[self.estado_estetico]

    # --- Datos internos ---

    @property
    def margen(self):
        """
        Ganancia del equipo. Se calcula en el backend y solo se expone al módulo
        interno: nunca forma parte de lo que recibe el sitio público.
        """
        return self.precio_venta - self.costo_compra

    # --- Validación ---

    def clean(self):
        errores = {}

        if self.marca == 'otra' and not self.marca_otra.strip():
            errores['marca_otra'] = 'Escribe cuál es la marca del equipo.'

        if self.procesador == 'otro' and not self.procesador_otro.strip():
            errores['procesador_otro'] = 'Escribe cuál es el procesador del equipo.'

        # Publicar con precio en cero sí se bloquea; vender por debajo del costo no,
        # porque a veces se hace a propósito (el aviso va en el formulario).
        if self.estado == self.Estado.PUBLICADO and not self.precio_venta:
            errores['precio_venta'] = 'Un equipo con precio en cero no se puede publicar.'

        if errores:
            raise ValidationError(errores)


class FotoEquipo(models.Model):
    """Una foto del estado real de un equipo. El orden decide cuál es la portada."""

    equipo = models.ForeignKey(
        EquipoComputo, related_name='fotos', on_delete=models.CASCADE
    )
    imagen = models.ImageField('foto (vista de detalle)', upload_to='equipos/')
    miniatura = models.ImageField(
        'foto (versión para la tarjeta)', upload_to='equipos/', blank=True
    )
    orden = models.PositiveSmallIntegerField(default=0)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'foto del equipo'
        verbose_name_plural = 'fotos del equipo'
        ordering = ['orden', 'id']

    def __str__(self):
        return f'Foto {self.orden} de {self.equipo_id}'

    def save(self, *args, **kwargs):
        # Solo se optimiza lo que acaba de llegar del celular. Una foto ya guardada
        # (que ya es .webp) no se vuelve a procesar en cada guardado.
        if self.imagen and not self.imagen.name.lower().endswith('.webp'):
            original = self.imagen
            self.miniatura = imagenes.version_miniatura(original)
            self.imagen = imagenes.version_detalle(original)

        super().save(*args, **kwargs)
