#!/usr/bin/env bash
# GitHub Codespaces: levantar backend + PostgreSQL + MongoDB sin publicar credenciales.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "[NexusTech] Comprobando Node.js y Docker..."
if ! command -v node >/dev/null 2>&1; then
  echo "[NexusTech] ERROR: Node.js no existe. Reconstruye el Codespace usando .devcontainer/devcontainer.json." >&2
  exit 1
fi
if ! command -v docker >/dev/null 2>&1; then
  echo "[NexusTech] ERROR: Docker CLI no existe. Revisa la feature Docker-in-Docker en los registros de creación." >&2
  exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "[NexusTech] ERROR: falta Docker Compose." >&2
  exit 1
fi
echo "[NexusTech] Node $(node --version); $(docker --version)"

# La feature docker-in-docker puede tardar unos segundos en iniciar su daemon.
ready=false
for attempt in $(seq 1 45); do
  if docker info >/dev/null 2>&1; then ready=true; break; fi
  sleep 2
done
if [ "$ready" != true ]; then
  echo "[NexusTech] ERROR: Docker existe, pero el daemon no responde; consulta Codespaces: View Creation Logs." >&2
  exit 1
fi

node scripts/hito3-env.cjs
echo "[NexusTech] Iniciando PostgreSQL, MongoDB y NestJS..."
if ! docker compose -p nexustech up -d --build --wait --wait-timeout 300 api; then
  docker compose -p nexustech ps -a || true
  docker compose -p nexustech logs --no-color --tail=80 api postgres mongo || true
  exit 1
fi

echo "[NexusTech] Verificando salud del servicio..."
if ! curl --fail --silent --show-error http://localhost:3001/api/v1/health/ready; then
  echo "[NexusTech] ERROR: la API no responde en localhost:3001." >&2
  docker compose -p nexustech logs --no-color --tail=80 api || true
  exit 1
fi
echo
echo "[NexusTech] API lista en puerto 3001. Copia la URL HTTPS de la pestaña PORTS (sin /api/v1) en la APK."
echo "[NexusTech] Para crear cuentas demo, ejecuta node scripts/hito3-demo.cjs."
echo "[NexusTech] Si utilizas contraseñas fijas privadas, carga antes las variables desde .env.demo.local."
