import { normalize } from '../utils/format.js';

const field = (key, label, mode = 'exact', unit = '', source) => ({ key, label, mode, unit, source });
export const SPEC_FIELDS = [
  field('brand', 'Marca'), field('series', 'Línea o serie'), field('kind', 'Tipo de producto'), field('weightKg', 'Peso máximo', 'max', 'kg'),
  field('cpuBrand', 'Marca del procesador'), field('cpuLine', 'Línea del procesador'), field('cpuModel', 'Modelo del procesador'),
  field('cores', 'Núcleos mínimos', 'min'), field('threads', 'Hilos mínimos', 'min'), field('cpuClass', 'Tipo de procesador'),
  field('cpuSocket', 'Socket'), field('cpuBoostGHz', 'Frecuencia boost mínima', 'min', 'GHz'),
  field('ramGb', 'Cantidad mínima de RAM', 'min', 'GB'), field('ramCapacity', 'Capacidad exacta', 'exact', 'GB', 'ramGb'),
  field('ramType', 'Tipo de RAM'), field('ramChannels', 'Canales de RAM'), field('ramFormat', 'Formato'),
  field('ramModules', 'Cantidad de módulos'), field('ramSpeed', 'Velocidad mínima', 'min', 'MT/s'),
  field('ramClock', 'Frecuencia mínima', 'min', 'MHz'), field('ramVoltage', 'Voltaje máximo', 'max', 'V'),
  field('ramCl', 'Latencia CAS máxima', 'max', 'CL'), field('ramEcc', 'Soporte ECC'),
  field('ramHeatsink', 'Disipador'), field('ramFullBuffer', 'Soporte Full Buffer'),
  field('displayInches', 'Tamaño mínimo', 'min', '″'), field('panel', 'Tipo de pantalla'), field('displayShape', 'Formato de pantalla'),
  field('resolution', 'Resolución mínima', 'min', 'p'), field('refreshHz', 'Tasa de refresco mínima', 'min', 'Hz'),
  field('touch', 'Pantalla táctil'), field('rotating', 'Pantalla rotatoria'),
  field('gpuType', 'Tipo de gráfica'), field('gpuBrand', 'Marca de la gráfica'), field('gpuLine', 'Línea de la gráfica'),
  field('gpuModel', 'Modelo de la gráfica'), field('vramGb', 'VRAM mínima', 'min', 'GB'), field('vramType', 'Tipo de memoria de video'),
  field('vramBusBits', 'Ancho de bus mínimo', 'min', 'bits'), field('gpuArchitecture', 'Arquitectura'),
  field('gpuArchitectureFamily', 'Familia de arquitectura'), field('pcieVersion', 'Versión PCI Express'),
  field('pcieLanes', 'Carriles mínimos', 'min'), field('gpuProfile', 'Perfil de tarjeta'), field('gpuCooling', 'Refrigeración'),
  field('gpuSlots', 'Ranuras máximas', 'max'), field('gpuLength', 'Largo máximo', 'max', 'mm'), field('rgb', 'Iluminación RGB'),
  field('gpuBenchmark', 'Puntaje mínimo 3DMark Time Spy', 'min'),
  field('storageGb', 'Capacidad mínima', 'min', 'storage'), field('storageType', 'Tipo de almacenamiento'), field('rpm', 'RPM mínimas', 'min', 'RPM'),
  field('storageFormat', 'Formato de unidad'), field('storageInterface', 'Interfaz'),
  field('readMBps', 'Lectura mínima', 'min', 'MB/s'), field('writeMBps', 'Escritura mínima', 'min', 'MB/s'),
  field('os', 'Sistema operativo'), field('osVersion', 'Versión del sistema'), field('keyboard', 'Idioma del teclado'),
  field('fingerprint', 'Lector de huellas'), field('ports', 'Puerto'),
  field('connection', 'Conectividad'), field('keySwitch', 'Tipo de switch'), field('keyLayout', 'Distribución'),
  field('hotSwap', 'Switches intercambiables'), field('dpi', 'Sensibilidad mínima', 'min', 'DPI'),
  field('noiseCancel', 'Cancelación activa de ruido'), field('boardChipset', 'Chipset'), field('boardFormat', 'Formato de placa'),
  field('networkSpeed', 'Velocidad mínima', 'min', 'Gb/s'), field('networkPorts', 'Puertos mínimos', 'min'), field('poe', 'PoE'),
  field('volumeL', 'Capacidad mínima', 'min', 'L'), field('energyClass', 'Clase de eficiencia energética'),
];
const byKey = new Map(SPEC_FIELDS.map((definition) => [definition.key, definition]));
const group = (id, label, keys) => ({
  id, label, fields: keys.map((key) => typeof key === 'string' ? byKey.get(key) : { ...byKey.get(key[0]), label: key[1] }),
});
const general = (...keys) => group('general', 'General', ['brand', 'series', ...keys]);
const data = (...keys) => group('general', 'Datos generales', ['brand', 'series', ...keys]);
const cpu = group('cpu', 'Procesador', ['cpuBrand', 'cpuLine', 'cpuModel', 'cores', 'threads', 'cpuClass', 'cpuBoostGHz']);
const ram = group('ram', 'RAM', ['ramGb', 'ramType', 'ramChannels']);
const display = group('display', 'Pantalla', ['displayInches', 'panel', 'displayShape', 'resolution', 'refreshHz', 'touch', 'rotating']);
const gpu = group('gpu', 'Tarjeta de video', ['gpuType', 'gpuBrand', 'gpuLine', 'gpuModel', 'vramGb', 'vramType']);
const storage = group('storage', 'Almacenamiento', ['storageGb', 'storageType', 'rpm']);
const other = group('other', 'Otros', ['os', 'osVersion', 'keyboard', 'fingerprint', 'ports']);
const computer = [general('weightKg'), cpu, ram, gpu, storage, other];
const profile = (id, label, pattern, sections, groups, example) => ({
  id, label, pattern, sections, groups, example,
  fields: groups.flatMap(({ fields }) => fields),
  attributeKeys: new Set(groups.flatMap(({ fields }) => fields.map(({ key, source }) => source || key))),
});

