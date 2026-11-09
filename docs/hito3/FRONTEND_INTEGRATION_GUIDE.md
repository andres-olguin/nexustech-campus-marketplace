# Integración React con el backend canónico NestJS

Fuente canónica: PR #4, rama `feat/hito3-codex-backend`. No utilizar el servidor Express de `2a9a76d`. Este documento no modifica React. Contrato exhaustivo: [api-contract.md](api-contract.md); OpenAPI generado por la aplicación: `/docs-json`.

Ejemplos de peticiones y respuestas realmente capturados durante la suite PostgreSQL: [HTTP_EXAMPLES.json](../../backend/docs/HTTP_EXAMPLES.json). Incluyen un 400 de validación, categoría, producto y checkout completo con UUID y timestamps reales de la base aislada. No contienen tokens/contraseñas y no deben usarse como IDs del despliegue.

## Configuración y cliente HTTP

En el entorno Vite, definir `VITE_API_BASE_URL=http://localhost:3000/api/v1`. Esta variable es pública y no debe contener secretos. En el backend configurar `CORS_ORIGINS=http://localhost:5173` o el origen real de React, sin rutas. `localhost` y `127.0.0.1` son orígenes distintos. CORS habilita Authorization y Content-Type; no habilitar `x-user-id` ni usarlo para identidad. Nunca incluir JWT_SECRET ni credenciales SQL en Vite.

Cliente de referencia para adaptar dentro de la rama React:

```js
const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
export async function api(path, { token, body, signal, ...options } = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    signal,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(Array.isArray(data.message) ? data.message.join(' ') : data.message || 'Error de API');
    error.status = response.status;
    throw error;
  }
  return data;
}
```

Es un ejemplo de adaptación, no código React instalado ni verificado en navegador. Tratar desconexión y cancelación por AbortController por separado. Un fallo no debe activar un catálogo, sesión o pedido local como si hubiese persistido en SQL.

## Registro, sesión y perfiles

```js
const session = await api('/auth/register', {
  method: 'POST',
  body: { name: 'Comprador Sintético', email: 'buyer@example.test', password: 'Ejemplo-local-2026!' },
}); // 201 { accessToken, user: { id, email, name } }
const login = await api('/auth/login', {
  method: 'POST', body: { email: 'buyer@example.test', password: 'Ejemplo-local-2026!' },
}); // 200, misma forma
const profile = await api('/users/me', { token: login.accessToken });
await api('/users/me', { method: 'PATCH', token: login.accessToken, body: { sellerName: 'Tienda Sintética' } });
```

Los valores del ejemplo son sintéticos, no cuentas existentes del despliegue. Contraseña 12..128 caracteres. JWT expira en una hora. No existe refresh/logout de servidor ni cambio de rol: cerrar sesión descarta el token; un token copiado sigue válido hasta expirar. Guardar token en memoria del cliente para la demostración y volver a iniciar sesión al recargar; persistirlo en almacenamiento accesible a JavaScript aumenta exposición ante XSS y no es necesario para probar persistencia de pedidos. Nunca guardar la contraseña. Ante 401, limpiar sesión y pedir login, sin reintentar indefinidamente.

Cada cuenta tiene buyerProfile y sellerProfile. Cambiar una pestaña comprador/vendedor no cambia permisos: los define la relación del recurso con el usuario del JWT. No usar `rol`, `targetRole`, `userId`, email o cabeceras proporcionadas por React como autorización.

## Catálogo, categorías y publicaciones

`GET /categories` devuelve `[{id,name,ownerId,createdAt}]`. Mostrar nombres; enviar UUID en categoryId. Si faltan categorías en una base vacía, un usuario autenticado puede crearlas con `POST /categories`, `{name:"Hardware"}`. Solo el creador puede renombrarlas/borrarlas; borrar una categoría en uso devuelve 409.

