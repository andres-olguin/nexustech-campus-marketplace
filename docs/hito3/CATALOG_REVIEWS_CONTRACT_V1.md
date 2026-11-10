# Contrato tecnico propuesto: catalogo SQL y resenas v1

Estado: DISENO, NO ENDPOINTS IMPLEMENTADOS. No consumir rutas nuevas como disponibles hasta que exista migracion, Swagger y pruebas aprobadas. Rama tecnica: feat/hito3-codex-cli-mongo-qa. No modifica Canvas ni sustituye el catalogo PostgreSQL por datos locales.

## Condicion previa y fuentes inspeccionadas

La instruccion del usuario exige cerrar Hito 3 antes de ampliar funcionalidades. Mongo y SQL tienen evidencia previa; el arranque Docker local sigue bloqueado (motor ausente, servicio detenido, Start-Service denegado). La prueba de Compose en CI 42766707222 (commit 470097f) aprobo los cuatro servicios, migraciones, privacidad, concurrencia y persistencia tras reinicio. En la interfaz integrada pasaron cinco flujos funcionales; una correccion minima de distribucion del header paso la prueba responsive a 390 y 768 px. No se modifico el worktree visual. Estos requisitos tecnicos previos quedan verificados antes de iniciar Review y seed; no equivale a certificar el ZIP o una rubrica original no inspeccionada.

Se inspeccionaron Product/Order/OrderItem/OrderFulfillment, ProductDto/UpdateProductDto/CatalogQuery, las tres migraciones registradas, CatalogService, el cliente nestApi, CatalogPage y pruebas HTTP/navegador. Tambien se leyeron los commits de interfaz 1373f9c y 9c68127 de la rama de cierre mediante git show, sin modificar su worktree.

## Contrato vigente que debe seguir funcionando

Base /api/v1. GET /products y /publications responden items, total, page, limit; GET /products/:id devuelve el producto activo. POST /products, PATCH /products/:id y DELETE /products/:id mantienen JWT, propiedad y archivado logico. No cambiar rutas ni nombres existentes.

Product actual: id UUID; createdAt/updatedAt ISO UTC; name 3..160; description 10..2000; categoryId y sellerId UUID; price entero CLP 1000..2500000; stock entero 0..100000; imageUrl string o null; isActive booleano. El servidor deriva sellerId del JWT. ProductDto solo acepta imagen HTTPS de hasta 1000 caracteres; no hay campos condition, specs, gallery ni rating en SQL.

Filtros actuales: search (1..160), categoryId, minPrice/maxPrice (0..2500000), page (1..100000), limit (1..100). Orden actual createdAt DESC, id ASC. ILIKE no promete busqueda sin acentos. Los campos desconocidos se rechazan con 400: enviar hoy filtros/campos propuestos tambien produce 400.

La migracion inicial impone FK de categorias/vendedores, CHECK de precio/stock e indices de catalogo/vendedor. Los snapshots de order_items conservan nombre, precio y cantidad; no se reescriben cuando cambia la publicacion.

## Extension aditiva del producto

| Campo propuesto | Entrada y limites | Migracion/backfill |
|---|---|---|
| description | Se conserva como descripcion tecnica en texto plano; mismo limite actual | No duplicar en technicalDescription sin una necesidad concreta |
| condition | new, used o null; omitir conserva valor al editar | Columna nullable, CHECK; historicos null (no inventar que eran nuevos/usados) |
| specifications | Array de hasta 20 objetos name/value; name 1..60, value 1..160, sin nombres repetidos normalizados | JSONB NOT NULL DEFAULT []; DTO anidado y limite de tamano; no JSON arbitrario |
| images | Galeria ordenada de hasta 6 objetos url/alt; HTTPS, url <=1000, alt 1..160 | JSONB NOT NULL DEFAULT []; copiar imageUrl HTTPS existente como primera imagen |
| origin | user o demo, solo lectura | Columna con DEFAULT user; seed explicito usa demo |
| reviewSummary | Solo lectura; resumen de resenas del servidor | Calculo agregado SQL; no aceptar promedio/recuentos en escritura |

