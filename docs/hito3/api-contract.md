# NexusTech API v1 — contrato de integración

Base: http://localhost:3000/api/v1. Swagger: /docs; OpenAPI: /docs-json.
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
Pedido: {id,userId,status,total,shippingAddress,idempotencyKey,createdAt,items:[{id,orderId,productId,name,unitPrice,quantity}],transactions:[{id,orderId,status,amount,provider:"simulation"}]}.
Carrito: {items:[{id,userId,productId,quantity,product}],total}; favoritos: página de {id,userId,productId,product}.
Usuario propio: {id,email,name,createdAt,buyerProfile:{id,userId},sellerProfile:{id,userId,displayName}}; no se exponen hashes.

## Reglas y relaciones
Usuario tiene perfil comprador y vendedor 1:1, carrito lógico y favoritos. Categoría tiene muchos productos; vendedor es dueño del producto. Pedido tiene detalles con nombre/precio históricos y transacción simulada. FK restringen borrado de productos pedidos. Productos se archivan. Cantidad 1..100; stock 0..100000; precio 1000..2500000; nombre 3..160; descripción 10..2000. Registro crea ambos perfiles. Categorías solo se borran sin productos. No se compra publicación propia. Checkout bloquea usuario y productos, verifica inventario, descuenta stock, crea detalles/transacción y vacía carrito en una transacción SQL. IdempotencyKey único por usuario (8..100 caracteres alfanuméricos, guion o guion bajo); reintento devuelve pedido existente; con distinta dirección devuelve 409. Estado inicial confirmed (simulación); solo confirmed→cancelled, repone inventario exactamente una vez. Cancelación repetida o reposición que exceda 100000 devuelve 409. No hay cobros reales.

## Integración MongoDB reservada
No se crea ni modifica backend/src/activity/. El agente Mongo debe exportar ActivityModule desde src/activity/activity.module.ts y agregarlo a imports de AppModule cuando esté listo. Sus dependencias/configuración pertenecen a ese módulo; usar MONGODB_URI. Para auditoría puede suscribirse a eventos Nest EventEmitter2: product.created, product.updated, order.created, order.cancelled con {userId,resourceId,occurredAt}. Se emiten tras commit; son best effort, sin outbox ni garantía de entrega. Mongo no participa en transacciones ni debe impedir checkout SQL. Nunca registrar contraseñas/tokens/direcciones.

## Seguridad y límites
JWT HS256 con secreto obligatorio de al menos 32 caracteres, caducidad 1 hora; contraseñas scrypt con sal aleatoria; propiedad validada en servidor. Sin recuperación, verificación email, MFA ni revocación antes de expirar; alcance académico. HTTPS corresponde al despliegue. CORS por origen explícito. Rate limit en memoria por IP, requiere configuración adicional detrás de proxy/múltiples instancias.
