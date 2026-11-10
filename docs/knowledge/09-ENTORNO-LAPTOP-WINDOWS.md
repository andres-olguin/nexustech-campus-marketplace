---
tags: [nexustech, entorno-local, windows, agentes, codex, claude, antigravity]
---
# Entorno de trabajo: laptop personal (Windows) — 10-11-2026

## Configuración elegida por el estudiante
Esta es **la configuración de trabajo en su laptop de casa**, no un requisito académico ni una configuración supuesta para los PC de la universidad.

| Agente | Forma de uso en la laptop | Evidencia compartida |
| --- | --- | --- |
| **Codex** | **Codex CLI** desde la terminal integrada de VS Code/PowerShell (sesión propia) | El estudiante informa que CLI sí funciona; el panel de ChatGPT Codex en VS Code no le funciona |
| **Antigravity** | **Panel izquierdo** de VS Code | Capturas muestran interfaz de Antigravity y solicitud de permiso para auditoría visual Playwright |
| **Claude Code** | **Pestaña/panel central del editor** mediante extensión oficial *Claude Code for VS Code* (Anthropic) | Captura muestra una conversación en esa pestaña y ejecución de `pwd` con salida `/c/Users/andre`; aún se veía procesando |
| Panel derecho de Claude | **No utilizarlo** en este equipo | El usuario informa que allí no funciona; no confundirlo con la pestaña central de la extensión oficial |

**No concluir** que el comando Claude CLI está instalado. Resultado real de PowerShell:
```text
PS C:\Users\andre> claude --version
claude : El término 'claude' no se reconoce ...
CommandNotFoundException
```
Esto indica que **no está disponible en PATH en esa sesión**. No significa que la extensión central no pueda funcionar. No instalar CLI si el panel oficial central ya sirve, salvo necesidad y consentimiento.

## Advertencia: terminal fuera del repositorio
En la misma captura el prompt era `PS C:\Users\andre>`, es decir, carpeta de inicio. Estos comandos devolvieron:
```text
git status
git branch --show-current
fatal: not a git repository (or any of the parent directories): .git
```
**Causa:** el directorio actual no es un repositorio Git; **no prueba que Git o NexusTech estén averiados**. El usuario había utilizado anteriormente `C:\Users\andre\nexustech-campus-marketplace`, pero verificar existencia/rama real antes de operar.

Comprobación en PowerShell (solo lectura):
```powershell
Test-Path "$HOME\nexustech-campus-marketplace"
git -C "$HOME\nexustech-campus-marketplace" status
git -C "$HOME\nexustech-campus-marketplace" branch --show-current
git -C "$HOME\nexustech-campus-marketplace" log -1 --oneline
```
Si la carpeta no existe, **buscar la ruta real sin adivinar**; abrir la carpeta correcta con **File > Open Folder**. En worktrees, `.git` puede ser archivo y no carpeta.

## Seguridad y coordinación multiagente
- Un agente = **worktree y rama independientes**, confirmados con `git status`, `git branch --show-current` y `git rev-parse --show-toplevel`. No permitir que los tres editen la misma carpeta.
- Antes de crear worktree adicional de Claude, inspeccionar worktrees existentes con `git worktree list` y verificar qué carpetas están libres. No mover ni borrar ramas/carpetas.
- **No habilitar 'Bypass all permissions'** como norma. Revisar permisos y cada comando, sobre todo scripts temporales, `git reset/clean`, DB, credenciales, push/merge y pruebas que manipulan datos.
- Usar una terminal independiente para cada CLI; evitar procesos duplicados que saturen RAM/CPU de la laptop.
- La configuración técnica de este equipo no implica que Docker Desktop/WSL estén solucionados: hubo errores previamente. No asumir capacidades de los PC de universidad.
- El estudiante desea dominar el 100 % y más del código y de cada cambio. Cada agente debe entregar una explicación didáctica y una entrada en la bitácora de errores.

## Primer chequeo práctico al abrir VS Code
1. Identificar carpeta activa del workspace y worktree; comprobar que no sea solo `C:\Users\andre`.
2. Si Claude central responde, pedir inspección **solo lectura**, con `pwd`/ruta y rama. Que lea `AGENTS.md` y `CLAUDE.md` de la rama documental cuando esté disponible; no asumir que están en la rama de producción.
3. Anotar los tres SHAs antes de trabajar; jamás confundir visual, técnico y documentación.
4. Continuar la tutoría desde fundamentos de rutas, terminal y Git: el estudiante declara **nivel cero en todas las tecnologías**.

## Origen y límites
Fuente: declaración del estudiante y captura de VS Code a 10-11-2026. Este documento describe ese momento y **debe actualizarse si cambian paneles, instalaciones o worktrees**. No contiene credenciales ni identificadores sensibles.
