"""Vistas de infraestructura, sin relación con el inventario."""

from django.conf import settings
from django.http import HttpResponse, JsonResponse


def health(_request):
    """Señal de vida del servicio, para verificar despliegues en Railway."""
    return JsonResponse({'ok': True})


def spa(_request):
    """
    Devuelve el index.html del build de Vite para cualquier ruta del frontend.

    Si el dist/ no existe (típicamente en local, cuando se trabaja con el dev
    server de Vite en el puerto 5173 y este proceso solo atiende la API), se dice
    explícitamente en vez de reventar con un error de archivo no encontrado.
    """
    index = settings.DIST_DIR / 'index.html'

    if not index.exists():
        return HttpResponse(
            'El frontend no está compilado. Corre "npm run build", o usa el dev '
            'server de Vite en http://localhost:5173 para trabajar en el frontend.',
            status=501,
            content_type='text/plain; charset=utf-8',
        )

    return HttpResponse(index.read_bytes(), content_type='text/html; charset=utf-8')
