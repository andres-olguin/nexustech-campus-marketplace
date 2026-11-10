---
tags: [debugging, errores, aprendizaje]
---
# Bitácora: fallo → causa → corrección → evidencia → defensa

Cada fila debe incluir fecha, SHA, rama, archivos y pruebas. Distinguir fallo histórico corregido, riesgo pendiente y resultado solo reportado. **Al corregir un fallo, el mentor debe enseñar al estudiante a reproducirlo y explicarlo frente al profesor.**

## Casos históricos a estudiar
| Caso | Síntoma | Causa / corrección registrada | Evidencia y límite |
| --- | --- | --- | --- |
| UNAB logo oscuro | Quedaba casi invisible en footer oscuro; cápsula blanca se veía recortada | Se cambió a isotipo transparente, grilla y cápsula sutil | commits \`bc73948\`, \`06d946f\`; comprobar visual actual |
| Sedes incorrectas | Footer mencionaba Santiago/Concepción | Enfocar exclusivamente sede Viña del Mar y rotulación Hito 3 | \`91f262c\` |
| Catálogo insuficiente | 48 ítems demo y pocos SQL | 240 ítems demo en 12 categorías, filtros/paginación; SQL sigue limitado hasta seed | \`08b37b7\`, \`9f88aaf\` |
| Fotos incoherentes | Imagen de procesador en producto de cargador | Asignación de SVG representativos y fuentes para categorías faltantes | \`328d9d7\`; 21 fotos para 240 ítems sigue implicando repetición |
| Mongo fingía persistencia | API indicaba guardado incluso sin insertar; consulta fallida parecía lista vacía | Confirmar insertOne o devolver 503; restringir acceso a participantes | \`baaaa71\`; pruebas reales y revisión |
| Evento SQL perdido si Mongo caía | Evento postcommit volátil | Outbox transaccional SQL con reintentos e idempotencia en Mongo | \`baaaa71\`, CI \`42766707222\` |
| React móvil horizontal | Viewport 390 px tenía ancho de contenido 595 px | Ajuste de envoltura de header/nav en rama técnica | documento \`GATE_HITO3_Y_COMPOSE_CI.md\`; revalidar en visual |
| Docker local no arrancaba | WSL timeout, Docker Desktop servicio detenido | No se resolvió localmente; CI Linux levantó 4 servicios | No confundir Docker CI con PC local |
| Catálogo y reseñas desacoplados | Datos demo no SQL; reseñas UI no persisten | Contrato v1 preparado; seed y endpoints permanecían pendientes | \`CATALOG_REVIEWS_CONTRACT_V1.md\` |

## Plantilla de nueva entrada
### YYYY-MM-DD — Nombre del incidente
- Versión, rama y SHA:
- Acción de usuario o requisito afectado:
- Síntoma preciso y cómo reproducir:
- Evidencia real: captura, comando, HTTP, log o test:
- Causa raíz comprobada (no hipótesis sin prueba):
- Alternativas consideradas y costes:
- Decisión y justificación:
- Archivos, funciones y líneas cambiadas:
- Responsable de implementar / coordinar / revisar (según evidencia):
- Comandos exactos y resultados de prueba:
- Riesgos/residual y rollback seguro:
- **Explicación oral de 20 s / 1 min / a nivel código:**
- **Pregunta de entrenamiento:** «¿por qué esta solución y no otra?»
- **Respuesta independiente del estudiante:** pendiente hasta evaluación.

No editar el pasado como si se hubiera realizado una prueba que nunca ocurrió.
