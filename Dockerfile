# --- Etapa 1: build ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Etapa 2: servidor estático de producción ---
FROM node:20-alpine AS production
WORKDIR /app

RUN npm install -g serve
COPY --from=build /app/dist ./dist

# Railway inyecta PORT en tiempo de ejecución; 4173 es el valor por defecto
# para correr el contenedor localmente (docker run -p 4173:4173 ...).
ENV PORT=4173
EXPOSE 4173

CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
