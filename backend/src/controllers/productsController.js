import db from '../config/db.js';
import { mongoCollections } from '../config/mongo.js';

const VALID_CATEGORIES = ['Workstations', 'Hardware', 'Periféricos', 'Soluciones'];

export async function listProducts(req, res) {
  try {
    const {
      page = 1,
      limit = 24,
      search = '',
      categoria = '',
      minPrice,
      maxPrice,
      sortBy = 'newest',
      sellerId = ''
    } = req.query;

    const store = db.getMemoryStore();
    let items = store.products.filter(p => p.activo !== false);

    // Filtro por categoría
    if (categoria && categoria !== 'Todas') {
      items = items.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
    }

    // Filtro por vendedor
    if (sellerId) {
      items = items.filter(p => p.vendedor_id === sellerId);
    }

    // Filtro por texto de búsqueda (sin tildes)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      items = items.filter(p => {
        const text = `${p.nombre} ${p.descripcion} ${p.vendedor_nombre} ${p.categoria}`
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        return text.includes(q);
      });

      // Registrar búsqueda en MongoDB
      mongoCollections.interactions.insertOne({
        eventType: 'SEARCH_CATALOG',
        userId: req.headers['x-user-id'] || 'anonymous',
        timestamp: new Date(),
        metadata: { query: search.trim(), resultsCount: items.length },
        clientIp: req.ip || '127.0.0.1'
      }).catch(err => console.error('Error log mongo search:', err));
    }

    // Filtro por rango de precio
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      items = items.filter(p => p.precio >= Number(minPrice));
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      items = items.filter(p => p.precio <= Number(maxPrice));
    }

    // Ordenamiento
    if (sortBy === 'price_asc') {
      items.sort((a, b) => a.precio - b.precio);
    } else if (sortBy === 'price_desc') {
      items.sort((a, b) => b.precio - a.precio);
    } else {
      // newest
      items.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    const total = items.length;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const totalPages = Math.ceil(total / limitNum) || 1;
    const offset = (pageNum - 1) * limitNum;
    const paginated = items.slice(offset, offset + limitNum);

    return res.json({
      data: paginated,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (err) {
    console.error('Error listProducts:', err);
    return res.status(500).json({ error: 'Error al obtener productos.' });
  }
}

export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const store = db.getMemoryStore();
    const product = store.products.find(p => p.id === id && p.activo !== false);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    // Registrar vista en MongoDB
    mongoCollections.interactions.insertOne({
      eventType: 'VIEW_PRODUCT',
      userId: req.headers['x-user-id'] || 'anonymous',
      productId: product.id,
      productName: product.nombre,
      category: product.categoria,
      timestamp: new Date(),
      metadata: { precio: product.precio, stock: product.stock },
      clientIp: req.ip || '127.0.0.1'
    }).catch(err => console.error('Error log mongo view:', err));

    return res.json(product);
  } catch (err) {
    return res.status(500).json({ error: 'Error al consultar producto.' });
  }
}

