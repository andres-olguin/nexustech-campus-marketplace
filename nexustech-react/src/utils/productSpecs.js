import { formatNumber, normalize } from './format.js';

const field = (key, label, mode = 'exact', unit = '') => ({ key, label, mode, unit });
export const SPEC_GROUPS = [
  { id: 'general', label: 'General', fields: [
    field('brand', 'Marca'), field('series', 'Línea o serie'), field('kind', 'Tipo de producto'), field('weightKg', 'Peso máximo', 'max', 'kg'),
  ] },
  { id: 'cpu', label: 'Procesador', fields: [
    field('cpuBrand', 'Marca del procesador'), field('cpuLine', 'Línea del procesador'), field('cpuModel', 'Modelo del procesador'),
    field('cores', 'Núcleos mínimos', 'min'), field('threads', 'Hilos mínimos', 'min'), field('cpuClass', 'Tipo de procesador'),
  ] },
  { id: 'ram', label: 'RAM', fields: [
    field('ramGb', 'Cantidad mínima de RAM', 'min', 'GB'), field('ramType', 'Tipo de RAM'), field('ramChannels', 'Canales de RAM'),
  ] },
  { id: 'display', label: 'Pantalla', fields: [
    field('displayInches', 'Tamaño mínimo', 'min', '″'), field('panel', 'Tipo de pantalla'), field('displayShape', 'Formato de pantalla'),
    field('resolution', 'Resolución mínima', 'min', 'p'), field('refreshHz', 'Tasa de refresco mínima', 'min', 'Hz'),
    field('touch', 'Pantalla táctil'), field('rotating', 'Pantalla rotatoria'),
  ] },
  { id: 'gpu', label: 'Tarjeta de video', fields: [
    field('gpuType', 'Tipo de gráfica'), field('gpuBrand', 'Marca de la gráfica'), field('gpuLine', 'Línea de la gráfica'),
    field('gpuModel', 'Modelo de la gráfica'), field('vramGb', 'VRAM mínima', 'min', 'GB'),
  ] },
  { id: 'storage', label: 'Almacenamiento', fields: [
    field('storageGb', 'Capacidad mínima', 'min', 'storage'), field('storageType', 'Tipo de almacenamiento'), field('rpm', 'RPM mínimas', 'min', 'RPM'),
  ] },
  { id: 'other', label: 'Otros', fields: [
    field('os', 'Sistema operativo'), field('osVersion', 'Versión del sistema'), field('keyboard', 'Idioma del teclado'),
    field('fingerprint', 'Lector de huellas'), field('ports', 'Puerto'),
  ] },
];
export const SPEC_FIELDS = SPEC_GROUPS.flatMap((group) => group.fields);

const cache = new WeakMap();
const demoCache = new Map();
const number = (value) => value ? Number(value.replace(',', '.')) : undefined;
const shortText = (value) => typeof value === 'string' ? value.trim().slice(0, 80) || undefined : undefined;
const optionText = (value) => value.trim().replace(/\s+/g, ' ');
const capacityGb = (amount, unit) => number(amount) * (unit.toUpperCase() === 'TB' ? 1000 : 1);
const yesNo = (text, pattern) => {
  const value = text.match(pattern)?.[1];
  return value ? (value.toLowerCase() === 'no' ? 'No' : 'Sí') : undefined;
};

export function formatSpecValue(definition, value) {
  if (definition.unit === 'storage') {
    return Number(value) >= 1000 ? formatNumber(Number(value) / 1000) + ' TB' : formatNumber(Number(value)) + ' GB';
  }
  if (definition.unit === 'p') {
    return { 2160: '2160p (4K)', 1440: '1440p (QHD)', 1080: '1080p (Full HD)', 720: '720p (HD)' }[value] || value + 'p';
  }
  if (definition.unit === '″') return formatNumber(Number(value)) + '″';
  if (definition.unit) return formatNumber(Number(value)) + ' ' + definition.unit;
  return String(value);
}

