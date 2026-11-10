# Evidencias de validacion Mongo QA

Fecha: 10 de noviembre de 2026. Implementacion: baaaa71. Merge de Enrique: c91df2e (segundo padre 4132f6d). Base de integracion: 6af5099.
Rama de trabajo: feat/hito3-codex-cli-mongo-qa. Destino de PR: feat/hito3-cierre-integrado. No se autoriza fusion automatica.

## Resultados finales ejecutados

| Comando | Resultado observado |
|---|---|
| npm run test:real-mongo --prefix backend | PASS: 20 pruebas, 0 fallos, 0 omitidas; duracion 335346.6319 ms |
| npm test --prefix nexustech-react | PASS: 13 pruebas, 0 fallos, 0 omitidas |
| npm run test:e2e --prefix nexustech-react | Base inicial: 6/6. Tras integrar 06d946f: 3 aprobadas y 3 fallidas; ver repeticion focalizada y fallo responsive abajo |
| npm run build --prefix backend | PASS: TypeScript estricto, tambien ejecutado por las suites de integracion |
| npm run build --prefix nexustech-react | PASS: Vite, 82 modulos transformados tras integrar la base visual |
| docker compose --env-file .env.example config --quiet | PASS: configuracion/interpolacion |
| git diff --check | PASS: sin errores de whitespace |
| docker compose --env-file .env.example up -d --build | NO EJECUTADO CON EXITO: motor Docker Desktop Linux inaccesible |

Node local: v24.12.0. PostgreSQL real local: 18.6, compilado para Windows. Mongo real: binario 8.2.6, WiredTiger, iniciado por mongodb-memory-server. Compose conserva PostgreSQL 16 y MongoDB 7: estas versiones de contenedor no fueron verificadas en ejecucion en esta sesion.

El contador de backend corresponde al reporte de node:test e incluye la prueba contenedora. No se suman pruebas omitidas ni resultados de intentos fallidos como aprobados.

## Evidencia por frontera

| Frontera | Evidencia |
|---|---|
| Navegador -> API | Formulario React envia POST con recurso, destinatario y mensaje; respuesta real 201 y _id hexadecimal Mongo |
| API -> SQL | JWT y participantes validados contra PostgreSQL; pruebas de propiedad y acceso anonimo |
| API -> Mongo | insertOne real; consulta independiente de interactions encuentra el mensaje |
| Mongo -> API | Nueva instancia de ActivityService consulta el mensaje almacenado |
| API -> React | Mensaje aparece tras enviar y tras recargar/reautenticar; no se persiste JWT en localStorage |
| SQL -> Mongo | Outbox drenada; se comprueban los cinco nombres de evento en documentos reales |
| Caida/recuperacion | Cierre de conexion Mongo produce 503 en escritura y lecturas; nueva publicacion conserva fila SQL y luego se entrega a Mongo |
| Reentrega | Documento con el mismo eventId previo al borrado SQL no se duplica al reintentar |
| Privacidad | Un tercero obtiene solo su conversacion vacia y no logs de otros actores; destinatario ajeno al recurso recibe 403 |
| Concurrencia | Checkout idempotente, ultima unidad entre compradores, cancelacion vs preparacion y stock consistente |
| Reinicios | PostgreSQL se reinicia y dos procesos NestJS nuevos recuperan el pedido entregado, sus segmentos y stock |

## Fallos intermedios y correcciones

1. Compilacion inicial encontro errores en la nueva migracion; se corrigieron antes del resultado final.
2. Primer arranque mongod supero el timeout de 10 segundos: se fijo margen de 120 segundos para el proceso real.
3. Primer suite backend supero el limite total de 180 segundos en esta maquina; el limite paso a 600 segundos con diagnostico de arranque.
4. Puerto fijo de API/Vite/PostgreSQL coincidia con otra demostracion simultanea. Se eligieron puertos libres y se propagaron URLs al navegador; no se detuvo la demostracion ajena.
5. El cierre de embedded-postgres podia esperar una salida ya ocurrida. Se usa pg_ctl del binario propio con el directorio temporal propio y tiempo limite.
6. El primer E2E Mongo descubrio que shop.act devolvia una funcion sin ejecutarse; se corrigio llamando shop.refresh tras escritura confirmada.
7. Tras reload el test suponia sesion persistente. Se adapto a la politica existente: reautenticar y comprobar que el mensaje continua en la base.
8. Se agregaron esquemas al cliente porque los metodos Mongo previos eran incompatibles con el validador comun de respuestas.

Los procesos antiguos bloqueados se identificaron por comando/PID y solo se detuvieron arboles propios de pruebas. Los ejecutores finales cierran sus servicios propios. La nueva limpieza comprueba que el directorio a eliminar sea el mkdtemp de la suite.

