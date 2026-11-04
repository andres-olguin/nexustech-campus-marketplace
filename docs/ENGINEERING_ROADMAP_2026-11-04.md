# Plan técnico verificable — nexustech-campus-marketplace

**Fecha:** 2026-11-04. Documento de planificación; no representa pruebas completadas ni aprobación comercial.

## Hallazgos de la revisión

Marketplace universitario de semestre con HTML y React/Vite, catálogo y carrito simulado; algunos archivos HTML (carrito.html e historial.html) están vacíos.

## Prioridades

1. Aclarar cuál frontend es canónico: HTML tradicional, App.jsx o nexustech-react; eliminar confusión solo tras migración verificada.
2. No publicar carrito, login, pagos, historial ni rastreo como funciones reales cuando son simulaciones o páginas vacías.
3. Crear flujo de catálogo/producto/carrito con datos ficticios, pruebas de estados, accesibilidad y seguridad de contenido de usuarios.

## Evidencia para cerrar el plan

Demo coherente con navegación verificada, cero páginas vacías anunciadas, tests de filtros y carrito y disclaimers explícitos de simulación.

## Procedimiento

Trabajar en ramas con PR, conservar código original y documentar pruebas realmente ejecutadas (comando, sistema, resultado y fecha). Nunca exponer secretos ni datos de clientes/estudiantes. La apertura de este PR documental no certifica seguridad, disponibilidad o funcionamiento.
