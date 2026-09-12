"""
Pruebas de lo que el sitio público alcanza a ver.

La primera de estas pruebas es la más importante del proyecto: existe para que
`costo_compra` no se filtre nunca al frontend público, ni siquiera por descuido de
alguien que agregue un campo al modelo dentro de seis meses. Es la directriz 4 de
CLAUDE.md convertida en algo que falla solo.
"""

from datetime import timedelta

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from inventario.models import EquipoComputo

# Un valor irrepetible: si aparece en la respuesta, es porque se filtró de acá.
COSTO_SECRETO = 7777777


def crear_equipo(**cambios):
    datos = dict(
        registro_correo='tecnico@rebootpcstore.com',
        responsable='bodega_bello',
        marca='lenovo',
        procesador='intel_i5',
        ram='16',
        almacenamiento_tipo='nvme',
        almacenamiento_capacidad='512',
        estado_bateria='mayor_80',
        estado_estetico=4,
        garantia_meses=6,
        costo_compra=COSTO_SECRETO,
        precio_venta=1450000,
        estado=EquipoComputo.Estado.PUBLICADO,
    )
    datos.update(cambios)
    return EquipoComputo.objects.create(**datos)


class CostoDeCompraNuncaEsPublico(TestCase):
    def test_el_costo_no_aparece_en_la_respuesta_publica(self):
        crear_equipo()

        respuesta = self.client.get(reverse('equipos-publicos'))
        cuerpo = respuesta.content.decode()

        self.assertEqual(respuesta.status_code, 200)
        # Contra el cuerpo crudo, no contra los campos que esperábamos: así también
        # se detecta el costo escondido dentro de un objeto anidado.
        self.assertNotIn(str(COSTO_SECRETO), cuerpo)
        self.assertNotIn('costo', cuerpo.lower())
        self.assertNotIn('margen', cuerpo.lower())

    def test_el_equipo_si_trae_lo_que_el_cliente_necesita(self):
        crear_equipo()

        equipo = self.client.get(reverse('equipos-publicos')).json()['results'][0]

        self.assertEqual(equipo['marca'], 'Lenovo')
        self.assertEqual(equipo['precio_venta'], '1450000')
        self.assertEqual(equipo['estado_estetico_texto'], 'Muy buen estado')
        self.assertEqual(equipo['garantia_meses'], 6)
        self.assertFalse(equipo['vendido'])


class QueEquiposSeVenEnLaVitrina(TestCase):
    def test_un_borrador_no_se_ve(self):
        crear_equipo(estado=EquipoComputo.Estado.BORRADOR)

        self.assertEqual(self.client.get(reverse('equipos-publicos')).json()['count'], 0)

    def test_un_vendido_reciente_sigue_visible_con_su_sello(self):
        crear_equipo(
            estado=EquipoComputo.Estado.VENDIDO,
            fecha_venta=timezone.now() - timedelta(days=2),
        )

        datos = self.client.get(reverse('equipos-publicos')).json()

        self.assertEqual(datos['count'], 1)
        self.assertTrue(datos['results'][0]['vendido'])

    def test_un_vendido_viejo_se_retira_solo(self):
        crear_equipo(
            estado=EquipoComputo.Estado.VENDIDO,
            fecha_venta=timezone.now() - timedelta(days=8),
        )

        self.assertEqual(self.client.get(reverse('equipos-publicos')).json()['count'], 0)

    def test_la_vitrina_muestra_nueve_por_pagina(self):
        for _ in range(11):
            crear_equipo()

        datos = self.client.get(reverse('equipos-publicos')).json()

        self.assertEqual(datos['count'], 11)
        self.assertEqual(len(datos['results']), 9)


class ElInventarioInternoSigueCerrado(TestCase):
    def test_sin_sesion_no_se_puede_listar_el_inventario(self):
        crear_equipo()

        respuesta = self.client.get('/api/equipos/')

        self.assertEqual(respuesta.status_code, 403)
        self.assertNotIn(str(COSTO_SECRETO), respuesta.content.decode())