## Docker: limite comprobado

Docker CLI 29.8.1 esta instalado. Docker Desktop fue iniciado en segundo plano; el motor devolvio error y despues su named pipe no existia. Se comprobo que com.docker.service estaba detenido. Start-Service fallo porque Windows no permitio abrir/iniciar el servicio, incluso ejecutando fuera del sandbox. WSL se pudo consultar fuera del sandbox, pero eso no demostro que Docker estuviera operativo.

No se construyeron/verificaron las cuatro imagenes en ejecucion, ni se comprobaron reinicios/volumenes de Compose en esta sesion. Para cerrar el criterio se necesita Docker Desktop operativo y repetir up --build, ps, healthchecks, migraciones, flujo de compra/mensajes y persistencia tras reinicio. No se borro ningun volumen de datos.

## Archivos principales y revision

- backend/src/activity/: DTO, controller, servicio Mongo e interfaces reales.
- backend/src/common/activity-events.ts: enqueue transaccional; common/openapi.ts: contrato de respuestas.
- backend/src/catalog/catalog.service.ts y orders/orders.service.ts: evento dentro del commit SQL.
- backend/src/database/: entidad ActivityOutbox, migracion y registro en data-source.
- backend/src/health.controller.ts: readiness SQL+Mongo sin alterar health SQL existente.
- backend/package.json y package-lock.json: driver real y ejecutor de pruebas.
- backend/test/: errores offline, HTTP SQL/Mongo, privacidad, reentrega, reinicios y lanzador mongod.
- compose.yaml, .env.example y backend/Dockerfile: healthchecks, Mongo autenticado y build sin descarga del binario de prueba.
- nexustech-react/src/services/nestApi.js y pages/InteractionsPage.jsx: contrato Mongo, credenciales, destinatario y refresco.
- nexustech-react/test/, scripts/run-integration.cjs y playwright.config.js: pruebas y puertos aislados.
- Eliminados: backend/src/ambient.d.ts, docker-compose.yml duplicado, init-mongo.js y nginx.conf sin uso.
- README.md, DOCKER.md y docs/hito3/: estado actual, historial, rubrica, IA y preguntas de defensa.

## Pendientes externos y coordinacion

No certificar 20/20 sin el enunciado oficial, ni atribuir cambios a un ZIP no inspeccionado. Se necesita el ZIP exacto entregado y su SHA-256 para una comparacion verificable. El registro Canvas a las 23:57 proviene del usuario.

Coordinar con Antigravity la integracion del formulario de destinatario, errores, schemas del cliente y shop.refresh. Su identidad visual, CSS, responsive, carpeta y rama no se modificaron. App.jsx entra por la historia del merge de Enrique. Ver la matriz provisional, arquitectura, limites de produccion y defensa en MONGO_QA_2026-11-10.md.

## Integracion de la base visual

Mientras se publicaba la PR #8, la base habia avanzado de 6af5099 a 06d946f. Se integra esa historia en la rama QA. El unico conflicto era InteractionsPage.jsx: se conserva el encabezado, la estructura y las tarjetas nuevas y se agregan los controles y datos Mongo. La comparacion de assets, CSS y componentes con 06d946f es vacia. Los endpoints y el backend no cambiaron por esa integracion.

### Resultado sobre la interfaz integrada 06d946f

La compilacion React paso con 82 modulos. La suite completa produjo 3 aprobadas (reintento de compra, API incompatible y mensaje Mongo tras nueva sesion) y 3 fallidas. Se corrigieron dos problemas del test: esperar el PATCH real del vendedor antes de refrescar el navegador comprador y usar el nombre accesible actual del enlace de acceso.

Comando focalizado ejecutado: npm run test:e2e --prefix nexustech-react -- --grep "Real browser registration|A 401 clears|Mobile navigation". Resultado: 2 aprobadas (flujo comercial completo y limpieza de sesion 401), 1 fallida (responsive), 2.1 minutos. Por tanto, hay evidencia positiva de los cinco flujos funcionales entre ambas ejecuciones, pero NO una suite final completamente aprobada. No se omitio ni relajo la comprobacion responsive.

Fallo confirmado para Antigravity: viewport 390 px, document.documentElement.scrollWidth = 595 px. Elementos fuera de pantalla: nt-ribbon-left (401 px), nt-ribbon-text (377 px), nt-nav-actions (397 px), carrito, acceso y boton de menu. La captura muestra controles superiores recortados. El caso se detiene a 390 px, por lo que no se certifica 768 px en esta repeticion. No se modifica su CSS: revisar la franja institucional y acciones de navbar, luego repetir la suite completa.
