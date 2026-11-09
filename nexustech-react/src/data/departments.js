import { normalize } from '../utils/format.js';
import { productAttributes } from '../utils/productSpecs.js';

const clean = (value) => normalize(value ?? '').replace(/[^a-z0-9]+/g, ' ').trim();
const anyPhrase = (phrases) => {
  const needles = phrases.map((phrase) => ' ' + clean(phrase) + ' ');
  return (text) => needles.some((needle) => text.includes(needle));
};
const ofType = (...phrases) => {
  const matches = anyPhrase(phrases);
  return (product) => matches(product.kind);
};
const has = (...phrases) => {
  const matches = anyPhrase(phrases);
  return (product) => matches(product.details);
};
const also = (...rules) => (product) => rules.every((rule) => rule(product));
const either = (...rules) => (product) => rules.some((rule) => rule(product));
const not = (rule) => (product) => !rule(product);
const attribute = (name, value) => (product) => clean(product.attributes[name]) === clean(value);
const minimum = (name, value) => (product) => Number(product.attributes[name]) >= value;
const item = (id, label, match = has(label)) => ({ id, label, match });
const options = (...rows) => rows.map(([id, label, ...aliases]) => item(id, label, has(label, ...aliases)));
const group = (id, label, types, children = []) => ({ id, label, match: ofType(label, ...types), children });
const excludeTypes = (family, ...types) => ({ ...family, match: also(family.match, not(ofType(...types))) });