```js
const params = new URLSearchParams({ page: '1', limit: '20', search: 'teclado' });
// Agregar categoryId, minPrice y maxPrice solo cuando hay filtro.
const catalog = await api(`/products?${params}`);
// { items: Product[], page: 1, limit: 20, total: number }
const detail = await api(`/products/${productId}`);
const created = await api('/products', {
  method: 'POST', token: sellerToken,
  body: { name: 'Teclado Sintético', description: 'Teclado sintético de demostración', categoryId, price: 65000, stock: 3 },
});
await api(`/products/${created.id}`, { method: 'PATCH', token: sellerToken, body: { price: 60000, stock: 2 } });
await api(`/products/${created.id}`, { method: 'DELETE', token: sellerToken }); // {deleted:true}
```

No existe PUT de edición ni endpoint restore en la API canónica. DELETE archiva; los pedidos conservan sus detalles. `GET /publications` es un alias del catálogo activo. Orden actual: más recientes, con UUID para desempatar; no enviar sortBy o sellerId porque no están implementados y retornan 400. Búsqueda ILIKE en nombre/descripción: insensible a mayúsculas, sin promesa de equivalencia de tildes.

## Adaptación de campos y UUID

| Frontend antiguo / Express | NestJS | Acción |
|---|---|---|
| id prefijado, TRK o UUID generado localmente | id UUID creado por PostgreSQL | Sustituir por el devuelto por la API; un UUID local válido tampoco acredita existencia |
| nombre | name | Mapear entrada y salida |
| descripcion | description | 10..2000 caracteres |
| precio | price | Convertir formulario a Number entero CLP; 1000..2500000 |
| categoria | categoryId | Resolver nombre contra `/categories`; al renderizar, usar mapa UUID→nombre |
| imagen | imageUrl | Enlace https; omitir si vacío; usar placeholder visual si respuesta null |
| vendedor / vendedor_nombre / vendedor_id | sellerId | Identidad desde JWT; no enviar nombres ni ID de vendedor en POST/PATCH |
| cantidad | quantity | Entero 1..100 |
| activo | isActive | Solo salida; archivar mediante DELETE |
| fecha / created_at | createdAt | ISO UTC; formatear localmente |
| codigo TRK | id del pedido | Mostrar UUID o versión visual abreviada, pero conservar UUID completo para peticiones |
| paso / estado | status + fulfillments | Usar estados textuales y seguimiento por vendedor |
| token simulado | accessToken | Solo JWT devuelto por Nest |
| data + meta | items + page + limit + total | No asumir respuesta Express |
| acabado / reseñas / campus / telefono | Sin equivalente persistente actual | No enviarlos a DTO ni presentarlos como datos guardados |

El catálogo público expone sellerId, no datos personales de vendedor. sellerProfile.displayName está disponible en el perfil propio, no existe directorio público de nombres. Mostrar una etiqueta neutral cuando no se dispone del nombre. Nunca usar el nombre del catálogo local para atribuir propiedad a un UUID distinto.

No mezclar `localStorage` del Taller 2 con el estado remoto. Al entrar al modo conectado, invalidar el catálogo/pedidos/favoritos/carrito locales de demostración y cargar los remotos. No migrar registros de compañeros ni seed institucional a SQL. Si el usuario quiere conservar datos sintéticos propios, debe publicarlos mediante la API y remapear las referencias con las respuestas reales.

## Carrito y favoritos

```js
await api('/cart', { method: 'PUT', token, body: { productId, quantity: 2 } });
// PUT establece cantidad absoluta: para incrementar, calcular nueva cantidad, no enviar delta.
const cart = await api('/cart', { token }); // {items:[{...,product}],total}
await api(`/cart/${productId}`, { method: 'DELETE', token });
await api(`/favorites/${productId}`, { method: 'PUT', token });
const favorites = await api('/favorites?page=1&limit=20', { token });
await api(`/favorites/${productId}`, { method: 'DELETE', token });
```

Una sola línea por usuario/producto; no hay variantes por acabado. Si el frontend mantiene varios acabados, debe dejar de tratarlos como SKU distintos en la API. Máximo 100 productos distintos en carrito. Un producto puede agotarse o archivarse después de agregarlo; GET carrito no reserva stock. Mostrar su estado y permitir retirarlo. Precio/stock se revalidan al comprar; recargar carrito y catálogo después de cada mutación o conflicto.

