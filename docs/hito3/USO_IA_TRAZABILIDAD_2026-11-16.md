# Uso responsable de inteligencia artificial — NexusTech, Hito 3

**Asignatura:** Desarrollo Web y Móvil (PTEC103) · UNAB Viña del Mar · 16 de noviembre de 2026.

El apartado 10 del enunciado permite análisis, diseño, generación de código, depuración, pruebas y documentación asistidos por IA. Exige registrar **herramienta, propósito, prompt representativo, resultado, validación humana y aprendizaje**. El equipo mantiene la responsabilidad sobre el código y debe poder explicarlo.

> Los ejemplos siguientes son **paráfrasis representativas de encargos**, no transcripciones literales de sesiones de agentes, salvo la cita textual indicada. Antes de presentar, cada integrante debe confirmar qué instrucciones y validaciones le corresponden; no atribuir trabajo generado por agentes como programación manual.

| Herramienta | Propósito e instrucción representativa | Resultado identificado | Validación y corrección humana | Aprendizaje y decisión |
| --- | --- | --- | --- | --- |
| Codex, coordinado por Andrés | «Implementar un backend REST NestJS para usuarios, productos, carrito, pedidos y PostgreSQL, manteniendo capas separadas y validaciones» *(paráfrasis)* | Módulos de backend, DTO, migraciones, servicios, pruebas y Swagger; ver historial de Git | Revisión de ramas/PR y pruebas de migraciones, compras, stock, concurrencia y errores en GitHub Actions | No bastaba con mostrar React: las operaciones del marketplace debían persistir, protegerse con JWT y separar controladores/servicios |
| Codex, con revisión de contribuciones de Enrique y el equipo | «Integrar mensajes e historial en MongoDB sin duplicar la compra relacional» *(paráfrasis)* | Interacciones Mongo y registros de actividad, con autorización y cola de salida SQL | Se ejecutaron pruebas sobre motores reales, privacidad de mensajes y recuperación; revisar código de `backend/src/activity` | PostgreSQL se usa como fuente transaccional; MongoDB almacena documentos de conversaciones y eventos |
| Antigravity y asistencia de IA para interfaz | «Corregir la superposición del hero y mejorar el catálogo sin romper componentes React» *(paráfrasis)* | CSS corregido, identidad visual y tarjetas con imágenes web referenciales | El coordinador observó solapamientos, imágenes repetidas y fotos de categorías equivocadas en capturas, pidió correcciones y verificó los cambios en el navegador | La revisión visual real es distinta de una compilación aprobada; los datos ficticios deben identificarse claramente |
| Asistencia de IA en integración y pruebas | «Respetar el código de Miguel, probar el incremento de unidades del carrito e incorporar Playwright al CI» *(paráfrasis)* | PR de corrección del carrito y suite de navegador dentro del flujo de cuatro servicios | Se revisó el PR #13, su prueba Playwright y la fusión separada del workflow mediante PR #17; CI final exitoso | Una compra debe sumar unidades del mismo producto y una prueba automatizada debe proteger ese comportamiento |
| Asistencia documental | «Confrontar los 20 criterios de la rúbrica con la evidencia disponible y distinguir implementado, probado y mostrado en la defensa» *(paráfrasis)* | Guías de cierre, matriz de pruebas, límites y presentación | Se cotejaron requisitos, commits, ZIP y logs locales. La entrega Canvas y la defensa siguen requiriendo comprobación individual | Una suite verde no demuestra comprensión ni equivale a un envío confirmado |

## Evidencia y límites

- Integración final en `main`, SHA de referencia **`7c8abbe95bcb82781e5f6192eac223b9e6fde341`**: [ejecución CI 43802108387](https://github.com/andres-olguin/nexustech-campus-marketplace/actions/runs/43802108387).
- [PR #13 Miguel](https://github.com/andres-olguin/nexustech-campus-marketplace/pull/13) y [PR #17 Playwright](https://github.com/andres-olguin/nexustech-campus-marketplace/pull/17); [PR #15 catálogo y pruebas](https://github.com/andres-olguin/nexustech-campus-marketplace/pull/15); [PR #16 imágenes](https://github.com/andres-olguin/nexustech-campus-marketplace/pull/16).
- Los pagos y despachos se simulan, las 240 fichas ilustrativas **no** representan publicaciones transaccionales y las reseñas son ejemplos ficticios; no confundirlas con opiniones verificadas ni un endpoint de reseñas productivo.
- Pendiente de evaluación humana: que todos los integrantes expliquen lo que muestran y que Canvas registre el ZIP elegido.

**Regla para la defensa:** no decir «la IA lo hizo, no sé cómo funciona»; explicar la responsabilidad concreta de cada capa, los errores detectados, el proceso de validación y las decisiones del equipo.
