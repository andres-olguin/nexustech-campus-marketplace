# Demostración reproducible y aislada

Este procedimiento no escribe en bases compartidas. Ejecuta registro, categoría, publicación, carrito, pedido, validación y persistencia después del reinicio usando exclusivamente datos sintéticos y un cluster PostgreSQL temporal. No necesita tener el servidor de desarrollo abierto ni configurar credenciales reales en `.env`.

## Ejecución automática

Desde `backend/`, con Node >=22.12 y puertos 55439 (PostgreSQL) y 55440 (API temporal) disponibles:

```powershell
npm ci
npm test
```

La suite crea un directorio aleatorio `nexustech-pg-*` dentro de la carpeta temporal del sistema, una contraseña aleatoria y la base `nexustech_test`. Los procesos API usan ese cluster, nunca la URL de `.env`. El directorio se valida antes de eliminarlo al terminar. No se modifica ni borra ninguna base compartida. El usuario del sistema debe poder ejecutar los binarios de embedded-postgres; no correr como root en Linux.

Para regenerar ejemplos JSON de respuestas reales de esa ejecución, sin JWT ni contraseñas:

```powershell
$env:NEXUSTECH_CAPTURE_EXAMPLES='1'
npm test
Remove-Item Env:NEXUSTECH_CAPTURE_EXAMPLES
```

Se escribe `backend/docs/HTTP_EXAMPLES.json`. Sus UUID corresponden a una base temporal ya eliminada; no son un seed para el despliegue. Revisar el diff antes de publicar un archivo regenerado. La captura se habilita únicamente con esa variable; una ejecución ordinaria no modifica ejemplos versionados.

## Pasos demostrados y evidencia

| Paso solicitado | Operación real | Comprobación automática |
|---|---|---|
| 1. Registrar comprador y vendedor ficticios | POST /auth/register con `buyer@example.test`, `seller@example.test` y nombres genéricos | 201, JWT, perfiles; login posterior verifica hash persistido |
| 2. Crear categoría | POST /categories autenticado | UUID retornado; propiedad verificada |
| 3. Publicar producto | POST /products con precio 65000 y stock 3 | 201 y UUID SQL real |
| 4. Consultar producto | GET /products/:id y filtros combinados | Producto correcto y paginación |
| 5. Añadir al carrito | PUT /cart con cantidad 2 | Total calculado 130000 |
| 6. Crear pedido | POST /orders con dirección de retiro genérica y clave única | 201, detalles y transacción simulation |
| 7. Verificar stock | GET /products/:id después de checkout | Stock pasa de 3 a 1; reintento concurrente no duplica descuento |
| 8. Consultar pedido | GET /orders/:id con JWT comprador | Total y snapshots; tercero recibe 404 |
| 9. Validación fallida | GET /products?limit=101; PATCH con precio negativo/null | 400 y error uniforme |
| 10. Persistencia tras reinicio | Cerrar Nest/pool, detener/arrancar PostgreSQL sin borrar cluster y arrancar dos procesos Node nuevos | Login recupera cuenta; pedido multivendedor sigue delivered, total 30000 y stocks 2; Swagger responde |

Se prueban además competencia por última unidad, rollback de carrito múltiple, cancelación simultánea y seguimiento por dos vendedores. Para seguimiento se publica un artículo sintético por vendedor, ambos de 15000; cada uno avanza solo su fulfillment. Un listener que falla simula indisponibilidad de auditoría; SQL y HTTP siguen correctos. No es una prueba de MongoDB real.

## Resultado ejecutado en esta fase

Se ejecutaron los diez pasos descritos mediante la suite HTTP contra PostgreSQL 18.6 real en Windows. La prueba de persistencia ejecutó procesos nuevos con `node dist/main.js`; no solo reconstruyó objetos en memoria. El reinicio es del entorno temporal de prueba, no del servidor de despliegue. Ver el resultado final y límites en [PHASE2_REPORT.md](PHASE2_REPORT.md).

## Demostración manual del equipo: pendiente en entorno integrado

Para usar Swagger y React, el equipo debe disponer de una base de demostración **dedicada**, aplicar `npm run migration:run`, configurar JWT_SECRET y CORS, iniciar API y conectar React. Repetir los pasos con correos `example.test` únicos y datos claramente sintéticos; no cargar datos de compañeros. Guardar el UUID del pedido y usar login de nuevo tras reiniciar la API: el JWT no es la evidencia de persistencia, lo son el pedido/detalles/stock leídos de SQL.

No ejecutar `migration:revert` ni borrar un volumen/base compartida para reiniciar la demo. La verificación React→Nest→PostgreSQL del despliegue, la integración Mongo real y la prueba visual en navegador quedan pendientes del equipo. No se presentan como ejecutadas aquí.
