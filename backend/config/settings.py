"""
Configuración de Django para el backend de Reboot PC Store.

Toda la configuración sensible o dependiente del entorno se lee de variables de
entorno (ver `.env.example`). En Railway esas variables las inyecta la plataforma;
en local salen del archivo `.env`, que no se versiona.
"""

from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, []),
    CSRF_TRUSTED_ORIGINS=(list, []),
)

# En local se lee el .env; en Railway no existe y las variables vienen del entorno.
environ.Env.read_env(BASE_DIR / '.env')

SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')

def _lista_limpia(valores):
    """
    Quita espacios sobrantes de una lista que vino de una variable de entorno.

    `django-environ` parte por comas pero no recorta: escribir
    "rebootpcstore.com, www.rebootpcstore.com" produce un host con un espacio
    adelante que no coincide con nada, y Django responde 400 sin explicar por qué.
    En el panel de Railway ese espacio es invisible, así que el fallo parece magia
    negra. Mejor tolerarlo que depender de escribirlo perfecto.
    """
    return [valor.strip() for valor in valores if valor.strip()]


# Los mismos hosts que ya declara vite.config.js para el preview de Railway.
ALLOWED_HOSTS = _lista_limpia(env('ALLOWED_HOSTS'))

# Railway consulta el healthcheck con el header `Host: healthcheck.railway.app`,
# que no lo cubre `.up.railway.app` (el sufijo es distinto). Sin esta línea Django
# responde 400 (DisallowedHost), el chequeo nunca pasa y el despliegue se marca
# como fallido aunque la aplicación esté funcionando perfectamente.
#
# Va acá y no en la variable de entorno a propósito: es infraestructura de la
# plataforma, no configuración del negocio, y no debería depender de que alguien
# recuerde agregar un hostname a mano en cada entorno nuevo.
HOST_DEL_HEALTHCHECK = 'healthcheck.railway.app'
if HOST_DEL_HEALTHCHECK not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(HOST_DEL_HEALTHCHECK)

CSRF_TRUSTED_ORIGINS = _lista_limpia(env('CSRF_TRUSTED_ORIGINS'))

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'inventario',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # WhiteNoise sirve el dist/ de Vite y los assets del panel de Django sin
    # necesidad de un servidor web aparte: un solo proceso para todo el sitio.
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Railway inyecta DATABASE_URL al vincular el plugin de PostgreSQL.
DATABASES = {
    'default': env.db('DATABASE_URL'),
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'es-co'
TIME_ZONE = 'America/Bogota'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Fotos de los equipos. En la tarea 4 del plan esto pasa a Cloudflare R2; mientras
# tanto se guardan en disco local, que en Railway es efímero y por eso no puede ser
# la solución final.
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# El build de Vite queda un nivel arriba del backend (dist/ en la raíz del repo).
DIST_DIR = BASE_DIR.parent / 'dist'

# WHITENOISE_ROOT sirve el contenido de dist/ desde la raíz del dominio, no desde
# /static/. Es lo que mantiene funcionando /robots.txt y /sitemap.xml, de los que
# depende el SEO ya configurado, y las rutas /assets/... que genera Vite.
WHITENOISE_ROOT = DIST_DIR
WHITENOISE_INDEX_FILE = True

# Los nombres de archivo de Vite ya vienen con hash, así que no hace falta el
# almacenamiento con manifiesto: comprimir alcanza y evita que el build falle por
# una referencia que el manifiesto no logre resolver.
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage',
    },
}

# Las fotos van a Cloudflare R2, que habla el protocolo de S3. Sin las variables
# configuradas se guardan en disco local, lo que sirve para desarrollo pero NO para
# Railway: allá el disco se borra en cada despliegue y las fotos se perderían.
R2_BUCKET = env('R2_BUCKET', default='')

if R2_BUCKET:
    STORAGES['default'] = {
        'BACKEND': 'storages.backends.s3.S3Storage',
        'OPTIONS': {
            'bucket_name': R2_BUCKET,
            'endpoint_url': env('R2_ENDPOINT_URL'),
            'access_key': env('R2_ACCESS_KEY_ID'),
            'secret_key': env('R2_SECRET_ACCESS_KEY'),
            'region_name': 'auto',
            'signature_version': 's3v4',
            # R2 no implementa las ACLs por objeto de S3: mandarlas hace fallar la
            # subida. El bucket se expone por su dominio público y las URLs van sin
            # firmar, porque son fotos de un catálogo abierto.
            'default_acl': None,
            'querystring_auth': False,
            # Dos equipos con una foto del mismo nombre no deben pisarse.
            'file_overwrite': False,
            'custom_domain': env('R2_PUBLIC_DOMAIN', default=None),
        },
    }

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# El frontend y la API comparten origen (un solo servicio en Railway), así que la
# autenticación va por sesión con cookie en vez de un token guardado en el navegador.
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# Cookies solo por HTTPS en producción; en local seguirían rompiendo el ingreso.
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
