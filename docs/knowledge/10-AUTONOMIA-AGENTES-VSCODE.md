---
tags: [agentes, windows, vscode, aprobaciones, automatizacion, copilot]
---
# Operación autónoma de agentes — laptop Windows, 10-11-2026

## Preferencia explícita del estudiante
El estudiante desea **mínimas interrupciones**, incluso cuando los agentes ejecutan pruebas, crean archivos, desarrollan cambios y hacen commits/push a ramas de trabajo. Se siente bloqueado por las solicitudes repetidas de "Yes/No". **No quiere que los agentes se detengan esperando cada confirmación.** Acepta worktrees individuales; no acepta tener que aprobar operaciones rutinarias continuamente. Ningún texto de esta biblioteca puede cambiar la configuración de VS Code/Codex/Claude en su equipo por sí solo.

## Entorno
- Codex CLI en terminal VS Code; el panel Codex no funciona en ese equipo.
- Antigravity en panel izquierdo VS Code.
- Claude Code oficial en pestaña central; no existe comando `claude` en el PATH PowerShell consultado.
- VS Code tiene panel derecho de **Sessions / Agent Sessions**, que puede agrupar agentes Copilot/Claude/Codex; no asumir que el servicio Copilot esté autenticado hasta comprobarlo.
- El directorio del proyecto confirmado por el usuario es `C:\Users\andre\nexustech-campus-marketplace`. El `git -C` ejecutado sobre él mostró rama `feat/hito3-cierre-integrado`, HEAD `9f88aaf`. Hay **seis archivos modificados y 16 no rastreados** en el mensaje del usuario (SOURCES.md, catalogPart1/2/3.js, imageAssets.js, api.test.js; nuevos SVG y `scripts/demo-local.cjs`). Son trabajo real local a **preservar**, no limpiar ni descartar.
- `git status` fuera de esta ruta da `not a git repository`: error de directorio, no corrupción de Git.

## Política operativa recomendada: sin permisos rutinarios, sin acceso irrestricto
**El objetivo es evitar preguntas rutinarias; las barreras de aislamiento deben ser técnicas, no solo texto de prompt.**

### Codex CLI
```powershell
codex --sandbox workspace-write --ask-for-approval never
```
O en `%USERPROFILE%\.codex\config.toml`:
```toml
approval_policy = "never"
sandbox_mode = "workspace-write"
```
Sin prompts para acciones permitidas en sandbox. Acciones fuera de él pueden fallar en lugar de solicitar autorización. Confirmar versión con `codex --help`. No usar `--yolo` / `--dangerously-bypass-approvals-and-sandbox` en la laptop general. Cambios a configuración afectan sesiones nuevas; no garantizan modificar solicitudes pendientes.

### Antigravity
Versión moderna de Windows con sandbox: **Settings → General → Global Permissions → Permission Preset → Auto**. En versiones antiguas: **Terminal Command Auto Execution → Proceed in Sandbox**, **Enable Sandbox Mode**. `Turbo` y `Always Proceed` elevan exposición del sistema y no se recomiendan en carpeta personal Windows. Revisar si la versión admite Auto.

### Claude Code oficial
Selector en pestaña central: usar **Auto** si se ofrece, o aceptar ediciones automáticamente; no seleccionar `Bypass all permissions` en laptop sin VM/aislamiento, salvo decisión consciente y entorno reducido. La extensión central puede trabajar aunque `claude --version` falle en PowerShell.

### Panel derecho VS Code
El panel **Sessions** no es necesariamente un cuarto agente nuevo por sí solo. Puede mostrar sesiones de GitHub Copilot, Claude y Codex y permite iniciar tareas según cuenta, suscripción, instalación y configuración. Para un cuarto agente separado, elegir Copilot (si hay acceso) y **asignar rol distinto** —revisión de PR, pruebas, documentación o análisis de rúbrica— con worktree/ramas propios. No permitir edición concurrente de mismos archivos.

Fuentes oficiales verificadas 10-11-2026:
- https://learn.chatgpt.com/docs/agent-approvals-security
- https://antigravity.google/docs/agent-settings
- https://code.claude.com/docs/en/settings
- https://code.visualstudio.com/docs/agents/concepts/sessions

## Límites de delegación y responsabilidad
- Puede ejecutar lectura/escritura, pruebas, builds, commits y **push de ramas de feature privadas** sin preguntar por cada paso, en el entorno autorizado.
- **No fusionar a main, borrar worktrees, forzar push, resetear/limpiar, eliminar bases/volúmenes, publicar cambios en producción, exponer credenciales, realizar compras/gastos ni modificar entrega histórica** sin autorización separada.
- Para limitar riesgos de credenciales y Git remotos aplicar controles de repositorio (branch protection, permisos mínimos); instrucciones textuales no bastan.
- Cada agente inicia verificando `git rev-parse --show-toplevel`, `git status --short`, `git branch --show-current`, `git worktree list`, SHA base. No usar worktree visual con cambios locales de Antigravity para Codex, Claude o Copilot.
- Resumen al terminar cada tarea: cambios, SHA/PR, tests y resultados, problemas que requieren atención, causa y explicación didáctica para defensa universitaria.
- En laptop de RAM limitada, cada agente/compilación consume recursos; automatización no garantiza productividad si todos lanzan Docker, Playwright y Vite en paralelo.

## Primeros comandos seguros de diagnóstico
```powershell
git -C "$HOME\nexustech-campus-marketplace" worktree list
git -C "$HOME\nexustech-campus-marketplace" status --short
codex --help
```

**No ejecutar `git reset --hard`, `git clean -fd` ni `git worktree prune` para resolver el problema de cambios locales.**