No borrar ni renombrar imageUrl. Al enviar images, su primer elemento define imageUrl; lista vacia equivale a imageUrl null. Si ambos se envian deben concordar o devolver 400. Un PATCH con solo imageUrl actualiza la imagen principal sin reemplazar el resto; null limpia la galeria explicitamente. Campos omitidos no borran datos. Registros anteriores con URL no HTTPS deben auditarse antes del backfill: no transformarlos silenciosamente en URLs inventadas.

description/specifications son texto plano: sin HTML ni Markdown ejecutable. No usar dangerouslySetInnerHTML. El servidor no descarga URLs para validar imagenes: evitar convertir validacion de URL en SSRF. Frontend muestra error/placeholder si una imagen no carga; el seed registra fuentes/licencias y enlaces reales apropiados.

Respuesta nueva conserva todos los campos anteriores y agrega condition, specifications, images, origin y reviewSummary. Clientes antiguos pueden ignorarlos. Formularios existentes siguen enviando ProductDto antiguo. Las nuevas escrituras se habilitan solo tras desplegar la migracion y DTO; no confundir datos de demoCatalog.js con esquema SQL.

## Filtros nuevos propuestos

| Parametro | Semantica |
|---|---|
| condition | new o used; omitido incluye historicos null |
| inStock | true/false estrictos; true exige stock > 0. No usar Type(Boolean), porque el texto false se convierte en true |
| sort | newest, priceAsc, priceDesc; lista cerrada mapeada a SQL y UUID como desempate |
| minRating | Entero 1..5 sobre el conjunto de resenas seleccionado; productos sin resenas no cumplen |

Los filtros antiguos y paginacion mantienen su comportamiento. Nunca ordenar por SQL arbitrario del cliente. Calcular minRating en consulta agregada/subconsulta evitando N+1; evaluar EXPLAIN con datos antes de agregar indices. La paginacion se aplica en SQL antes de enviar al navegador: no filtrar solo los 20 productos descargados de una pagina.

## Review propuesta: integridad y autoria

Tabla PostgreSQL reviews, UUID y createdAt/updatedAt. productId FK products; authorId FK users; rating SMALLINT CHECK 1..5; title 3..100 y comment 10..1000 tras trim; origin CHECK user/demo; orderItemId UUID nullable FK order_items. UNIQUE(productId,authorId) impide duplicados concurrentes. Indice productId/createdAt/id para paginacion; evaluar productId/rating si se usa ese filtro. Foreign keys restrictivas: el archivado de producto no destruye pedidos ni opiniones.

El autor se deriva exclusivamente del JWT. La API publica nunca acepta authorId, userId, origin, isDemo, verifiedPurchase, productId en el body ni promedios. productId viene del path. origin=user indica contenido publicado por una cuenta de usuario, no identidad personal certificada. Cuentas demo necesitan un marcador de servidor que tambien fuerce origin=demo al publicar; el registro normal no puede asignar ese marcador.

No se venden resenas como identidad/compras verificadas fuera del sistema academico. Contrase?as, emails, direcciones y datos de pago nunca se incluyen en ReviewResponse.

## Rutas y permisos previstos

| Metodo y ruta (base /api/v1) | Permiso | Resultado |
|---|---|---|
| GET /products/:id/reviews | Publico, solo producto activo | 200 ReviewPage; 404 producto inexistente/inactivo |
| POST /products/:id/reviews | JWT, autor distinto del vendedor | 201 ReviewResponse; 409 si ya existe resena del mismo autor |
| PATCH /products/:id/reviews/:reviewId | JWT, solo autor | 200 ReviewResponse; 403 ajeno; 404 si no pertenece al producto |
| DELETE /products/:id/reviews/:reviewId | JWT, solo autor | 200 {deleted:true}; borrado fisico y recalculo del resumen |

