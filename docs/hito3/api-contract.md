# NexusTech API v1 — contrato de integración

Base: http://localhost:3000/api/v1. Swagger: /docs; OpenAPI: /docs-json.
Canónico: NestJS/TypeORM de PR #4; incompatible con servidor Express de 2a9a76d. [Guía React](FRONTEND_INTEGRATION_GUIDE.md), [eventos Mongo](ACTIVITY_INTEGRATION.md) y [JSON capturado de HTTP real aislado](../../backend/docs/HTTP_EXAMPLES.json). Los UUID de ejemplos son de prueba, no registros del despliegue.
JSON camelCase; identificadores UUID; fechas ISO UTC; precios enteros CLP.
Autorización: Bearer accessToken obtenido en /auth/login o /auth/register. Nunca enviar userId para suplantar al usuario.

| Método | Ruta | Entrada / salida | Acceso |
|---|---|---|---|
| POST | /auth/register | {email,password,name} → {accessToken,user} | público |
| POST | /auth/login | {email,password} → {accessToken,user} | público |
| GET/PATCH | /users/me | perfil / {name?,sellerName?} → usuario y perfiles | autenticado |
| GET/POST | /categories | lista / {name} → categoría | lectura pública; escritura autenticada |
| PATCH/DELETE | /categories/:id | {name} / vacío | creador |
| GET | /products | ?page=1&limit=20&search=&categoryId=&minPrice=&maxPrice= → página | público |
| GET | /products/:id | producto | público |
| POST | /products | {name,description,categoryId,price,stock,imageUrl?} | autenticado con perfil vendedor |
| PATCH | /products/:id | campos anteriores opcionales | propietario |
| DELETE | /products/:id | archiva publicación | propietario |
| GET | /publications | mismo catálogo público y filtros | público |
| GET/PUT | /cart | carrito / {productId,quantity} → elemento | propietario |
| DELETE | /cart/:productId | elimina elemento | propietario |
| GET | /favorites | lista paginada de favoritos | propietario |
| PUT/DELETE | /favorites/:productId | agrega / elimina | propietario |
| POST | /orders | {shippingAddress,idempotencyKey} → pedido con detalles y transacción simulada | propietario |
| GET | /orders | página de pedidos propios | propietario |
| GET | /orders/:id | pedido propio con detalles | propietario |
| PATCH | /orders/:id/status | {status:"cancelled"} | comprador propietario |
| GET | /seller/orders | ?page=1&limit=20 → página de pedidos con solo los artículos propios | vendedor participante |
| PATCH | /seller/orders/:id/status | {status:"preparing"\|"shipped"\|"delivered"} → SellerOrder | vendedor participante; siguiente estado únicamente |
| GET | /health | {status:"ok",database:"up"} | público |

POST: 201, excepto /auth/login: 200; GET/PATCH/PUT/DELETE: 200. DELETE devuelve {deleted:true}.
Errores: {statusCode,message,error}; 400 validación, 401 token ausente/inválido, 403 propiedad, 404 recurso, 409 conflicto (email, categoría, stock, estado), 429 límite, 500 error interno, 503 base no disponible.
Paginación: {items:[],page:1,limit:20,total:0}; limit máximo 100.
Categorías devuelve un arreglo sin paginar. El carrito tiene máximo 100 productos distintos. PUT /cart devuelve un elemento {id,userId,productId,quantity,createdAt}; PUT /favorites/:productId devuelve {id,userId,productId,createdAt}. Campos desconocidos se rechazan con 400. PATCH de producto no admite null en campos obligatorios.

Ejemplo registro: {"email":"comprador@example.test","password":"ClaveDemo123!","name":"Comprador Demo"}. Contraseña: 12..128 caracteres; email normalizado a minúsculas.
Respuesta auth: {"accessToken":"<JWT>","user":{"id":"<uuid>","email":"comprador@example.test","name":"Comprador Demo"}}.
Ejemplo producto: {"name":"Teclado mecánico","description":"Teclado usado en buen estado","categoryId":"<uuid>","price":65000,"stock":3}.
Producto: {id,name,description,categoryId,sellerId,price,stock,imageUrl,isActive,createdAt,updatedAt}.
Publicación: producto con isActive=true; producto y publicación se modelan como una sola oferta vendible.
Ejemplo pedido: {"shippingAddress":"Retiro campus Viña del Mar","idempotencyKey":"checkout-2026-001"}.
Pedido: {id,userId,status,total,shippingAddress,idempotencyKey,createdAt,items:[{id,orderId,productId,sellerId,name,unitPrice,quantity,createdAt}],transactions:[{id,orderId,status,amount,provider:"simulation",createdAt}],fulfillments:[{id,orderId,sellerId,status,createdAt,updatedAt}]}.
Carrito: {items:[{id,userId,productId,quantity,product}],total}; favoritos: página de {id,userId,productId,product}.
Usuario propio: {id,email,name,createdAt,buyerProfile:{id,userId},sellerProfile:{id,userId,displayName}}; no se exponen hashes.
BuyerProfile y SellerProfile incluyen createdAt. Categoría: {id,name,ownerId,createdAt}. Todos los UUID deben existir en PostgreSQL; no basta generar uno en React. No hay endpoint público de perfil ajeno, listado general de usuarios ni consulta pública de pedidos por código TRK.

