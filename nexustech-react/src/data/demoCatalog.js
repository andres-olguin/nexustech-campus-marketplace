import { localProductImage } from "./imageAssets.js";

const IMG = {
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

const rawCatalog = [
  // ======================== NOTEBOOKS (8) ========================
  {
    id: "demo-001",
    name: 'Notebook Ultrabook 14" — 16GB RAM / 512GB NVMe',
    category: "Notebooks",
    condition: "Usado",
    price: 540000,
    stock: 2,
    imgKey: "ultrabook",
    description: "Equipo liviano en excelente estado estético y de batería, ideal para desarrollo web, bases de datos y clases en Sede Viña del Mar.",
    specs: ["Procesador 8 núcleos", "16 GB RAM DDR4", "512 GB SSD NVMe", "Peso 1.35 kg"],
    reviews: [
      { id: "rev-001", author: "Estudiante de demostración A", rating: 5, createdAt: "2026-10-28T14:20:00.000Z", title: "Muy cómodo para llevar a laboratorio", comment: "La batería rinde la jornada completa de clases y compila Docker sin tirones.", featuresEvaluated: ["Autonomía", "Portabilidad"], isDemo: true },
      { id: "rev-002", author: "Estudiante de demostración B", rating: 4, createdAt: "2026-11-02T18:10:00.000Z", title: "Buen estado general", comment: "Teclado en español impecable y pantalla con muy buen brillo en sala.", featuresEvaluated: ["Pantalla", "Estado físico"], isDemo: true }
    ]
  },
  {
    id: "demo-002",
    name: 'Notebook Ingeniería 15.6" — Gráfica Dedicada 6GB / 16GB RAM',
    category: "Notebooks",
    condition: "Nuevo",
    price: 890000,
    stock: 3,
    imgKey: "laptopDark",
    description: "Notebook de alto rendimiento térmico pensado para modelado 3D, simulación, machine learning y compilación intensiva.",
    specs: ["GPU Dedicada 6 GB VRAM", "16 GB DDR5 ampliable", "1 TB SSD PCIe 4.0", "Pantalla 144Hz IPS"],
    reviews: [
      { id: "rev-003", author: "Usuario de demostración", rating: 5, createdAt: "2026-11-04T11:30:00.000Z", title: "Excelente refrigeración", comment: "Probado con entornos virtuales y entrenamiento de modelos pequeños, mantiene temperaturas estables.", featuresEvaluated: ["Rendimiento", "Refrigeración"], isDemo: true }
    ]
  },
  {
    id: "demo-003",
    name: 'Notebook Profesional 13.3" Chasis Aluminio — 16GB / 512GB',
    category: "Notebooks",
    condition: "Usado",
    price: 620000,
    stock: 1,
    imgKey: "laptopPro",
    description: "Portátil compacto con pantalla de alta densidad de píxeles, puertos Thunderbolt/USB-C y cargador original incluido.",
    specs: ["Pantalla 13.3\" QHD", "16 GB Memoria Unificada", "512 GB SSD", "2x USB-C Thunderbolt"],
    reviews: []
  },
  {
    id: "demo-004",
    name: 'Laptop Estudiante 14" Full HD — 8GB RAM / 256GB SSD',
    category: "Notebooks",
    condition: "Usado",
    price: 265000,
    stock: 4,
    imgKey: "laptopSilver",
    description: "Equipo económico ideal para ofimática, navegación, toma de apuntes y programación introductoria en primer año.",
    specs: ["Pantalla 14\" FHD antirreflejo", "8 GB RAM (1 slot libre)", "256 GB SSD M.2", "Wi-Fi Dual Band"],
    reviews: [
      { id: "rev-004", author: "Estudiante de demostración", rating: 4, createdAt: "2026-10-19T16:45:00.000Z", title: "Cumple para programar y estudiar", comment: "Buen precio para partir la carrera, muy silencioso.", featuresEvaluated: ["Precio/calidad"], isDemo: true }
    ]
  },
  {
    id: "demo-005",
    name: 'Workstation Portátil 16" — 32GB RAM / 1TB NVMe',
    category: "Notebooks",
    condition: "Nuevo",
    price: 1380000,
    stock: 2,
    imgKey: "laptopDev",
    description: "Estación móvil orientada a desarrollo de software empresarial, contenedores múltiples y edición multimedia.",
    specs: ["32 GB RAM DDR5", "1 TB SSD NVMe", "Pantalla 16\" 16:10 100% sRGB", "Teclado retroiluminado"],
    reviews: []
  },
  {
    id: "demo-006",
    name: 'Notebook Compacto 14" Linux Ready — 16GB / 512GB',
    category: "Notebooks",
    condition: "Usado",
    price: 430000,
    stock: 2,
    imgKey: "laptopDark",
    description: "Equipo con excelente compatibilidad de drivers para Ubuntu/Fedora, ideal para ramos de sistemas operativos y redes.",
    specs: ["Compatibilidad nativa Linux", "16 GB RAM", "512 GB NVMe", "Puerto RJ45 Gigabit integrado"],
    reviews: [
      { id: "rev-005", author: "Usuario de demostración", rating: 5, createdAt: "2026-11-01T09:15:00.000Z", title: "Puerto Ethernet físico muy útil", comment: "Conectar directo a switch en el laboratorio sin adaptadores es un gran punto a favor.", featuresEvaluated: ["Conectividad", "Compatibilidad"], isDemo: true }
    ]
  },
  {
    id: "demo-007",
    name: 'Ultrabook Convertible 2-en-1 Táctil 13" — 16GB / 512GB',
    category: "Notebooks",
    condition: "Usado",
    price: 590000,
    stock: 1,
    imgKey: "laptopPro",
    description: "Bisagra 360° con pantalla táctil para tomar apuntes manuscritos y programar en un mismo dispositivo.",
    specs: ["Pantalla táctil 360°", "16 GB RAM LPDDR4x", "512 GB NVMe", "Carga rápida USB-C 65W"],
    reviews: []
  },
  {
    id: "demo-008",
    name: 'Notebook Gamer / CAD 15.6" — 16GB / 512GB (Sin stock)',
    category: "Notebooks",
    condition: "Usado",
    price: 710000,
    stock: 0,
    imgKey: "laptopDev",
    description: "Publicación de referencia actualmente agotada para demostrar control de disponibilidad en el catálogo.",
    specs: ["GPU Dedicada 8 GB", "16 GB RAM", "512 GB NVMe", "Pantalla 120Hz"],
    reviews: []
  },

  // ======================== COMPONENTES (8) ========================
  {
    id: "demo-009",
    name: "Tarjeta Gráfica Dedicada 12GB GDDR6 Dual Fan",
    category: "Componentes",
    condition: "Nuevo",
    price: 385000,
    stock: 3,
    imgKey: "gpuRig",
    description: "GPU eficiente con 12 GB de VRAM para renderizado, cómputo paralelo CUDA/OpenCL y juegos en 1440p.",
    specs: ["12 GB VRAM GDDR6", "Interfaz PCIe 4.0 x16", "Doble ventilador axial", "Requiere fuente 550W+"],
    reviews: [
      { id: "rev-006", author: "Usuario de demostración", rating: 5, createdAt: "2026-10-25T20:00:00.000Z", title: "Muy buena para proyectos de IA", comment: "Los 12GB de VRAM permiten correr modelos locales sin quedarse corto de memoria.", featuresEvaluated: ["VRAM", "Temperatura"], isDemo: true }
    ]
  },
  {
    id: "demo-010",
    name: "Procesador Desktop 8 Núcleos / 16 Hilos AM5/LGA",
    category: "Componentes",
    condition: "Nuevo",
    price: 279000,
    stock: 5,
    imgKey: "cpuChip",
    description: "Procesador multi-hilo de arquitectura moderna para armado de PC de escritorio para compilación y multitarea.",
    specs: ["8 Núcleos / 16 Hilos", "Frecuencia boost hasta 5.0 GHz", "Caché L3 32 MB", "TDP 65W eficiente"],
    reviews: []
  },
  {
    id: "demo-011",
    name: "Kit Memoria RAM 32GB (2x16GB) DDR5 6000MHz",
    category: "Componentes",
    condition: "Nuevo",
    price: 129000,
    stock: 6,
    imgKey: "ramModules",
    description: "Módulos Dual Channel con disipador de aluminio de perfil bajo para workstations y equipos de desarrollo.",
    specs: ["32 GB (2 x 16 GB)", "DDR5 6000 MT/s", "Latencia CL36", "Perfil XMP/EXPO"],
    reviews: [
      { id: "rev-007", author: "Estudiante de demostración", rating: 5, createdAt: "2026-11-03T13:20:00.000Z", title: "Estable con perfil automático", comment: "Reconocida a 6000MHz sin errores en test de memoria.", featuresEvaluated: ["Estabilidad", "Perfil bajo"], isDemo: true }
    ]
  },
  {
    id: "demo-012",
    name: "Kit Memoria RAM 16GB (2x8GB) DDR4 3200MHz",
    category: "Componentes",
    condition: "Usado",
    price: 42000,
    stock: 4,
    imgKey: "ramModules",
    description: "Upgrade directo y probado con MemTest86 para equipos de escritorio DDR4.",
    specs: ["16 GB (2 x 8 GB)", "DDR4 3200 MHz", "Voltaje 1.35V", "Testeado 100%"],
    reviews: []
  },
  {
    id: "demo-013",
    name: "Placa Madre ATX Chipset Medio — 4 Slots RAM / Dual M.2",
    category: "Componentes",
    condition: "Nuevo",
    price: 168000,
    stock: 3,
    imgKey: "motherboard",
    description: "Placa base sólida con VRM refrigerado, audio aislado, Ethernet 2.5G y soporte para dos unidades NVMe.",
    specs: ["Formato ATX", "2x M.2 PCIe 4.0", "LAN 2.5Gbps integrada", "USB-C frontal"],
    reviews: []
  },
  {
    id: "demo-014",
    name: "Mini PC Barebone / Nodo Clúster Doméstico",
    category: "Componentes",
    condition: "Usado",
    price: 215000,
    stock: 2,
    imgKey: "miniPc",
    description: "Computador ultracompacto silencioso ideal como servidor local Docker, laboratorio Linux o homelab.",
    specs: ["Bajo consumo (15-25W)", "Soporte NVMe + SATA 2.5\"", "Doble salida HDMI", "Tamaño 12x12 cm"],
    reviews: [
      { id: "rev-008", author: "Usuario de demostración", rating: 5, createdAt: "2026-10-30T15:10:00.000Z", title: "Perfecto para homelab", comment: "Corre Proxmox y varios contenedores sin hacer ruido en el escritorio.", featuresEvaluated: ["Consumo", "Silencio"], isDemo: true }
    ]
  },
  {
    id: "demo-015",
    name: "Módulo RAM Notebook SO-DIMM 16GB DDR4 3200MHz",
    category: "Componentes",
    condition: "Nuevo",
    price: 39000,
    stock: 7,
    imgKey: "ramModules",
    description: "Memoria SO-DIMM para ampliar notebooks universitarios que traen 8 GB de fábrica.",
    specs: ["Formato SO-DIMM 260-pin", "16 GB DDR4", "3200 MHz", "1.2V estándar JEDEC"],
    reviews: []
  },
  {
    id: "demo-016",
    name: "Placa Base Micro-ATX con Wi-Fi Integrado",
    category: "Componentes",
    condition: "Usado",
    price: 112000,
    stock: 1,
    imgKey: "motherboard",
    description: "Placa compacta con antena Wi-Fi/Bluetooth incluida, ideal para gabinetes pequeños.",
    specs: ["Formato Micro-ATX", "Wi-Fi + Bluetooth integrado", "4 puertos SATA III", "1 puerto M.2 NVMe"],
    reviews: []
  },

  // ======================== ALMACENAMIENTO (6) ========================
  {
    id: "demo-017",
    name: "SSD NVMe M.2 1TB PCIe Gen4 — Lectura hasta 5000 MB/s",
    category: "Almacenamiento",
    condition: "Nuevo",
    price: 78000,
    stock: 8,
    imgKey: "ssdStorage",
    description: "Unidad de estado sólido M.2 2280 de alta velocidad para acelerar arranque del SO, compilaciones y máquinas virtuales.",
    specs: ["Capacidad 1 TB", "Interfaz NVMe PCIe 4.0 x4", "Factor de forma 2280", "Lectura secuencial ~5000 MB/s"],
    reviews: [
      { id: "rev-009", author: "Estudiante de demostración", rating: 5, createdAt: "2026-11-05T10:00:00.000Z", title: "Cambio notorio al compilar", comment: "Instalado en el segundo slot del notebook, excelente velocidad para proyectos grandes.", featuresEvaluated: ["Velocidad", "Instalación"], isDemo: true }
    ]
  },
  {
    id: "demo-018",
    name: "SSD NVMe M.2 2TB PCIe Gen4 Alta Capacidad",
    category: "Almacenamiento",
    condition: "Nuevo",
    price: 145000,
    stock: 3,
    imgKey: "ssdStorage",
    description: "Almacenamiento masivo rápido para datasets de minería de datos, máquinas virtuales y proyectos multimedia.",
    specs: ["Capacidad 2 TB", "PCIe Gen4 x4", "Caché SLC dinámica", "Incluye tornillo de montaje"],
    reviews: []
  },
  {
    id: "demo-019",
    name: 'SSD Interno 2.5" SATA III 500GB',
    category: "Almacenamiento",
    condition: "Nuevo",
    price: 36000,
    stock: 9,
    imgKey: "ssdStorage",
    description: "Reemplazo ideal para revitalizar notebooks antiguos con disco mecánico HDD.",
    specs: ["Capacidad 500 GB", "Interfaz SATA III 6Gb/s", "Lectura ~550 MB/s", "Formato 2.5\" 7mm"],
    reviews: []
  },
  {
    id: "demo-020",
    name: "Cofre Externo Aluminio NVMe a USB-C 10Gbps",
    category: "Almacenamiento",
    condition: "Nuevo",
    price: 22000,
    stock: 6,
    imgKey: "ssdStorage",
    description: "Convierte cualquier SSD M.2 NVMe en una unidad externa ultrarrápida para respaldos de tesis y laboratorios.",
    specs: ["USB 3.2 Gen2 (10 Gbps)", "Carcasa aluminio disipadora", "Cable USB-C a USB-C/A", "Instalación sin herramientas"],
    reviews: []
  },
  {
    id: "demo-021",
    name: "SSD Externo Portátil 1TB USB-C Resistente",
    category: "Almacenamiento",
    condition: "Usado",
    price: 68000,
    stock: 2,
    imgKey: "ssdStorage",
    description: "Unidad compacta con salud SMART al 98% comprobada, perfecta para transportar máquinas virtuales entre casa y campus.",
    specs: ["Capacidad 1 TB", "Salud SMART 98%", "Conector USB-C", "Resistencia a golpes leves"],
    reviews: []
  },
  {
    id: "demo-022",
    name: "Kit SSD 256GB NVMe + Case Externo USB 3.0",
    category: "Almacenamiento",
    condition: "Usado",
    price: 29000,
    stock: 4,
    imgKey: "ssdStorage",
    description: "Unidad extraída de upgrade de notebook, formateada y lista para usar como disco externo rápido.",
    specs: ["256 GB NVMe", "Case incluido", "Cable USB incluido", "Formateado exFAT"],
    reviews: []
  },

  // ======================== PERIFÉRICOS (8) ========================
  {
    id: "demo-023",
    name: "Teclado Mecánico Compacto 75% Switches Lineales",
    category: "Periféricos",
    condition: "Nuevo",
    price: 64000,
    stock: 5,
    imgKey: "keyboard",
    description: "Teclado compacto con layout ergonómico, switches lineales silenciosos y keycaps PBT ideales para programar por horas.",
    specs: ["Formato 75% (84 teclas)", "Switches lineales Hot-Swap", "Conexión USB-C desmontable", "Keycaps PBT doble inyección"],
    reviews: [
      { id: "rev-010", author: "Estudiante de demostración", rating: 5, createdAt: "2026-10-29T19:40:00.000Z", title: "Silencioso y cómodo", comment: "Al ser 75% cabe perfecto en la mochila y no molesta en sala de estudio.", featuresEvaluated: ["Acústica", "Tamaño"], isDemo: true }
    ]
  },
  {
    id: "demo-024",
    name: "Teclado Mecánico Inalámbrico Tri-Modo (BT / 2.4G / Cable)",
    category: "Periféricos",
    condition: "Usado",
    price: 55000,
    stock: 2,
    imgKey: "keyboard",
    description: "Alterna fácilmente entre notebook, tablet y PC de escritorio hasta con 3 dispositivos Bluetooth.",
    specs: ["Bluetooth 5.1 + 2.4GHz + USB-C", "Batería recargable 3000 mAh", "Compatible Windows/macOS/Linux", "Retroiluminación blanca"],
    reviews: []
  },
  {
    id: "demo-025",
    name: "Mouse Inalámbrico Ergonómico Sensor Alta Precisión",
    category: "Periféricos",
    condition: "Nuevo",
    price: 45000,
    stock: 7,
    imgKey: "mouse",
    description: "Diseño contorneado para reducir fatiga en muñeca durante jornadas extensas de desarrollo o diseño.",
    specs: ["Sensor óptico hasta 4000 DPI", "Rueda de desplazamiento rápido", "USB-C recargable", "Conexión dual BT / Receptor"],
    reviews: [
      { id: "rev-011", author: "Usuario de demostración", rating: 4, createdAt: "2026-11-01T12:15:00.000Z", title: "Muy ergonómico", comment: "Cómodo para manos medianas y grandes; la batería dura semanas.", featuresEvaluated: ["Ergonomía", "Batería"], isDemo: true }
    ]
  },
  {
    id: "demo-026",
    name: "Mouse Ligero Inalámbrico Gaming/Productividad 63g",
    category: "Periféricos",
    condition: "Usado",
    price: 38000,
    stock: 3,
    imgKey: "mouse",
    description: "Mouse simétrico ultraliviano con pies de PTFE y baja latencia.",
    specs: ["Peso 63 gramos", "Polling rate 1000 Hz", "Switches ópticos", "Receptor USB incluido"],
    reviews: []
  },
  {
    id: "demo-027",
    name: "Audífonos Over-Ear Cancelación Activa (ANC) + USB-C",
    category: "Periféricos",
    condition: "Nuevo",
    price: 79000,
    stock: 4,
    imgKey: "headphones",
    description: "Aislamiento acústico ideal para estudiar en biblioteca o concentrarse en desarrollo de código.",
    specs: ["Cancelación activa híbrida", "Hasta 35h de batería", "Carga rápida USB-C", "Modo cableado 3.5mm incluido"],
    reviews: []
  },
  {
    id: "demo-028",
    name: "Audífonos de Monitoreo Cerrados para Edición",
    category: "Periféricos",
    condition: "Usado",
    price: 49000,
    stock: 2,
    imgKey: "headphones",
    description: "Respuesta de frecuencia balanceada con almohadillas renovadas, ideales para edición de video o audio.",
    specs: ["Drivers 40mm", "Cable espiralado 3m", "Adaptador 6.3mm incluido", "Almohadillas nuevas"],
    reviews: []
  },
  {
    id: "demo-029",
    name: "Micrófono Condensador USB Plug & Play con Trípode",
    category: "Periféricos",
    condition: "Nuevo",
    price: 44000,
    stock: 5,
    imgKey: "microphone",
    description: "Audio nítido para presentaciones remotas, defensas de proyecto, clases online y grabación de demos.",
    specs: ["Patrón cardioide direccional", "Botón mute físico táctil", "Salida monitoreo 3.5mm", "Trípode metálico incluido"],
    reviews: [
      { id: "rev-012", author: "Estudiante de demostración", rating: 5, createdAt: "2026-11-04T17:05:00.000Z", title: "Claridad excelente en defensas", comment: "No capta tanto ruido del teclado y el botón de mute rápido es súper práctico.", featuresEvaluated: ["Audio", "Practicidad"], isDemo: true }
    ]
  },
  {
    id: "demo-030",
    name: "Kit Periféricos Estudio: Teclado 65% + Mouse Inalámbrico",
    category: "Periféricos",
    condition: "Usado",
    price: 52000,
    stock: 2,
    imgKey: "keyboard",
    description: "Combo compacto ideal para escritorios universitarios reducidos, incluye cables y receptor.",
    specs: ["Teclado compacto 65%", "Mouse óptico 2.4GHz", "Cables trenzados incluidos", "Estado 9/10"],
    reviews: []
  },

  // ======================== MONITORES (6) ========================
  {
    id: "demo-031",
    name: 'Monitor 27" QHD (2560x1440) IPS — Ideal Programación',
    category: "Monitores",
    condition: "Nuevo",
    price: 235000,
    stock: 3,
    imgKey: "monitor",
    description: "Amplio espacio de trabajo vertical y horizontal para tener IDE, navegador y terminal visibles simultáneamente.",
    specs: ["Panel IPS 27\" 2560x1440", "Cobertura 99% sRGB", "Soporte ajustable en altura", "HDMI + DisplayPort"],
    reviews: [
      { id: "rev-013", author: "Usuario de demostración", rating: 5, createdAt: "2026-10-22T15:50:00.000Z", title: "La resolución QHD marca diferencia", comment: "El texto se ve muchísimo más nítido que en 1080p a 27 pulgadas.", featuresEvaluated: ["Nitidez", "Ergonomía"], isDemo: true }
    ]
  },
  {
    id: "demo-032",
    name: 'Monitor 24" Full HD IPS 100Hz Sin Bordes',
    category: "Monitores",
    condition: "Nuevo",
    price: 118000,
    stock: 5,
    imgKey: "monitor",
    description: "Monitor accesible con filtro de luz azul y tasa de refresco de 100Hz para lectura cómoda de código y documentos.",
    specs: ["24\" Full HD 1920x1080", "Panel IPS 100Hz", "Filtro Low Blue Light", "Montaje VESA 100x100"],
    reviews: []
  },
  {
    id: "demo-033",
    name: 'Monitor 27" USB-C Power Delivery 65W Hub Integrado',
    category: "Monitores",
    condition: "Usado",
    price: 269000,
    stock: 2,
    imgKey: "monitor",
    description: "Conecta video, datos y carga tu notebook usando un único cable USB-C, manteniendo el escritorio ordenado.",
    specs: ["USB-C con carga 65W", "Hub 3x USB-A integrado", "Resolución QHD IPS", "Pivote vertical 90°"],
    reviews: []
  },
  {
    id: "demo-034",
    name: 'Monitor Portátil 15.6" Full HD USB-C para Mochila',
    category: "Monitores",
    condition: "Nuevo",
    price: 139000,
    stock: 4,
    imgKey: "monitor",
    description: "Segunda pantalla ultrafina para trabajar en proyectos grupales dentro de la sede universitaria.",
    specs: ["15.6\" IPS FHD", "Grosor 6mm / 780g", "Funda magnética soporte", "Mini HDMI + 2x USB-C"],
    reviews: []
  },
  {
    id: "demo-035",
    name: 'Monitor Ultrawide 29" 21:9 Multitarea',
    category: "Monitores",
    condition: "Usado",
    price: 185000,
    stock: 1,
    imgKey: "monitor",
    description: "Formato panorámico ideal para dividir pantalla en dos ventanas completas sin usar doble monitor.",
    specs: ["29\" 2560x1080 (21:9)", "Panel IPS antirreflejo", "2x HDMI + DisplayPort", "Sin píxeles muertos"],
    reviews: []
  },
  {
    id: "demo-036",
    name: 'Monitor Secundario 22" Full HD Pivotante (Rotación 90°)',
    category: "Monitores",
    condition: "Usado",
    price: 75000,
    stock: 3,
    imgKey: "monitor",
    description: "Base ergonómica que permite usarlo en vertical para leer logs, documentación técnica o código largo.",
    specs: ["22\" 1920x1080", "Rotación vertical 90°", "DisplayPort + HDMI + VGA", "Excelente estado"],
    reviews: []
  },

  // ======================== REDES (4) ========================
  {
    id: "demo-037",
    name: "Router Wi-Fi 6 (AX3000) Doble Banda Gigabit",
    category: "Redes",
    condition: "Nuevo",
    price: 69000,
    stock: 5,
    imgKey: "networkSwitch",
    description: "Mejora la estabilidad en videollamadas y descargas con soporte OFDMA y 4 puertos Gigabit LAN.",
    specs: ["Wi-Fi 6 AX3000", "4 puertos Gigabit LAN", "Soporte WPA3", "Modo Router / Access Point"],
    reviews: []
  },
  {
    id: "demo-038",
    name: "Switch Gestionable L2 de 8 Puertos Gigabit (VLAN / QoS)",
    category: "Redes",
    condition: "Usado",
    price: 45000,
    stock: 3,
    imgKey: "networkSwitch",
    description: "Switch metálico silencioso ideal para prácticas de redes, segmentación VLAN 802.1Q y laboratorios en casa.",
    specs: ["8 puertos 10/100/1000 Mbps", "Soporte VLAN 802.1Q", "Administración Web UI", "Chasis metálico fanless"],
    reviews: [
      { id: "rev-014", author: "Estudiante de demostración", rating: 5, createdAt: "2026-10-27T11:20:00.000Z", title: "Muy útil para prácticas de redes", comment: "Permite configurar VLANs y trunking fácilmente para preparar evaluaciones prácticas.", featuresEvaluated: ["VLAN", "Estabilidad"], isDemo: true }
    ]
  },
  {
    id: "demo-039",
    name: "Switch No Gestionado 5 Puertos Gigabit Compacto",
    category: "Redes",
    condition: "Nuevo",
    price: 18500,
    stock: 8,
    imgKey: "networkSwitch",
    description: "Solución plug-and-play para conectar varios equipos de escritorio o Raspberry Pi por cable.",
    specs: ["5 puertos Gigabit", "Plug & Play sin configuración", "Bajo consumo", "Indicadores LED por puerto"],
    reviews: []
  },
  {
    id: "demo-040",
    name: "Servidor Rack / Laboratorio Redes (Equipo Demo)",
    category: "Redes",
    condition: "Usado",
    price: 420000,
    stock: 1,
    imgKey: "rackServer",
    description: "Unidad de práctica para entornos de virtualización, firewall dedicado o servidor de archivos de laboratorio.",
    specs: ["Doble NIC Gigabit", "32 GB ECC", "Bahías Hot-Swap", "Uso académico / homelab"],
    reviews: []
  },

  // ======================== TABLETS (4) ========================
  {
    id: "demo-041",
    name: 'Tablet 11" Estudio + Lápiz Óptico para Apuntes PDF',
    category: "Tablets",
    condition: "Usado",
    price: 295000,
    stock: 2,
    imgKey: "tabletTouch",
    description: "Ideal para subrayar guías, resolver ejercicios matemáticos y tomar apuntes digitales en clases.",
    specs: ["Pantalla 11\" 120Hz", "128 GB almacenamiento", "Incluye lápiz magnético", "Funda tipo libro incluida"],
    reviews: [
      { id: "rev-015", author: "Estudiante de demostración", rating: 5, createdAt: "2026-11-03T10:15:00.000Z", title: "Adiós cuadernos de papel", comment: "La baja latencia del lápiz hace súper natural anotar en las diapositivas de clases.", featuresEvaluated: ["Lápiz", "Pantalla"], isDemo: true }
    ]
  },
  {
    id: "demo-042",
    name: 'Tablet 10.4" Lectura Técnica y Multimedia — 64GB',
    category: "Tablets",
    condition: "Nuevo",
    price: 175000,
    stock: 4,
    imgKey: "tabletWeb",
    description: "Tablet liviana con ranura microSD expandible para leer libros técnicos, documentación y ver clases grabadas.",
    specs: ["Pantalla 10.4\" 2K", "64 GB + slot MicroSD", "Batería 7040 mAh", "Carga USB-C"],
    reviews: []
  },
  {
    id: "demo-043",
    name: "Tableta Digitalizadora Gráfica USB para Diagramas y Clases",
    category: "Tablets",
    condition: "Usado",
    price: 38000,
    stock: 3,
    imgKey: "analytics",
    description: "Conecta a tu notebook para dibujar diagramas UML, circuitos o fórmulas en pizarras virtuales.",
    specs: ["Área activa 10x6 pulgadas", "8192 niveles de presión", "Lápiz sin batería", "Compatible Win/Mac/Linux"],
    reviews: []
  },
  {
    id: "demo-044",
    name: 'Tablet Compacta 8.7" Lectura de Documentación',
    category: "Tablets",
    condition: "Usado",
    price: 95000,
    stock: 2,
    imgKey: "tabletTouch",
    description: "Tamaño ideal para llevar en el bolsillo de la mochila y revisar material entre clases.",
    specs: ["Pantalla 8.7\"", "32 GB + MicroSD", "Carcasa protectora", "Batería en buen estado"],
    reviews: []
  },

  // ======================== ACCESORIOS ESTUDIANTILES (4) ========================
  {
    id: "demo-045",
    name: "Hub USB-C 7-en-1 (HDMI 4K + Ethernet + PD 100W + SD)",
    category: "Accesorios",
    condition: "Nuevo",
    price: 32000,
    stock: 10,
    imgKey: "analytics",
    description: "Adaptador esencial para notebooks modernos con pocos puertos: proyecta en salas, conecta red cableada y lee tarjetas.",
    specs: ["HDMI 4K@30Hz", "Puerto RJ45 Gigabit", "Carga Pass-Through 100W", "2x USB 3.0 + Lector SD/TF"],
    reviews: [
      { id: "rev-016", author: "Usuario de demostración", rating: 5, createdAt: "2026-11-05T16:30:00.000Z", title: "Imprescindible para exponer", comment: "Funciona directo con proyectores HDMI de la sede sin instalar nada.", featuresEvaluated: ["Compatibilidad", "Puertos"], isDemo: true }
    ]
  },
  {
    id: "demo-046",
    name: "Soporte Ergonómico Plegable Aluminio para Notebook",
    category: "Accesorios",
    condition: "Nuevo",
    price: 16500,
    stock: 12,
    imgKey: "laptopSilver",
    description: "Eleva la pantalla a altura de los ojos, mejora la postura y favorece la ventilación inferior del equipo.",
    specs: ["Aluminio anodizado", "6 niveles de inclinación", "Plegable con bolsa transporte", "Soporta hasta 17 pulgadas"],
    reviews: []
  },
  {
    id: "demo-047",
    name: 'Funda Acolchada Impermeable 14"-15.6" con Bolsillo Cargador',
    category: "Accesorios",
    condition: "Nuevo",
    price: 18000,
    stock: 8,
    imgKey: "laptopPro",
    description: "Protección interior de felpa suave contra rayones y salpicaduras durante el traslado diario.",
    specs: ["Interior felpa anti-rayas", "Exterior repelente al agua", "Bolsillo frontal para cargador", "Cierre doble reforzado"],
    reviews: []
  },
  {
    id: "demo-048",
    name: "Cargador Universal GaN 65W USB-C Dual Port Compacto",
    category: "Accesorios",
    condition: "Nuevo",
    price: 28000,
    stock: 6,
    imgKey: "cpuChip",
    description: "Carga simultáneamente tu notebook y teléfono con un bloque compacto que ocupa la mitad que un cargador tradicional.",
    specs: ["Tecnología GaN 65W", "2x USB-C + 1x USB-A", "Protocolo PD 3.0 / PPS", "Enchufe chileno directo"],
    reviews: []
  }
];

export const DEMO_CATEGORIES = [
  "Notebooks",
  "Componentes",
  "Almacenamiento",
  "Periféricos",
  "Monitores",
  "Redes",
  "Tablets",
  "Accesorios",
];

export function getDemoCatalog() {
  return rawCatalog.map((item) => ({
    ...item,
    imageUrl: localProductImage(IMG[item.imgKey]),
    isActive: true,
    isDemo: true,
    sellerId: "00000000-0000-4000-8000-000000000000",
    sellerLabel: "Catálogo de demostración · Viña del Mar",
    createdAt: "2026-11-01T12:00:00.000Z",
    updatedAt: "2026-11-09T12:00:00.000Z",
  }));
}
