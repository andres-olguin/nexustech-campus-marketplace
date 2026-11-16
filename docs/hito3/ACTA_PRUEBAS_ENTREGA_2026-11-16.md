# Acta de pruebas y entrega — Hito 3 NexusTech (16-11-2026)

**Referencia auditada:** `main` `7c8abbe95bcb82781e5f6192eac223b9e6fde341`. [README](../../README.md) · [Guía Docker](../../DOCKER.md) · [Uso de IA](USO_IA_TRAZABILIDAD_2026-11-16.md).

## I. Pruebas automáticas: evidencia objetiva

| Criterio observable | Resultado comprobado | Prueba |
| --- | --- | --- |
| Stack React + NestJS + PostgreSQL + MongoDB | **Aprobado en GitHub Actions**, con `docker compose up -d --build --wait` y 4 servicios | [CI 43802108387](https://github.com/andres-olguin/nexustech-campus-marketplace/actions/runs/43802108387) |
| Modelo, migraciones y persistencia SQL | **Aprobado en CI** | Mismo workflow: migraciones, catálogo, pedidos, stock, transacciones |
| MongoDB funcional | **Aprobado en CI** | Mismo workflow: interacciones, privacidad, actividad y persistencia tras reinicio |
| Errores, autorizaciones y validaciones | **Aprobado en CI** | Mismo workflow: HTTP 4xx, restricciones, pruebas de seguridad y concurrencia |
| React, componentes y filtros | **Aprobado en CI** | Mismo workflow: build + tests del frontend |
| Flujos reales en navegador | **Aprobado en CI** | Mismo workflow: Playwright contra la API y ambas bases |
| Git y colaboración | **Documentado y comprobable** | PR de Miguel #13/#17, Benjamín #2/#6/#7/#11, contribuciones de Enrique y ramas de integración |

La segunda ejecución de `main` también finalizó en `success`: [CI 43802107810](https://github.com/andres-olguin/nexustech-campus-marketplace/actions/runs/43802107810).

## II. Observación en el equipo expositor

**Comprobado según registros del equipo:** en Windows se iniciaron PostgreSQL embebido, MongoDB temporal, NestJS y Vite; el lanzador informó **84 publicaciones ficticias persistidas en PostgreSQL** y rutas HTTP activas. Esto no acredita por sí solo haber completado manualmente un pedido y una conversación desde la interfaz.

### Comprobación manual imprescindible (marcar únicamente al ejecutarla)

- [ ] Abro la URL `Web:` del lanzador **actual**, veo 84 publicaciones y realizo un filtro por nombre/categoría.
- [ ] Entro como vendedor (usuario y clave de la **misma sesión**), creo o edito una publicación y la consulto desde otra sesión.
- [ ] Entro como comprador en ventana privada, agrego un producto, confirmo un **pedido simulado** y lo recupero en «Pedidos» después de refrescar el navegador.
- [ ] Desde comprador abro un producto, envío una consulta; al entrar como vendedor puedo leerla. En «Actividad» verifico el historial de **MongoDB**.
- [ ] Abro Swagger en la URL de la terminal, ejecuto `GET /api/v1/health/ready` y obtengo una respuesta satisfactoria para PostgreSQL y MongoDB.
- [ ] Provoco una validación controlada, por ejemplo `GET /api/v1/products?limit=101`, y compruebo HTTP **400**, explicando por qué el backend la rechaza.
- [ ] Enseño el workflow exitoso de Compose/Playwright como evidencia del requisito Docker, **sin afirmar** que Docker Desktop se ejecutó en Windows.
- [ ] Ensayo la explicación de la arquitectura `React → NestJS → PostgreSQL/MongoDB` y verifico que todos identifican al menos un controlador, servicio y entidad/documento.

Anotar captura o resultado **sin credenciales ni tokens**. Las cuentas temporales se regeneran cada vez que se reinicia el lanzador.

## III. Entrega Canvas (no verificada hasta confirmación externa)

- [x] El usuario generó `NexusTech_Hito3_16NOV_7c8abbe95.zip` con `git archive` y reportó SHA-256 `6F4970E3ABBD62700D788D777A68B991F768E088E0090D05337186CC7FBE2A53`.
- [ ] Subir ese ZIP al **segundo intento** de Taller 3 / Hito 3, antes de las **14:00 del lunes 16 de noviembre de 2026 (Chile)**.
- [ ] Confirmar el estado «Entregado» o equivalente en Canvas, guardar captura y comprobar que el archivo corresponde al SHA pretendido.
- [ ] Mantener guardado el ZIP original y un respaldo de los comandos de arranque de la versión **que efectivamente se envió**.

**Si solo se agrega documentación a `main` después de generar el ZIP, el ZIP anterior sigue siendo el código probado.** No hace falta reemplazarlo para que el código funcione; enviar un nuevo ZIP queda sujeto al plazo, verificación y decisión del equipo.

## IV. Preguntas de defensa

- **¿Qué hace React?** Muestra la interfaz y envía HTTP/JSON al backend mediante `nexustech-react/src/services/nestApi.js`.
- **¿Qué hace NestJS?** Valida solicitudes/autorización, aplica reglas de negocio y coordina almacenamiento.
- **¿Qué persiste en PostgreSQL?** Usuarios, categorías, productos, stock, carrito, pedidos, detalles, relaciones y transacciones simuladas.
- **¿Qué persiste en MongoDB?** Mensajes y eventos de actividad: datos documentales que no duplican los pedidos SQL.
- **¿Por qué 84 y 240?** 84 publicaciones ficticias SQL cargadas para la demo local y comprables; 240 fichas de catálogo ilustrativo, no comprables.
- **¿Qué no está implementado como servicio real?** Pagos, despachos y reseñas verificadas. No eran obligatorios como servicios comerciales en el Hito 3.

## V. Cierre de riesgos

| Riesgo | Mitigación |
| --- | --- |
| WSL/Docker Desktop falla en laptop | Lanzador local sin Docker + evidencia Docker Compose en CI |
| Se reinicia el lanzador | Reutilizar las **nuevas** credenciales y URL; datos anteriores eran temporales |
| El profesor pide ver código | Mostrar `nexustech-react/src/services/nestApi.js`, `backend/src/orders/orders.service.ts`, `backend/src/activity/activity.service.ts` y `backend/src/database/entities.ts` |
| Tiempo corto | Cerrar Canvas primero, luego ensayo corto de compra, mensaje, Swagger, HTTP 400 y arquitectura |