export const GENERAL_PROFILE = profile('general', null, null, [], [general()]);
export const PRODUCT_PROFILES = [
  profile('notebook', 'Notebooks', /\b(?:notebooks?|laptops?|ultrabooks?|portatil(?:es)?|workstation movil|macbook(?:s)?)\b/, ['tecnologia/notebooks'],
    [general('weightKg'), cpu, ram, display, gpu, storage, other], 'Intel Core i7-13700H, 16 GB RAM DDR5, SSD 512 GB, pantalla IPS 144 Hz'),
  profile('desktop', 'Computadores de escritorio', /\b(?:mini pcs?|pcs? (?:de escritorio|gamer)|computador(?:a|es)? de escritorio|all in one|imac)\b/,
    ['computacion/equipos', 'tecnologia/all-in-one'], computer),
  profile('server', 'Servidores', /\bservidor(?:es)?\b/, ['computacion/servidores'], computer),
  profile('graphics', 'Tarjetas de video', /\b(?:tarjetas? (?:de video|graficas?)|gpus?|memoria de video|vram)\b/, ['computacion/graficas'], [
    data(['gpuBrand', 'Fabricante del chip']),
    group('gpu', 'GPU', [['gpuLine', 'Línea de GPU'], ['gpuModel', 'Modelo de GPU'], 'gpuBenchmark']),
    group('memory', 'Memoria de video', [['vramGb', 'Capacidad mínima de VRAM'], 'vramType', 'vramBusBits']),
    group('architecture', 'Arquitectura', ['gpuArchitecture', 'gpuArchitectureFamily']),
    group('bus', 'Bus', ['pcieVersion', 'pcieLanes']),
    group('other', 'Otros', ['gpuProfile', 'gpuCooling', 'gpuSlots', 'rgb', 'gpuLength', 'ports']),
  ], 'NVIDIA RTX 4060, VRAM: 8 GB GDDR6, bus de memoria: 128 bits, PCIe 4.0 x8, largo: 200 mm'),
  profile('memory', 'Memorias RAM', /\b(?:memorias? (?:ram|ddr[345])|ram)\b/, ['computacion/ram'], [
    data(['ramGb', 'Capacidad total mínima'], 'ramCapacity', 'ramModules'),
    group('specifications', 'Especificaciones', ['ramType', 'ramFormat', 'ramSpeed', 'ramClock', 'ramVoltage', 'ramChannels']),
    group('advanced', 'Avanzado', ['ramHeatsink', 'ramCl', 'ramEcc', 'ramFullBuffer', 'rgb']),
  ], '2×8 GB DDR4 DIMM, 3200 MT/s, 1,35 V, CL16, ECC: no, Disipador: sí'),
  profile('cpu', 'Procesadores', /\b(?:procesador(?:es)?(?! de alimentos)|cpus?)\b/, ['computacion/procesadores'],
    [general(), group('cpu', 'Procesador', [...cpu.fields.map(({ key }) => key), 'cpuSocket'])]),
  profile('motherboard', 'Placas madre', /\b(?:placas? (?:madre|base)|motherboards?)\b/, ['computacion/placas-madre'],
    [general(), group('board', 'Placa madre', ['cpuSocket', 'boardChipset', 'boardFormat', 'ramType', 'ports'])]),
  profile('ssd', 'Unidades SSD', /\b(?:ssds?|unidades? (?:nvme|de estado solido|estado solido))\b/, ['computacion/ssd'],
    [general(), group('storage', 'Almacenamiento', ['storageGb', 'storageType', 'storageFormat', 'storageInterface', 'readMBps', 'writeMBps'])]),
  profile('hdd', 'Discos duros', /\b(?:discos? duros?|hdds?)\b/, ['computacion/discos-duros'],
    [general(), group('storage', 'Almacenamiento', ['storageGb', 'storageFormat', 'storageInterface', 'rpm'])]),
  profile('headphones', 'Audífonos', /\b(?:audifonos?|auriculares?|headsets?|airpods)\b/, ['tecnologia/audifonos'],
    [general('weightKg'), group('audio', 'Audio', ['connection', 'noiseCancel', 'ports'])]),
  profile('monitor', 'Monitores', /\b(?:monitor(?:es)?|pantallas? (?:pc|para pc))\b/, ['computacion/monitores'],
    [general(), display, group('other', 'Conexiones', ['ports'])]),
  profile('tv', 'Televisores', /\b(?:televisor(?:es)?|smart tv|tvs?)\b/, ['tecnologia/televisores'],
    [general(), display, group('other', 'Conexiones y sistema', ['ports', 'os', 'osVersion'])]),
  profile('phone', 'Celulares', /\b(?:celulares?|smartphones?|telefonos? moviles?|iphones?|galaxy s\d+|redmi)\b/, ['tecnologia/celulares', 'tecnologia/iphone'],
    [general('weightKg'), display, cpu, ram, storage, other]),
  profile('tablet', 'Tablets', /\b(?:tablets?|tabletas?|ipads?|galaxy tab)\b/, ['tecnologia/tablets'],
    [general('weightKg'), display, cpu, ram, storage, other]),
  profile('keyboard', 'Teclados', /\bteclados?\b/, ['computacion/teclados'],
    [general(), group('keyboard', 'Teclado', ['keySwitch', 'keyLayout', 'keyboard', 'connection', 'hotSwap', 'rgb'])]),
  profile('mouse', 'Mouse', /\b(?:mouse|mouses|raton(?:es)?)\b/, ['computacion/mouse'],
    [general('weightKg'), group('mouse', 'Mouse', ['connection', 'dpi', 'rgb'])]),
  profile('network', 'Equipos de red', /\b(?:switch gestionable|switch de red|router(?:s)?|access point|repetidor wi fi)\b/, ['computacion/redes'],
    [general(), group('network', 'Red y puertos', ['networkSpeed', 'networkPorts', 'poe', 'ports'])]),
  profile('microphone', 'Micrófonos', /\bmicrofonos?\b/, [],
    [general(), group('audio', 'Audio', ['connection', 'ports'])]),
  profile('fridge', 'Refrigeradores', /\b(?:refrigerador(?:es)?|neveras?|heladeras?|freezer|congelador(?:es)?)\b/, ['electrohogar/refrigeradores'],
    [general(), group('appliance', 'Capacidad y consumo', ['volumeL', 'energyClass'])]),
];

