# Cierre de requisitos tecnicos antes de ampliar catalogo/resenas

La rama tecnica conserva los commits originales de Enrique y Benjamin. La base visual 9c68127 se integra mediante merge 470097f sin modificar su worktree. Conflictos de nestApi y test HTTP resueltos preservando ambos contratos, sin eliminar Mongo por incorporar el cliente de rese?as aun no implementado.

## Evidencia nueva

- Docker Desktop local: motor ausente, com.docker.service detenido; Windows deniega Start-Service fuera del sandbox. No se declara validado en Windows.
- CI Linux real: https://github.com/andres-olguin/nexustech-campus-marketplace/actions/runs/42766707222, commit 470097f, conclusion success. Construye React/NestJS, PostgreSQL 16 y MongoDB 7; espera los cuatro healthchecks; ejecuta migraciones SQL; JWT/privacidad de mensajes; compra concurrente idempotente; stock; parada Mongo con 503 y evento SQL retenido; recuperacion de outbox; reinicio de ambos motores/API/web; lectura real Mongo y SQL persistida. Tambien build React y 14 pruebas de cliente.
- Intento CI anterior 42765700950: Docker y smoke aprobados, pero test React fallaba por ausencia de /backend/docs/HTTP_EXAMPLES.json dentro de la imagen web. Se corrige copiando solo el fixture canonico durante CI; no se simulan bases ni se suprime la prueba.
- Prueba navegador completa sobre 9c68127: cinco flujos aprobados y un fallo responsive (595 px en viewport 390 px). Correccion minima en NUESTRA rama: permitir wrap en nav-shell/nav-actions y texto institucional; no se oculta contenido ni se modifican colores, logos o componentes.
- Repeticion focalizada Mobile navigation: aprobada a 390 y 768 px, 1 prueba, 17.3 s de suite. Los cinco flujos desktop no cambian con la regla CSS limitada a <=640 px.
- Evidencia backend previa: 20/20 con SQL/Mongo reales; sin cambios backend durante esta integracion. Se ampliara y repetira al incorporar nuevas migraciones.

## Reproduccion de Compose

El workflow .github/workflows/hito3-compose.yml se dispara al publicar la rama tecnica. Usa permisos GitHub solo de lectura y obtiene exactamente el SHA del evento, sin servicios de terceros ni credenciales reales. scripts/hito3-compose-smoke.cjs prepare crea .env.ci con secretos aleatorios, no los imprime y rechaza sobrescribir un archivo existente. .gitignore ya excluye .env.*.

En una maquina Docker libre y desde la raiz: ejecutar prepare; docker compose --project-name nexustech-hito3-ci --env-file .env.ci up -d --build --wait --wait-timeout 240; luego node scripts/hito3-compose-smoke.cjs. Requiere puertos 3001/5173/5433 disponibles y crea un proyecto independiente. La prueba pausa/reinicia unicamente servicios de ese proyecto; no usarla sobre datos de trabajo. En CI los volumenes son efimeros y se retiran al final, comprobando CI=true y el nombre exacto del proyecto. No se borran volumenes locales.

## Alcance de la condicion previa

La evidencia anterior permite iniciar las etapas aditivas solicitadas: contrato primero y luego persistencia de rese?as/seed con nuevas pruebas. No se afirma 20/20 de una rubrica no cotejada ni se cambia el ZIP registrado. El uso de IA corresponde a auditoria, integracion, CI, contrato y pruebas; no se inventan contribuciones de estudiantes.
