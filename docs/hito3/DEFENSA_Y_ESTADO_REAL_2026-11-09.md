# NexusTech — Estado real, preparación de defensa y control ZIP
Fecha: 9 de noviembre de 2026. Basado en el enunciado oficial del Hito 3 (PTEC103) y PR #4, #5 y #7.

## Exposición de 40 segundos
NexusTech continúa el marketplace universitario del Taller 2. La evolución del Hito 3 consiste en un frontend React que consume una API REST propia desarrollada con NestJS. El backend valida entradas, controla propiedad/autorización JWT, implementa reglas de negocio y persiste en PostgreSQL mediante TypeORM. Se pueden registrar perfiles, publicar productos, utilizar filtros, favoritos y carrito, crear pedidos con control de stock y consultar su seguimiento. Las transacciones de pago y estados de entrega son simulados. MongoDB es obligatorio para historial de interacciones: su módulo real aún no se integra a este código. Docker está propuesto en otra PR y requiere integración final.

## Qué existe realmente en esta rama
- Frontend: nexustech-react, React 19, Vite 7, páginas y componentes, services/nestApi.js.
- Backend: backend, NestJS 11, TypeScript, TypeORM y PostgreSQL; API base /api/v1 y Swagger /docs en puerto 3000.
- Persistencia: migraciones SQL, usuarios/perfiles, categorías/productos, carrito/favoritos, pedidos/detalles, transacciones simuladas y seguimiento por vendedor.
- Seguridad: JWT Bearer, validación de propiedad y datos, hashing scrypt de contraseñas.
- Compra: JSON con shippingAddress e idempotencyKey, descuento de stock y creación de pedido en transacción SQL.
- Seguimiento: confirmed -> preparing -> shipped -> delivered por vendedor participante; cancelación antes de preparación.
- API pública: consulta de dólar en src/services/publicApi.js; verificar visualmente antes de demostrar.
- MongoDB: NO integrado en el backend canónico de esta rama; vista de historial informa que está pendiente.
- Docker: PR #7 feature/hito3-docker con compose.yaml, pero aún no forma parte de esta rama ni está validado tras integración.
- Pruebas: los agentes informaron 17 backend (PostgreSQL real), 12 cliente HTTP y 5 navegador Playwright; no se ejecutaron de nuevo al escribir este documento.

## Rúbrica oficial y estado provisional
### Diagnóstico y diseño
1. Continuidad con Taller 2: evidenciada en el mismo marketplace.
2. Ampliación del dominio: implementada con usuarios, favoritos, pedidos.
3. Modelado y arquitectura: SQL y diagramas documentados; integración NoSQL pendiente.
4. Diseño de API: contrato HTTP documentado.
### Backend y persistencia
5. Estructura del backend: NestJS modular.
6. API REST y reglas de negocio: implementadas, agentes reportan tests.
7. Persistencia SQL: implementada, pruebas reportadas contra PostgreSQL.
8. Persistencia NoSQL: PENDIENTE, obligatoria.
9. Swagger y errores: implementado, comprobar en demo.
### Frontend e integración
10. Integración React–API: implementada, agentes reportan E2E.
11. Funcionalidad y flujos: núcleo SQL implementado; NoSQL no.
12. Experiencia y estados: código y tests reportados, requiere revisión visual final.
13. Separación de responsabilidades: componentes, páginas, hooks y servicios.
### Integración, pruebas y entrega
14. Flujo end-to-end: Playwright reportado, falta demostración Mongo.
15. Pruebas y validaciones: 34 pruebas reportadas (17 + 12 + 5).
16. Docker y reproducibilidad: PR #7 disponible, aún no integrada ni verificada en rama final.
17. Git y colaboración: PR #4, #5, #6, #7; validar commits individuales.
18. README y documentación: presentes, con correcciones en progreso.
19. Uso de IA: declarado; agregar prompts, resultados y validación humana del equipo.
20. Demostración y defensa: pendiente.

El cumplimiento pleno exige la funcionalidad NoSQL real, no solo un servicio Mongo iniciado.

## Preguntas de defensa y respuestas cortas
**¿Qué resolvemos?** Compra/venta y publicación de productos para estudiantes en una interfaz común.
**¿Qué cambió desde Taller 2?** De estado y datos locales a React que se comunica con backend y SQL.
**¿Qué hace React?** Componentes, formularios, estados de carga/error/vacío, navegación y HTTP.
**¿Qué hace NestJS?** Rutas, validaciones, autenticación, lógica de negocio y persistencia.
**¿Qué es REST?** Recursos HTTP: GET consulta, POST crea, PATCH modifica y DELETE archiva.
**¿Qué es Swagger?** Documentación OpenAPI interactiva y contratos de endpoints.
**¿Por qué PostgreSQL?** Relaciones, restricciones, integridad y transacciones para productos y pedidos.
**¿Qué es ACID?** Propiedades que ayudan a que varias operaciones se confirmen juntas o se reviertan.
**¿Cómo evitan compras de más?** Bloqueos y verificación de stock dentro de una transacción SQL.
**¿Qué es idempotencia?** El mismo intento de checkout, con igual clave, no crea dos pedidos.
**¿Qué es JWT?** Token firmado y con expiración, validado por la API para identificar usuarios.
**¿Qué es autorización?** Verificar que el usuario autenticado tiene derecho a modificar un recurso.
**¿Por qué se valida en backend?** El frontend se puede manipular; la regla real debe imponerse en servidor.
**¿Qué significa 401/403/404/409?** Sin autenticación / sin permiso / no encontrado / conflicto.
**¿Qué hace TypeORM?** Mapeo de entidades, SQL, consultas, migraciones y transacciones.
**¿Qué son migraciones?** Cambios controlados y reproducibles del esquema de la base SQL.
**¿Para qué MongoDB?** Historial documental de interacciones (campos flexibles); obligatorio, pendiente en esta rama.
**¿Qué hace Docker Compose?** Levanta y conecta servicios con configuración reproducible.
**¿Pagos y entregas son reales?** No: son simulaciones académicas; pedido y estados sí se almacenan en SQL.
**¿Qué pasa cuando falla la API?** Debe mostrar error sin inventar una compra ni datos de catálogo.
**¿Qué prueban los tests?** Backend SQL/HTTP, cliente HTTP y flujo browser real, según informes de agentes.
**¿Qué trabajo hizo IA?** Asistió programación y pruebas; cada integrante debe describir sus cambios y lo que validó personalmente.
**¿Qué limitaciones persisten?** MongoDB y Docker final; no ocultarlas en defensa ni atribuir funciones inexistentes.

## Revisión de la entrega como ZIP
1. Confirmar el branch final de integración y su SHA; no bajar main sin PR #4 y #5.
2. Inspeccionar el ZIP: backend/, nexustech-react/, docs/, package.json, lockfiles, .env.example.
3. No incluir node_modules, contraseñas, archivos .env privados o datos personales reales.
4. Verificar la README y los comandos. Backend: npm ci, configurar .env, npm run migration:run, npm run build, npm start. Frontend: npm ci, npm run dev.
5. Incluir infraestructura Docker solo después de validar conflicto y funcionamiento.
6. En Canvas cargar ZIP, completar envío y conservar comprobante antes de las 23:59.
7. Guardar enlaces GitHub y PR y quién hizo los commits reales.