export const DEPARTMENTS = [
  {
    id: 'tecnologia', label: 'Tecnología', icon: 'laptop',
    groups: [
      group('notebooks', 'Notebooks', ['notebook', 'laptop', 'ultrabook', 'portátil', 'portátiles', 'workstation móvil', 'macbook'], [
        item('gamer', 'Gamer', either(has('gamer', 'gaming'), attribute('gpuType', 'Dedicada'))),
        item('trabajo-estudio', 'Trabajo y estudios', has('trabajo', 'estudio', 'estudios', 'oficina', 'ultrabook', 'dev', 'workstation móvil')),
        ...options(['convertibles', 'Convertibles (2 en 1)', 'convertible', '2 en 1', '2-in-1'], ['macbook-air', 'MacBook Air'], ['macbook-pro', 'MacBook Pro'], ['macbook-neo', 'MacBook Neo']),
      ]),
      group('celulares', 'Celulares', ['celular', 'smartphone', 'smartphones', 'teléfono móvil', 'iphone', 'galaxy', 'redmi', 'moto g'], options(
        ['5g', 'Equipos 5G', '5g'], ['iphone', 'iPhone'], ['samsung', 'Samsung', 'galaxy'], ['motorola', 'Motorola', 'moto g'], ['xiaomi', 'Xiaomi', 'redmi'],
      )),
      group('iphone', 'iPhone', ['iphones'], [
        ...options(['17', 'iPhone 17'], ['17e', 'iPhone 17e']),
        item('18-pro', 'iPhone 18 Pro', also(has('iPhone 18 Pro'), not(has('iPhone 18 Pro Max')))),
        ...options(['18-pro-max', 'iPhone 18 Pro Max'], ['air', 'iPhone Air']),
      ]),
      group('consolas', 'Consolas', ['consola', 'handheld', 'nintendo switch', 'playstation', 'ps5', 'xbox', 'steam deck', 'rog ally', 'legion go'], [
        item('switch', 'Switch', also(has('switch'), not(has('switch 2')))),
        ...options(['switch-2', 'Switch 2'], ['ps5', 'PlayStation 5', 'ps5'], ['xbox-series-x', 'Xbox Series X'], ['handheld', 'PCs de mano / handheld', 'steam deck', 'rog ally', 'legion go', 'handheld']),
      ]),
      group('tablets', 'Tablets', ['tablet', 'tableta', 'tabletas', 'ipad', 'galaxy tab'], options(
        ['ipad', 'iPad'], ['ipad-air', 'iPad Air'], ['ipad-pro', 'iPad Pro'], ['ipad-mini', 'iPad Mini'], ['samsung', 'Samsung'], ['lenovo', 'Lenovo'], ['xiaomi', 'Xiaomi'],
      )),
      group('wearables', 'Wearables', ['wearable', 'smartwatch', 'smartwatches', 'reloj inteligente', 'fitness tracker', 'pulsera inteligente'], options(
        ['smartwatches', 'Smartwatches', 'smartwatch', 'reloj inteligente'], ['fitness-trackers', 'Fitness trackers', 'fitness tracker', 'pulsera inteligente'],
      )),
      group('televisores', 'Televisores', ['televisor', 'smart tv', 'tv'], options(['led', 'LED'], ['oled', 'OLED'], ['qled', 'QLED'], ['qned', 'QNED'])),
      group('audio', 'Audio', ['parlante', 'parlantes', 'altavoz', 'altavoces', 'soundbar', 'barra de sonido', 'micrófono', 'micrófonos'], [
        item('bluetooth', 'Parlantes Bluetooth', also(ofType('parlante', 'parlantes', 'altavoz', 'altavoces'), has('bluetooth'))),
        item('karaoke', 'Parlantes Karaoke', also(ofType('parlante', 'parlantes', 'altavoz', 'altavoces'), has('karaoke'))),
        ...options(['soundbars', 'Soundbars', 'soundbar', 'barra de sonido'], ['parlantes-pc', 'Parlantes PC', 'parlante pc', 'parlante para pc'], ['tradicionales', 'Parlantes tradicionales', 'parlante tradicional']),
        item('microfonos', 'Micrófonos', ofType('micrófono', 'micrófonos')),
      ]),
      group('audifonos', 'Audífonos', ['audífono', 'auricular', 'auriculares', 'airpods', 'headset', 'headsets'], options(
        ['airpods', 'AirPods / AirPods Pro', 'airpods'], ['tws', 'True wireless (TWS)', 'true wireless', 'tws'],
        ['airpods-max', 'AirPods Max'], ['headsets', 'Headsets', 'headset'], ['deportivos', 'Deportivos', 'deportivo', 'deportiva'],
      )),
      group('all-in-one', 'All-in-One', ['all in one', 'all in ones', 'todo en uno', 'imac'], options(['imac', 'iMac'])),
      group('aire-acondicionado', 'Aire acondicionado', ['aires acondicionados', 'aire acondicionado portátil', 'purificador de aire'], options(
        ['portatiles', 'Portátiles', 'portátil'], ['split', 'Split'], ['purificadores', 'Purificadores de aire', 'purificador de aire'],
      )),
      group('camaras', 'Cámaras de seguridad / IP', ['cámara de seguridad', 'cámaras de seguridad', 'cámara ip', 'cámaras ip', 'videovigilancia'], options(
        ['interior', 'Interior'], ['exterior', 'Exterior'],
      )),
    ],
  },
  {
    id: 'electrohogar', label: 'ElectroHogar', icon: 'package',
    groups: [
      group('refrigeradores', 'Refrigeradores', ['refrigerador', 'nevera', 'heladera', 'freezer', 'congelador'], [
        ...options(['top-freezer', 'Top Freezer'], ['bottom-freezer', 'Bottom Freezer'], ['side-by-side', 'Side by Side'], ['french-door', 'French Door']),
        item('freezer', 'Freezer', also(ofType('freezer', 'congelador'), not(has('top freezer', 'bottom freezer')))),
      ]),
      group('lavado', 'Lavado y planchado', ['lavadora', 'lavadoras', 'secadora', 'secadoras', 'lavasecadora', 'lavavajillas', 'plancha de ropa'], options(
        ['lavadoras', 'Lavadoras automáticas', 'lavadora automática', 'lavadora'], ['secadoras', 'Secadoras', 'secadora'],
        ['lavasecadoras', 'Lavadoras y secadoras', 'lavasecadora'], ['lavavajillas', 'Lavavajillas'], ['planchas', 'Planchas', 'plancha de ropa'],
      )),
      group('hornos', 'Hornos y microondas', ['horno', 'hornos', 'microondas'], options(['hornos', 'Hornos', 'horno'], ['microondas', 'Microondas'])),
      group('aspiradoras', 'Aspiradoras', ['aspiradora', 'robot aspirador'], options(['arrastre', 'De arrastre'], ['robot', 'Robot', 'robot aspirador'], ['verticales', 'Verticales', 'vertical'])),
      group('agua-caliente', 'Calefones y termos', ['calefón', 'calefones', 'termo', 'termos', 'termotanque'], options(['calefones', 'Calefones', 'calefón'], ['termos', 'Termos', 'termo', 'termotanque'])),
      group('estufas', 'Estufas', ['estufa', 'termoventilador', 'termoventiladores', 'calefactor'], options(
        ['termoventiladores', 'Termoventiladores', 'termoventilador'], ['gas-licuado', 'Estufas a gas licuado', 'gas licuado'],
        ['gas-natural', 'Estufas a gas natural', 'gas natural'], ['parafina', 'Estufas a parafina', 'parafina'],
        ['lena', 'Estufas a leña', 'leña'], ['pellet', 'Estufas a pellet', 'pellet'],
      )),
      group('cocinas', 'Cocinas y encimeras', ['cocina', 'cocinas', 'encimera', 'encimeras'], options(
        ['cocina-gas-licuado', 'Cocinas gas licuado', 'cocina gas licuado'], ['cocina-gas-natural', 'Cocinas gas natural', 'cocina gas natural'],
        ['encimera-gas-licuado', 'Encimeras gas licuado', 'encimera gas licuado'], ['encimera-gas-natural', 'Encimeras gas natural', 'encimera gas natural'],
        ['vitroceramicas', 'Encimeras vitrocerámicas', 'vitrocerámica'], ['induccion', 'Encimeras inducción', 'inducción'],
      )),
      group('electrodomesticos', 'Electrodomésticos', ['freidora', 'hervidor', 'licuadora', 'parrilla eléctrica', 'robot de cocina', 'tostador', 'tostadora'], options(
        ['freidoras', 'Freidoras de aire', 'freidora de aire', 'air fryer'], ['hervidores', 'Hervidores', 'hervidor'],
        ['licuadoras', 'Licuadoras', 'licuadora'], ['parrillas', 'Parrillas eléctricas', 'parrilla eléctrica'],
        ['robots', 'Robots de cocina', 'robot de cocina'], ['tostadores', 'Tostadores', 'tostador', 'tostadora'], ['otros', 'Otros', 'otro electrodoméstico'],
      )),
      group('cafeteras', 'Cafeteras', ['cafetera'], options(
        ['espresso', 'Cafeteras de espresso', 'espresso'], ['filtro', 'Cafeteras de filtro', 'cafetera de filtro'],
        ['capsulas', 'Cafeteras con cápsulas', 'cápsulas', 'cápsula'], ['automaticas', 'Cafeteras full automáticas', 'automática'],
      )),
      group('ollas', 'Ollas eléctricas', ['olla eléctrica', 'arrocera', 'multiolla', 'olla de cocción lenta'], options(
        ['arroceras', 'Arroceras', 'arrocera'], ['multiollas', 'Multiollas', 'multiolla'], ['coccion-lenta', 'Ollas de cocción lenta', 'cocción lenta'],
      )),
      group('batidoras', 'Batidoras', ['batidora'], options(['mano', 'Batidoras de mano', 'de mano'], ['pedestal', 'Batidoras de pedestal', 'pedestal'])),
      group('jugos', 'Exprimidores y sacajugos', ['exprimidor', 'exprimidores', 'sacajugos', 'extractor de jugos'], options(['exprimidores', 'Exprimidores', 'exprimidor'], ['sacajugos', 'Sacajugos', 'extractor de jugos'])),
      group('procesadores-alimentos', 'Preparadores de alimentos', ['minipimer', 'picadora', 'procesador de alimentos', 'procesadores de alimentos'], options(
        ['minipimers', 'Minipimers', 'minipimer'], ['picadoras', 'Picadoras', 'picadora'], ['procesadores', 'Procesadores de alimentos', 'procesador de alimentos'],
      )),
      group('sandwiches', 'Sandwicheras y wafleras', ['sandwichera', 'sandwicheras', 'waflera', 'wafleras'], options(['sandwicheras', 'Sandwicheras', 'sandwichera'], ['wafleras', 'Wafleras', 'waflera'])),
    ],
  },
  {
    id: 'computacion', label: 'Computación', icon: 'cpu',
    groups: [
      group('graficas', 'Tarjetas de video', ['tarjeta de video', 'tarjeta gráfica', 'tarjetas gráficas', 'gpu'], options(
        ['nvidia', 'NVIDIA GeForce', 'nvidia', 'geforce', 'rtx', 'gtx'], ['amd', 'AMD Radeon', 'amd', 'radeon'],
      )),
      group('procesadores', 'Procesadores', ['procesador', 'cpu'], options(['intel', 'Intel', 'core i3', 'core i5', 'core i7', 'core i9', 'xeon'], ['amd', 'AMD', 'ryzen', 'epyc'])),
      group('placas-madre', 'Placas madre', ['placa madre', 'placa base', 'motherboard'], options(
        ['intel-1700', 'Intel 1700', 'lga 1700'], ['intel-1851', 'Intel 1851', 'lga 1851'], ['amd-am4', 'AMD AM4', 'am4'], ['amd-am5', 'AMD AM5', 'am5'],
      )),
      group('ram', 'RAM', ['memoria ram', 'kit memoria ram', 'memoria ddr4', 'memoria ddr5'], [
        item('ddr4-desktop', 'DDR4 Desktop', also(has('ddr4'), has('desktop', 'udimm', 'dimm', 'escritorio'))),
        item('ddr5-desktop', 'DDR5 Desktop', also(has('ddr5'), has('desktop', 'udimm', 'dimm', 'escritorio'))),
        item('ddr4-notebook', 'DDR4 Notebook', also(has('ddr4'), has('notebook', 'sodimm', 'so dimm'))),
        item('ddr5-notebook', 'DDR5 Notebook', also(has('ddr5'), has('notebook', 'sodimm', 'so dimm'))),
      ]),
      group('discos-duros', 'Discos duros', ['disco duro', 'hdd'], options(['desktop', 'Desktop', 'escritorio', '3.5'], ['notebook', 'Notebook', '2.5', '2,5'])),
      group('ssd', 'SSD', ['nvme', 'unidad estado sólido', 'unidad de estado sólido'], [
        item('sata-25', '2,5″ SATA', also(has('sata'), has('2.5', '2,5'))),
        item('m2-sata', 'M.2 SATA', also(has('m.2'), has('sata'))),
        item('m2-nvme', 'M.2 PCIe NVMe', has('nvme')),
      ]),
      group('gabinetes', 'Gabinetes', ['gabinete', 'case pc', 'chasis pc'], options(
        ['mini-itx', 'Mini ITX'], ['micro-atx', 'Micro ATX', 'matx'],
      ).concat(item('atx', 'ATX', also(has('atx'), not(has('micro atx', 'matx')))))),
      group('fuentes', 'Fuentes de poder', ['fuente de poder', 'fuente de alimentación', 'psu'], options(
        ['certificadas', 'Certificadas', 'certificada', '80 plus'], ['modulares', 'Modulares', 'modular'],
      )),
      group('mouse', 'Mouse', ['ratón', 'ratones', 'mouses'], options(['opticos', 'Ópticos', 'óptico'], ['laser', 'Láser'], ['inalambricos', 'Inalámbricos', 'inalámbrico', 'wireless'])),
      group('teclados', 'Teclados', ['teclado'], options(['mecanicos', 'Mecánicos', 'mecánico'], ['inalambricos', 'Inalámbricos', 'inalámbrico', 'wireless'])),
      group('cooler', 'Cooler CPU', ['cooler', 'disipador cpu', 'refrigeración líquida'], options(
        ['aire', 'Por aire', 'disipador', 'cooler aire'], ['liquida', 'Refrigeración líquida', 'aio'],
      )),
      group('ventiladores', 'Ventiladores', ['ventilador pc', 'ventilador', 'fan pc'], options(['120-mm', '120 mm', '120mm'], ['140-mm', '140 mm', '140mm'])),
      group('combos', 'Combos teclado y mouse', ['combo teclado mouse', 'combo teclado y mouse', 'kit teclado mouse'], options(['inalambricos', 'Inalámbricos', 'inalámbrico', 'wireless'])),
      excludeTypes(group('monitores', 'Monitores', ['monitor', 'pantalla pc'], [
        item('144hz', 'De 144 Hz o más', minimum('refreshHz', 144)),
        ...options(['freesync', 'Con FreeSync', 'freesync'], ['gsync', 'Con G-Sync', 'g-sync', 'gsync']),
      ]), 'audífono', 'audífonos', 'auricular', 'auriculares', 'headset'),
      group('sillas', 'Sillas gamer', ['silla gamer', 'silla gaming']),
      group('impresoras', 'Impresoras', ['impresora', 'multifuncional', 'tóner', 'cartucho de tinta'], [
        item('tinta', 'Tinta', has('tinta', 'inkjet')),
        item('laser-monocromatica', 'Láser blanco y negro', also(has('láser'), has('blanco y negro', 'monocromática'))),
        item('laser-color', 'Láser color', also(has('láser'), has('color'))),
        ...options(['multifuncionales', 'Multifuncionales', 'multifuncional'], ['consumibles', 'Tintas y tóners', 'tinta', 'tóner', 'cartucho']),
      ]),
      group('proyectores', 'Proyectores', ['proyector'], options(['lampara', 'Lámpara'], ['laser', 'Láser'], ['led', 'LED'])),
      group('redes', 'Conectividad y redes', ['router', 'routers', 'switch gestionable', 'switch de red', 'switches', 'access point', 'repetidor wi-fi', 'adaptador de red'], options(
        ['routers', 'Routers', 'router'], ['switches', 'Switches', 'switch'], ['access-points', 'Access points', 'access point'],
        ['repetidores', 'Repetidores Wi-Fi', 'repetidor wi-fi', 'repetidor wifi'], ['adaptadores', 'Adaptadores de red', 'adaptador de red'],
      )),
      group('accesorios', 'Accesorios', ['accesorio', 'disco duro externo', 'pendrive', 'tarjeta de memoria', 'ups', 'lector dvd', 'lector blu-ray'], options(
        ['discos-externos', 'Discos duros externos', 'disco duro externo'], ['pendrives', 'Pendrives', 'pendrive'],
        ['memorias', 'Tarjetas de memoria', 'tarjeta de memoria'], ['ups', 'UPS'], ['lectores', 'Lectores de DVD y Blu-ray', 'lector dvd', 'lector blu-ray'],
      )),
      group('equipos', 'Computadores de escritorio', ['computador de escritorio', 'pc de escritorio', 'mini pc'], options(['mini-pc', 'Mini PC'])),
      group('servidores', 'Servidores', ['servidor'], options(['rack', 'Rack'])),
    ],
  },
  {
    id: 'cuidado-personal', label: 'Perfumería y Cuidado personal', icon: 'star',
    groups: [
      group('perfumes', 'Perfumes, colonias y fragancias', ['perfume', 'perfumes', 'colonia', 'fragancia', 'eau de parfum', 'eau de toilette']),
      group('cabello', 'Dispositivos para el cabello', ['secador de pelo', 'secador de cabello', 'alisador', 'ondulador', 'styler'], options(
        ['secadores', 'Secadores de pelo', 'secador de pelo', 'secador de cabello'], ['alisadores', 'Alisadores', 'alisador'],
        ['onduladores', 'Onduladores', 'ondulador'], ['styler', 'Styler'],
      )),
    ],
  },
];

