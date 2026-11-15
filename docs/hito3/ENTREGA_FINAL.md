# Diseño y criterios de entrega · NexusTech

## Alcance

La versión React del Taller 2 resolvía la navegación y formularios, pero los registros dependían del navegador. El Hito 3 conserva ese flujo y el marketplace universitario. Agrega validaciones, roles de comprador y vendedor, datos compartidos y seguimiento del pedido. El catálogo ilustrativo se conserva para explicar la interfaz; los flujos evaluados usan publicaciones reales.

| Actor | Flujo prioritario | Resultado verificable |
|---|---|---|
| Vendedor | Crear categoría y publicación; modificar precio y archivar | Otra sesión ve el precio actualizado; archivar no elimina el historial de un pedido. |
| Comprador | Buscar y filtrar; guardar un favorito; comprar y consultar su pedido | El checkout guarda un pedido simulado y descuenta stock una sola vez. |
| Comprador y vendedor | Preguntar sobre una publicación y leer su conversación | Participantes acceden al mensaje; un tercero no lo puede consultar. |
| Equipo | Ejecutar y revisar la entrega | Compose levanta la web, API y las dos bases. Swagger permite demostrar respuesta normal y error de stock. |

## Modelo de datos

El [entidad-relación](../../backend/README.md#modelo-relacional) muestra las relaciones SQL. PostgreSQL conserva usuarios, perfiles, categorías, productos, carrito, favoritos, pedidos, ítems, estados por vendedor y transacciones simuladas. La ficha técnica se almacena junto al producto en `products.technical` (`jsonb` validado), porque sus características pertenecen a una publicación. Las existencias y el precio operativo siguen en columnas tipadas.

En MongoDB, `interactions` contiene tipo de recurso, ID de publicación o pedido, participantes, mensaje y fecha. `activity_logs` contiene eventos, actor, recurso y metadatos variables según la acción, con un ID único de evento. Estos documentos no reemplazan ni duplican la información de una compra. Se pueden leer por usuario o recurso. La tabla SQL `activity_outbox` guarda eventos pendientes en la misma transacción que origina el cambio, hasta que se entregan a MongoDB.

## Rutas y navegación

| Pantalla | Contrato principal |
|---|---|
| Cuenta | `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/users/me` |
| Catálogo | `GET /api/v1/categories`, `GET /api/v1/products`, `GET /api/v1/products/facets`, `GET /api/v1/products/{id}` |
| Publicaciones | `POST /api/v1/products`, `PATCH /api/v1/products/{id}`, `DELETE /api/v1/products/{id}` (archiva) |
| Favoritos, carrito y pedidos | `/api/v1/favorites`, `/api/v1/cart`, `/api/v1/orders`, `/api/v1/seller/orders` |
| Actividad | `POST /api/v1/activity/interactions`, `GET /api/v1/activity/interactions/me`, `GET /api/v1/activity/logs/me` |

La interfaz se organiza en Catálogo, Favoritos, Pedidos y ventas, Actividad y Mi cuenta. Swagger publica cuerpos, estados y esquemas en `/docs`. Los filtros técnicos del catálogo combinan tipo (`profile`), campos (`facets`, mapa JSON), texto, categoría y precio. `/products/facets` ofrece opciones a partir de publicaciones activas que coinciden con los criterios básicos. El listado realiza la intersección completa en PostgreSQL antes de paginar.

## Comprobar el hito

1. Usar [la guía de arranque](../../DOCKER.md) y las cuentas ficticias. Mostrar que el catálogo de muestra no participa en la compra.
2. Crear, editar y consultar una publicación desde React. Filtrar memoria por 16 GB y después abrir una tarjeta de video para mostrar el cambio de opciones.
3. Comprar un producto desde el frontend y volver a consultar el pedido. Mostrar un error 409 en Swagger con una cantidad mayor al stock.
4. Enviar una consulta al vendedor y recuperarla en Actividad después de reiniciar. Confirmar que las dos bases responden en `/api/v1/health/ready`.
5. Activar la referencia USD y describir qué ocurre si el proveedor falla. Mantener el cálculo de la compra en CLP.
6. Revisar el PR, la ejecución de CI y los resultados del commit que se comprime para entregar. Los documentos históricos de ramas anteriores no sustituyen estas comprobaciones.

El Hito 4 se evalúa aparte. No se incluyen cobros bancarios ni se confunden reseñas ilustrativas con opiniones reales.