Límites adicionales: name de registro/perfil 3..80, sellerName 3..80, category.name 3..80, email 3..254, password de registro 12..128, shippingAddress 10..500, imageUrl HTTPS 1..1000 si se informa. ProductDto requiere name,description,categoryId,price,stock; PATCH permite subconjunto de esos campos y imageUrl. Precio/stock/quantity deben ser números JSON enteros, no strings de formulario. imageUrl null corresponde a ausencia de imagen; ningún precio/cantidad/identificador admite null.

## Reglas y relaciones
Usuario tiene perfil comprador y vendedor 1:1, carrito lógico y favoritos. Categoría tiene muchos productos; vendedor es dueño del producto. Pedido tiene detalles con nombre/precio históricos y transacción simulada. FK restringen borrado de productos pedidos. Productos se archivan. Cantidad 1..100; stock 0..100000; precio 1000..2500000; nombre 3..160; descripción 10..2000. Registro crea ambos perfiles. Categorías solo se borran sin productos. No se compra publicación propia. Checkout bloquea usuario y productos, verifica inventario, descuenta stock, crea detalles/transacción y vacía carrito en una transacción SQL. IdempotencyKey único por usuario (8..100 caracteres alfanuméricos, guion o guion bajo); reintento devuelve pedido existente; con distinta dirección devuelve 409. Estado inicial confirmed (simulación); solo confirmed→cancelled, repone inventario exactamente una vez. Cancelación repetida o reposición que exceda 100000 devuelve 409. No hay cobros reales.

## Integración MongoDB reservada
No se crea ni modifica backend/src/activity/. El agente Mongo debe exportar ActivityModule desde src/activity/activity.module.ts y agregarlo a imports de AppModule cuando esté listo. Sus dependencias/configuración pertenecen a ese módulo; usar MONGODB_URI. Para auditoría puede suscribirse a eventos Nest EventEmitter2: product.created, product.updated, order.created, order.cancelled con {userId,resourceId,occurredAt}. Se emiten tras commit; son best effort, sin outbox ni garantía de entrega. Mongo no participa en transacciones ni debe impedir checkout SQL. Nunca registrar contraseñas/tokens/direcciones.

## Seguimiento por vendedor (simulado)

Cada pedido contiene un fulfillment por vendedor. El servidor toma sellerId de los productos al comprar y lo guarda en los detalles; nunca acepta sellerId del cliente. Secuencia estricta: confirmed → preparing → shipped → delivered. Solo el vendedor de ese fulfillment puede avanzarlo mediante `/seller/orders/:id/status`; saltos, repeticiones, retrocesos y pedidos cancelados devuelven 409. Un usuario que no vende artículos de ese pedido recibe 404. Un comprador no puede avanzar el despacho usando su endpoint de cancelación (400 si intenta otro estado).

El estado global es el menor avance entre vendedores: si uno está delivered y otro confirmed, el pedido global sigue confirmed. La cancelación completa requiere que **todos** sigan confirmed; si cualquiera comenzó preparing devuelve 409, aunque el global siga confirmed. Cancelar actualiza todos los fulfillments a cancelled y repone todo el stock en la misma transacción. No hay cancelación parcial ni devoluciones después de preparación. Las transiciones de seguimiento no descuentan ni reponen stock y no cambian la simulación de pago. No hay conexión con transportistas ni prueba real de entrega: son declaraciones de avance del vendedor para la demostración.

SellerOrder: {id,createdAt,orderStatus,shippingAddress,subtotal,items:[OrderItem propios],fulfillment:OrderFulfillment propio}. No contiene total global, detalles de otros vendedores, idempotencyKey, userId del comprador ni transacciones. La dirección se comparte con los vendedores participantes para coordinar entrega.

Ejemplo petición autenticada de vendedor: `PATCH /api/v1/seller/orders/22222222-2222-4222-8222-222222222222/status`, body `{"status":"preparing"}`.
Ejemplo de fulfillment (UUID ilustrativos, no IDs de seed):
```json
{"id":"33333333-3333-4333-8333-333333333333","orderId":"22222222-2222-4222-8222-222222222222","sellerId":"11111111-1111-4111-8111-111111111111","status":"preparing","createdAt":"2026-11-09T22:00:00.000Z","updatedAt":"2026-11-09T22:05:00.000Z"}
```

Evento adicional `order.fulfillment.updated`: `{userId,resourceId,occurredAt,sellerId,status,orderStatus}`. userId y sellerId identifican al vendedor autenticado; resourceId es el UUID del pedido; status es el nuevo estado del fulfillment y orderStatus el agregado después de la transacción. Sin datos de dirección ni identidad del comprador. El timestamp corresponde a publicación posterior al commit, no a recepción garantizada en Mongo. Los cuatro eventos anteriores conservan su contrato.

## Seguridad y límites
JWT HS256 con secreto obligatorio de al menos 32 caracteres, caducidad 1 hora; contraseñas scrypt con sal aleatoria; propiedad validada en servidor. Sin recuperación, verificación email, MFA ni revocación antes de expirar; alcance académico. HTTPS corresponde al despliegue. CORS por origen explícito. Rate limit en memoria por IP, requiere configuración adicional detrás de proxy/múltiples instancias.
