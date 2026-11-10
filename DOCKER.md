# NexusTech Campus Marketplace - Docker

## Servicios

- Frontend: React + Vite
- Backend: NestJS
- Base SQL: PostgreSQL 16
- Base NoSQL: MongoDB 7

## Requisitos

- Docker Desktop funcionando
- Docker Compose

## Configuracion inicial

1. Clonar el repositorio.
2. Copiar .env.example como .env.
3. Reemplazar los valores de ejemplo por credenciales locales seguras.
4. Ejecutar:

docker compose up -d --build

## Direcciones

Frontend:
http://localhost:5173

Backend:
http://localhost:3001

API Health:
http://localhost:3001/api/v1/health

## Puertos

React: 5173
NestJS: 3001 externo, 3000 interno
PostgreSQL: 5433 externo, 5432 interno
MongoDB: 27017 interno

## Comandos utiles

Ver contenedores:
docker compose ps

Ver logs:
docker compose logs --tail=60 api

Detener servicios:
docker compose down

## Persistencia

PostgreSQL utiliza el volumen postgres_data.
MongoDB utiliza el volumen mongo_data.

Los datos persisten al reiniciar los contenedores.
No ejecutar docker compose down -v si se desea conservarlos.

## Prueba realizada

- Inicio de los cuatro servicios.
- Migraciones PostgreSQL ejecutadas.
- Backend NestJS iniciado.
- Frontend React iniciado.
- Publicacion de un teclado gamer.
- Consulta del producto mediante API REST.
- Verificacion del registro directamente en PostgreSQL.
- Persistencia comprobada luego de reiniciar API y React.

## Pendientes

- Verificar la funcionalidad real de MongoDB.
- Completar las pruebas integrales del Hito 3.
