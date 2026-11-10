---
tags: [agentes, github, organizacion]
---
# Coordinación de los tres agentes y revisión humana

El estudiante actúa como coordinador, expositor principal y responsable de aprender los cambios. GitHub registra código y propuestas; las decisiones y la validación humana deben quedar documentadas. Nunca presentar una solución como escrita manualmente por el alumno si fue generada por IA.

## Áreas de preferencia (reasignables con contrato previo)
| Actor | Área base | Evitar sin coordinación |
| --- | --- | --- |
| Codex | NestJS/API, SQL, Mongo, migraciones, contrato, pruebas backend | JSX/CSS concurrentes con Antigravity |
| Antigravity | React, UI, imágenes, accesibilidad y responsive, integración por contrato | Migraciones/DTO que Codex edita |
| Claude | Auditoría cruzada, documentación, experimentos aislados, verificación técnica y preguntas de defensa | Escribir simultáneamente en archivos reservados |
| Estudiante | Prioridades, aceptación, verificación en su equipo, aprendizaje y presentación | atribuirse autoría de líneas no escritas |
| Integrantes humanos | Contribuciones verificadas por commits/PR/revisión y diálogo | inferir porcentajes exactos sin evidencia |

## Protocolo de tarea
1. Identificar criterio de rúbrica y problema observables.
2. Consultar ramas, issues, PR, SHA y archivos propietarios.
3. Asignar agente, rama/worktree, archivos tocables y contrato de API.
4. Registrar diagnóstico, alternativas, cambios, pruebas y autoría.
5. Commit/push en rama de feature, abrir PR, revisar CI y riesgo de regresión.
6. No merge a main sin revisión/permiso; no modificar ZIP histórico.
7. Documentar en bitácora y producir «tarjeta de defensa»: síntoma, causa, código, solución, evidencia.
8. Enseñar al estudiante a encontrar y explicar el cambio. Evaluar individualmente sin pistas.

## Alertas históricas
- Visual \`feat/hito3-cierre-integrado\` @ \`9f88aaf\`.
- Técnica \`feat/hito3-codex-cli-mongo-qa\` @ \`086f89b\`, PR #8 abierta al documentar.
- La extensión \`CATALOG_REVIEWS_CONTRACT_V1.md\` es diseño; no afirmar migración/seed completo si no se prueba.
- Docker CI y Docker Desktop local son entornos distintos.
- El README raíz en rama visual era histórico/obsoleto; debe auditarse antes de usarlo en la presentación.
- Si otro agente trabaja mientras se consulta GitHub, repetir estado antes de coordinar o fusionar.

## Formato del handoff entre agentes
\`\`\`text
Objetivo / criterio:
Rama y SHA base:
Archivos asignados:
Contrato compartido:
Trabajo realizado y autoría:
Tests exactos y resultado:
Errores/limitaciones:
Riesgos o conflictos:
PR / próxima integración:
Explicación didáctica (qué, cómo, por qué, alternativa, prueba):
\`\`\`

## Entorno confirmado: laptop de casa
Consultar [Entorno Windows y uso de los tres agentes](09-ENTORNO-LAPTOP-WINDOWS.md). En esta laptop: Codex por CLI de terminal; Antigravity en panel izquierdo VS Code; Claude Code oficial en pestaña central. El panel derecho de Claude/ChatGPT Codex no funciona según el estudiante. `claude` no estaba en PATH en PowerShell, pero la extensión central sí emitió una ejecución de `pwd`. El error `not a git repository` ocurrió en `C:\Users\andre`, no dentro de la carpeta del proyecto. Cada agente debe verificar directorio y rama antes de ejecutar.
