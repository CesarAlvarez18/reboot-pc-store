"""Vistas de infraestructura, sin relación con el inventario."""

from django.http import JsonResponse


def health(_request):
    """Señal de vida del servicio, para verificar despliegues en Railway."""
    return JsonResponse({'ok': True})
