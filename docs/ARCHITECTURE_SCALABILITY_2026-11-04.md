# nexustech-campus-marketplace — Escalabilidad y evolución técnica

**Documento:** MTS-ENG-NEXUSTECH-CAMPUS-MARKETPLACE-20261104 · **Estado:** investigación y planificación, no producción certificada · **Fecha:** 2026-11-04.

## Base del repositorio

Ejercicio académico con versiones HTML/React, catálogo, filtros y carrito simulado; páginas de historial y carrito históricamente vacías.

## Arquitectura objetivo

Elegir frontend canónico y separar catálogo, filtros, favoritos/carrito local y publicación. No implementar pagos hasta validar autenticación, protección contra fraude, políticas de intercambio y moderación.

## Calidad y observabilidad

Número de ítems sintéticos, p95 de filtro en móvil, tamaño del catálogo, errores de enlaces, accesibilidad y tareas completas por usuario; no confundir visitas con ventas.

En pruebas documentar versión, fecha, dataset, comandos, hardware, fallos, tiempo y variación. Las cifras de capacidad solo se presentan cuando están respaldadas por ejecuciones reales, distinguiendo ejemplos sintéticos.

## Puertas de seguridad y negocio

Conservar coautoría del semestre; etiquetar carrito simulado y no registrar datos reales de usuarios hasta tener avisos, autorización y mecanismos de abuso.

## Hoja de ruta condicional

G1 navegación sin páginas vacías; G2 catálogo y búsqueda testeada; G3 moderación y permisos; G4 piloto estudiantil voluntario.

Las etapas no son promesas de fecha. Pasar de una etapa a otra exige prueba verificable, control de costos, responsable y análisis de riesgo. No introducir infraestructura de alta complejidad sin métricas de saturación que la justifiquen.

## Fuentes metodológicas consultadas el 04-11-2026

- [AWS Well-Architected](https://docs.aws.amazon.com/wellarchitected/): rendimiento, seguridad, operación, fiabilidad y costos.
- [OWASP ASVS 5.0.0](https://asvs.owasp.org/): verificación de controles web/API cuando aplica.
- [NIST SSDF](https://csrc.nist.gov/pubs/sp/800/218/final): disciplina de desarrollo seguro.
- [Google SRE](https://sre.google/workbook/implementing-slos/): objetivos medidos de fiabilidad.

**Nota de integridad:** no se ha ejecutado una auditoría integral por el mero hecho de publicar este documento y las fuentes externas no prueban eficacia del proyecto.