const sections = new Map();
for (const department of DEPARTMENTS) {
  const root = { id: department.id, label: department.label };
  sections.set(root.id, { ...root, departmentId: root.id, trail: [root], match: (product) => department.groups.some(({ match }) => match(product)) });
  for (const family of department.groups) {
    const parent = { id: root.id + '/' + family.id, label: family.label };
    sections.set(parent.id, { ...parent, departmentId: root.id, trail: [root, parent], match: family.match });
    for (const child of family.children) {
      const leaf = { id: parent.id + '/' + child.id, label: child.label };
      sections.set(leaf.id, { ...leaf, departmentId: root.id, trail: [root, parent, leaf], match: also(family.match, child.match) });
    }
  }
}

export const catalogHref = (id) => id ? '#/catalogo?seccion=' + encodeURIComponent(id) : '#/catalogo';
export const getCatalogSection = (id) => sections.get(id) ?? null;

const contextCache = new WeakMap();
function catalogContext(product) {
  if (!contextCache.has(product)) {
    const kind = clean(String(product.tipo ?? '').trim() || product.nombre);
    const name = product.catalogoDemo ? product.nombre.split(' (')[0] : product.nombre;
    const attributes = productAttributes(product);
    const details = product.catalogoDemo
      ? [name, product.tipo, ...Object.values(attributes)]
      : [name, product.tipo, product.descripcion, product.fichaTecnica, ...Object.values(attributes)];
    contextCache.set(product, { kind: ' ' + kind + ' ', details: ' ' + clean(details.join(' ')) + ' ', attributes });
  }
  return contextCache.get(product);
}

export function matchesCatalogSection(product, section) {
  return !section || section.match(catalogContext(product));
}
