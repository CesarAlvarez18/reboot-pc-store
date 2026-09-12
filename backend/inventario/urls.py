"""Rutas de la API del inventario, todas bajo /api/."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('equipos', views.EquipoViewSet, basename='equipo')
router.register('fotos', views.FotoViewSet, basename='foto')

urlpatterns = [
    path('auth/ingresar/', views.ingresar, name='ingresar'),
    path('auth/salir/', views.salir, name='salir'),
    path('auth/yo/', views.yo, name='yo'),
    path('opciones/', views.opciones, name='opciones'),
    path('', include(router.urls)),
]
