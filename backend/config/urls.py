"""
Rutas del backend.

El panel propio de Django vive en /django-admin/ y no en /admin/: se usa solo para
crear las cuentas de los técnicos. El panel de inventario que ellos usan es el de
React, en /dashboard, y lo sirve la SPA.

El catch-all del final es lo que permite entrar directo a una ruta del frontend
(por ejemplo rebootpcstore.com/dashboard) sin recibir un 404: cualquier ruta que no
sea de la API, del panel de Django o de archivos estáticos devuelve el index.html
de la SPA, y de ahí en adelante el router de React decide qué mostrar.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, re_path

from .views import health, spa

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/health/', health, name='health'),
]

# Solo en desarrollo: en producción las fotos las sirve el almacenamiento remoto.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [
    re_path(r'^(?!api/|django-admin/|static/|media/).*$', spa, name='spa'),
]