## Checkout, pedidos y seguimiento

```js
const checkoutKey = crypto.randomUUID(); // Crear una vez para este intento.
const body = { shippingAddress: 'Punto de retiro sintético de demostración', idempotencyKey: checkoutKey };
const order = await api('/orders', { method: 'POST', token, body });
// 201: pedido completo con items, transactions y fulfillments.
const orders = await api('/orders?page=1&limit=20', { token });
const saved = await api(`/orders/${order.id}`, { token });
await api(`/orders/${order.id}/status`, { method: 'PATCH', token, body: { status: 'cancelled' } });
```

No enviar items, total, precios, userId, datos de tarjeta o transaccion_id al checkout. El servidor compra el carrito autenticado y calcula el total. Combinar campos antiguos de dirección/ciudad en shippingAddress (10..500 caracteres), usando solo datos sintéticos durante la demo. La simulación ya se crea dentro del pedido: no llamar `/transactions/simulate` ni solicitar números de tarjeta.

Ante timeout, el resultado del checkout es incierto: conservar clave y body, deshabilitar doble clic y reintentar con ambos idénticos. No generar una clave nueva automáticamente. Una clave existente con dirección distinta devuelve 409. Un reintento exitoso devuelve el mismo pedido, incluso si fue cancelado. Para una compra deliberadamente nueva, cargar carrito y generar otra clave. El carrito se vacía solo después de confirmar la respuesta o consultar el estado remoto.

Comprador: mostrar `fulfillments` por vendedor. Secuencia: confirmed, preparing, shipped, delivered. Cancelar solo si todos están confirmed; un estado global confirmed no basta para habilitar el botón. Un 409 obliga a recargar pedido.

Vendedor: `GET /seller/orders` devuelve páginas de SellerOrder con items propios, subtotal, dirección y fulfillment propio. `PATCH /seller/orders/:id/status`, `{status:"preparing"}`, luego shipped y delivered. Solo siguiente estado, sin saltos; no se aceptan IDs de vendedor. Los vendedores no reciben detalles de otros vendedores ni datos de transacciones. Mostrar estas acciones como seguimiento declarado **simulado**, sin afirmar despacho, transportista, pago o recepción real.

## Carga, errores y validación

- Renderizar por separado loading, catálogo vacío y error. AbortController cancela búsquedas anteriores; la última respuesta válida debe corresponder al filtro visible.
- Deshabilitar envío mientras hay mutación. Volver a consultar recursos tras éxito; no mostrar éxito antes de respuesta HTTP.
- Error JSON: `{statusCode,message,error}`; message puede ser lista. Mostrar mensaje de validación de forma segura como texto.
- 400: corregir formulario/UUID/campos; 401: login; 403: falta propiedad; 404: no existe o no es visible para esa cuenta; 409: recargar y resolver stock/estado/duplicado; 429: respetar Retry-After; 500/503 o red: mostrar indisponibilidad y permitir reintento controlado.
- No registrar tokens/contraseñas en consola ni anexarlos a URL. No reemplazar errores de API con respuestas de demostración exitosas.

## Qué está comprobado y qué falta

Ejecutado en backend: registro/login, CRUD, filtros, carrito/favoritos, checkout, permisos, concurrencia, seguimiento multivendedor, Swagger y persistencia tras reinicios de PostgreSQL y procesos API. Las peticiones HTTP de la suite están en `backend/test/marketplace.test.cjs`; usan respuestas reales para encadenar UUID, nunca IDs inventados de un seed.

El código JS de esta guía es una referencia basada en ese contrato; sus snippets no se ejecutaron dentro de React. El agente frontend debe implementar el adaptador en su rama, ejecutar su build y verificar en navegador el flujo completo contra Nest. MongoDB y su historial no están disponibles por esta rama: no llamar endpoints Express de interacciones como si fueran canónicos.