export async function createProduct(req, res) {
  try {
    const {
      nombre,
      categoria,
      precio,
      imagen,
      descripcion,
      vendedor_id,
      vendedor_nombre,
      stock = 1,
      condicion = 'Como nuevo'
    } = req.body;

    if (!nombre || nombre.trim().length < 3) {
      return res.status(400).json({ error: 'El nombre del producto debe tener al menos 3 caracteres.' });
    }
    if (!categoria || !VALID_CATEGORIES.includes(categoria)) {
      return res.status(400).json({ error: `La categoría debe ser una de: ${VALID_CATEGORIES.join(', ')}.` });
    }
    const precioNum = Number(precio);
    if (isNaN(precioNum) || precioNum < 1000) {
      return res.status(400).json({ error: 'El precio debe ser un número entero mayor o igual a $1.000 CLP.' });
    }
    if (!descripcion || descripcion.trim().length < 10) {
      return res.status(400).json({ error: 'La descripción debe tener al menos 10 caracteres.' });
    }

    const store = db.getMemoryStore();
    const newProduct = {
      id: 'prod-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      nombre: nombre.trim(),
      categoria,
      precio: Math.round(precioNum),
      imagen: imagen?.trim() || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
      descripcion: descripcion.trim(),
      vendedor_id: vendedor_id || 'usr-demo',
      vendedor_nombre: vendedor_nombre?.trim() || 'Estudiante UNAB',
      contacto: 'contacto@uandresbello.edu',
      stock: Math.max(1, Number(stock) || 1),
      condicion,
      activo: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    store.products.unshift(newProduct);

    // Registro de auditoría en MongoDB
    await mongoCollections.audit_logs.insertOne({
      entity: 'Product',
      entityId: newProduct.id,
      action: 'CREATE',
      performedBy: newProduct.vendedor_id,
      timestamp: new Date(),
      changes: { nombre: newProduct.nombre, precio: newProduct.precio, categoria: newProduct.categoria }
    });

    return res.status(201).json({
      message: 'Producto publicado exitosamente.',
      product: newProduct
    });
  } catch (err) {
    console.error('Error createProduct:', err);
    return res.status(500).json({ error: 'Error interno al crear producto.' });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { nombre, categoria, precio, imagen, descripcion, stock, condicion } = req.body;

    const store = db.getMemoryStore();
    const product = store.products.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    if (nombre && nombre.trim().length < 3) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 3 caracteres.' });
    }
    if (categoria && !VALID_CATEGORIES.includes(categoria)) {
      return res.status(400).json({ error: 'Categoría no válida.' });
    }
    if (precio !== undefined && (isNaN(Number(precio)) || Number(precio) < 1000)) {
      return res.status(400).json({ error: 'El precio debe ser un número mayor o igual a $1.000.' });
    }

    const previousState = { ...product };

    if (nombre) product.nombre = nombre.trim();
    if (categoria) product.categoria = categoria;
    if (precio !== undefined) product.precio = Math.round(Number(precio));
    if (imagen) product.imagen = imagen.trim();
    if (descripcion) product.descripcion = descripcion.trim();
    if (stock !== undefined) product.stock = Math.max(0, Number(stock));
    if (condicion) product.condicion = condicion;
    product.updated_at = new Date();

    // Auditoría en MongoDB
    await mongoCollections.audit_logs.insertOne({
      entity: 'Product',
      entityId: product.id,
      action: 'UPDATE',
      performedBy: req.headers['x-user-id'] || product.vendedor_id,
      timestamp: new Date(),
      changes: { from: previousState, to: product }
    });

    return res.json({
      message: 'Producto actualizado exitosamente.',
      product
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar producto.' });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const store = db.getMemoryStore();
    const product = store.products.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    product.activo = false;
    product.updated_at = new Date();

    await mongoCollections.audit_logs.insertOne({
      entity: 'Product',
      entityId: id,
      action: 'DELETE',
      performedBy: req.headers['x-user-id'] || 'system',
      timestamp: new Date(),
      changes: { activo: false }
    });

    return res.json({
      message: 'Producto eliminado del catálogo.',
      id
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al eliminar producto.' });
  }
}

export async function restoreProduct(req, res) {
  try {
    const { id } = req.params;
    const store = db.getMemoryStore();
    const product = store.products.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado para restaurar.' });
    }

    product.activo = true;
    product.updated_at = new Date();

    await mongoCollections.audit_logs.insertOne({
      entity: 'Product',
      entityId: id,
      action: 'RESTORE',
      performedBy: req.headers['x-user-id'] || 'system',
      timestamp: new Date(),
      changes: { activo: true }
    });

    return res.json({
      message: 'Producto restaurado exitosamente.',
      product
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al restaurar producto.' });
  }
}

export async function getCategories(req, res) {
  try {
    const store = db.getMemoryStore();
    const activeProducts = store.products.filter(p => p.activo !== false);
    
    const counts = VALID_CATEGORIES.map(cat => ({
      categoria: cat,
      total: activeProducts.filter(p => p.categoria === cat).length
    }));

    return res.json({
      categories: counts,
      totalGlobal: activeProducts.length
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener categorías.' });
  }
}
