> Documento historico del 9 de noviembre. El transporte post-commit fue reemplazado por outbox transaccional en la rama Mongo QA. Estado actual: [MONGO_QA_2026-11-10.md](MONGO_QA_2026-11-10.md).

# Contrato de integración ActivityModule — NestJS

Responsable: agente Antigravity CLI. Directorio exclusivo: `backend/src/activity/`. No se ha creado ni modificado en esta rama. No incorporar `config/mongo.js`, fallback en memoria ni servidor Express.

## Dependencias y montaje

Exportar `ActivityModule` desde `src/activity/activity.module.ts`, registrar sus providers/controllers internamente y añadirlo a `imports` de `AppModule` mediante cambio coordinado. `EventEmitterModule.forRoot()` ya está registrado una vez; no volver a inicializarlo. La conexión Mongo debe estar encapsulada en ActivityModule con `MONGODB_URI`; no reutilizar DATABASE_URL. No importar OrdersService/CatalogService dentro del módulo para registrar auditoría, ni importar ActivityModule en esos servicios: consumir eventos de aplicación.

Si se exponen endpoints, el agente debe definir permisos y DTO, filtrar datos por usuario autenticado y coordinar el acceso al guard/JwtModule mediante un módulo de autenticación compartido. Actualmente AuthGuard/JwtModule se registran en AppModule; no asumir que se inyectan automáticamente en un módulo hijo. Evitar duplicar configuración JWT o crear dependencias circulares con AppModule. No se han definido ni verificado endpoints Mongo en este PR.

## Eventos SQL disponibles

| Nombre | resourceId | userId | Campos adicionales |
|---|---|---|---|
| product.created | UUID producto | vendedor autenticado | ninguno |
| product.updated | UUID producto | vendedor autenticado | ninguno; incluye archivado lógico |
| order.created | UUID pedido | comprador autenticado | ninguno |
| order.cancelled | UUID pedido | comprador autenticado | ninguno |
| order.fulfillment.updated | UUID pedido | vendedor autenticado | sellerId, status, orderStatus |

Contrato base TypeScript:

```ts
type ActivityEvent = {
  userId: string;        // UUID actor validado por servidor
  resourceId: string;    // UUID recurso SQL
  occurredAt: string;    // ISO UTC al publicar después de commit
};
type FulfillmentEvent = ActivityEvent & {
  sellerId: string;
  status: 'preparing' | 'shipped' | 'delivered';
  orderStatus: 'confirmed' | 'preparing' | 'shipped' | 'delivered';
};
```

Ejemplo sintético: `{"userId":"11111111-1111-4111-8111-111111111111","resourceId":"22222222-2222-4222-8222-222222222222","occurredAt":"2026-11-09T22:05:00.000Z","sellerId":"11111111-1111-4111-8111-111111111111","status":"preparing","orderStatus":"confirmed"}`. El agregado puede seguir confirmed si otro vendedor aún no avanzó. No derivar una cancelación permitida solo del agregado.

## Semántica y aislamiento

`ActivityEvents.publish` invoca `EventEmitter2.emitAsync` después de finalizar la transacción SQL. No espera persistencia Mongo; captura throw/rechazo de listeners y registra advertencia sin cuerpos sensibles. Un fallo del listener no convierte un pedido ya comprometido en error HTTP. La suite comprueba un listener que falla durante transiciones multivendedor: el estado SQL y la respuesta HTTP se mantienen correctos.

Entrega best effort: no outbox, eventId, garantía de orden, entrega única, cola persistente ni reintentos durables. Un proceso puede caer entre commit y emisión; eventos pueden perderse. occurredAt no prueba el orden exacto de commits. Idempotencia de checkout evita una segunda emisión de order.created en un reintento, pero no constituye garantía global de entrega única. Si se requiere auditoría durable, diseñar un outbox SQL en una fase posterior; no afirmar que existe.

Persistir solo actor/recurso/estado/timestamp permitido. No registrar contraseñas, JWT, correos institucionales, nombres de compañeros, IP o dirección de entrega. No consultar datos personales de SQL para enriquecer esos eventos. No aceptar actor userId arbitrario de un cliente React como identidad verificada de auditoría.

## Pruebas pendientes del agente Mongo

1. Conectar a MongoDB real aislado; evidenciar insert y lectura después de reiniciar su proceso.
2. Validar esquema, índices, límites de consultas y permisos sobre historial.
3. Desconectar Mongo y comprobar que SQL/checkout no se corrompe ni simula persistencia Mongo exitosa.
4. Comprobar que ningún endpoint admite suplantar actor con body/header/query.
5. Integrar Nest y su build/migraciones sin reemplazar package.json ni tocar el backend alternativo.

Este PR prueba el aislamiento del emisor ante fallos de listeners, **no** la conexión ni persistencia de MongoDB.