Vendedor no puede rese?ar su propio producto ni borrar opiniones de terceros. No inventar un rol administrador inexistente. POST/PATCH aceptan rating, title, comment y featuresEvaluated opcional (maximo 8 textos de 1..60, sin duplicados), mas orderItemId opcional para solicitar una relacion que el servidor debe comprobar. PATCH requiere al menos un cambio permitido y no permite mover producto/autor/origen. Tras borrar, una nueva rese?a del autor es admisible pero sujeta al limite de frecuencia; la restriccion evita duplicados simultaneos, no promete moderacion infalible.

Texto plano, rechazo de NUL/control y delimitadores HTML, limites de longitud y cuerpo en backend; React escapa el texto. Limite propuesto POST 5/minuto y PATCH 10/minuto por cliente mediante Throttler, aparte del limite global; 429 con Retry-After. La cuota por IP no equivale a proteccion antispam completa ni compartida entre replicas. Evaluar cuota por autor persistente solo si el abuso/uso real lo requiere.

Errores: 400 DTO/query/HTML; 401 token ausente/invalido; 403 propiedad/autorrese?a; 404 recurso/pedido no accesible; 409 duplicado concurrente; 429 limite; 503 base no disponible. No responder [] ni promedio cero ante fallos de PostgreSQL.

## Relacion con compras: decision exclusiva del servidor

orderItemId no es una declaracion de compra verificada. En la misma transaccion se comprueba: orders.userId = JWT.sub; order_items.productId = producto; la orden no esta cancelada; simulated_transactions.status = approved; el fulfillment del vendedor de ese item esta delivered. No basta con que otro vendedor del pedido haya entregado su segmento. El servidor bloquea/consulta las filas pertinentes antes de asociar la rese?a.

verifiedPurchase es SOLO derivado de esas relaciones vigentes, nunca un booleano editable ni una marca hardcodeada. Una referencia ajena/inexistente devuelve el mismo 404. Si no se envia orderItemId, el servidor puede enlazar una compra elegible del mismo autor/producto de manera determinista; sin evidencia deja null y verifiedPurchase=false. Una rese?a demo siempre devuelve verifiedPurchase=false, aunque haya pedidos demo de prueba.

Los pedidos de esta aplicacion son registrados realmente en PostgreSQL pero el pago y la entrega se simulan/declaran. El badge debe explicarlo (por ejemplo, Pedido registrado), sin presentarlo como comprobacion de pago bancario o entrega fisica independiente.

## Respuesta y compatibilidad con la interfaz 9c68127

ReviewResponse:

    {
      id: UUID, productId: UUID, authorId: UUID,
      userId: UUID, // alias igual a authorId para el cliente existente
      userName: null, // alias publico opcional; nunca correo o perfil completo
      rating: 1..5, title: string, comment: string,
      featuresEvaluated: string[], createdAt: ISO, updatedAt: ISO,
      origin: user|demo, isDemo: boolean,
      verifiedPurchase: boolean
    }

No devolver orderItemId ni datos de pedido en la consulta publica. La implementacion puede devolver al autor su referencia en una vista privada separada si la UX lo necesita. No agregar esa ruta sin necesidad.

ReviewPage:

    {
      items: ReviewResponse[], total: integer, page: integer, limit: integer,
      averageRating: number|null,
      distribution: {1:integer,2:integer,3:integer,4:integer,5:integer},
      demoCount: integer, userCount: integer, origin: all|demo|user
    }

Promedio null cuando no hay resenas (no inventar puntuacion cero). distribution suma total para el conjunto completo que cumple los filtros, no solo items de la pagina. Promedio/recuento/distribucion/pagina salen del mismo snapshot SQL (transaccion de lectura REPEATABLE READ o una sola consulta). No almacenar promedios editables ni recalcularlos solo con la pagina descargada.

