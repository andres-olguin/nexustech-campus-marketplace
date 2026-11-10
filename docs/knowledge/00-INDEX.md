---
tags: [nexustech, ptec103, defensa, aprendizaje]
aliases: [NexusTech Knowledge Vault]
---
# NexusTech: biblioteca versionada para ingeniería y defensa

Este directorio es un conjunto de **archivos Markdown**. Sirve en GitHub y puede abrirse como una carpeta/vault en Obsidian. **No le da memoria automática a ninguna IA**: cada agente tiene que leer estos archivos y comprobar el estado vigente del repositorio. Git documenta cambios; Obsidian organiza y enlaza notas; la comprensión del estudiante se construye con ejercicios.

## Ruta de estudio y trabajo
1. [Contrato maestro de tutoría](01-CONTRATO-MAESTRO.md): principiante absoluto y presentador individual principal.
2. [Mapa y recorrido de todo el código](02-MAPA-CODIGO.md): archivos, tecnologías, flujos y legado.
3. [Rúbrica y evidencias](03-RUBRICA-EVIDENCIAS.md): 20 criterios y 7 demostraciones obligatorias.
4. [Defensa código, Git y equipo](04-DEFENSA-CODIGO-GIT-EQUIPO.md): pruebas impredecibles del docente.
5. [Recorrido funcional en vivo](05-DEMO-PASO-A-PASO.md): ventas, SQL, Mongo, Swagger, Docker y plan de contingencia.
6. [Bitácora de errores y decisiones](06-BITACORA-ERRORES.md): qué falló, por qué y cómo se probó la solución.
7. [Progreso de dominio](07-PROGRESO.md): registro de comprensión real, no porcentajes ficticios.
8. [Coordinación multiagente](08-COORDINACION-AGENTES.md): contratos, ramas, autoría, revisión.

## Estado observado al redactar (10 noviembre 2026; revalidar)
- Repositorio: https://github.com/andres-olguin/nexustech-campus-marketplace
- Rama visual \`feat/hito3-cierre-integrado\` @ \`9f88aaf\`: catálogo de **240 artículos de demostración**, no 240 SQL.
- Rama técnica \`feat/hito3-codex-cli-mongo-qa\` @ \`086f89b\`: Mongo privado, outbox, Docker CI y contrato de catálogo/reseñas. PR #8 abierta contra rama visual, aún sin merge; no incluye necesariamente la última expansión visual.
- \`main\` divergente @ \`b54f45e\`.
- Canvas: ZIP presentado 09-11-2026 23:57 según usuario. No atribuirle commits posteriores.
- GitHub Actions \`42766707222\` confirmó Compose en Linux para commit \`470097f\`; Docker Desktop local presentaba problemas WSL/servicio.
- Prototipo académico exclusivo **UNAB, sede Viña del Mar**; no plataforma oficial institucional.
- El usuario quiere mostrar y explicar **todos los archivos pertinentes de código, el recorrido visual/funcional y Git**, y defender aportes, dificultades y trabajo humano. Punto de partida declarado: cero conocimientos previos.

## Obsidian sin confusiones
1. Clona o descarga el repositorio, abre Obsidian, selecciona «Abrir carpeta como vault» y escoge \`docs/knowledge\` o el repositorio entero.
2. Usa enlaces relativos Markdown, búsqueda y notas para repasar. No es necesario un complemento para leer Markdown.
3. Si vas a sincronizar con Git, usa commits y push/pull conscientes; no edites archivos de varios worktrees a la vez.
4. Obsidian no convierte estos apuntes en memoria permanente de ChatGPT, Claude ni Codex. Estos agentes deben leerlos al comenzar.

**No almacenar:** datos de compañeros no públicos, secretos, chats privados, calificaciones no autorizadas o credenciales.

9. [Entorno de laptop Windows y tres agentes](09-ENTORNO-LAPTOP-WINDOWS.md): Codex CLI, Antigravity izquierda, Claude Code central, ubicación Git, permisos y worktrees.
