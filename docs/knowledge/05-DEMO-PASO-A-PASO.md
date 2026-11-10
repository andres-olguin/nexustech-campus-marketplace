---
tags: [demo, frontend, backend, sql, nosql]
---
# Plan de demostración controlada y libre

## Antes del aula
1. **Definir versión exacta**: \`git status\`, \`git rev-parse HEAD\`; marcar branch/SHA en notas. No asumir que ramas se integraron.
2. Verificar React, API, Postgres, Mongo, Swagger, respuesta de healthchecks y acceso al catálogo **SQL**. Tomar capturas de evidencia y casos ya ensayados.
3. Preparar cuentas **sintéticas** comprador/vendedor; registrar IDs de prueba y un producto con stock verificable; no exponer contraseñas/JWT al proyectar.
4. Preparar secuencia y contingencia si falla una red/puerto/Docker. No modificar la entrega histórica.
5. Si Docker local falla, mostrar evidencia CI Linux (ejecución \`42766707222\`) claramente identificada como de otro entorno, no como live local.
6. No llamar «compra real»: pagos y despachos son simulados.

## Recorrido principal
- Contexto: NexusTech para UNAB **Viña del Mar**, no sistema oficial.
- **Frontend:** dónde están login, catálogo, categoría/filtros, ficha, publicación, favoritos y carrito. Mostrar dónde React llama a \`nestApi.js\`.
- **Backend:** abrir \`CatalogController\`, \`CatalogService\`, DTO y una entidad; enseñar trayecto GET /products → SQL → JSON → pantalla.
- **Usuario vendedor:** crear categoría/publicación; observar UUID y respuesta.
- **Usuario comprador:** iniciar sesión, filtrar y añadir al carrito; confirmar pedido simulado.
- **Regla:** abrir \`orders.service.ts\`; explicar transacción/bloqueo, stock, idempotencyKey; comparar stock antes/después. Reintento no debe descontar dos veces.
- **PostgreSQL:** consultar pedido por API con otra sesión; explicar cómo saber que es persistente. Si se usa SQL directamente, hacerlo en DB demo y sin mostrar secretos.
- **Swagger:** abrir \`/docs\` en puerto de la versión activa; ejecutar una operación GET y un error (p. ej. \`/products?limit=101\` da 400 por DTO).
- **Mongo:** únicamente si la rama técnica está integrada, enviar mensaje entre participantes autorizados, consultar \`activity/interactions/me\`, reautenticarse tras reload; distinguir eventos outbox y mensajes directos. Un 503 si Mongo está abajo es correcto, no éxito simulado.
- **Docker/CI:** explicar servicios, variables \`.env.example\`, red, puertos, volúmenes, healthchecks, build CI, conflictos locales.
- **Git:** mostrar commits, PR, ramas de los compañeros; señalar cómo se integraron, por qué hubo PR abierta y qué parte quedó postentrega.

## Problemas previsibles
- El **modo demo 240** funciona desde archivos React, NO mediante operaciones SQL. Para demostrar compras usar un producto del **catálogo API real**.
- La rama visual no integra por sí sola Mongo; la técnica puede no incluir los 240 productos.
- Las reseñas SQL estaban en fase de contrato, no demostración confirmada a 086f89b.
- El token del frontend vive en memoria: recargar puede requerir volver a iniciar sesión. Eso NO implica pérdida de pedido SQL.
- WSL/Docker Desktop local puede fallar. Las pruebas CI no sustituyen la demostración local requerida.
- Mantener copia de captura/registro de la demo, sin declarar que capturas reemplazan persistencia en vivo.

## Mini guion de apertura (ajustar a evidencia real)
«Presentaremos NexusTech, un prototipo académico de marketplace de productos tecnológicos para estudiantes UNAB sede Viña del Mar. Evolucionamos desde una interfaz React con datos locales hacia un sistema con API NestJS y persistencia SQL de usuarios, inventario y pedidos. La rama técnica incorpora mensajes e historial MongoDB, con validaciones y pruebas. Mostraré no solo las pantallas, sino el recorrido de una solicitud, las reglas que protege el backend y cómo verificamos las operaciones y sus límites».

**No memorizar sin comprender**: ensayar con interrupciones y cambiar el orden de archivos.