Query: page=1, limit=5 (1..100), rating opcional 1..5, origin=all|user|demo (default all), verifiedPurchase=true|false opcional, sort=newest|highest|lowest (default newest). El resumen refleja exactamente ese conjunto; demoCount/userCount explicitan si el promedio contiene contenido ficticio. El cliente muestra la etiqueta DEMO cuando isDemo=true y debe indicar cuando las estadisticas incluyen demo.

El cliente de 9c68127 ya llama GET/POST /products/:id/reviews y envia featuresEvaluated. No existen esos controladores en el backend revisado: 404 es esperado, no prueba de persistencia. Su schema exige userId; preservar ese alias mientras se adopta authorId. ReviewsSection usa averageRating/distribution y calcula con items solo si faltan: la API real debe entregarlos siempre para evitar estadisticas de una pagina. ReviewCard ya muestra isDemo; el schema debe validar origin/isDemo/verifiedPurchase en la futura integracion. Edicion/borrado y manejo de 409/429 todavia deben conectarse visualmente.

## Seed DEMO previsto, no implementado ni automatico

- Fixture versionada de 48 productos concretos y categorias coherentes. No usar createProducts ni combinatorias de 2400 items como catalogo SQL.
- Entre 2 y 5 resenas especificas por producto aplicable, todas origin=demo/isDemo=true/verifiedPurchase=false. Si un producto no admite opiniones, documentar la excepcion; no afirmar cobertura que el fixture no tenga.
- Cuentas sinteticas con dominio example.test y alias explicitos; ninguna identidad de compa?eros. Password requerida via entorno DEMO_PASSWORD y hash scrypt canonico, nunca password real/predeterminada en Git.
- Guardas APP_ENV=demo y ALLOW_DEMO_SEED=true; rechazo expreso si NODE_ENV=production. Comando manual, separado de migraciones, Docker CMD y arranque NestJS.
- Claves estables demoKey de fixture, unicas y restringidas al seed. Una transaccion SQL por ejecucion; ON CONFLICT para omitir entradas propias existentes; no resetear inventario/precio editado ni tocar publicaciones/pedidos de usuarios.
- Repetir dos veces conserva UUID y conteos, sin duplicar resenas/eventos. Crear outbox solo para inserciones/cambios realmente efectuados. Nunca limpiar el catalogo para resembrar.
- Validar fixture con los DTO/reglas reales, CHECK y FK. Registrar fuentes y licencia de imagenes; comprobar enlaces sin inventar que siempre estaran disponibles.
- El frontend usa /products y /reviews reales. El catalogo local de demostracion es una vista ilustrativa explicita, no respaldo automatico de una API fallida ni una prueba de persistencia.

## Migraciones propuestas y pruebas de aceptacion

No se alteran las migraciones ya versionadas. Siguientes migraciones separadas: ProductDetails (campos aditivos/backfill auditado); Reviews (tabla/FK/CHECK/UNIQUE); DemoProvenance (marcadores de cuenta/fixture si no se incorporan antes). Registrar clases en data-source y probar up/down/up sin borrar tablas previas. No asignar timestamps finales ni afirmar migraciones nuevas hasta implementarlas.

Pruebas necesarias: contrato antiguo de producto intacto; campos desconocidos rechazados; rating limites/tipo/null/HTML/control; FK reales; un autor por producto incluso con POST concurrentes; propietario frente a tercero; vendedor no autorrese?a; publicacion archivada; paginacion/orden/filtros; media y distribucion globales tras crear/editar/borrar; ninguna estadistica demo oculta; compra propia/ajena/cancelada/sin pago/segmento equivocado; verifiedPurchase forjado rechazado; seed dos veces y guardas de produccion; UI badge demo, errores y persistencia tras recarga/reautenticacion. Ejecutar contra PostgreSQL real, no arrays.

Este contrato permite coordinar componentes, pero NO declara implementadas las etapas 2 y 3. La prohibicion de ampliar antes de cerrar Hito 3 controla su inicio.
