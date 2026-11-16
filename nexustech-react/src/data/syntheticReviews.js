// Reseñas ORIGINALES DE EJEMPLO para prototipar la UI, no testimonios reales.
// Deben mostrarse únicamente etiquetadas como ficticias, sin atribuirse a personas.
const perspective = {
  Notebooks: ["autonomía y temperatura en jornadas universitarias", "peso y conectividad al trasladarse entre clases"],
  Computadores: ["posibilidad de ampliación de memoria y almacenamiento", "disipación térmica al compilar proyectos"],
  Componentes: ["compatibilidad con placa y fuente antes de comprar", "condición física y conectores antes de instalar"],
  Almacenamiento: ["velocidad sostenida al copiar proyectos grandes", "compatibilidad del formato y estado SMART"],
  Monitores: ["ergonomía y lectura de texto en programación", "conectividad y resolución para trabajar con dos ventanas"],
  Periféricos: ["comodidad durante sesiones largas", "conexión estable y facilidad de limpieza"],
  Audio: ["claridad durante videollamadas y clases", "comodidad, aislamiento y compatibilidad"],
  Smartphones: ["autonomía y fluidez de navegación", "almacenamiento y soporte para apps móviles"],
  Tablets: ["lectura de apuntes y autonomía", "respuesta táctil y accesorios compatibles"],
  Redes: ["estabilidad de la conexión en laboratorio", "cantidad de puertos y compatibilidad"],
  Impresoras: ["costo de insumos y facilidad de mantenimiento", "compatibilidad con Windows y macOS"],
  Accesorios: ["construcción y materiales del accesorio", "medidas y compatibilidad con el equipo"],
};
const openers = [
  "Como ejemplo de evaluación, conviene verificar", "Para un estudiante de informática, revisaría",
  "Antes de decidir una compra, comprobaría", "En una ficha técnica completa buscaría",
  "Para usarlo en el campus, tendría en cuenta", "Al comparar opciones similares, priorizaría",
  "Un aspecto útil para estudiar es confirmar", "Para un laboratorio universitario, destacaría",
];
const conclusions = [
  "Es una evaluación simulada y no refleja una compra.", "Comentario ficticio creado para probar la interfaz.",
  "No hay una experiencia real de comprador detrás de este texto.", "El estado real debe comprobarse con el vendedor.",
];
function normalized(str) { return String(str || "").trim(); }
function hash(str) {
  let value = 0;
  for (const c of String(str)) value = (Math.imul(value, 33) + c.codePointAt(0)) >>> 0;
  return value;
}
export function syntheticReviewsForProduct(product, minimum = 2) {
  const previous = Array.isArray(product.reviews) ? product.reviews : [];
  const count = Math.max(0, minimum - previous.length);
  if (!count) return previous;
  const name = normalized(product.name) || "este producto";
  const category = normalized(product.category) || "Componentes";
  const topics = perspective[category] || perspective.Componentes;
  const specs = Array.isArray(product.specs) ? product.specs.filter(Boolean) : [];
  const extra = product.technical?.text ? [product.technical.text] : [];
  const criteria = [...specs, ...extra];
  const uniqueSeed = hash(name + category + normalized(product.id));
  const produced = Array.from({length:count},(_,idx)=>{
    const n = idx + previous.length;
    const topic = topics[(uniqueSeed + n) % topics.length];
    const actualSpec = criteria[n % Math.max(1,criteria.length)];
    const opener = openers[(uniqueSeed + n * 5) % openers.length];
    const characteristic = actualSpec ? 'La ficha menciona "' + actualSpec + '".' : 'La ficha describe "' + normalized(product.description).slice(0,100) + '".';
    const observation = n % 2 === 0
      ? "Además, revisaría " + topic + " para determinar si se ajusta a mi uso."
      : "También preguntaría por " + topic + " antes de confirmar la compra.";
    return {
      id: 'ejemplo-' + normalized(product.id || name).replace(/[^a-zA-Z0-9_-]/g,"-") + '-' + n,
      author: 'Evaluación ficticia ' + (n + 1),
      rating: 3 + ((uniqueSeed + n * 7) % 3),
      title: (n % 2 === 0 ? 'Ficha de ' : 'Revisaría ') + name.slice(0,64),
      comment: opener + ' la información de ' + name + '. ' + characteristic + ' ' + observation + ' ' + conclusions[(uniqueSeed+n)%conclusions.length],
      featuresEvaluated: [topic],
      createdAt: '2026-11-10T14:00:00.000Z',
      isDemo: true,
    };
  });
  return [...previous,...produced];
}
