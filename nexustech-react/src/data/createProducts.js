import config from './catalogConfig.json';
import { localProductImage } from './imageAssets.js';
import { demoComponentSpecs } from './demoComponentSpecs.js';

// Se conserva la combinatoria de 2.400 productos del main.js original.
// El catálogo es de demostración: nombres, precios y reseñas no son ofertas reales.
export function createProducts() {
  return Array.from({ length: 2400 }, (_, index) => {
    const i = index + 1;
    const family = config.FAMILIAS_PRODUCTO[(i * 7) % config.FAMILIAS_PRODUCTO.length];
    const brand = config.MARCAS[(i * 11) % config.MARCAS.length];
    const series = config.SERIES_MODELO[(i * 13) % config.SERIES_MODELO.length];
    const component = demoComponentSpecs(family.tipo, Math.floor(index / config.FAMILIAS_PRODUCTO.length));
    const specs = component?.title ?? config.SPECS_LISTA[(i * 17) % config.SPECS_LISTA.length];
    const priceRange = family.pMax - family.pMin;
    const remoteImage = family.imgs[i % family.imgs.length];
    return {
      id: String(i),
      nombre: brand + ' ' + family.tipo + ' ' + series + ' (' + specs + ')',
      categoria: family.cat,
      marca: brand.split(' ')[0],
      linea: series,
      tipo: family.tipo,
      fichaTecnica: specs,
      ...(component && { especificaciones: component.specs }),
      catalogoDemo: true,
      precio: family.pMin + Math.floor(((i * 9973) % priceRange) / 1000) * 1000,
      imagen: localProductImage(remoteImage),
      imagenOriginal: remoteImage,
      descripcion: 'Publicación de ejemplo para la comunidad universitaria. Configuración de referencia: ' + specs + '.',
      vendedor: config.VENDEDORES[(i * 5) % config.VENDEDORES.length],
      contacto: 'contacto@mastertechg.com',
      reseñas: [0, 1].map((n) => ({
        usuario: config.NOMBRES_ESTUDIANTES[(i * 3 + n) % config.NOMBRES_ESTUDIANTES.length],
        rating: n ? 4 + (i % 2) : 5,
        texto: config.PLANTILLAS_OPINION[(i * 2 + n) % config.PLANTILLAS_OPINION.length],
      })),
    };
  });
}
