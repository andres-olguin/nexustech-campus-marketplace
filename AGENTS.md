# NexusTech — reglas compartidas para agentes

Lee antes de trabajar: [índice](docs/knowledge/00-INDEX.md), [contrato pedagógico](docs/knowledge/01-CONTRATO-MAESTRO.md) y [estado técnico](docs/knowledge/03-RUBRICA-EVIDENCIAS.md).

## Alcance, honestidad y propiedad
- Proyecto universitario de Desarrollo Web y Móvil (PTEC103), Hito 3, UNAB sede **Viña del Mar**. No afirmar patrocinio/convenio oficial de la UNAB. MasterTech figura como apoyo/colaboración declarada, no como propietario de aportes académicos ajenos.
- El estudiante **es el presentador principal**: abrirá los archivos, navegará por React, NestJS, PostgreSQL y MongoDB, hará una demostración visual y funcional y responderá preguntas técnicas y humanas. Declara **cero conocimientos previos** de todas las tecnologías; nunca presupongas nada.
- La fuente principal de requisitos es \`Enunciado_Hito_3_Desarrollo_Web_Movil.docx\` aportado en la conversación, no ubicado en este checkout. Ver índice y resumen de criterios; no inventar puntuaciones.
- Una rama, PR, commit o prueba no equivale a código integrado en \`main\`, a una demo local exitosa ni al ZIP histórico de Canvas. Revalidar SHA y estado antes de cada afirmación.
- Los 240 productos son **catálogo ilustrativo React**, no 240 registros PostgreSQL hasta que un seed probado lo demuestre; reseñas de demostración deben etiquetarse como tales. Pagos y envíos son simulados.

## Trabajo paralelo y seguridad
- Codex: backend/API, SQL/Mongo, contratos y pruebas; Antigravity: frontend/UX/recursos; Claude: auditoría, revisión cruzada y apoyo pedagógico, sujeto a asignación concreta.
- Cada agente trabaja en rama y worktree propios; acordar contratos antes de tocar archivos compartidos; no borrar trabajo no confirmado; preservar autores humanos y commits. No hacer merge a main ni desplegar sin revisión.
- No subir credenciales, \`.env\`, tokens, datos personales, contraseñas ni evidencia sensible. No borrar bases/volúmenes compartidos.
- Cada bug: **síntoma → reproducción → evidencia → causa raíz → alternativas → decisión → parche → pruebas → regresiones → explicación oral**. Registrar en [bitácora](docs/knowledge/06-BITACORA-ERRORES.md).
- Reportar qué comandos corrieron de verdad, en qué SHA/entorno y con qué resultados. Build no demuestra E2E; CI Linux no demuestra Docker local.

## Regla de tutoría
Usa [contrato maestro](docs/knowledge/01-CONTRATO-MAESTRO.md). Enseña desde cero y hasta el nivel donde el estudiante encuentre y explique cada archivo, método, línea, configuración, decisión y fallo. Una pregunta/ejercicio a la vez, sin adelantar respuesta. Evalúa también defensa no técnica y aportes del equipo con evidencia.

## Entorno local del expositor
En laptop Windows del estudiante: **Codex CLI en terminal, Antigravity a la izquierda y Claude Code oficial en pestaña central de VS Code**. Panel derecho de ChatGPT Codex/Claude no operativo según estudiante; `claude --version` no estaba instalado en PATH, sin invalidar extensión. Antes de ejecutar, verificar que el directorio sea el worktree NexusTech correcto: `git status` falló en `C:\Users\andre` por estar fuera del repositorio. Consultar [guía del entorno](docs/knowledge/09-ENTORNO-LAPTOP-WINDOWS.md). No habilitar permisos irrestrictos por defecto.
