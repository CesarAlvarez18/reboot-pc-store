# Imagen de producción de Reboot PC Store: un solo servicio que sirve la landing,
# el panel de inventario y la API.
#
# Node compila el frontend con Vite; la imagen final es de Python, y Gunicorn
# atiende todo. WhiteNoise sirve el dist/ compilado desde la raíz del dominio, así
# que no hace falta un servidor web adicional ni un segundo servicio en Railway.

# --- Etapa 1: build del frontend ---
FROM node:20-alpine AS frontend
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.js tailwind.config.js postcss.config.js ./
COPY src/ ./src/
COPY public/ ./public/
RUN npm run build

# --- Etapa 2: imagen final ---
FROM python:3.12-slim AS production

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/
COPY --from=frontend /app/dist ./dist

WORKDIR /app/backend

# collectstatic solo recoge los assets del panel de Django (el dist/ lo sirve
# WhiteNoise directamente). Necesita que la configuración cargue, pero no toca la
# base de datos: por eso los valores de abajo son de mentira y viven solo en este
# paso del build.
RUN SECRET_KEY=solo-para-el-build \
    DATABASE_URL=postgres://build:build@localhost:5432/build \
    python manage.py collectstatic --noinput

EXPOSE 8080

# Railway inyecta PORT en tiempo de ejecución. Las migraciones corren al arrancar
# porque el plan de Railway no tiene una fase de release separada.
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT} --workers 2 --access-logfile -"]
