export const PHOTO_URLS = {
  laptopPro: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
  laptopDark: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80",
  ultrabook: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80",
  laptopSilver: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80",
  laptopDev: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&q=80",
  miniPc: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80",
  gpuRig: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=80",
  cpuChip: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&q=80",
  ssdStorage: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=80",
  ramModules: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&q=80",
  rackServer: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80",
  networkSwitch: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80",
  motherboard: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80",
  headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
  keyboard: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80",
  monitor: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
  mouse: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80",
  microphone: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80",
  analytics: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80",
  tabletWeb: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80",
  tabletTouch: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&q=80",
};
/* Los 21 archivos .jpg son fotografías obtenidas de Unsplash y conservadas
 * localmente para que la demo académica funcione sin Internet.
 * 41 claves de catálogo se asignan a la foto de temática más próxima.
 * No representan el modelo exacto ni el estado de un equipo a la venta. */
export const PHOTO_REMAP = {
  smartphone: "tabletTouch", smartphonePro: "tabletTouch",
  printer: "analytics", printer3d: "analytics", scannerLabeler: "analytics",
  charger: "motherboard", powerbank: "tabletTouch", webcam: "monitor",
  psuCooling: "gpuRig", pcCase: "miniPc", accessories: "motherboard",
  speaker: "headphones", hddExternal: "ssdStorage", pendriveSd: "ssdStorage",
  monitorUltrawide: "monitor", monitorPortable: "monitor",
  routerWifi: "networkSwitch", networkTools: "rackServer",
  laptopStand: "laptopSilver", laptopBag: "laptopSilver",
  toolsElectronics: "motherboard", tabletEreader: "tabletTouch",
};
export function photoUrlForKey(key) {
  return PHOTO_URLS[key] || PHOTO_URLS[PHOTO_REMAP[key]] || PHOTO_URLS.analytics;
}


/* Fotos gratuitas nuevas de Unsplash; son representativas, no imagen real
   del artículo anunciado. Para las imágenes nuevas se necesita Internet;
   ProductImage conserva un JPEG local de respaldo. */
