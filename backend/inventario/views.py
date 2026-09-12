"""
API interna del inventario.

Todo lo de este archivo exige sesión iniciada, incluida la lista de equipos: el
spec pide que quien no haya ingresado no pueda ni siquiera saber qué hay en bodega.
La única excepción es el ingreso, y el endpoint que entrega la cookie CSRF.
"""

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from . import choices
from .models import EquipoComputo, FotoEquipo
from .serializers import (
    CambioEstadoSerializer,
    EquipoInternoSerializer,
    FotoEquipoSerializer,
    FotoSubidaSerializer,
)


def _datos_usuario(usuario):
    return {
        'autenticado': True,
        'correo': usuario.email,
        'nombre': usuario.get_full_name() or usuario.get_username(),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def ingresar(request):
    """
    Ingreso del técnico con su correo y su contraseña.

    Las cuentas las crea el dueño del negocio desde /django-admin/: acá no hay
    registro abierto.
    """
    correo = str(request.data.get('correo', '')).strip()
    contrasena = str(request.data.get('contrasena', ''))

    # Django autentica por nombre de usuario; el técnico solo conoce su correo.
    Usuario = get_user_model()
    nombre_usuario = correo
    coincidencias = Usuario.objects.filter(email__iexact=correo)
    if coincidencias.count() == 1:
        nombre_usuario = coincidencias.get().get_username()

    usuario = authenticate(request, username=nombre_usuario, password=contrasena)

    if usuario is None:
        # Un solo mensaje para credenciales malas: decir cuál de los dos falló le
        # confirmaría a un desconocido que ese correo existe.
        return Response(
            {'detalle': 'Correo o contraseña incorrectos.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    login(request, usuario)
    return Response(_datos_usuario(usuario))


@api_view(['POST'])
def salir(request):
    logout(request)
    return Response({'autenticado': False})


@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def yo(request):
    """
    Quién está adentro, y de paso deja la cookie CSRF en el navegador.

    Responde 200 incluso sin sesión —con `autenticado: false`— porque el frontend
    necesita poder llamarlo antes de ingresar para obtener esa cookie.
    """
    if not request.user.is_authenticated:
        return Response({'autenticado': False})

    return Response(_datos_usuario(request.user))


@api_view(['GET'])
def opciones(request):
    """Las listas desplegables, para que el formulario no las repita."""
    return Response(choices.opciones_para_api())


class EquipoViewSet(viewsets.ModelViewSet):
    queryset = EquipoComputo.objects.prefetch_related('fotos')
    serializer_class = EquipoInternoSerializer

    def perform_create(self, serializer):
        correo = self.request.user.email

        if not correo:
            raise ValidationError(
                {
                    'registro_correo': 'Tu cuenta no tiene un correo registrado. '
                    'Pídele al administrador que lo agregue antes de cargar equipos.'
                }
            )

        serializer.save(registro_correo=correo)

    @action(detail=True, methods=['post'])
    def fotos(self, request, pk=None):
        """Sube una foto del equipo. Se optimiza sola al guardarse."""
        equipo = self.get_object()

        entrada = FotoSubidaSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)

        foto = FotoEquipo.objects.create(
            equipo=equipo,
            imagen=entrada.validated_data['imagen'],
            orden=entrada.validated_data['orden'],
        )

        return Response(
            FotoEquipoSerializer(foto).data, status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['patch'])
    def estado(self, request, pk=None):
        """Publicar, despublicar o marcar vendido, con efecto inmediato en el sitio."""
        equipo = self.get_object()

        entrada = CambioEstadoSerializer(data=request.data, context={'equipo': equipo})
        entrada.is_valid(raise_exception=True)

        nuevo = entrada.validated_data['estado']
        equipo.estado = nuevo
        # La fecha de venta es la que decide cuándo se retira solo del sitio.
        equipo.fecha_venta = timezone.now() if nuevo == EquipoComputo.Estado.VENDIDO else None
        equipo.save(update_fields=['estado', 'fecha_venta', 'actualizado_en'])

        return Response(EquipoInternoSerializer(equipo).data)


class FotoViewSet(
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Cambiar el orden de una foto (hacer portada) o quitarla."""

    queryset = FotoEquipo.objects.all()
    serializer_class = FotoEquipoSerializer
