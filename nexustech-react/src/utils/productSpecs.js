import { profileForProduct, SPEC_FIELDS } from '../data/filterProfiles.js';
import { formatNumber } from './format.js';

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
  if (definition.unit === 'CL') return 'CL' + formatNumber(Number(value));
  if (definition.unit) return formatNumber(Number(value)) + ' ' + definition.unit;
  return String(value);
}

function parseTechnicalText(text, profile) {
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
  put('cpuSocket', text.match(/\b(?:AM[45]|LGA\s*(?:1200|1700|1851))\b/i)?.[0].toUpperCase().replace(/LGA\s*/, 'LGA '));
  put('cpuBoostGHz', number((text.match(/\bboost\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*GHz\b/i)
    || text.match(/\b(\d+(?:[.,]\d+)?)\s*GHz\s*boost\b/i))?.[1]));

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
  if (profile === 'memory') {
    const kit = text.match(/\b(\d{1,2})\s*[x×]\s*(\d{1,3})\s*GB\b/i);
    const total = text.match(/\b(?:capacidad(?: total)?|total)\s*[:=]\s*(\d{1,4})\s*GB\b/i);
    const standalone = text.match(/\b(\d{1,4})\s*GB\b(?!\s*(?:SSD|HDD|NVMe|VRAM|GDDR))/i);
    put('ramGb', total ? number(total[1]) : kit ? Number(kit[1]) * Number(kit[2]) : number(standalone?.[1]));
    put('ramModules', number(kit?.[1] || text.match(/\b(\d{1,2})\s*m[oó]dulos?\b/i)?.[1]));
    const format = text.match(/\b(SO[\s-]?DIMM|RDIMM|UDIMM|DIMM)\b/i)?.[1];
    if (format) put('ramFormat', /^SO/i.test(format) ? 'SO-DIMM' : /^(?:U)?DIMM$/i.test(format) ? 'DIMM' : format.toUpperCase());
    put('ramSpeed', number((text.match(/\b(\d{3,5})\s*MT\/s\b/i) || text.match(/\bDDR[345]\s*-\s*(\d{3,5})\b/i))?.[1]));
    put('ramClock', number(text.match(/\b(\d{3,5})\s*MHz\b/i)?.[1]));
    put('ramVoltage', number(text.match(/\b(\d+(?:[.,]\d+)?)\s*(?:V|voltios)\b/i)?.[1]));
    put('ramCl', number(text.match(/\b(?:CL|CAS)\s*[:=]?\s*(\d{1,3})\b/i)?.[1]));
    put('ramEcc', yesNo(text, /\b(?:soporte\s+)?ECC\s*[:=]\s*(s[ií]|no)\b/i)
      || (/\b(?:non[- ]|sin\s+)ECC\b/i.test(text) ? 'No' : /\bECC\b/i.test(text) ? 'Sí' : undefined));
    put('ramHeatsink', yesNo(text, /\bdisipador\s*[:=]\s*(s[ií]|no)\b/i));
    put('ramFullBuffer', yesNo(text, /\bfull buffer\s*[:=]\s*(s[ií]|no)\b/i));
  }

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
  put('vramType', text.match(/\b(?:GDDR[4567]X?|HBM[23]E?)\b/i)?.[0].toUpperCase());
  const videoCapacity = text.match(/\bVRAM\s*[:=]?\s*(\d+)\s*GB\b/i) || text.match(/\b(\d+)\s*GB\s*(?:VRAM|GDDR[4567]X?|HBM[23]E?)\b/i);
  put('vramGb', number(videoCapacity?.[1]));
  if (profile === 'graphics') {
    put('gpuBrand', attributes.gpuBrand || text.match(/\b(?:fabricante del chip|GPU)\s*[:=]\s*(NVIDIA|AMD|Intel)\b/i)?.[1]);
    put('vramBusBits', number(text.match(/\b(?:bus(?: de memoria)?\s*[:=]?\s*)?(\d{2,4})\s*bits\b/i)?.[1]));
    const pcie = text.match(/\bPCI(?:\s*Express|e)\s*(?:Gen(?:eraci[oó]n)?\s*)?(\d(?:[.,]\d)?)(?:\s*[x×]\s*(1|2|4|8|16)\b)?/i);
    put('pcieVersion', pcie ? 'PCIe ' + pcie[1].replace(',', '.') + (pcie[1].length === 1 ? '.0' : '') : undefined);
    put('pcieLanes', number(pcie?.[2]));
    put('gpuArchitecture', shortText(text.match(/\barquitectura\s*[:=]\s*([^,\n;|]+)/i)?.[1]));
    put('gpuArchitectureFamily', shortText(text.match(/\bfamilia(?: de arquitectura)?\s*[:=]\s*([^,\n;|]+)/i)?.[1]));
    const cooling = text.match(/\brefrigeraci[oó]n\s*[:=]\s*(pasiva|activa|por aire|l[ií]quida)\b/i)?.[1];
    put('gpuCooling', cooling ? cooling[0].toUpperCase() + cooling.slice(1).toLowerCase() : undefined);
    put('gpuProfile', /\b(?:bajo perfil|low profile)\b/i.test(text) ? 'Bajo perfil'
      : /\bperfil\s*[:=]\s*est[aá]ndar\b/i.test(text) ? 'Estándar' : undefined);
    put('gpuLength', number(text.match(/\b(?:largo|longitud)\s*[:=]?\s*(\d{2,3}(?:[.,]\d+)?)\s*mm\b/i)?.[1]));
    put('gpuSlots', number(text.match(/\b(\d(?:[.,]\d+)?)\s*(?:ranuras|slots)\b/i)?.[1]));
    put('gpuBenchmark', number(text.match(/\b(?:3DMark\s+)?Time Spy\s*[:=]\s*(\d{3,6})\b/i)?.[1]));
  }

  const storage = text.match(/\b(\d+(?:[.,]\d+)?)\s*(GB|TB)\s*(?:de\s+)?(NVMe|SSD|HDD|eMMC)\b/i);
  const reverseStorage = text.match(/\b(NVMe|SSD|HDD|eMMC)\s*(?:de\s+)?(\d+(?:[.,]\d+)?)\s*(GB|TB)\b/i);
  const storageType = storage?.[3] || reverseStorage?.[1] || text.match(/\b(NVMe|SSD|HDD|eMMC)\b/i)?.[1];
  if (storageType) {
    put('storageGb', storage ? capacityGb(storage[1], storage[2]) : reverseStorage ? capacityGb(reverseStorage[2], reverseStorage[3]) : undefined);
    put('storageType', { NVME: 'NVMe', EMMC: 'eMMC' }[storageType.toUpperCase()] || storageType.toUpperCase());
  }
  put('rpm', number(text.match(/\b(\d{3,5})\s*RPM\b/i)?.[1]));
  if (profile === 'ssd' || profile === 'hdd') {
    const genericCapacity = text.match(/\b(\d+(?:[.,]\d+)?)\s*(GB|TB)\b/i);
    if (genericCapacity && !attributes.storageGb) put('storageGb', capacityGb(genericCapacity[1], genericCapacity[2]));
    const driveFormat = text.match(/\bM[.-]2\b/i)?.[0] || text.match(/\b(?:2[.,]5|3[.,]5)(?=\s*(?:pulgadas|["″]))/i)?.[0];
    put('storageFormat', driveFormat ? (/^M/i.test(driveFormat) ? 'M.2' : driveFormat.replace('.', ',') + '″') : undefined);
    put('storageInterface', /\bNVMe\b/i.test(text) ? 'NVMe' : /\bSATA\b/i.test(text) ? 'SATA' : undefined);
    for (const [key, pattern] of [
      ['readMBps', /(?:lectura|read)(?: secuencial)?\s*[:=]?\s*(\d{2,5})\s*MB\/s\b|\b(\d{2,5})\s*MB\/s\s*(?:de\s+)?lectura\b/i],
      ['writeMBps', /(?:escritura|write)(?: secuencial)?\s*[:=]?\s*(\d{2,5})\s*MB\/s\b|\b(\d{2,5})\s*MB\/s\s*(?:de\s+)?escritura\b/i],
    ]) {
      const speed = text.match(pattern);
      put(key, number(speed?.[1] || speed?.[2]));
    }
  }

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
  const connection = [
    [/\bBluetooth\b/i, 'Bluetooth'], [/\b(?:inal[aá]mbric[oa]|wireless|2[.,]4\s*GHz)\b/i, 'Inalámbrica'],
    [/\b(?:USB|cablead[oa]|con cable)\b/i, 'Por cable'],
  ].filter(([pattern]) => pattern.test(text)).map(([, label]) => label);
  put('connection', connection);
  const colorSwitch = text.match(/\b(?:switch(?:es)?\s+)?(linear red|cherry mx red|cherry mx brown|cherry mx blue|lineal(?:es)?|t[aá]ctil(?:es)?|clicky)\b/i)?.[1];
  if (colorSwitch) put('keySwitch', colorSwitch[0].toUpperCase() + colorSwitch.slice(1).toLowerCase());
  put('keyLayout', text.match(/\b(?:TKL|full size|60%|65%|75%)(?=\W|$)/i)?.[0].toUpperCase());
  put('hotSwap', yesNo(text, /\bhot[- ]swap\s*[:=]\s*(s[ií]|no)\b/i)
    || (/\bhot[- ]swap\b/i.test(text) ? 'Sí' : undefined));
  put('rgb', yesNo(text, /\bRGB\s*[:=]\s*(s[ií]|no)\b/i) || (/\bRGB\b/i.test(text) ? 'Sí' : undefined));
  put('dpi', number(text.match(/\b(\d{2,6})\s*DPI\b/i)?.[1]));
  put('noiseCancel', yesNo(text, /\b(?:ANC|cancelaci[oó]n activa(?: de ruido)?)\s*[:=]\s*(s[ií]|no)\b/i)
    || (/\b(?:ANC|cancelaci[oó]n activa)\b/i.test(text) ? 'Sí' : undefined));
  put('boardChipset', text.match(/\b(?:chipset\s*[:=]?\s*)?([ABHZ]\d{3}[EM]?)\b/i)?.[1].toUpperCase());
  const board = text.match(/\b(Micro[- ]ATX|mATX|Mini[- ]ITX|E[- ]ATX|ATX)\b/i)?.[1];
  put('boardFormat', board && (/^(?:micro|mATX)/i.test(board) ? 'Micro ATX' : /^mini/i.test(board) ? 'Mini ITX' : board.toUpperCase()));
  put('networkSpeed', number(text.match(/\b(\d+(?:[.,]\d+)?)\s*(?:Gb\/s|Gbps|G\s*SFP)\b/i)?.[1]));
  put('networkPorts', number(text.match(/\b(\d{1,3})\s*puertos\b/i)?.[1]));
  put('poe', yesNo(text, /\bPoE\+?\s*[:=]\s*(s[ií]|no)\b/i) || (/\bPoE\b/i.test(text) ? 'Sí' : undefined));
  put('volumeL', number(text.match(/\b(\d{1,4}(?:[.,]\d+)?)\s*(?:litros|L)\b/i)?.[1]));
  put('energyClass', text.match(/\b(?:clase(?: energ[eé]tica)?|eficiencia energ[eé]tica)\s*[:=]?\s*([A-G](?:\+{1,3})?)(?=\s|[,;\n]|$)/i)?.[1].toUpperCase());
  const ports = [
    [/\bUSB[- ]?C\b/i, 'USB-C'], [/\bUSB[- ]?A\b/i, 'USB-A'], [/\bThunderbolt\b/i, 'Thunderbolt'],
    [/\bHDMI\b/i, 'HDMI'], [/\bDisplayPort\b/i, 'DisplayPort'], [/\bRJ[- ]?45\b/i, 'RJ-45'],
    [/\bSFP\+/i, 'SFP+'], [/\bPoE\+/i, 'PoE+'],
  ].filter(([pattern]) => pattern.test(text)).map(([, label]) => label);
  put('ports', ports);
  return attributes;
}

function applicable(attributes, profile) {
  return Object.fromEntries(Object.entries(attributes).filter(([key]) => profile.attributeKeys.has(key)));
}

function demoSpecs(product, profile) {
  if (product.especificaciones) return applicable(product.especificaciones, profile);
  const key = product.tipo + '\0' + product.fichaTecnica;
  if (!demoCache.has(key)) {
    // Los textos históricos se combinan entre familias; solo se toma lo aplicable.
    demoCache.set(key, applicable(parseTechnicalText(product.fichaTecnica + '\n' + product.tipo, profile.id), profile));
  }
  return demoCache.get(key);
}

export function productAttributes(product) {
  if (!cache.has(product)) {
    const profile = profileForProduct(product);
    const isDemo = product.catalogoDemo === true && typeof product.tipo === 'string' && typeof product.fichaTecnica === 'string';
    const declared = [product.fichaTecnica, product.tipo, product.nombre, product.descripcion].filter(Boolean).join('\n');
    const parsed = isDemo ? demoSpecs(product, profile) : parseTechnicalText(declared, profile.id);
    cache.set(product, {
      ...(isDemo || profile.id === 'general' ? parsed : applicable(parsed, profile)),
      brand: shortText(product.marca), series: shortText(product.linea), kind: shortText(product.tipo),
    });
  }
  return cache.get(product);
}

export function productSpecRows(product) {
  const attributes = productAttributes(product);
  return SPEC_FIELDS.filter(({ key, source }) => !source && attributes[key] !== undefined).map((definition) => {
    const value = attributes[definition.key];
    const label = definition.label.replace(/\bm(?:[ií]nim|[aá]xim)[oa]s?\b/gi, '').replace(/\s+/g, ' ').trim();
    return { key: definition.key, label, value: (Array.isArray(value) ? value : [value]).map((item) => formatSpecValue(definition, item)).join(', ') };
  });
}

export function productSpecHighlights(product) {
  const id = profileForProduct(product).id;
  if (id !== 'memory' && id !== 'graphics') return [];
  const a = productAttributes(product);
  return (id === 'memory'
    ? [a.ramGb && formatNumber(a.ramGb) + ' GB', [a.ramType, a.ramFormat].filter(Boolean).join(' · '),
      a.ramSpeed ? formatNumber(a.ramSpeed) + ' MT/s' : a.ramClock && formatNumber(a.ramClock) + ' MHz']
    : [a.gpuModel, a.vramGb && formatNumber(a.vramGb) + ' GB' + (a.vramType ? ' ' + a.vramType : ' VRAM'),
      a.pcieVersion && a.pcieVersion + (a.pcieLanes ? ' x' + a.pcieLanes : '')]).filter(Boolean);
}
