# Revisión del conflicto de backend — Hito 3

Fecha: 9 de noviembre de 2026, Chile. Revisión estática del commit remoto [`2a9a76d`](https://github.com/andres-olguin/nexustech-campus-marketplace/tree/2a9a76ddc365b1fa72fdf1b4f697ca048806da6c/backend), rama `feat/hito3-antigravity-fullstack`. Base canónica revisada: NestJS de `2f7f484`, PR #4. Las conclusiones sobre Express corresponden a esos archivos versionados; no abarcan cambios locales posteriores de otros agentes. No se ejecutó su suite ni se modificó su rama.

Comprobación remota al cerrar: esa rama avanzó a `f25590a`. El diff de `backend/` desde `2a9a76d` añade únicamente `backend/Dockerfile`; los archivos de servidor revisados no cambian y los hallazgos siguen aplicando. No se incorporó ni modificó ese Dockerfile. No se revisan aquí los cambios React de ese commit.

## Decisión de integración

El backend canónico es NestJS + TypeORM + PostgreSQL de PR #4. No fusionar la rama Express completa ni incorporar su `backend/package.json`, servidor, lockfile o configuración de datos. Mantener intacto su historial. El frontend de esa rama requiere adaptación explícita al contrato Nest; compartir el prefijo `/api/v1` no hace compatibles las implementaciones.

## Comparación

| Aspecto | Alternativa Express en 2a9a76d | Backend NestJS |
|---|---|---|
| Inicio de sesión | Cadena `token-jwt-simulado-` más ID; comparación de contraseña con prefijo literal | JWT firmado, issuer/audience, expiración y scrypt con sal |
| Identidad | `x-user-id`, parámetros/body y usuarios de respaldo | Usuario extraído de JWT verificado y existencia comprobada |
| Productos | CRUD, restauración, orden por precio, búsqueda sin tildes y filtro de vendedor sobre arreglos | CRUD con propiedad, archivo lógico, filtros SQL, categorías UUID, paginación acotada |
| Perfiles | Nombre, teléfono, campus, cambio de rol e indicadores en memoria | Perfiles comprador/vendedor persistentes; cuenta con ambas capacidades |
| Checkout | Nombre/precio/cantidad del cliente; identidad por body; inserción en arreglos | Carrito del usuario; precio/stock del servidor; transacción SQL y bloqueos |
| Pedidos | Consulta general/código TRK y pasos 0..3 sin autorización de rutas | Consulta propia por UUID; seguimiento por vendedor implementado en esta fase |
| Inventario | Crear pedido no comprueba ni descuenta stock del catálogo | Descuento transaccional, cancelación con reposición única |
| Simulación | Endpoint independiente acepta monto, tarjeta y código arbitrarios | Una transacción simulation vinculada por FK al pedido y total del servidor |
| PostgreSQL | Pool opcional, pero controladores principales usan `getMemoryStore()` | Persistencia exclusivamente PostgreSQL; fallo no se transforma en éxito en memoria |
| Mongo | Driver con fallback en arreglos; auditoría acoplada a solicitudes | Módulo reservado para agente Mongo; eventos posteriores al commit, best effort |
| Salud | `connected: true` devuelto sin demostrar consulta a bases | `/health` ejecuta `SELECT 1`, 503 si falla |
| Pruebas | Importan app sin inicializar bases, afirman estado de conexión y ejercitan arreglos | HTTP contra PostgreSQL real aislado; migraciones y concurrencia verificadas |
| Cambio USD/CLP | mindicador con caché y valor constante de respaldo | No hay endpoint de cambio en Nest; no es necesario para comprar en CLP |

## Hallazgos concretos

1. **Autenticación y autorización insuficientes.** `controllers/authController.js` guarda `'hash_' + password` y emite un token de texto sin firma. `getProfile` confía en `x-user-id`/query; `switchRole` recibe userId y rol del body. Los archivos `routes/*Routes.js` no agregan middleware de autenticación a CRUD, pedidos ni transacciones. No adaptar esos mecanismos.
2. **Exposición de pedidos e identidad.** `listOrders` permite consulta sin filtro; `getOrderByCode` revela dirección e información del destinatario con un código TRK de seis dígitos; `updateOrderStatus` acepta pasos arbitrarios 0..3 y atribuye actor desde una cabecera sin verificar. No conservar ese contrato público. En Nest las consultas son privadas y UUID no sustituye la autorización.
3. **Checkout manipulable y no transaccional.** `createOrder` calcula desde precio/cantidad enviados por cliente, permite productos no existentes con identificador de respaldo y escribe arreglos. No utiliza inventario ni una transacción SQL; el usuario comprador también puede venir del body. Un fallo posterior de auditoría podría devolver 500 después de mutar el pedido en memoria.
4. **Persistencia aparente.** `config/db.js` declara `memoryStore`; no hay escritura de esos arreglos a archivo aunque el comentario mencione memoria/archivo. Los controladores acceden directamente al store incluso si el pool llega a conectar. `db.query` también puede delegar errores SQL a un intérprete local parcial. `getPostgresStatus` indica conectado siempre. No presentar esto como persistencia PostgreSQL comprobada.
5. **Mongo con estado engañoso.** `config/mongo.js` conserva arreglos locales y `connected: true`; un insert puede pasar a memoria cuando falla Mongo. La analítica se calcula sobre hasta 500 documentos, por lo que no constituye un total global confiable. No trasladar fallback ni estado de conexión al módulo canónico.
6. **Datos de demostración inadecuados.** Stores y pruebas incluyen nombres de personas, correos de dominio institucional, teléfonos y direcciones que aparentan pertenecer a compañeros o campus. No se verificó su procedencia ni consentimiento. Este informe no los reproduce; no migrarlos ni asumir que son ficticios. Usar `example.test`, nombres genéricos y lugares explícitamente sintéticos.
7. **Simulación con apariencia comercial.** El comprobante alternativo utiliza nombres de proveedores y lenguaje de certificación, junto con datos de tarjeta de demostración. No hay evidencia de certificación ni integración real. Mantener `provider: simulation`; no solicitar tarjetas reales ni emitir afirmaciones de autorización comercial.
8. **Pruebas desacopladas de las bases.** `tests/api.test.js` importa `app.js`; el arranque de bases reside fuera de ese archivo. Las pruebas de CRUD usan IDs prefijados/usuarios precargados y la salud responde constantes de conexión. Que pasen no demostraría migraciones, durabilidad, FK ni atomicidad. No se ejecutaron y no se atribuye aquí un resultado.
9. **Validación desigual.** Listado sin máximo efectivo de limit, coerciones laxas de cantidad/stock/precio y actualización de estado sin secuencia estricta. Validar mediante DTO, restricciones SQL y reglas de servicio antes de persistir.

## Aprovechamiento selectivo

| Idea | Acción |
|---|---|
| Timeline de seguimiento | Adaptada como estados confirmación/preparación/despacho/entrega declarados por cada vendedor; sin copiar controladores ni constantes con afirmaciones reales |
| Vista de pedidos vendidos | Añadida en Nest con filtrado de detalles propios, subtotal y destino necesario; sin datos de otros vendedores o transacciones |
| Orden de catálogo, filtro de vendedor, búsqueda sin tildes | Mejoras opcionales futuras; no bloquean el flujo evaluable. Diseñar DTO y consultas SQL antes de ofrecerlas |
| Restaurar publicación | Opcional futuro con permiso de propietario y consulta privada de publicaciones archivadas; no copiar endpoint abierto |
| Conteos e indicadores de perfil | Opcional futuro mediante agregaciones SQL y control de acceso; no copiar campos personales del seed |
| Cambio de rol de interfaz | Puede ser una preferencia visual de React; no usarlo como autorización ni modificar identidad en servidor |
| Conversión USD | Mantener fuera del checkout CLP. Si se adapta después, identificar fecha/fuente real y diferenciar falta de dato de tasa vigente |
| Interacciones e historial | Encargar exclusivamente a ActivityModule; definir permiso propio, proyección sin datos sensibles y conexión real |

## Plan operativo sin sobrescribir trabajo

1. Consumir PR #4 como fuente canónica de backend y [api-contract.md](api-contract.md).
2. El agente React adapta su cliente siguiendo [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md), en su propio ámbito. No trasladar headers `x-user-id`, precios del checkout ni IDs prefijados.
3. El agente Mongo entrega `backend/src/activity/` para Nest; integra los eventos documentados sin bloquear transacciones SQL. Ver [ACTIVITY_INTEGRATION.md](ACTIVITY_INTEGRATION.md).
4. El responsable de integración resuelve explícitamente `backend/` eligiendo Nest, preservando la rama alternativa y sus commits. No hacer merge/cherry-pick completo del servidor Express. Revisar por separado cambios de frontend e infraestructura.
5. Ejecutar migraciones en el entorno elegido y validar React→Nest→PostgreSQL y ActivityModule→Mongo reales. Las pruebas aisladas de Nest no acreditan esa integración.

Uso de IA: revisión estática y documentación asistidas por Codex; hallazgos contrastados con `git show` del SHA citado. No se copiaron servidores, esquemas, credenciales ni datos personales.