export const MORE_PHOTOS = {
  router: "https://images.unsplash.com/photo-1750710583720-8b3bdd0f658a?w=500&q=78",
  bag: "https://images.unsplash.com/photo-1535982330050-f1c2fb79ff78?w=500&q=78",
  stand: "https://images.unsplash.com/photo-1658869402195-9f0ea192ecd5?w=500&q=78",
  ram: "https://images.unsplash.com/photo-1676554565685-3aeb5d7ad1b7?w=500&q=78",
  tower: "https://images.unsplash.com/photo-1754330895399-e84cb0d48014?w=500&q=78",
  keyboard1: "https://images.unsplash.com/photo-1760656523257-4f89c1e41fb1?w=500&q=78",
  keyboard2: "https://images.unsplash.com/photo-1762117643785-f05364c2f44d?w=500&q=78",
  monitor: "https://images.unsplash.com/photo-1661226829497-54e210957b46?w=500&q=78",
  desk: "https://images.unsplash.com/photo-1738676524296-364cf18900a8?w=500&q=78",
  mainboard: "https://images.unsplash.com/photo-1760708528862-c07b820354c6?w=500&q=78",
  ssd: "https://images.unsplash.com/photo-1669480380758-4b163a33f6f9?w=500&q=78",
  phone: "https://images.unsplash.com/photo-1772683748238-95a91b0f7f43?w=500&q=78",
  charger1: "https://images.unsplash.com/photo-1770417999831-1c070eb628e6?w=500&q=78",
  mouse1: "https://images.unsplash.com/photo-1754330895458-0bb117ce54a5?w=500&q=78",
  headset1: "https://images.unsplash.com/photo-1697652974624-470e68497990?w=500&q=78",
  headset2: "https://images.unsplash.com/photo-1690988109078-f76b74e1a551?w=500&q=78",
  charger2: "https://images.unsplash.com/photo-1706290134049-c5c72d24146a?w=500&q=78",
  printer: "https://images.unsplash.com/photo-1648949300454-143ad1f9d6c2?w=500&q=78",
  printer3d: "https://images.unsplash.com/photo-1756723901890-4d8a4b4cddaf?w=500&q=78",
  mouse2: "https://images.unsplash.com/photo-1707592691247-5c3a1c7ba0e3?w=500&q=78",
  powerbank: "https://images.unsplash.com/photo-1557767382-97b28f5488e7?w=500&q=78",
  mic: "https://images.unsplash.com/photo-1568074510392-dcb94ca46c4d?w=500&q=78",
  charger3: "https://images.unsplash.com/photo-1725304382197-663ae3864750?w=500&q=78",
  ethernet: "https://images.unsplash.com/photo-1691435828932-911a7801adfb?w=500&q=78",
  bag2: "https://images.unsplash.com/photo-1668114844900-537ab91478b9?w=500&q=78",
  switch: "https://images.unsplash.com/photo-1698668975271-2ba9a323be6b?w=500&q=78",
};
const Q = PHOTO_URLS, N = MORE_PHOTOS;
const GROUPS = {
  laptopPro: [Q.laptopPro,Q.laptopDark,Q.ultrabook,Q.laptopSilver,Q.laptopDev,N.desk],
  laptopDark: [Q.laptopDark,Q.laptopDev,Q.laptopSilver,Q.ultrabook,Q.laptopPro,N.desk],
  ultrabook: [Q.ultrabook,Q.laptopSilver,Q.laptopPro,Q.laptopDev,Q.laptopDark,N.desk],
  laptopSilver: [Q.laptopSilver,Q.laptopDark,Q.ultrabook,Q.laptopDev,Q.laptopPro,N.desk],
  laptopDev: [Q.laptopDev,Q.laptopPro,Q.laptopSilver,Q.laptopDark,Q.ultrabook,N.desk],
  laptopStand: [N.stand,Q.laptopSilver,N.desk],
  laptopBag: [N.bag,N.bag2,Q.laptopSilver],
  miniPc: [Q.miniPc,N.tower,Q.laptopDev,Q.motherboard],
  gpuRig: [Q.gpuRig,N.tower,N.mainboard,Q.miniPc],
  cpuChip: [Q.cpuChip,N.mainboard,Q.motherboard,N.tower],
  ramModules: [N.ram,Q.ramModules,N.tower,Q.motherboard],
  motherboard: [N.mainboard,Q.motherboard,N.tower,Q.cpuChip],
  psuCooling: [N.tower,Q.gpuRig,Q.motherboard],
  pcCase: [N.tower,Q.miniPc,Q.gpuRig],
  ssdStorage: [N.ssd,Q.ssdStorage,Q.ramModules],
  hddExternal: [Q.ssdStorage,N.ssd,Q.rackServer],
  pendriveSd: [N.ssd,Q.ssdStorage,Q.ramModules],
  monitor: [Q.monitor,N.monitor,N.desk,Q.analytics],
  monitorUltrawide: [N.monitor,Q.monitor,N.desk],
  monitorPortable: [N.desk,Q.monitor,N.monitor],
  keyboard: [N.keyboard1,Q.keyboard,N.keyboard2,N.desk],
  mouse: [N.mouse2,Q.mouse,N.mouse1],
  headphones: [N.headset1,Q.headphones,N.headset2],
  microphone: [N.mic,Q.microphone,N.desk],
  speaker: [N.phone,Q.headphones,N.headset1],
  webcam: [Q.monitor,N.desk,N.monitor],
  printer: [N.printer,Q.analytics,N.printer3d],
  printer3d: [N.printer3d,N.printer,Q.analytics],
  scannerLabeler: [N.printer,Q.analytics,N.printer3d],
  charger: [N.charger1,N.charger2,N.charger3],
  powerbank: [N.powerbank,N.phone,Q.tabletTouch],
  smartphone: [N.phone,N.powerbank,Q.tabletTouch,Q.tabletWeb],
  smartphonePro: [N.phone,Q.tabletTouch,N.powerbank,Q.tabletWeb],
  tabletWeb: [Q.tabletWeb,Q.tabletTouch,N.phone,N.desk],
  tabletTouch: [Q.tabletTouch,Q.tabletWeb,N.phone,N.desk],
  tabletEreader: [Q.tabletTouch,Q.tabletWeb,N.phone],
  routerWifi: [N.router,Q.networkSwitch,N.ethernet,Q.rackServer],
  networkSwitch: [N.switch,N.ethernet,Q.networkSwitch,Q.rackServer],
  networkTools: [N.ethernet,Q.rackServer,N.switch,Q.networkSwitch],
  rackServer: [Q.rackServer,N.switch,N.ethernet,Q.networkSwitch],
  accessories: [N.charger1,N.stand,Q.motherboard,N.charger2],
  toolsElectronics: [Q.motherboard,N.mainboard,N.charger2],
  analytics: [Q.analytics,N.desk,Q.monitor,N.printer]
};
function categoryKeyFor(item) {
  const n = String(item.name||"").normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase();
  if (/mochila|backpack|bolso/.test(n)) return "laptopBag";
  if (/soporte de notebook|soporte para laptop|base elevadora/.test(n)) return "laptopStand";
  if (/cargador|adaptador de corriente/.test(n)) return "charger";
  if (/powerbank|bateria externa|bateria portatil/.test(n)) return "powerbank";
  if (/kit de red|adaptador de red|cable de red|ethernet|rj45/.test(n)) return "networkTools";
  if (/router|wifi 6|punto de acceso/.test(n)) return "routerWifi";
  if (/switch de red/.test(n)) return "networkSwitch";
  if (/impresora 3d/.test(n)) return "printer3d";
  if (/impresora|escaner/.test(n)) return "printer";
  if (/teclado/.test(n)) return "keyboard";
  if (/mouse|raton/.test(n)) return "mouse";
  if (/audifon|auricular/.test(n)) return "headphones";
  if (/microfono/.test(n)) return "microphone";
  if (/webcam|camara web/.test(n)) return "webcam";
  if (/monitor ultrawide/.test(n)) return "monitorUltrawide";
  if (/monitor/.test(n)) return "monitor";
  if (/smartphone|telefono|celular/.test(n)) return "smartphone";
  if (/tablet|ipad|ebook/.test(n)) return "tabletTouch";
  if (/memoria ram|ddr[345]/.test(n)) return "ramModules";
  if (/tarjeta de video|grafica|gpu|rtx|geforce/.test(n)) return "gpuRig";
  if (/nvme|ssd|disco duro|hdd/.test(n)) return "ssdStorage";
  if (/placa madre|motherboard/.test(n)) return "motherboard";
  if (/procesador|ryzen|intel core/.test(n)) return "cpuChip";
  return item.imgKey || "analytics";
}
function stableHash(s) {
  let n = 2166136261;
  for (const c of s) n = Math.imul(n ^ c.codePointAt(0),16777619)>>>0;
  return n;
}
export function photoUrlForItem(item, index=0, recent=[]) {
  const key=categoryKeyFor(item);
  const options=GROUPS[key] || GROUPS[PHOTO_REMAP[key]] || GROUPS.analytics;
  const start=stableHash(String(item.id||item.name)+":"+index)%options.length;
  for(let j=0;j<options.length;j++) {
    const url=options[(start+j)%options.length];
    if(!recent.includes(url)) return url;
  }
  return [...Object.values(PHOTO_URLS),...Object.values(MORE_PHOTOS)]
    .find(url=>!recent.includes(url)) || options[start];
}