const sectionProfiles = new Map(PRODUCT_PROFILES.flatMap((entry) => entry.sections.map((id) => [id, entry])));
const cachedProfiles = new WeakMap();
export const normalizeSearch = (value) => normalize(value).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
export function matchProfile(text) {
  let best = null;
  for (const profile of PRODUCT_PROFILES) {
    const match = text.match(profile.pattern);
    if (match && (!best || match.index < best.match.index)) best = { profile, match };
  }
  return best;
}

export function profileHint(text, named) {
  if ((!named || named.profile.id === 'notebook' && named.match.index > 0) &&
    /^\bddr[345]\s+(?:dimm|so dimm|sodimm|udimm|rdimm|desktop|escritorio|notebook)\b/.test(text)) return profileForId('memory');
  if (!named && /\b(?:geforce|radeon|rtx(?:\s*\d{3,4})?|gtx(?:\s*\d{3,4})?|rx\s*\d{3,4}|arc\s*[ab]?\d{3})\b/.test(text)) return profileForId('graphics');
  return null;
}

export function profileForProduct(product) {
  if (!cachedProfiles.has(product)) {
    const declared = product.tipo ? matchProfile(normalizeSearch(product.tipo)) : null;
    if (declared || product.catalogoDemo) {
      cachedProfiles.set(product, declared?.profile ?? GENERAL_PROFILE);
      return cachedProfiles.get(product);
    }
    const name = normalizeSearch(product.nombre || '');
    const named = matchProfile(name);
    cachedProfiles.set(product, profileHint(name, named) ?? named?.profile ?? GENERAL_PROFILE);
  }
  return cachedProfiles.get(product);
}

export function profileForSection(section) {
  return sectionProfiles.get(section?.trail?.[1]?.id) ?? null;
}

export const profileForId = (id) => PRODUCT_PROFILES.find((profile) => profile.id === id) ?? null;
