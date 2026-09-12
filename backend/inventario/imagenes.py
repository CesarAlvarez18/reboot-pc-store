"""
Optimización de las fotos de los equipos.

El técnico sube la foto original del celular —que puede pesar varios megas— y no
tiene que hacer nada más: acá se reduce y se convierte a WebP antes de guardarla.
Es la directriz 3 de CLAUDE.md, y lo que evita que la vitrina pública se ponga
lenta por cargar fotos de 4 MB.
"""

from io import BytesIO
from pathlib import Path

from django.core.files.base import ContentFile
from PIL import Image, ImageOps

# Ancho máximo de la foto que se ve al abrir el equipo.
ANCHO_DETALLE = 1600

# Ancho máximo de la portada que se ve en la tarjeta del listado.
ANCHO_MINIATURA = 640

CALIDAD = 82


def _optimizar(archivo, ancho_max, sufijo):
    """Devuelve una copia en WebP, redimensionada, lista para guardar."""
    archivo.seek(0)

    with Image.open(archivo) as imagen:
        # Las fotos de celular traen la orientación en los metadatos EXIF. Sin esto
        # una foto tomada en vertical se publica acostada.
        imagen = ImageOps.exif_transpose(imagen)

        if imagen.mode not in ('RGB', 'RGBA'):
            imagen = imagen.convert('RGB')

        imagen.thumbnail((ancho_max, ancho_max), Image.LANCZOS)

        buffer = BytesIO()
        imagen.save(buffer, format='WEBP', quality=CALIDAD, method=6)

    nombre = f'{Path(archivo.name).stem}{sufijo}.webp'
    return ContentFile(buffer.getvalue(), name=nombre)


def version_detalle(archivo):
    return _optimizar(archivo, ANCHO_DETALLE, '')


def version_miniatura(archivo):
    return _optimizar(archivo, ANCHO_MINIATURA, '-min')
