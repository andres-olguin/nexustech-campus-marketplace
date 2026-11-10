import { OpenAPIObject, SchemaObject } from '@nestjs/swagger';

const uuid: SchemaObject = { type: 'string', format: 'uuid' };
const text: SchemaObject = { type: 'string' };
const integer: SchemaObject = { type: 'integer' };
const date: SchemaObject = { type: 'string', format: 'date-time' };
const ref = (name: string): SchemaObject => ({ $ref: `#/components/schemas/${name}` } as SchemaObject);
const array = (items: SchemaObject): SchemaObject => ({ type: 'array', items });
const object = (properties: Record<string, SchemaObject>): SchemaObject => ({ type: 'object', properties, required: Object.keys(properties) });
const record = (fields: Record<string, SchemaObject>) => object({ id: uuid, createdAt: date, ...fields });
const page = (name: string) => object({ items: array(ref(name)), total: integer, page: integer, limit: integer });

/** Explicit output schemas: persistence entities never expose passwordHash in OpenAPI. */
export function addResponseSchemas(document: OpenAPIObject) {
  const schemas: Record<string, SchemaObject> = {
    PublicUser: object({ id: uuid, email: { type: 'string', format: 'email' }, name: text }),
    Session: object({ accessToken: text, user: ref('PublicUser') }),
    BuyerProfile: record({ userId: uuid }),
    SellerProfile: record({ userId: uuid, displayName: text }),
    UserProfile: record({ email: text, name: text, buyerProfile: ref('BuyerProfile'), sellerProfile: ref('SellerProfile') }),
    Category: record({ name: text, ownerId: uuid }),
    Product: record({ name: text, description: text, categoryId: uuid, sellerId: uuid, price: { type: 'integer', minimum: 1000, maximum: 2500000 }, stock: { type: 'integer', minimum: 0, maximum: 100000 }, imageUrl: { type: 'string', nullable: true }, isActive: { type: 'boolean' }, updatedAt: date }),
    CartItem: record({ userId: uuid, productId: uuid, quantity: integer }),
    CartItemWithProduct: record({ userId: uuid, productId: uuid, quantity: integer, product: ref('Product') }),
    Cart: object({ items: array(ref('CartItemWithProduct')), total: integer }),
    Favorite: record({ userId: uuid, productId: uuid }),
    FavoriteWithProduct: record({ userId: uuid, productId: uuid, product: ref('Product') }),
    OrderItem: record({ orderId: uuid, productId: uuid, sellerId: uuid, name: text, unitPrice: integer, quantity: integer }),
    OrderFulfillment: record({ orderId: uuid, sellerId: uuid, status: { type: 'string', enum: ['confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'] }, updatedAt: date }),
    SellerOrder: object({ id: uuid, createdAt: date, orderStatus: { type: 'string', enum: ['confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'] }, shippingAddress: text, subtotal: integer, items: array(ref('OrderItem')), fulfillment: ref('OrderFulfillment') }),
    SimulatedTransaction: record({ orderId: uuid, status: { type: 'string', enum: ['approved', 'reversed'] }, provider: { type: 'string', enum: ['simulation'] }, amount: integer }),
    Order: record({ userId: uuid, status: { type: 'string', enum: ['confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'] }, total: integer, shippingAddress: text, idempotencyKey: text, items: array(ref('OrderItem')), transactions: array(ref('SimulatedTransaction')), fulfillments: array(ref('OrderFulfillment')) }),
    ActivityLog: object({ eventName: text, userId: uuid, resourceId: uuid, occurredAt: date }),
    Interaction: object({ targetId: uuid, targetType: { type: 'string', enum: ['product', 'order'] }, senderId: uuid, message: text, createdAt: date }),
    Deleted: object({ deleted: { type: 'boolean', enum: [true] } }),
    Health: object({ status: { type: 'string', enum: ['ok'] }, database: { type: 'string', enum: ['up'] } }),
    ApiError: object({ statusCode: integer, message: { oneOf: [text, array(text)] }, error: text }),
  };
  document.components ??= {};
  Object.assign(document.components.schemas ??= {}, schemas);
  for (const [path, methods] of Object.entries(document.paths)) {
    for (const method of ['get', 'post', 'put', 'patch', 'delete'] as const) {
      const operation = methods[method];
      if (!operation) continue;
      let schema: SchemaObject;
      if (method === 'delete') schema = ref('Deleted');
      else if (path.includes('/auth/')) schema = ref('Session');
      else if (path.endsWith('/users/me')) schema = ref('UserProfile');
      else if (path.includes('/categories')) schema = path.endsWith('/categories') && method === 'get' ? array(ref('Category')) : ref('Category');
      else if (path.includes('/products') || path.includes('/publications')) schema = (path.endsWith('/products') || path.endsWith('/publications')) && method === 'get' ? page('Product') : ref('Product');
      else if (path.includes('/cart')) schema = ref(method === 'get' ? 'Cart' : 'CartItem');
      else if (path.includes('/favorites')) schema = method === 'get' ? page('FavoriteWithProduct') : ref('Favorite');
      else if (path.includes('/seller/orders')) schema = method === 'get' ? page('SellerOrder') : ref('SellerOrder');
      else if (path.includes('/orders')) schema = path.endsWith('/orders') && method === 'get' ? page('Order') : ref('Order');
      else if (path.includes('/activity/interactions')) schema = path.includes('/target/') || path.endsWith('/me') ? array(ref('Interaction')) : ref('Interaction');
      else if (path.includes('/activity/logs')) schema = array(ref('ActivityLog'));
      else schema = ref('Health');
      const status = method === 'post' && !path.endsWith('/auth/login') ? '201' : '200';
      operation.responses[status] = { description: 'Operación completada', content: { 'application/json': { schema } } };
      for (const code of ['400', '401', '403', '404', '409', '429', '500', '503']) {
        operation.responses[code] = { description: `Error HTTP ${code}; consultar contrato`, content: { 'application/json': { schema: ref('ApiError') } } };
      }
    }
  }
}
