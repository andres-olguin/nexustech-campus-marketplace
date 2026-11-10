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

## 10-11-2026 — TOML interpretado erróneamente como PowerShell
- **Síntoma real:** al pegar `approval_policy = "never"`, `sandbox_mode = "workspace-write"` y `[sandbox_workspace_write]` directamente en terminal PowerShell aparecen `CommandNotFoundException` y `TypeNotFound`.
- **Causa:** son propiedades TOML de configuración Codex, **no comandos de PowerShell**.
- **Solución:** editar con un editor de texto `$HOME\.codex\config.toml` (p. ej., `notepad "$HOME\.codex\config.toml"`), guardar propiedades al nivel superior (antes de otras tablas) y reiniciar Codex. Si ya existe configuración, conservarla y evitar claves duplicadas. No se ejecutó la corrección en el computador; el usuario debe realizarla.
- **Límite importante:** `approval_policy="never"` + `workspace-write` reduce prompts, pero puede bloquear operaciones fuera del sandbox, incluso commits Git (rutas `.git` protegidas), en vez de pedir aprobación. Acceso de red separado; no prometer push automático.
- **Explicación para defensa:** distinguir lenguaje de shell, archivo de configuración, formato TOML, directorio HOME y permisos.
- **Pregunta de tutoría:** ¿por qué una variable declarada en un archivo TOML no es un comando ejecutable de PowerShell?

## 10-11-2026 — Inspección de Claude confundió ausencia local con ausencia en GitHub
- **Síntoma:** Claude, desde `C:\Users\andre`, vio `fatal: not a git repository`. Luego, dentro del repositorio visual, examinó `main` y `feat/hito3-cierre-integrado` y concluyó erróneamente «AGENTS.md y CLAUDE.md no están disponibles en ninguna rama».
- **Causa:** no había descargado/examinado la rama documental `docs/nexustech-defensa-aprendizaje-20261110`, donde **sí existen** ambos archivos; comprobó solo ramas locales seleccionadas. La carpeta inicial `C:\Users\andre` no era un repositorio.
- **Solución:** usar ruta/worktree correcto y `git fetch origin` antes de verificar ramas remotas; usar `git show origin/docs/nexustech-defensa-aprendizaje-20261110:AGENTS.md` y `...:CLAUDE.md` después del fetch, o consultar GitHub. No alterar `main` ni la rama visual para obtenerlos.
- **Regla:** no decir «en ninguna rama» después de revisar solo dos ramas; distinguir **no existe en checkout actual**, **no existe en ramas locales comprobadas** y **no existe en remoto**.
- **Ejercicio:** explicar diferencia entre rama local, remoto `origin`, `fetch`, worktree y archivo rastreado.

## 10-11-2026 — Auditoría visual de Antigravity (resultado reportado)
- Los commits `3a7cc79` y `48d5979` fueron confirmados en GitHub. Antigravity reporta 64 mapeos de productos corregidos, 15 SVG nuevos (22 totales), 15/15 tests frontend, build Vite, imágenes no rotas y ausencia de overflow a 375/768/1366/1920px tras iteraciones Playwright.
- **Precisión:** los commits y modificaciones están verificables; los resultados Playwright son reportados por Antigravity y se deben reproducir al integrar PR #8. El modo demo contiene 240 publicaciones en React, no necesariamente registros SQL.
- **Defensa:** describir por qué `white-space: nowrap` puede causar overflow, cómo diagnosticar con `scrollWidth` vs `innerWidth`, cómo corregir responsive y por qué se repitieron pruebas.
