/**
 * Respaldo visual local y exclusivo para cada publicación.
 * Nunca se hace pasar por una fotografía real del producto.
 * Solo se utiliza cuando falta o falla la imagen proporcionada.
 */
const TYPES = [
  ["bag", /mochila|backpack|bolso|funda/],
  ["stand", /soporte|base elevadora/],
  ["powerbank", /powerbank|bateria externa|bateria portatil/],
  ["charger", /cargador|adaptador de corriente|gan/],
  ["ethernet", /kit de red|adaptador de red|ethernet|rj45|cable de red/],
  ["router", /router|wifi 6|punto de acceso/],
  ["switch", /switch de red/],
  ["printer3d", /impresora 3d/],
  ["printer", /impresora|escaner/],
  ["webcam", /webcam|camara web/],
  ["microphone", /microfono/],
  ["headphones", /audifon|auricular|headset/],
  ["keyboard", /teclado/],
  ["mouse", /mouse|raton/],
  ["ram", /memoria ram|\bram\b|\bddr[345]\b/],
  ["gpu", /tarjeta de video|grafica|\brtx\b|\bgpu\b/],
  ["ssd", /\bssd\b|\bnvme\b|disco duro|\bhdd\b/],
  ["motherboard", /placa madre|motherboard/],
  ["cpu", /procesador|ryzen|intel core/],
  ["monitor", /monitor|pantalla/],
  ["tablet", /tablet|ipad|ebook/],
  ["phone", /celular|smartphone|telefono/],
  ["laptop", /notebook|laptop|portatil/],
  ["computer", /computador|gabinete|mini pc|torre/],
];
const LABELS = {
 bag: "MOCHILA", stand: "SOPORTE", powerbank: "BATERÍA EXTERNA",
 charger: "CARGADOR", ethernet: "CONECTIVIDAD", router: "ROUTER",
 switch: "SWITCH", printer3d: "IMPRESORA 3D", printer: "IMPRESORA",
 webcam: "CÁMARA", microphone: "MICRÓFONO", headphones: "AUDIO",
 keyboard: "TECLADO", mouse: "MOUSE", ram: "MEMORIA RAM", gpu: "GRÁFICA",
 ssd: "ALMACENAMIENTO", motherboard: "PLACA MADRE", cpu: "PROCESADOR",
 monitor: "MONITOR", tablet: "TABLET", phone: "TELÉFONO",
 laptop: "NOTEBOOK", computer: "COMPUTADOR", generic: "TECNOLOGÍA",
};
const ICONS = {
 bag: '<path d="M185 122 Q185 94 214 94 H266 Q295 94 295 122 V216 Q295 233 280 233 H200 Q185 233 185 216 Z"/><path d="M213 94 V84 Q240 62 267 84 V94"/><path d="M198 160 H282 M214 176 H266"/>',
 stand: '<path d="M180 194 L240 123 L300 194 M202 194 H278 M194 209 H286"/><rect x="177" y="116" width="126" height="14" rx="4"/>',
 powerbank: '<rect x="192" y="100" width="97" height="138" rx="15"/><path d="M231 119 H251 M235 146 L216 176 H239 L229 196 L262 157 H241 L248 146"/>',
 charger: '<rect x="196" y="107" width="89" height="110" rx="15"/><path d="M214 107 V84 M266 107 V84 M220 177 H262 M242 155 V200"/>',
 ethernet: '<rect x="169" y="121" width="144" height="94" rx="9"/><path d="M179 151 H303 M201 121 V151 M224 121 V151 M247 121 V151 M270 121 V151 M293 121 V151 M185 190 H293"/>',
 router: '<rect x="175" y="163" width="129" height="50" rx="11"/><path d="M194 163 L183 92 M286 163 L297 92 M240 151 V127 M221 141 Q240 121 259 141 M204 128 Q240 93 276 128"/><circle cx="198" cy="190" r="3"/><circle cx="217" cy="190" r="3"/>',
 switch: '<rect x="163" y="142" width="155" height="74" rx="7"/>' + Array.from({length:6},(_,i)=>'<rect x="'+(177+i*22)+'" y="167" width="14" height="17" rx="2"/>').join(''),
 printer3d: '<rect x="177" y="92" width="126" height="144" rx="5"/><path d="M189 114 H291 M198 217 H283 M240 114 V153 M218 194 L240 165 L262 194 Z M193 153 H287"/>',
 printer: '<rect x="179" y="142" width="127" height="81" rx="9"/><path d="M193 142 V108 H292 V142 M195 197 H291 M206 197 V233 H281 V197"/><circle cx="288" cy="161" r="4"/>',
 webcam: '<rect x="184" y="115" width="112" height="90" rx="22"/><circle cx="240" cy="160" r="27"/><circle cx="240" cy="160" r="12"/><path d="M240 205 V226 H282"/>',
 microphone: '<rect x="218" y="98" width="44" height="107" rx="22"/><path d="M195 153 V177 Q195 220 240 220 Q285 220 285 177 V153 M240 220 V243 M213 243 H267"/>',
 headphones: '<path d="M176 167 V144 Q176 83 240 83 Q304 83 304 144 V167"/><rect x="172" y="155" width="35" height="62" rx="12"/><rect x="273" y="155" width="35" height="62" rx="12"/>',
 keyboard: '<rect x="158" y="135" width="165" height="84" rx="10"/>' + Array.from({length:4},(_,r)=>Array.from({length:8},(_,i)=>'<rect x="'+(168+i*19)+'" y="'+(146+r*17)+'" width="13" height="10" rx="2"/>').join('')).join(''),
 mouse: '<rect x="206" y="86" width="69" height="146" rx="34"/><path d="M240 87 V158 M207 159 H275"/>',
 ram: '<rect x="158" y="135" width="164" height="66" rx="7"/>' + Array.from({length:6},(_,i)=>'<rect x="'+(173+i*24)+'" y="150" width="15" height="30" rx="2"/>').join('') + '<path d="M172 201 V215 M194 201 V215 M216 201 V215 M238 201 V215 M260 201 V215 M282 201 V215 M304 201 V215"/>',
 gpu: '<rect x="164" y="130" width="153" height="83" rx="8"/><circle cx="221" cy="171" r="28"/><circle cx="221" cy="171" r="12"/><path d="M264 155 H300 M264 169 H300 M264 183 H300"/>',
 ssd: '<rect x="190" y="98" width="100" height="132" rx="9"/><rect x="203" y="114" width="74" height="56" rx="5"/><path d="M208 189 H272 M208 201 H251 M208 213 H263"/>',
 motherboard: '<rect x="167" y="87" width="144" height="145" rx="5"/><rect x="186" y="106" width="65" height="65" rx="4"/><path d="M264 107 V217 M278 107 V217 M293 107 V217 M186 190 H251 M186 207 H251 M182 104 V86"/>',
 cpu: '<rect x="185" y="104" width="110" height="110" rx="8"/><rect x="204" y="123" width="72" height="72" rx="5"/>' + Array.from({length:5},(_,i)=>'<path d="M'+(196+i*18)+' 92 V104 M'+(196+i*18)+' 214 V227"/>').join(''),
 monitor: '<rect x="156" y="86" width="167" height="122" rx="8"/><path d="M156 184 H323 M240 208 V236 M209 236 H271"/>',
 tablet: '<rect x="188" y="79" width="104" height="159" rx="13"/><path d="M201 100 H279 M201 211 H279"/><circle cx="240" cy="225" r="3"/>',
 phone: '<rect x="206" y="75" width="68" height="164" rx="14"/><path d="M224 93 H256 M219 219 H261"/>',
 laptop: '<rect x="171" y="87" width="138" height="109" rx="7"/><path d="M156 207 H324 L310 221 H170 Z"/><path d="M184 183 H296"/>',
 computer: '<rect x="196" y="82" width="88" height="150" rx="9"/><circle cx="240" cy="169" r="29"/><circle cx="240" cy="169" r="12"/><path d="M207 106 H271"/><circle cx="240" cy="91" r="3"/>',
 generic: '<rect x="193" y="97" width="94" height="127" rx="12"/><path d="M207 142 H273 M207 163 H273 M207 184 H273"/>',
};
const PALETTES = ["#38bdf8","#64e3c3","#a8b7ff","#ffcc82","#83d1f1","#d6a9ff"];
function hash(value) {
 let acc = 2166136261;
 for (const ch of String(value)) acc = Math.imul(acc ^ ch.codePointAt(0), 16777619) >>> 0;
 return acc;
}
const escapeXml = (value) => String(value).replace(/[&<>"']/g, ch => ({
 "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&apos;",
})[ch]);
function linesForTitle(title) {
 const cleaned = String(title || "Producto tecnológico").replace(/\s+/g, " ").trim().slice(0, 72);
 if (cleaned.length <= 28) return [cleaned, ""];
 const space = cleaned.lastIndexOf(" ", 28);
 const cut = space > 13 ? space : 28;
 const second = cleaned.slice(cut).trim();
 return [cleaned.slice(0, cut).trim(), second.length > 35 ? second.slice(0, 32) + "…" : second];
}
export function productVisualKind(title = "") {
 const normalized = String(title).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
 return TYPES.find(([, test]) => test.test(normalized))?.[0] || "generic";
}
export function fallbackArtworkForProduct(title = "", visualKey = "") {
 const kind = productVisualKind(title);
 const accent = PALETTES[hash(String(title) + "|" + String(visualKey)) % PALETTES.length];
 const [first, second] = linesForTitle(title);
 const art = ICONS[kind] || ICONS.generic;
 const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320" width="480" height="320">
 <rect width="480" height="320" fill="#0c1d31"/>
 <path d="M0 0 H480 V260 H0 Z" fill="#142a43"/>
 <circle cx="240" cy="153" r="117" fill="${accent}" opacity=".09"/>
 <g fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">${art}</g>
 <rect x="0" y="258" width="480" height="62" fill="#081626" opacity=".98"/>
 <text x="24" y="277" fill="${accent}" font-family="Arial,sans-serif" font-weight="700" font-size="10" letter-spacing="2">${LABELS[kind]}</text>
 <text x="24" y="295" fill="#f1f5f9" font-family="Arial,sans-serif" font-weight="700" font-size="16">${escapeXml(first)}</text>
 ${second ? `<text x="24" y="312" fill="#c7d2e2" font-family="Arial,sans-serif" font-size="13">${escapeXml(second)}</text>` : ""}
 </svg>`;
 return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
