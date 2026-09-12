"""
Opciones predefinidas de los campos del inventario.

Este archivo es al backend lo que `src/data/content.js` es al frontend: la única
fuente de verdad. El formulario de React no repite estas listas, las pide por la
API, de modo que agregar una marca nueva se hace acá y en ningún otro lado.

Casi todo lo que sigue viene del formulario provisional que el negocio ya usa; lo
que no, está marcado con "PROPUESTO" y hay que confirmarlo.
"""

MARCAS = [
    ('apple', 'Apple'),
    ('hp', 'HP'),
    ('dell', 'Dell'),
    ('lenovo', 'Lenovo'),
    ('asus', 'ASUS'),
    ('acer', 'Acer'),
    ('msi', 'MSI'),
    ('toshiba', 'Toshiba'),
    ('otra', 'Otra'),
]

PROCESADORES = [
    ('intel_i3', 'Intel Core i3'),
    ('intel_i5', 'Intel Core i5'),
    ('intel_i7', 'Intel Core i7'),
    ('intel_i9', 'Intel Core i9'),
    ('ryzen_3', 'AMD Ryzen 3'),
    ('ryzen_5', 'AMD Ryzen 5'),
    ('ryzen_7', 'AMD Ryzen 7'),
    ('apple_silicon', 'Apple M1 / M2 / M3'),
    ('otro', 'Otro'),
]

RAMS = [
    ('4', '4 GB'),
    ('8', '8 GB'),
    ('16', '16 GB'),
    ('32', '32 GB'),
    ('mas_32', 'Más de 32 GB'),
]

ALMACENAMIENTO_TIPOS = [
    ('hdd', 'HDD'),
    ('ssd', 'SSD'),
    ('nvme', 'NVMe'),
]

# PROPUESTO: el formulario provisional pide tipo y capacidad juntos en un solo
# campo de texto. Separarlos es lo que permite filtrar y mostrar siempre igual.
ALMACENAMIENTO_CAPACIDADES = [
    ('128', '128 GB'),
    ('256', '256 GB'),
    ('480', '480 GB'),
    ('512', '512 GB'),
    ('1000', '1 TB'),
    ('2000', '2 TB'),
    ('mas_2000', 'Más de 2 TB'),
]

ESTADOS_BATERIA = [
    ('nueva', 'Nueva'),
    ('mayor_80', 'Vida útil > 80% (Muy buena)'),
    ('entre_50_80', 'Vida útil 50% - 80% (Regular)'),
    ('menor_50', 'Vida útil < 50% (Requiere cambio pronto)'),
    # PROPUESTO: el catálogo del sitio también ofrece equipos de escritorio, que
    # no tienen batería. Sin esta opción, el técnico tendría que mentir.
    ('no_aplica', 'No aplica (equipo de escritorio)'),
]

# El formulario provisional solo etiqueta los extremos de la escala. El spec pide
# que cada nivel diga qué significa, así que el 2, 3 y 4 son PROPUESTOS.
ESTADOS_ESTETICOS = [
    (1, 'Con daños estéticos visibles / Desgastado'),
    (2, 'Marcas de uso notorias'),
    (3, 'Buen estado, con marcas leves'),
    (4, 'Muy buen estado, casi sin marcas'),
    (5, 'Como nuevo / Impecable'),
]

# Cómo se le cuenta ese mismo estado al cliente en la vitrina. Es más corto y menos
# crudo que la etiqueta interna: un "3" desnudo, o un "con marcas leves" dicho de
# más formas distintas, espanta compradores sin motivo.
ESTADOS_ESTETICOS_PUBLICOS = {
    1: 'Con desgaste visible',
    2: 'Con marcas de uso',
    3: 'Buen estado',
    4: 'Muy buen estado',
    5: 'Como nuevo',
}

# PROPUESTO: pendiente de confirmar qué garantía ofrece el negocio de verdad. Hoy
# la landing promete 3 y 6 meses en los usados sin que eso esté registrado.
GARANTIAS_MESES = [
    (3, '3 meses'),
    (6, '6 meses'),
    (12, '12 meses'),
]

# PROPUESTO: el formulario provisional pide el nombre del técnico o almacén como
# texto libre. Pasarlo a lista es lo que evita que "Cesar", "cesar" y "César"
# convivan en la base, pero hay que reemplazarlo por los nombres reales.
RESPONSABLES = [
    ('bodega_bello', 'Bodega Bello'),
    ('bodega_medellin', 'Bodega Medellín'),
    ('tecnico_1', 'Técnico 1 (reemplazar por el nombre real)'),
    ('tecnico_2', 'Técnico 2 (reemplazar por el nombre real)'),
]


def opciones_para_api():
    """
    Devuelve todas las listas en el formato que consume el formulario de React.

    Cada opción viaja como {"valor": ..., "etiqueta": ...} para que el frontend no
    tenga que saber que internamente son tuplas de Django.
    """

    def formatear(opciones):
        return [{'valor': str(valor), 'etiqueta': etiqueta} for valor, etiqueta in opciones]

    return {
        'marcas': formatear(MARCAS),
        'procesadores': formatear(PROCESADORES),
        'rams': formatear(RAMS),
        'almacenamiento_tipos': formatear(ALMACENAMIENTO_TIPOS),
        'almacenamiento_capacidades': formatear(ALMACENAMIENTO_CAPACIDADES),
        'estados_bateria': formatear(ESTADOS_BATERIA),
        'estados_esteticos': formatear(ESTADOS_ESTETICOS),
        'garantias_meses': formatear(GARANTIAS_MESES),
        'responsables': formatear(RESPONSABLES),
    }
