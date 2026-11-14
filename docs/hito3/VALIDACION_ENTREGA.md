# Validación de la entrega integrada

| Verificación | Resultado |
|---|---|
| Backend · `npm run test:real-mongo` | 21 comprobaciones aprobadas, sin omisiones, con PostgreSQL 18.6 y MongoDB 7.0.24 aislados. Incluye migraciones, filtros antes de paginar, permisos de edición, stock, compra concurrente y recuperación de la cola de actividad. |
| Frontend · `npm test` y `npm run build` | 34 comprobaciones aprobadas; compilación de producción correcta. |
| Navegador · `npm run test:e2e` | 8 recorridos aprobados contra NestJS, PostgreSQL y MongoDB. Se verificó compra, conversaciones, cambios de precio entre sesiones, flechas entre páginas, tamaños de 375/390/768 px y la respuesta ante una referencia USD no disponible. Para USD se usaron respuestas controladas. |
| Arranque de prueba y recuperación | Se ejecutaron los scripts de configuración y datos de ejemplo sobre instancias aisladas. Se ejecutó `GET /api/v1/health/ready` desde Swagger interactivo. Se comprobó el 409 de stock, una compra y un mensaje, y se recuperaron después de reiniciar ambas bases y la API. |
| Docker Compose | Se verificó la estructura de servicios y el flujo de CI. Queda ejecutar los contenedores de esta revisión en Docker Desktop o en GitHub Actions. Las pruebas locales anteriores ejecutaron ambos motores como procesos aislados. |

Para repetir la comprobación de contenedores, seguí [el paso a paso en Windows](../../DOCKER.md). GitHub Actions se activa al publicar la rama de entrega y en el PR de `main`; la prueba del flujo levanta los cuatro servicios desde el commit del evento y revisa escritura y lectura tras reinicios.
