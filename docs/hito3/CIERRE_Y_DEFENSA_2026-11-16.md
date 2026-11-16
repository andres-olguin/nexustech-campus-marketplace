# NexusTech — cierre técnico y defensa del Hito 3 (16-11-2026)

Documento de revisión para **Desarrollo Web y Móvil (PTEC103), UNAB Viña del Mar**. Fuente de requisitos: `Enunciado_Hito_3_Desarrollo_Web_Movil.docx` y rúbrica Canvas (100 puntos). Este documento diferencia **código disponible**, **verificación automatizada** y **demostración pendiente en el equipo expositor**.

## Estado y evidencia verificable

- **Base auditada:** `main` en `ac7540f934891236742a8aaca9d56efa0e4d5a98`; integración [PR #11](https://github.com/andres-olguin/nexustech-campus-marketplace/pull/11). Si este documento se actualiza, registrar el nuevo SHA.
- **Integración CI real:** [GitHub Actions 43659791187](https://github.com/andres-olguin/nexustech-campus-marketplace/actions/runs/43659791187), conclusión `success`: construye y espera React, NestJS, PostgreSQL y MongoDB; comprueba migraciones, catálogo, privacidad Mongo, concurrencia, stock y persistencia, más build y tests del frontend.
- **React → NestJS:** `nexustech-react/src/services/nestApi.js`, `src/hooks/useShop.js`, `src/App.jsx`. Los productos operativos provienen de la API SQL; las fichas ilustrativas están separadas y no son comprables.
- **SQL:** `backend/src/database/entities.ts` y `src/database/migrations/`. Usuarios, perfiles, categorías, publicaciones, favoritos, carrito, pedidos, detalles, estados y transacciones simuladas.
- **NoSQL real:** `backend/src/activity/` y colecciones Mongo `interactions` / `activity_logs`. Los mensajes se validan y persisten; la tabla SQL `activity_outbox` permite reintentos de eventos tras errores temporales en Mongo.
- **Swagger:** `http://localhost:3001/docs`; API `/api/v1`; comprobación conjunta `http://localhost:3001/api/v1/health/ready`.
- **Compose:** `compose.yaml`, `DOCKER.md`, `scripts/hito3-env.cjs`, `scripts/hito3-demo.cjs`, `.github/workflows/hito3-compose.yml`.
- **API pública:** Mindicador `/api/dolar`, informativa. La compra se registra en pesos chilenos.

**Importante:** el CI exitoso no sustituye ensayar en el computador que compartirá pantalla. La publicación de un ZIP tampoco significa que el segundo intento de Canvas esté enviado.

## Qué falta antes de afirmar «100 % terminado»

1. **Revisar y enviar segundo intento Canvas antes del lunes 16/11 a las 14:00 (Chile)**. El primer intento de 09/11 a las 23:57 ya consta entregado. Subir un ZIP con el SHA final; comprobar confirmación en Canvas.
2. **Ejecutar una demostración propia**, preferentemente con Docker; si WSL falla, usar un entorno temporal separado para ensayar y conservar como respaldo el CI real. No afirmar que Docker local funciona si no se ha comprobado.
3. **Comprobar en pantalla:** inicio de sesión, creación de publicación, filtro técnico, carrito, pedido simulado, lectura posterior del pedido, interacción Mongo, error 409 y Swagger.
4. **Revisar verbalmente todos los archivos principales**. El profesor puede señalar cualquier función y consultar qué recibe, qué valida y dónde persiste.
5. **Verificar que README y documentación reflejan el SHA de entrega, las limitaciones y el uso de agentes**. No exponer secretos ni copias de `.env`, `.demo-local.json` o `node_modules`.

No hay en esta auditoría un bloqueo de integración comprobado por CI. Sí queda pendiente la aceptación **en el entorno real de presentación**, la entrega final en Canvas y la defensa individual.

## Demo recomendada (10 minutos, con tiempos orientativos)

| Minuto | Acción observable | Explicación |
|---|---|---|
| 00:00–01:00 | Problema, Taller 2 → Hito 3 | Marketplace universitario; de React con datos locales a API propia y persistencia real |
| 01:00–02:30 | Arquitectura y mapa del repositorio | `nexustech-react/` es interfaz; `backend/` es API; PostgreSQL datos transaccionales, Mongo mensajes/eventos |
| 02:30–04:15 | Vendedor: iniciar sesión y publicar | React envía HTTP; Nest valida JWT/DTO; TypeORM escribe en PostgreSQL |
| 04:15–06:15 | Comprador: filtrar, carrito y checkout simulado | Validación de stock, transacción SQL, relación pedido-detalles, estado persistido |
| 06:15–07:30 | Enviar pregunta sobre producto y leer actividad | Inserción real en Mongo, permisos de participantes, registro documental |
| 07:30–08:40 | Swagger y error de stock | Mostrar endpoint real, respuestas HTTP y rechazo 409 |
| 08:40–10:00 | Compose, CI, colaboración, IA y límites | Evidencias verificables, cómo se validó código generado; pagos y despachos simulados |

La distribución entre integrantes debe acordarse antes de presentar; todos deben saber responder por cualquier sección, no solo por su parte.

## Preguntas difíciles y respuesta comprobable

**¿Por qué las dos bases?** PostgreSQL es la fuente de verdad de usuarios, inventario y pedidos: garantiza relaciones y transacciones. MongoDB almacena mensajes e historial documental con estructura flexible. No se duplican pedidos como fuente operativa.

**¿Dónde se conecta React con el backend?** En `nexustech-react/src/services/nestApi.js` se construyen peticiones HTTP/JSON hacia `/api/v1`. El backend recibe solicitudes a través de controladores y ejecuta lógica en servicios.

**¿Qué pasa si Mongo deja de responder?** Las rutas de interacción deben fallar explícitamente; no simulan una escritura exitosa. Los eventos pendientes en la tabla `activity_outbox` se pueden reintentar. No afirmar que una compra depende de guardar inmediatamente un log en Mongo.

**¿Cómo se evita vender más unidades que el stock?** El checkout usa una transacción en PostgreSQL, verificación de existencias y bloqueos; la prueba de concurrencia del CI aporta evidencia.

**¿Por qué hay 240 fichas de muestra?** Son ilustrativas, separadas de las publicaciones reales que se pueden comprar. No se debe afirmar que esas 240 fichas están todas almacenadas en PostgreSQL.

**¿Para qué sirve Swagger?** Documenta y permite ejecutar la API REST. Mostrar un GET real y una operación autenticada o un error.

**¿Cómo se utilizó IA?** El enunciado permite análisis, diseño, generación de código, depuración, pruebas y documentación, pero exige declarar herramienta, propósito, prompt representativo, resultado, validación humana y aprendizaje. No atribuir código escrito por agentes a una persona; explicar decisiones, correcciones y evidencia.

## Trazabilidad del equipo (sin porcentajes arbitrarios)

- **Miguel Margas Cerpa:** [PR #1](https://github.com/andres-olguin/nexustech-campus-marketplace/pull/1), formularios y lógica React inicial (`App.jsx`, `data.js`, `useLogica.js`); parte de la evolución desde Taller 2.
- **Benjamín Aguilera:** [PR #2](https://github.com/andres-olguin/nexustech-campus-marketplace/pull/2), estructura/componentes React; [PR #6](https://github.com/andres-olguin/nexustech-campus-marketplace/pull/6), filtros y navegación; [PR #7](https://github.com/andres-olguin/nexustech-campus-marketplace/pull/7), Docker; [PR #11](https://github.com/andres-olguin/nexustech-campus-marketplace/pull/11), fusión de integración.
- **Enrique Chamys:** commits de API pública y JavaScript histórico, más [`fdb3042`](https://github.com/andres-olguin/nexustech-campus-marketplace/commit/fdb30428cf) y ajustes del módulo Mongo, actividad e interacciones. Su diseño fue después reforzado por otros commits.
- **Andrés Olguín y agentes bajo su coordinación:** roadmap, cierre, integración React–NestJS, backend SQL/JWT/pedidos, correcciones de Mongo, CI, mejoras visuales, documentación y coordinación. Diferenciar commits de usuario (`andres-olguin`, `TheMasterX77`) de autores técnicos `Codex Backend`, `Codex React Integration` y `codex`; no adjudicar porcentajes ni trabajo manual no verificado.

## Comandos de arranque y paquete

```powershell
git fetch origin --prune
git rev-parse origin/main
node scripts/hito3-env.cjs
docker compose -p nexustech-hito3-final up -d --build --wait --wait-timeout 240
node scripts/hito3-demo.cjs
```

Abrir `http://localhost:5173` y `http://localhost:3001/docs`. Las credenciales de demostración se generan localmente en `.demo-local.json`.

Para comprimir **exactamente** el commit que será evaluado (sin credenciales ni archivos ignorados):

```powershell
git fetch origin --prune
git archive --format=zip --output=NexusTech_Hito3_FINAL.zip origin/main
git rev-parse origin/main
```

**Antes de subir:** comprobar ZIP, SHA, README, demo y segundo intento. No utilizar `docker compose down -v`: eliminaría los datos persistentes de la demostración.
