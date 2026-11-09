-- ====================================================================
-- NexusTech Campus Marketplace — DDL Inicial PostgreSQL
-- Hito 3: Persistencia Relacional
-- ====================================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'comprador', -- 'comprador', 'vendedor', 'ambos'
    telefono VARCHAR(30),
    campus VARCHAR(80) DEFAULT 'Campus Casona UNAB',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    categoria VARCHAR(60) NOT NULL, -- 'Workstations', 'Hardware', 'Periféricos', 'Soluciones'
    precio INTEGER NOT NULL CHECK (precio >= 1000),
    imagen TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    vendedor_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    vendedor_nombre VARCHAR(120) NOT NULL,
    contacto VARCHAR(160),
    stock INTEGER DEFAULT 5 CHECK (stock >= 0),
    condicion VARCHAR(40) DEFAULT 'Como nuevo',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_categoria ON products(categoria);
CREATE INDEX IF NOT EXISTS idx_products_activo ON products(activo);
CREATE INDEX IF NOT EXISTS idx_products_precio ON products(precio);

CREATE TABLE IF NOT EXISTS orders (
    codigo VARCHAR(32) PRIMARY KEY,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    comprador_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    nombre_cliente VARCHAR(120) NOT NULL,
    email_cliente VARCHAR(160) NOT NULL,
    direccion TEXT NOT NULL,
    ciudad VARCHAR(80) NOT NULL,
    origen VARCHAR(80) DEFAULT 'Campus Hub Santiago',
    paso INTEGER DEFAULT 0 CHECK (paso BETWEEN 0 AND 3),
    estado VARCHAR(40) DEFAULT 'Pendiente', -- 'Pendiente', 'En preparación', 'Enviado', 'Entregado'
    total INTEGER NOT NULL CHECK (total >= 0),
    metodo_pago VARCHAR(50) DEFAULT 'Webpay Plus Simulado',
    transaccion_id VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_codigo VARCHAR(32) REFERENCES orders(codigo) ON DELETE CASCADE,
    product_id VARCHAR(64),
    nombre VARCHAR(200) NOT NULL,
    precio_unitario INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    acabado VARCHAR(60) DEFAULT 'Estándar',
    subtotal INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_codigo);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    token VARCHAR(128) UNIQUE NOT NULL,
    order_codigo VARCHAR(32) REFERENCES orders(codigo) ON DELETE CASCADE,
    monto INTEGER NOT NULL,
    metodo VARCHAR(50) NOT NULL,
    estado VARCHAR(30) NOT NULL, -- 'AUTHORIZED', 'REJECTED'
    codigo_autorizacion VARCHAR(32),
    ultimos_digitos VARCHAR(4),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Datos Semilla (Usuarios Iniciales)
INSERT INTO users (id, nombre, email, password_hash, rol, telefono, campus) VALUES
('usr-seller-1', 'Andrés Olguín', 'andres.olguin@uandresbello.edu', 'hash_andres_123', 'vendedor', '+56 9 8123 4567', 'Campus Casona UNAB'),
('usr-seller-2', 'Benjamín Aguilera', 'benjamin.aguilera@uandresbello.edu', 'hash_benja_123', 'vendedor', '+56 9 7654 3210', 'Campus República UNAB'),
('usr-buyer-1', 'Enrique Chamyr', 'enrique.chamyr@uandresbello.edu', 'hash_enrique_123', 'comprador', '+56 9 6543 2109', 'Campus Bellavista UNAB'),
('usr-hybrid-1', 'Miguel Vargas', 'miguel.vargas@uandresbello.edu', 'hash_miguel_123', 'ambos', '+56 9 5432 1098', 'Campus Los Leones UNAB'),
('usr-demo', 'Estudiante UNAB', 'estudiante@uandresbello.edu', 'demo1234', 'ambos', '+56 9 1234 5678', 'Campus República UNAB')
ON CONFLICT (id) DO NOTHING;

