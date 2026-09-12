"""
Rutas del backend.

El panel propio de Django vive en /django-admin/ y no en /admin/: se usa solo para
crear las cuentas de los técnicos. El panel de inventario que ellos usan es el de
React, en /dashboard, y se sirve desde el frontend.
"""

from django.contrib import admin
from django.urls import path

from .views import health

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/health/', health, name='health'),
]
