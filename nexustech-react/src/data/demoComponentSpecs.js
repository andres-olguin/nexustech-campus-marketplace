// Variantes ficticias para probar el catálogo y sus filtros.
// Los valores no son especificaciones de una publicación comercial.
const memory = [
  // GB totales, tipo, formato, módulos, MT/s, V, CL, disipador, ECC
  [8, 'DDR4', 'DIMM', 1, 2666, 1.2, 19, 'No', 'No'],
  [16, 'DDR4', 'DIMM', 2, 3200, 1.35, 16, 'Sí', 'No'],
  [32, 'DDR4', 'DIMM', 2, 3600, 1.35, 18, 'Sí', 'No'],
  [32, 'DDR4', 'RDIMM', 2, 3200, 1.2, 22, 'No', 'Sí'],
  [8, 'DDR4', 'SO-DIMM', 1, 2666, 1.2, 19, 'No', 'No'],
  [16, 'DDR4', 'SO-DIMM', 2, 3200, 1.2, 22, 'No', 'No'],
  [16, 'DDR5', 'DIMM', 2, 4800, 1.1, 40, 'No', 'No'],
  [32, 'DDR5', 'DIMM', 2, 5600, 1.25, 36, 'Sí', 'No'],
  [64, 'DDR5', 'DIMM', 2, 6000, 1.35, 32, 'Sí', 'No'],
  [16, 'DDR5', 'SO-DIMM', 1, 4800, 1.1, 40, 'No', 'No'],
  [32, 'DDR5', 'SO-DIMM', 2, 5600, 1.1, 46, 'No', 'No'],
].map(([ramGb, ramType, ramFormat, ramModules, ramSpeed, ramVoltage, ramCl, ramHeatsink, ramEcc], i) => ({
  ramGb, ramType, ramFormat, ramModules, ramSpeed, ramVoltage, ramCl, ramHeatsink, ramEcc,
  ramClock: ramSpeed / 2, ramFullBuffer: 'No', rgb: i === 2 || i === 8 ? 'Sí' : 'No',
}));

const graphics = [
  // Chip, línea, modelo, GB VRAM, tipo, bits, arquitectura, familia, bus, carriles, mm, ranuras, perfil, RGB
  ['NVIDIA', 'GeForce GTX', 'GTX 1650', 4, 'GDDR6', 128, 'Turing', 'TU11x', 'PCIe 3.0', 16, 168, 2, 'Bajo perfil', 'No'],
  ['NVIDIA', 'GeForce RTX', 'RTX 3060', 12, 'GDDR6', 192, 'Ampere', 'GA10x', 'PCIe 4.0', 16, 242, 2, 'Estándar', 'No'],
  ['NVIDIA', 'GeForce RTX', 'RTX 4060', 8, 'GDDR6', 128, 'Ada Lovelace', 'AD10x', 'PCIe 4.0', 8, 200, 2, 'Estándar', 'No'],
  ['NVIDIA', 'GeForce RTX', 'RTX 4080', 16, 'GDDR6X', 256, 'Ada Lovelace', 'AD10x', 'PCIe 4.0', 16, 304, 3, 'Estándar', 'Sí'],
  ['NVIDIA', 'GeForce RTX', 'RTX 5070', 12, 'GDDR7', 192, 'Blackwell', 'GB20x', 'PCIe 5.0', 16, 252, 2, 'Estándar', 'Sí'],
  ['AMD', 'Radeon RX', 'RX 7600', 8, 'GDDR6', 128, 'RDNA 3', 'Navi 33', 'PCIe 4.0', 8, 204, 2, 'Estándar', 'No'],
  ['AMD', 'Radeon RX', 'RX 7800 XT', 16, 'GDDR6', 256, 'RDNA 3', 'Navi 32', 'PCIe 4.0', 16, 267, 2.5, 'Estándar', 'Sí'],
  ['Intel', 'Intel Arc', 'ARC A380', 6, 'GDDR6', 96, 'Xe HPG', 'Alchemist', 'PCIe 4.0', 8, 169, 2, 'Bajo perfil', 'No'],
].map(([gpuBrand, gpuLine, gpuModel, vramGb, vramType, vramBusBits, gpuArchitecture, gpuArchitectureFamily,
  pcieVersion, pcieLanes, gpuLength, gpuSlots, gpuProfile, rgb], i) => ({
  gpuBrand, gpuLine, gpuModel, vramGb, vramType, vramBusBits, gpuArchitecture, gpuArchitectureFamily,
  pcieVersion, pcieLanes, gpuLength, gpuSlots, gpuProfile, rgb,
  gpuCooling: i === 3 ? 'Líquida' : 'Por aire', ports: ['HDMI', 'DisplayPort'],
}));

export function demoComponentSpecs(kind, variation) {
  if (kind === 'Kit Memoria RAM Dual Channel') {
    const specs = memory[variation % memory.length];
    return { specs, title: specs.ramGb + ' GB ' + specs.ramType + ' ' + specs.ramFormat + ' · ' + specs.ramSpeed + ' MT/s' };
  }
  if (kind === 'Tarjeta Gráfica GPU') {
    const specs = graphics[variation % graphics.length];
    return { specs, title: specs.gpuModel + ' · ' + specs.vramGb + ' GB ' + specs.vramType };
  }
  return null;
}