function parseTechnicalText(text) {
  const attributes = {};
  const put = (key, value) => {
    if (typeof value === 'string' && value || typeof value === 'number' && Number.isFinite(value) && value > 0 || Array.isArray(value) && value.length) {
      attributes[key] = value;
    }
  };

  put('weightKg', number(text.match(/\b(\d+(?:[.,]\d+)?)\s*kg\b/i)?.[1]));
  put('cores', number(text.match(/\b(\d{1,3})\s*(?:cores|n[uú]cleos)\b/i)?.[1]));
  put('threads', number(text.match(/\b(\d{1,3})\s*(?:threads|hilos)\b/i)?.[1]));
  if (/\b(?:multi[- ]?core|multin[uú]cleo)\b/i.test(text)) put('cpuClass', 'Multinúcleo');

  const intel = text.match(/\b(?:Intel\s+)?(Core\s+(?:Ultra\s+)?(?:i[3579]|[3579])|Xeon|Celeron|Pentium)(?:[\s-]+([A-Z]{0,2}\d[\w-]*))?\b/i);
  const amd = text.match(/\b(?:AMD\s+)?(Ryzen\s+(?:[3579]|Threadripper)|EPYC|Athlon)(?:\s+([A-Z]{0,2}\d[\w-]*))?\b/i);
  const apple = text.match(/\bApple\s+(M\d+)(?:\s+(Pro|Max|Ultra))?\b/i);
  if (intel || amd || apple) {
    const match = intel || amd || apple;
    const line = optionText(match[1]);
    put('cpuBrand', intel ? 'Intel' : amd ? 'AMD' : 'Apple');
    put('cpuLine', apple ? 'Apple M' : line);
    put('cpuModel', match[2] ? line + ' ' + (apple ? match[2] : match[2].toUpperCase()) : apple ? line : undefined);
  }

  const ram = text.match(/\b(\d+(?:[.,]\d+)?)\s*GB\s*(?:de\s+)?(?:RAM\b|(?:LP)?DDR[345]X?\b)/i)
    || text.match(/\bRAM\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*GB\b/i);
  put('ramGb', number(ram?.[1]));
  put('ramType', text.match(/\b(?:LP)?DDR[345]X?\b/i)?.[0].toUpperCase());
  if (/\bdual channel\b/i.test(text)) put('ramChannels', 'Dual Channel');

  put('displayInches', number(text.match(/\b(\d{1,2}(?:[.,]\d+)?)\s*(?:pulgadas\b|pulg\.|["″])/i)?.[1]));
  const panel = text.match(/\b(OLED|IPS|Mini[- ]LED)\b/i)?.[1] || text.match(/\b(?:pantalla|panel)\s+(VA|TN)\b/i)?.[1];
  put('panel', panel ? panel.toUpperCase().replace('MINI-LED', 'MINI LED') : undefined);
  if (/\b(?:monitor|pantalla)\s+curv[ao]\b/i.test(text)) put('displayShape', 'Curva');
  else if (/\b(?:monitor|pantalla)\s+plan[ao]\b/i.test(text)) put('displayShape', 'Plana');
  const pixels = text.match(/\b\d{3,4}\s*[x×]\s*(\d{3,4})\b/i)?.[1] || text.match(/\b(720|1080|1440|2160)\s*p\b/i)?.[1];
  const resolution = pixels ? Number(pixels) : /\b(?:4K|UHD)\b/i.test(text) ? 2160
    : /\b(?:QHD|2K)\b/i.test(text) ? 1440 : /\b(?:FHD|Full\s*HD)\b/i.test(text) ? 1080 : undefined;
  put('resolution', resolution);
  put('refreshHz', number(text.match(/\b(\d{2,3})\s*Hz\b/i)?.[1]));
  put('touch', yesNo(text, /\b(?:pantalla\s+)?t[aá]ctil\s*[:=]\s*(s[ií]|no)\b/i));
  put('rotating', yesNo(text, /\b(?:pantalla\s+)?rotatoria\s*[:=]\s*(s[ií]|no)\b/i));

  const gpu = text.match(/\b(RTX|GTX|RX|ARC)\s*([AB]?\d{3,4})(?:\s+(Ti(?:\s+Super)?|Super|XTX|XT))?\b/i);
  if (gpu) {
    const line = gpu[1].toUpperCase();
    put('gpuType', 'Dedicada');
    put('gpuBrand', line === 'RX' ? 'AMD' : line === 'ARC' ? 'Intel' : 'NVIDIA');
    put('gpuLine', line === 'RX' ? 'Radeon RX' : line === 'ARC' ? 'Intel Arc' : 'GeForce ' + line);
    put('gpuModel', [line, gpu[2].toUpperCase(), gpu[3]?.toUpperCase()].filter(Boolean).join(' '));
    put('vramGb', number(text.slice(gpu.index + gpu[0].length).match(/^\s+(\d+)\s*GB\b/i)?.[1]));
  } else if (/\b(?:gr[aá]fica|GPU|video)\s+integrad[ao]\b/i.test(text)) {
    put('gpuType', 'Integrada');
  } else if (/\btarjeta gr[aá]fica\b/i.test(text)) {
    put('gpuType', 'Dedicada');
  }
  put('vramGb', number(text.match(/\b(\d+)\s*GB\s*(?:VRAM|GDDR[456]X?)\b/i)?.[1]));

  const storage = text.match(/\b(\d+(?:[.,]\d+)?)\s*(GB|TB)\s*(?:de\s+)?(NVMe|SSD|HDD|eMMC)\b/i);
  const reverseStorage = text.match(/\b(NVMe|SSD|HDD|eMMC)\s*(?:de\s+)?(\d+(?:[.,]\d+)?)\s*(GB|TB)\b/i);
  const storageType = storage?.[3] || reverseStorage?.[1] || text.match(/\b(NVMe|SSD|HDD|eMMC)\b/i)?.[1];
  if (storageType) {
    put('storageGb', storage ? capacityGb(storage[1], storage[2]) : reverseStorage ? capacityGb(reverseStorage[2], reverseStorage[3]) : undefined);
    put('storageType', { NVME: 'NVMe', EMMC: 'eMMC' }[storageType.toUpperCase()] || storageType.toUpperCase());
  }
  put('rpm', number(text.match(/\b(\d{3,5})\s*RPM\b/i)?.[1]));

  const windows = text.match(/\bWindows\s+(10|11)(?:\s+(Home|Pro|Enterprise))?\b/i);
  const linux = text.match(/\b(Ubuntu|Debian|Fedora)\b(?:\s+(\d+(?:\.\d+)*))?/i);
  const mac = text.match(/\bmacOS\b(?:\s+(\d+(?:\.\d+)*))?/i);
  if (/\bsin\s+sistema\s+operativo\b/i.test(text)) put('os', 'Sin sistema operativo');
  else if (windows) { put('os', 'Windows'); put('osVersion', optionText(windows[0])); }
  else if (linux || /\bLinux\b/i.test(text)) { put('os', 'Linux'); put('osVersion', linux?.[0]); }
  else if (mac) { put('os', 'macOS'); put('osVersion', mac[1] && mac[0]); }
  else if (/\bChromeOS\b/i.test(text)) put('os', 'ChromeOS');

  const keyboard = text.match(/\b(?:idioma del teclado|teclado(?:\s+en)?)\s*[:=]?\s*(Espa[ñn]ol(?: latinoamericano)?|Ingl[eé]s|Latinoamericano|Portugu[eé]s)\b/i)?.[1];
  put('keyboard', keyboard ? keyboard[0].toUpperCase() + keyboard.slice(1).toLowerCase() : undefined);
  put('fingerprint', yesNo(text, /\b(?:lector de )?huellas\s*[:=]\s*(s[ií]|no)\b/i));
  const ports = [
    [/\bUSB[- ]?C\b/i, 'USB-C'], [/\bUSB[- ]?A\b/i, 'USB-A'], [/\bThunderbolt\b/i, 'Thunderbolt'],
    [/\bHDMI\b/i, 'HDMI'], [/\bDisplayPort\b/i, 'DisplayPort'], [/\bRJ[- ]?45\b/i, 'RJ-45'],
    [/\bSFP\+/i, 'SFP+'], [/\bPoE\+/i, 'PoE+'],
  ].filter(([pattern]) => pattern.test(text)).map(([, label]) => label);
  put('ports', ports);
  return attributes;
}

function demoSpecs(product) {
  const key = product.tipo + '\0' + product.fichaTecnica;
  if (!demoCache.has(key)) {
    const parsed = parseTechnicalText(product.fichaTecnica + '\n' + product.tipo);
    const kind = normalize(product.tipo);
    const system = product.categoria === 'Workstations' || kind.includes('servidor');
    const allowed = new Set([
      'general',
      ...(system || kind.includes('procesador') ? ['cpu'] : []),
      ...(system || kind.includes('memoria ram') ? ['ram'] : []),
      ...(system || kind.includes('gpu') ? ['gpu'] : []),
      ...(system || kind.includes('nvme') ? ['storage'] : []),
      ...(kind.includes('laptop') || kind.includes('movil') || kind.includes('monitor') ? ['display'] : []),
      ...(system || kind.includes('switch') ? ['other'] : []),
    ]);
    // La demo original combina textos entre familias: no se toma como RAM
    // o pantalla de un teclado una especificación que no corresponde a su tipo.
    demoCache.set(key, Object.fromEntries(
      SPEC_GROUPS.filter((group) => allowed.has(group.id)).flatMap((group) => group.fields)
        .filter(({ key: name }) => parsed[name] !== undefined).map(({ key: name }) => [name, parsed[name]])
    ));
  }
  return demoCache.get(key);
}

export function productAttributes(product) {
  if (!cache.has(product)) {
    const isDemo = product.catalogoDemo === true && typeof product.tipo === 'string' && typeof product.fichaTecnica === 'string';
    const declared = [product.fichaTecnica, product.tipo, product.nombre, product.descripcion].filter(Boolean).join('\n');
    cache.set(product, {
      ...(isDemo ? demoSpecs(product) : parseTechnicalText(declared)),
      brand: shortText(product.marca), series: shortText(product.linea), kind: shortText(product.tipo),
    });
  }
  return cache.get(product);
}

export function productSpecRows(product) {
  const attributes = productAttributes(product);
  return SPEC_FIELDS.filter(({ key }) => attributes[key] !== undefined).map((definition) => {
    const value = attributes[definition.key];
    const label = definition.label.replace(/\b(m[ií]nimo|m[ií]nima|m[ií]nimos|m[ií]nimas|m[aá]ximo)\b/gi, '').replace(/\s+/g, ' ').trim();
    return { key: definition.key, label, value: (Array.isArray(value) ? value : [value]).map((item) => formatSpecValue(definition, item)).join(', ') };
  });
}
