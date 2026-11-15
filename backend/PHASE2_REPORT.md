# Integración controlada y cierre técnico — fase 2

9 de noviembre de 2026, Chile. Backend canónico NestJS, worktree `C:/Users/alumno/Desktop/nexustech-codex-backend`, rama `feat/hito3-codex-backend`, [PR #4](https://github.com/andres-olguin/nexustech-campus-marketplace/pull/4). No se fusiona a main ni se altera la rama Express. No se modifican frontend, Docker ni `backend/src/activity/`.

## Problemas reales y correcciones

- Se confirmó el conflicto arquitectónico al inspeccionar `origin/feat/hito3-antigravity-fullstack` en `2a9a76d`: servidor Express alternativo, operaciones en memoria, tokens simulados, identidad enviada por cliente, precios del checkout desde body y datos de demostración con apariencia personal/institucional. No se importó ese código. Ver [revisión con archivos y decisiones](../docs/hito3/BACKEND_CONFLICT_REVIEW.md).
- Nest solo ofrecía confirmed/cancelled. Se añadió seguimiento por vendedor, sin permitir que comprador ni otro vendedor modifiquen su fulfillment. Una compra con múltiples vendedores no puede tratarse como un único despacho controlado por cualquiera.
- El estado agregado confirmed puede coexistir con un vendedor preparing y otro confirmed. La cancelación comprueba todos los fulfillments dentro de la transacción; no usa solo el agregado. Comparte bloqueo del pedido con las transiciones para evitar cancelar y preparar simultáneamente.
- pg advirtió sobre llamadas paralelas query() sobre una misma conexión transaccional. Se serializaron las consultas de detalles/vista vendedor; la ejecución final no emitió esa advertencia.
- La documentación React debía diferenciar UUID/DTO/respuestas del contrato Express. Se preparó guía de adaptación y ejemplos capturados sin tokens ni datos personales.

## Funcionalidades de esta fase

Migración adicional, conservando la inicial, para `order_fulfillments` y sellerId histórico en order_items. La migración completa registros antiguos mediante el vendedor del producto referenciado. Su reversión se protege contra borrar seguimiento que ya avanzó. Aplicar ambas migraciones antes de iniciar la nueva API.

Secuencia por vendedor: confirmed→preparing→shipped→delivered. Sin saltos, retrocesos o repeticiones. Estado global igual al menor avance. Cancelación completa solo antes de cualquier preparación; actualiza todos los fulfillments, repone stock y revierte simulación de manera atómica. Transiciones de seguimiento no vuelven a tocar inventario ni pago. Son declaraciones simuladas, sin transportistas ni verificación real de entrega.

Endpoints nuevos: `GET /api/v1/seller/orders` (paginado) y `PATCH /api/v1/seller/orders/:id/status`. Las respuestas del vendedor incluyen solo artículos propios, subtotal, fulfillment y dirección necesaria; omiten identidad del comprador, total general, otros artículos, claves y transacciones. Pedidos del comprador ahora incluyen fulfillments y sellerId en cada detalle. Los endpoints anteriores se conservan.

## Autorización y seguridad inspeccionadas

Se revisaron guard JWT, verificación HS256/issuer/audience/expiración, existencia del usuario, scrypt, validaciones DTO y proyección de perfiles. Se mantuvieron propiedad de productos/categorías, acceso privado a carrito/favoritos/pedidos, consultas parametrizadas y restricciones SQL. Las nuevas rutas toman actor del JWT; no aceptan userId/sellerId del body. Se probó que `x-user-id` sin token no autentica.

Para inventario se mantienen bloqueos de usuario y productos en checkout, orden de UUID para productos, snapshots y clave única de idempotencia. Cancelación y seguimiento bloquean el mismo pedido antes de decidir. Los listeners de actividad fallidos se aíslan después de commit. No es una auditoría exhaustiva de seguridad ni certificación de producción.

## Pruebas ejecutadas

Se ejecutó primero la suite de `2f7f484`: 14 aprobadas, 0 fallidas, PostgreSQL 18.6 real aislado. Después se ampliaron pruebas y se ejecutó la suite final con captura de ejemplos:

```powershell
# Dentro de backend/
$env:NEXUSTECH_CAPTURE_EXAMPLES='1'
npm test
```

Salida final, código 0:

```text
Verified database: PostgreSQL 18.6 on x86_64-windows, compiled by msvc-19.44.35228, 64-bit
tests 17
pass 17
fail 0
cancelled 0
skipped 0
duration_ms 19483.7497
```

Incluye un caso principal y 16 subpruebas. Node 26.13.0, npm 11.20.0, Windows x64. Las migraciones se aplicaron con CLI JS, se revirtieron ambas y se aplicaron con CLI TS. La suite no utiliza mocks de PostgreSQL. La reversión/aplicación se comprobó en base aislada vacía; no se ejecutó una migración sobre una base compartida ni se verificó el backfill contra datos de despliegue existentes.

Además del flujo previo, se verificó:

- Dos vendedores en un pedido; aislamiento de vista y permisos, salto/repetición inválidos, agregado y cancelación bloqueada aunque agregado confirmed.
- Dos avances concurrentes al mismo fulfillment: solo uno 200, otro 409.
- Carrera cancelación/preparación: solo una operación exitosa; stock y transacción consistentes.
- Listener de actividad que lanza error: avance HTTP/SQL exitoso y contrato de evento sin dirección.
- Cierre de Nest/pools y reinicio del proceso PostgreSQL conservando disco. Luego dos arranques independientes de `node dist/main.js`, con cierre entre ellos, recuperan cuenta/login, pedido delivered, fulfillments, total y stocks; Swagger UI responde HTTP 200.
- Ninguna base compartida se modifica; cluster temporal validado antes de limpieza. Se comprobó después que no quedaban procesos PostgreSQL de prueba.

`npm audit` ejecutado dentro de backend informó `found 0 vulnerabilities`. `git diff --check` no encontró errores de whitespace. Los resultados de auditoría corresponden al lockfile actual, no garantizan ausencia de fallas futuras. No se ejecutó la suite del servidor Express, no se atribuye un resultado a ella.

## Swagger y documentos entregados

Swagger mantiene `/docs` y `/docs-json`, con Bearer JWT, DTO, errores y schemas. Añade tag seller orders, DTO FulfillmentStatusDto, schemas SellerOrder/OrderFulfillment, sellerId en OrderItem, fulfillments y nuevos estados en Order. Las pruebas comprueban las rutas/schemas generadas y acceso HTTP a documentación después de reinicios.

- [api-contract.md](../docs/hito3/api-contract.md): todos los endpoints disponibles, permisos, respuestas y estados.
- [FRONTEND_INTEGRATION_GUIDE.md](../docs/hito3/FRONTEND_INTEGRATION_GUIDE.md): URL/CORS, JWT, adaptador y transformación de campos/UUID, errores, checkout y seguimiento.
- [ACTIVITY_INTEGRATION.md](../docs/hito3/ACTIVITY_INTEGRATION.md): montaje Nest, contratos de eventos y límites best effort.
- [BACKEND_CONFLICT_REVIEW.md](../docs/hito3/BACKEND_CONFLICT_REVIEW.md): evidencia estática y plan selectivo.
- [DEMO_PROCEDURE.md](DEMO_PROCEDURE.md): diez pasos reproducibles y distinción ejecutado/pendiente.
- [docs/HTTP_EXAMPLES.json](docs/HTTP_EXAMPLES.json): peticiones/respuestas reales de la última ejecución aislada, con datos sintéticos y sin credenciales.

## Necesidades de los otros agentes

React debe reemplazar cliente Express/localStorage por llamadas Nest, usar UUID devueltos, categoryId y campos camelCase, enviar Bearer, comprar carrito remoto con clave persistente de reintento y separar vista comprador/vendedor. No enviar precios/usuario al checkout ni usar x-user-id. La simulación se obtiene en la respuesta del pedido; no solicitar tarjetas.

Mongo debe entregar exclusivamente ActivityModule para Nest y encapsular conexión real. Consumir product.created, product.updated, order.created, order.cancelled y order.fulfillment.updated sin importar servicios SQL. No hay outbox ni garantía de entrega/orden. Si expone endpoints autenticados, coordinar exportación de AuthGuard/JwtModule mediante módulo compartido; su acceso no es automático desde un módulo hijo. No está implementado ni probado aquí.

## Brechas y límites de evaluación

No se recibió una rúbrica detallada distinta de los requisitos del encargo; no se afirma cumplimiento de criterios no disponibles. Los procesos backend enumerados tienen implementación y pruebas SQL. Siguen pendientes para la entrega Full Stack:

1. Adaptación real de React y verificación visual navegador→Nest→PostgreSQL en el entorno integrado.
2. ActivityModule y evidencia de conexión/persistencia con MongoDB real.
3. Configuración y ejecución del entorno de despliegue/infraestructura del otro agente, secretos, HTTPS y CORS; no se probó su PostgreSQL ni su reinicio.
4. Revisión del PR #4 y resolución explícita del conflicto de backend por el integrador; sin merge automático.

No implementados por alcance: pagos/envíos reales, recuperación de contraseña, MFA, verificación de email o pertenencia institucional, refresh/revocación inmediata y auditoría durable. Rate limit en memoria por instancia. Opcionales del backend alternativo (orden por precio, búsqueda sin tildes, restauración y métricas) no se presentan como implementados.

## Git, comandos, fuentes y uso de IA

Se verificaron `git status`, `git fetch origin`, `git ls-remote`, historial y `gh pr view 4` antes de editar. Se inspeccionó Express con `git ls-tree` y `git show origin/feat/hito3-antigravity-fullstack:...`, sin checkout/merge/cherry-pick. Se ejecutaron `npm run build`, `npm test`, `npm audit` y `git diff --check`. Los cambios funcionales y contrato se publicaron en `2c1c478`, con SHA remoto verificado. Los documentos/captura se publican en un commit posterior visible en el PR. No force push ni cambios sobre main.

La rama alternativa avanzó durante el trabajo a `f25590a`; se comprobó con fetch y diff que su servidor backend no cambió respecto de `2a9a76d` (solo añadió Dockerfile). Se conserva la revisión del código en ese SHA y no se modifica el avance ajeno.

IA: Codex asistió revisión, diseño de seguimiento, migración, implementación, pruebas y documentación. Las reglas se contrastaron con HTTP y SQL reales; se corrigió la advertencia observada y se conservan evidencias/limitaciones. No se reutilizaron contraseñas, identidades ni datos personales del backend alternativo.

Bibliografía primaria: [validación NestJS](https://docs.nestjs.com/techniques/validation), [Swagger NestJS](https://docs.nestjs.com/openapi/introduction), [Nest EventEmitter](https://docs.nestjs.com/techniques/events), [migraciones TypeORM](https://typeorm.io/docs/advanced-topics/migrations/), [transacciones TypeORM](https://typeorm.io/docs/advanced-topics/transactions/), [bloqueos PostgreSQL](https://www.postgresql.org/docs/current/explicit-locking.html), [guía node-postgres de transacciones](https://node-postgres.com/features/transactions). La evidencia del conflicto es el código versionado del SHA 2a9a76d, no una inferencia de conectividad remota.
