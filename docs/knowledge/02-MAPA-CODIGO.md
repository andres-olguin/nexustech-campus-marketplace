---
tags: [arquitectura, archivos, navegacion]
---
# Mapa de archivos: recorrer todo NexusTech

No basta un guion de arquitectura. El objetivo es que el estudiante **pueda abrir cualquier archivo relevante del proyecto, identificar su función y explicar cómo se conecta a otro**. Revisar el árbol del SHA exacto antes de cada clase. La lista puede cambiar.

## Conceptos mínimos
- *Código fuente:* instrucciones escritas para que un programa las ejecute o convierta en acciones.
- *Archivo:* conjunto de texto que almacena código/configuración; *carpeta:* agrupa archivos; *ruta:* ubicación.
- *Frontend:* interfaz que el navegador ejecuta; *backend:* programa que responde solicitudes; *base de datos:* mantiene información; *API:* reglas del intercambio.
- *JavaScript:* lenguaje del frontend; *JSX:* sintaxis que combina expresiones JavaScript y estructura visual; *TypeScript:* JavaScript con comprobaciones de tipos.
- *Proceso:* programa en ejecución; *puerto:* número de conexión de un servicio; *HTTP:* protocolo de solicitudes (GET, POST, PUT, PATCH, DELETE); *JSON:* representación de datos.
- *Prueba:* código que comprueba expectativas, distinto de compilación/build.

## Entrada y frontend React
| Archivo o área | Qué estudiar | Posible pregunta del profesor |
| --- | --- | --- |
| nexustech-react/package.json, vite.config.* | scripts y dependencias | ¿Qué ocurre al ejecutar npm run dev? |
| nexustech-react/index.html, src/main.jsx | punto de entrada | ¿Cómo llega React a la pantalla? |
| src/App.jsx, hooks/useHashRoute.js | navegación, diálogos | ¿Qué ocurre al abrir el detalle? |
| pages/CatalogPage.jsx | búsqueda, filtros, paginación | ¿Qué diferencia hay entre demo y SQL? |
| components/catalog/ProductCard.jsx | tarjetas/acciones | ¿Qué props recibe y qué callbacks invoca? |
| components/shop/{ProductDetail,PublishForm,CartPanel,CheckoutForm}.jsx | producto, formulario, compra | ¿Quién valida y quién guarda? |
| hooks/useShop.js | estado y acciones HTTP | ¿Cómo se actualiza la interfaz tras una operación? |
| services/nestApi.js | cliente JSON, Bearer y validación | ¿Qué pasa con 401, 400 y 503? |
| services/publicApi.js | dólar de mindicador.cl | ¿Cómo se maneja una API externa caída? |
| components/reviews/ | formulario, tarjetas y estadísticas | ¿Qué es real y qué es demostración? |
| data/demoCatalog.js, catalogPart1/2/3.js | 240 publicaciones ficticias | ¿Por qué no demuestra 240 registros SQL? |
| pages/InteractionsPage.jsx | mensajes e historial Mongo | ¿Qué datos y controles de acceso se usan? |
| styles/, assets/images/, SOURCES.md | diseño, licencias, responsive | ¿Por qué usamos imagen/estilo específico? |
| test/, test/browser/ | tests | ¿Qué ejecuta una prueba unitaria vs E2E? |

## Backend NestJS
| Archivo o área | Qué estudiar | Pregunta |
| --- | --- | --- |
| backend/package.json; src/main.ts | comandos e inicio | ¿Cómo arranca Nest? |
| src/bootstrap.ts, app.module.ts | CORS, Swagger, módulos | ¿Dónde se configuran validación y endpoints? |
| src/auth/ | JWT, credenciales y guardias | ¿Cómo se comprueba identidad? |
| src/common/dto.ts | campos, límites y validación | ¿Por qué limitar el precio y longitud? |
| src/catalog/{catalog.controller,catalog.service}.ts | productos y categorías | ¿Controlador o servicio: quién hace qué? |
| src/users/, src/cart/ | perfiles, carrito, favoritos | ¿Dónde se consulta SQL? |
| src/orders/orders.service.ts | checkout y estados | ¿Por qué transacción, locks e idempotencyKey? |
| src/database/entities.ts, data-source.ts | entidades, repositorios | ¿Cómo se modelan las relaciones? |
| src/database/migrations/ | cambios SQL versionados | ¿Por qué no alterar una migración aplicada? |
| src/activity/ (rama técnica) | interacciones Mongo, guardias | ¿Cómo se restringe el acceso? |
| src/common/activity-events.ts | outbox SQL | ¿Qué ocurre si Mongo está apagado? |
| test/ | pruebas HTTP y datos temporales | ¿Cómo verificamos una operación real? |

## Configuración, operación y colaboración
\`compose.yaml\`, \`.env.example\`, \`backend/Dockerfile\`, \`nexustech-react/Dockerfile\`, \`.github/workflows/hito3-compose.yml\`, \`README.md\`, \`DOCKER.md\`, \`docs/hito3/\`, \`.gitignore\`, \`package-lock.json\`.

**Legado histórico:** archivos \`index.html\`, \`App.jsx\`, \`data.js\`, \`useLogica.js\`, \`js/\`, \`css/\` y páginas HTML antiguas en raíz **no son necesariamente el frontend canónico**. Debes saber explicar su historia y por qué no se usan para la demo principal, sin borrarlos impulsivamente.

## Orden para abrir y entender una compra
1. \`nexustech-react/src/components/catalog/ProductCard.jsx\`: clic en agregar.
2. \`src/pages/CatalogPage.jsx\`: callback; \`src/hooks/useShop.js\`: estado y acción.
3. \`src/services/nestApi.js\`: request HTTP y token.
4. \`backend/src/orders/orders.controller.ts\` o controlador de carrito: ruta/DTO/identidad.
5. \`backend/src/orders/orders.service.ts\`: transacción, stock, order items, outbox.
6. \`backend/src/database/entities.ts\` y migraciones: relaciones/restricciones.
7. \`backend/src/activity/activity.service.ts\`: entrega de evento a Mongo en la rama técnica.
8. Respuesta JSON hacia React; actualización de estado y navegación a pedidos.

**Ejercicio sin cambios:** desde la raíz del repo \`git ls-files\` enumera todos los archivos rastreados. Clasifica uno por uno como frontend, backend, infraestructura, documentación, prueba, recurso o legado. Nunca afirmar que se cubrió 100 % de archivos si faltan.
