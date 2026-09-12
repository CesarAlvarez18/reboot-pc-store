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

# Los mismos hosts que ya declara vite.config.js para el preview de Railway.
ALLOWED_HOSTS = env('ALLOWED_HOSTS')
CSRF_TRUSTED_ORIGINS = env('CSRF_TRUSTED_ORIGINS')

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
