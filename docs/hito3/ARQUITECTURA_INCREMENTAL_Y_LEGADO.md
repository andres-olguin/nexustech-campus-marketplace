# Calidad incremental y evidencia academica

## Decision sobre TypeScript en React

El backend ya es TypeScript. El frontend canonico es React/Vite con JSX y validadores HTTP en tiempo de ejecucion. No se justifica una reescritura para cambiar el porcentaje de lenguajes de GitHub.

Propuesta tras cerrar Hito 3: primero tipar una utilidad pura pequena (por ejemplo formato/contratos), habilitando allowJs para coexistencia. Migrar luego el cliente HTTP y componentes nuevos uno por uno, con pruebas y build tras cada cambio. No cambiar de framework ni reemplazar componentes estables. Un DTO de TypeScript no valida JSON remoto: conservar schemas runtime, errores HTTP y pruebas reales. No agregar declaraciones ambient any para ocultar errores o fingir dependencias.

Antes de activar checkJs sobre todo el proyecto, medir errores y resolver un modulo acotado. No se modifica ahora tsconfig frontend ni se instala otra tecnologia: las prioridades son Docker, seguridad, persistencia y pruebas. El contrato de catalogo/resenas define la futura frontera tipada; OpenAPI debe ser la fuente documentada cuando los endpoints existan.

## Inventario HTML observado

| Archivos | Tratamiento |
|---|---|
| nexustech-react/index.html | Entrada ACTIVA de Vite. No archivar ni renombrar |
| index.html, login.html, carrito.html, contacto.html, historial.html, rastreo.html de la raiz | Prototipo HTML heredado; conservar como evidencia de talleres anteriores, no anunciar como frontend canonico |
| API.html | Artefacto heredado de documentacion/demostracion; el contrato actual es Swagger /docs y docs/hito3 |
| nexustech-react/base-taller1/*.html (incluye contacto (1).html) | Copia academica historica; conservar autoria y distinguir del flujo React actual |
| nexustech-react/VISTA_PREVIA.html | Vista previa historica, no prueba de API/persistencia |

No se eliminan ni reescriben estos archivos y no se cambia el ZIP de Canvas. El Docker web construye nexustech-react y la entrada Vite; los HTML de la raiz no se convierten por ello en parte de la aplicacion React. Revisar enlaces/documentacion de publicacion antes de servir toda la raiz como un sitio estatico, porque podria mostrar el prototipo antiguo como si fuera la version actual.

No se usa .gitattributes para esconder lenguajes ni se agregan archivos artificiales. Los commits de Benjam?n y Enrique permanecen en la historia; los cambios de asistencia IA y las validaciones humanas se documentan con evidencia, sin inventar aportaciones.
