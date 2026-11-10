---
tags: [defensa, git, codigo, trabajo-en-equipo]
---
# Defensa individual: navegar, explicar, justificar y demostrar

**Expositor:** el estudiante conduce toda la presentación. No contar con que un compañero responda por él. Ensayar de pie, con la misma interfaz y ordenador disponibles durante la presentación; el profesor puede interrumpir.

## Plantilla para cualquier archivo seleccionado
1. **Ubicación:** «Estamos en \`...\`, pertenece al frontend/backend/infraestructura».
2. **Responsabilidad:** «Recibe X, verifica Y y produce Z».
3. **Lectura:** identificar imports, declaraciones, parámetros, tipos, condicionales, bucles, llamadas, retorno y errores.
4. **Conexiones:** encontrar quién llama la función y a quién llama esta; mostrar JSON/API/consulta si corresponde.
5. **Decisión:** justificar por qué se implementó así, qué alternativa había, pros/contras.
6. **Prueba:** ejecutar caso exitoso, inválido y límite con salida verificable.
7. **Historia:** cómo llegó ese código al repo, PR/commit, problemas y validación.
8. **Límite:** reconocer lo que todavía no funciona, depende de una rama o no fue entregado.

## Mapa de preguntas técnicas impredecibles
- JavaScript/TypeScript: import/export, función, \`async/await\`, promesas, tipos, arreglos, objetos, \`map/filter\`, cierres y errores.
- React: JSX, props/estado, \`useEffect\`, componentes, renderizado, eventos, formularios, render condicional, filtrado, paginación, responsive, accesibilidad.
- HTTP: URL/base, GET/POST/PUT/PATCH/DELETE, status 200/201/400/401/403/404/409/429/500/503, JSON, CORS, REST, Swagger.
- Seguridad: credenciales, hash vs cifrado, JWT vs sesión, autenticación vs autorización, validación de DTO, ownership, logging y privacidad.
- SQL: tabla/columna/PK/FK, JOIN, índices, CHECK, transacciones/ACID, locks, concurrencia, migraciones, seed y datos reales.
- Mongo: colección/documento, ObjectId, índices, acceso por participantes, fallos 503, outbox, reintentos, consistencia eventual.
- Docker: imagen vs contenedor, volumen, red, env, healthcheck, Dockerfile, Compose, CI Linux vs WSL local.
- Arquitectura: responsabilidades, capas, DTO vs entidad, frontend vs API, contratos, TypeORM, Node, procesos/puertos, API pública.
- Pruebas: unit vs integración vs E2E, qué valida cada una, caso de regresión, flakiness, mocks vs motores reales.
- Cambios hipotéticos: «si quito esta condición», «si dos personas compran la última unidad», «si JWT expira», «si PostgreSQL se cae», «si Mongo responde tarde», «si imagen no carga».

## Git/GitHub desde cero
- **Git** registra versiones locales; **GitHub** hospeda repositorios remotos y colaboración.
- **Working tree**: archivos actuales; **stage/index**: selección preparada; **commit**: instantánea/version; **branch**: referencia a una línea de desarrollo; **push**: envío al remoto; **pull/fetch**: recibir referencias/cambios; **PR**: propuesta revisable para integrar; **merge**: unión de historias; **worktree**: carpeta de trabajo adicional asociada al mismo repositorio.
- Comandos de **solo lectura** para el examen (explicar cada uno antes de ejecutar):
  - \`git status\` — cambios locales y rama actual.
  - \`git branch -a\` — ramas locales y remotas rastreadas.
  - \`git log --oneline --decorate --graph --all -n 30\` — historia y merges (salir con \`q\`).
  - \`git show --stat <SHA>\` — archivos de un commit.
  - \`git show <SHA> -- <ruta>\` — diff de un archivo.
  - \`git diff --stat <base>..<rama>\` — comparación.
  - \`git ls-files\` — inventario versionado.
  - \`git remote -v\` — remoto(s) configurados.
- Comandos **con cambios**: \`git add\`, \`git commit\`, \`git push\`, \`git merge\`, \`git pull\`. No practicar estos en ramas compartidas o base de entrega sin crear primero un entorno seguro. Saber diferenciar **push ≠ merge ≠ despliegue ≠ entrega Canvas**.
- **Evidencia de autoría:** usar commits, PR, revisiones y testimonios verificables. Un commit con cuenta propia creado por Codex no prueba autoría manual de cada línea. No inventar porcentajes de participación.

## Preguntas humanas / individuales
- ¿Cuál fue el problema inicial y quiénes son los usuarios?
- ¿Qué hiciste **tú** exactamente (coordinación, decisiones, revisión, pruebas, código verificado)?
- ¿Cómo distribuyeron tareas y negociaron contratos entre integrantes?
- ¿Cómo trataron cambios de Miguel, Enrique y Benjamín? ¿Qué dicen PR y commits?
- ¿Qué error grave encontraron? ¿Cómo lo descubrieron? ¿Quién hizo la corrección y quién la validó?
- ¿Qué decisión habrías tomado diferente y por qué?
- ¿Cómo se controló la calidad del código generado por IA?
- ¿Por qué una PR se mantuvo abierta? ¿Qué diferencia hay entre publicada y fusionada?
- ¿Qué saben realmente sobre la entrega en Canvas y los cambios posteriores?
- ¿Cómo enfrentarían una controversia entre prioridades de UI, backend y plazos?
- ¿Qué limitaciones permanecen y cuál es el plan con evidencia?

**Estructura oral:** afirmación clara → evidencia verificable → razonamiento → límite. Cuando no sepa: «No puedo confirmar ese detalle sin revisar X; lo comprobaría en este archivo/PR/prueba», no inventar.
