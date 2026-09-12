"""
Serializers del inventario.

Los de este archivo son los **internos**: incluyen el costo de compra y el margen,
y solo los ve quien tiene sesión iniciada. El serializer público, que nunca nombra
esos campos, vive aparte a propósito (tarea 6 del plan).
"""

from rest_framework import serializers

from .models import EquipoComputo, FotoEquipo


class FotoEquipoSerializer(serializers.ModelSerializer):
    imagen = serializers.ImageField(read_only=True)
    miniatura = serializers.ImageField(read_only=True)

    class Meta:
        model = FotoEquipo
        fields = ['id', 'imagen', 'miniatura', 'orden']


class EquipoInternoSerializer(serializers.ModelSerializer):
    """Lo que ve el técnico en el panel, costo y margen incluidos."""

    fotos = FotoEquipoSerializer(many=True, read_only=True)

    # Calculados en el backend: el frontend no repite la aritmética de precios.
    margen = serializers.DecimalField(max_digits=12, decimal_places=0, read_only=True)
    marca_visible = serializers.CharField(read_only=True)
    procesador_visible = serializers.CharField(read_only=True)
    resumen_specs = serializers.CharField(read_only=True)
    estado_estetico_publico = serializers.CharField(read_only=True)

    class Meta:
        model = EquipoComputo
        fields = [
            'id',
            'registro_correo',
            'responsable',
            'marca',
            'marca_otra',
            'procesador',
            'procesador_otro',
            'ram',
            'almacenamiento_tipo',
            'almacenamiento_capacidad',
            'estado_bateria',
            'estado_estetico',
            'garantia_meses',
            'costo_compra',
            'precio_venta',
            'notas_fallas',
            'estado',
            'fecha_venta',
            'creado_en',
            'actualizado_en',
            'fotos',
            'margen',
            'marca_visible',
            'procesador_visible',
            'resumen_specs',
            'estado_estetico_publico',
        ]
        read_only_fields = [
            'registro_correo',
            'estado',
            'fecha_venta',
            'creado_en',
            'actualizado_en',
        ]

    def validate(self, datos):
        """
        Mismas reglas que EquipoComputo.clean, aplicadas sobre la mezcla de lo que
        llega y lo que ya estaba guardado (en un PATCH puede venir solo un campo).
        """

        def valor(campo):
            if campo in datos:
                return datos[campo]
            return getattr(self.instance, campo, None)

        errores = {}

        if valor('marca') == 'otra' and not (valor('marca_otra') or '').strip():
            errores['marca_otra'] = 'Escribe cuál es la marca del equipo.'

        if valor('procesador') == 'otro' and not (valor('procesador_otro') or '').strip():
            errores['procesador_otro'] = 'Escribe cuál es el procesador del equipo.'

        if errores:
            raise serializers.ValidationError(errores)

        return datos


class CambioEstadoSerializer(serializers.Serializer):
    """Publicar, despublicar o marcar vendido."""

    estado = serializers.ChoiceField(choices=EquipoComputo.Estado.choices)

    def validate_estado(self, estado):
        equipo = self.context['equipo']

        if estado == EquipoComputo.Estado.PUBLICADO:
            if not equipo.precio_venta:
                raise serializers.ValidationError(
                    'Un equipo con precio en cero no se puede publicar.'
                )
            if not equipo.fotos.exists():
                raise serializers.ValidationError(
                    'Un equipo sin fotos no se puede publicar: el cliente necesita '
                    'ver el equipo real.'
                )

        return estado


class FotoSubidaSerializer(serializers.Serializer):
    imagen = serializers.ImageField()
    orden = serializers.IntegerField(required=False, default=0)
