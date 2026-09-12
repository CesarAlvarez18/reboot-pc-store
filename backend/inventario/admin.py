"""
Panel de Django para el inventario.

No es el panel que usan los técnicos —ese es el de React, en /dashboard—, pero
sirve para crear sus cuentas y para revisar datos a mano cuando algo se ve raro.
"""

from django.contrib import admin

from .models import EquipoComputo, FotoEquipo


class FotoEquipoInline(admin.TabularInline):
    model = FotoEquipo
    extra = 1
    fields = ['imagen', 'orden']


@admin.register(EquipoComputo)
class EquipoComputoAdmin(admin.ModelAdmin):
    list_display = [
        '__str__',
        'estado',
        'precio_venta',
        'costo_compra',
        'margen',
        'responsable',
        'creado_en',
    ]
    list_filter = ['estado', 'marca', 'responsable']
    search_fields = ['marca_otra', 'procesador_otro', 'notas_fallas', 'registro_correo']
    readonly_fields = ['creado_en', 'actualizado_en']
    inlines = [FotoEquipoInline]

    @admin.display(description='margen')
    def margen(self, equipo):
        return equipo.margen
