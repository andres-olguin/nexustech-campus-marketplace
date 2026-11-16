# Validación de la entrega integrada

| Verificación | Resultado |
|---|---|
| Backend · `npm run test:real-mongo` | 21 comprobaciones aprobadas, sin omisiones, con PostgreSQL 18.6 y MongoDB 7.0.24 aislados. Incluye migraciones, filtros antes de paginar, permisos de edición, stock, compra concurrente y recuperación de la cola de actividad. |
| Frontend · `npm test` y `npm run build` | 34 comprobaciones aprobadas; compilación de producción correcta. |
| Navegador · `npm run test:e2e` | 8 recorridos aprobados contra NestJS, PostgreSQL y MongoDB. Se verificó compra, conversaciones, cambios de precio entre sesiones, flechas entre páginas, tamaños de 375/390/768 px y la respuesta ante una referencia USD no disponible. Para USD se usaron respuestas controladas. |
| Arranque de prueba y recuperación | Se ejecutaron los scripts de configuración y datos de ejemplo sobre instancias aisladas. Se ejecutó `GET /api/v1/health/ready` desde Swagger interactivo. Se comprobó el 409 de stock, una compra y un mensaje, y se recuperaron después de reiniciar ambas bases y la API. |
| Docker Compose | Se verificó la estructura de servicios y el flujo de CI. Queda ejecutar los contenedores de esta revisión en Docker Desktop o en GitHub Actions. Las pruebas locales anteriores ejecutaron ambos motores como procesos aislados. |

Para repetir la comprobación de contenedores, seguí [el paso a paso en Windows](../../DOCKER.md). GitHub Actions se activa al publicar la rama de entrega y en el PR de `main`; la prueba del flujo levanta los cuatro servicios desde el commit del evento y revisa escritura y lectura tras reinicios.

## Actualización posterior — 14/11/2026, integración a main

La frase anterior «queda ejecutar los contenedores en GitHub Actions» corresponde a la revisión previa a la fusión y ya no describe el estado actual. El workflow **Hito 3 - Compose real** pasó en `main`:

- Ejecución [43659791187](https://github.com/andres-olguin/nexustech-campus-marketplace/actions/runs/43659791187): conclusión **success**, commit `ac7540f934891236742a8aaca9d56efa0e4d5a98`.
- Confirmados por CI: checkout del commit correcto; generación de credenciales efímeras; construcción y salud de cuatro servicios; migraciones; catálogo y casos de seguridad y stock; persistencia tras reinicio; compilación y pruebas del frontend.
- **No confirmado por esta prueba:** arranque en el laptop específico del equipo, recuperación de un fallo de WSL/Docker Desktop, el segundo envío a Canvas ni la defensa oral. Esas acciones son pendientes independientes.

Ver [guía de cierre y defensa](CIERRE_Y_DEFENSA_2026-11-16.md).