-- Productos Iniciales Representativos de las 4 Categorías
INSERT INTO products (id, nombre, categoria, precio, imagen, descripcion, vendedor_id, vendedor_nombre, stock, condicion) VALUES
('prod-001', 'Workstation Dell Precision 5570 Intel i9 64GB RTX A2000', 'Workstations', 1850000, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', 'Estación de trabajo portátil certificada para renderizado 3D y simulaciones de ingeniería.', 'usr-seller-1', 'Andrés Olguín', 4, 'Como nuevo'),
('prod-002', 'Apple MacBook Pro 16 M3 Max 36GB 1TB Space Black', 'Workstations', 2490000, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80', 'Ideal para desarrollo de software, Docker y compilación nativa.', 'usr-seller-2', 'Benjamín Aguilera', 3, 'Nuevo'),
('prod-003', 'Tarjeta Gráfica ASUS ROG Strix GeForce RTX 4080 16GB OC', 'Hardware', 1199990, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80', 'GPU de arquitectura Ada Lovelace para IA generativa y diseño gráfico avanzado.', 'usr-seller-1', 'Andrés Olguín', 2, 'Como nuevo'),
('prod-004', 'Procesador AMD Ryzen 9 7950X 16 Cores 32 Hilos AM5', 'Hardware', 529990, 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80', 'Frecuencia boost hasta 5.7 GHz, caché de 80MB.', 'usr-hybrid-1', 'Miguel Vargas', 5, 'Nuevo'),
('prod-005', 'Monitor Curvo Dell UltraSharp 38 U3824DW WQHD+ IPS Black', 'Periféricos', 890000, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80', 'Hub USB-C con 90W power delivery, cobertura 98% DCI-P3.', 'usr-seller-2', 'Benjamín Aguilera', 3, 'Como nuevo'),
('prod-006', 'Teclado Mecánico Custom Keychron Q1 Pro Wireless RGB QMK', 'Periféricos', 175000, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', 'Chasis de aluminio mecanizado CNC, switches Gateron Jupiter Red.', 'usr-hybrid-1', 'Miguel Vargas', 7, 'Nuevo'),
('prod-007', 'API Integración Pasarela Webpay Plus & Transbank en Node.js', 'Soluciones', 140000, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', 'Módulo probado con endpoints REST, webhooks y documentación Swagger lista para producción.', 'usr-seller-1', 'Andrés Olguín', 10, 'Nuevo'),
('prod-008', 'Auditoría de Seguridad Web OWASP Top 10 + Reporte Ejecutivo', 'Soluciones', 280000, 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80', 'Análisis de vulnerabilidades, cabeceras seguras, CORS y matriz de riesgos para startups universitarias.', 'usr-seller-2', 'Benjamín Aguilera', 6, 'Nuevo')
ON CONFLICT (id) DO NOTHING;

-- Pedido Inicial de Demostración
INSERT INTO orders (codigo, fecha, comprador_id, nombre_cliente, email_cliente, direccion, ciudad, origen, paso, estado, total, metodo_pago, transaccion_id) VALUES
('TRK-987654', '2026-10-10 14:30:00+00', 'usr-buyer-1', 'Enrique Chamyr', 'enrique.chamyr@uandresbello.edu', 'Av. República 237, Edificio R3', 'Santiago', 'Campus Hub Santiago', 1, 'En preparación', 1374990, 'Webpay Plus Simulado', 'tx-sim-987654')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO order_items (order_codigo, product_id, nombre, precio_unitario, cantidad, acabado, subtotal) VALUES
('TRK-987654', 'prod-003', 'Tarjeta Gráfica ASUS ROG Strix GeForce RTX 4080 16GB OC', 1199990, 1, 'Negro Mate', 1199990),
('TRK-987654', 'prod-006', 'Teclado Mecánico Custom Keychron Q1 Pro Wireless RGB QMK', 175000, 1, 'Gris Titanio', 175000)
ON CONFLICT DO NOTHING;
