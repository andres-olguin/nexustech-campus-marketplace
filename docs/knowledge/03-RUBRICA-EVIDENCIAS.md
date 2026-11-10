---
tags: [rubrica, hito3, evaluacion]
---
# Alcance oficial del Hito 3 y evidencias

Fuente: **Enunciado_Hito_3_Desarrollo_Web_Movil.docx**, proporcionado en conversación, segundo semestre 2026, sección 3.4, requisitos 4–12 y rúbrica 13. Este resumen **no sustituye la rúbrica oficial completa**, que contiene descripciones de logro esperado, parcial e insuficiente. No hay ponderaciones individuales en el documento oficial.

## Funcionalidades obligatorias para marketplace (3.4)
- Usuarios y perfiles de comprador/vendedor.
- Publicación y administración de productos.
- Categorías, búsqueda y filtros.
- Favoritos y carrito.
- Creación y seguimiento de pedidos.
- Estados de pedidos y transacciones simuladas.
- SQL PostgreSQL: usuarios, productos, categorías, pedidos y detalles.
- NoSQL: **conversaciones o historial de interacción** con backend real.

## Veinte criterios (etapa → criterio)
1 Continuidad Taller 2; 2 Ampliación del dominio; 3 Modelado y arquitectura; 4 Diseño de API.
5 Estructura backend; 6 API REST y reglas; 7 Persistencia SQL; 8 Persistencia NoSQL; 9 Swagger y errores.
10 Integración React-API; 11 Funcionalidad y flujos; 12 Experiencia y estados; 13 Separación de responsabilidades.
14 Flujo end-to-end; 15 Pruebas y validaciones; 16 Docker y reproducibilidad; 17 Git y colaboración; 18 README y documentación; 19 Uso de IA; 20 Demostración y defensa.

## Siete evidencias mínimas en vivo (sección 8)
1 Flujo completo desde React. 2 Datos SQL que persisten y se consultan después. 3 Interacción Mongo real de escritura o lectura. 4 Regla relevante como stock. 5 Operación en Swagger. 6 Error validado y explicado en frontend/backend. 7 Ejecución Docker Compose.

## Historial/estado: NO mezclar
| Elemento | Evidencia disponible / límite |
| --- | --- |
| Entrega Canvas 9-11 23:57 | ZIP histórico registrado, comprobar SHA y contenido; mejoras posteriores no equivalen a entrega |
| Visual \`9f88aaf\` | 240 productos demo, no SQL; frontend reseñas conecta a rutas por implementar |
| Técnico \`086f89b\` | Mongo privado, outbox y pruebas; PR #8 abierta en fecha de redacción |
| GitHub Actions \`42766707222\` | Docker Compose 4 servicios exitoso para \`470097f\` en Linux |
| Docker Desktop local | Error WSL/servicio, no afirmar que funcionó en ese PC |
| 240 productos SQL y reseñas SQL | No confirmados como persistidos a fecha de redacción |
| \`main\` | Otra historia, no sustituir rama de integración sin revisar |

**Regla:** por cada criterio guardar: qué pide, archivo y línea, comando de reproducción, captura o salida, commit SHA, estado (implementado/validado/integrado/entregado/pendiente) y quién lo puede explicar.

## IA responsable (sección 10)
Registrar herramienta, propósito, prompt representativo, resultado, validación humana y aprendizaje. No reclamar código escrito personalmente cuando lo generó un asistente; sí explicar decisiones, coordinación, auditoría, correcciones y validación propia en la medida en que puedan demostrarse.
