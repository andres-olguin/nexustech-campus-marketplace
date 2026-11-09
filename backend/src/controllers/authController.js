import db from '../config/db.js';
import { mongoCollections } from '../config/mongo.js';

export async function register(req, res) {
  try {
    const { nombre, email, password, rol = 'comprador', telefono, campus } = req.body;

    if (!nombre || nombre.trim().length < 3) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 3 caracteres.' });
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'El correo electrónico no tiene un formato válido.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }
    const rolesValidos = ['comprador', 'vendedor', 'ambos'];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido. Debe ser comprador, vendedor o ambos.' });
    }

    // Comprobar si ya existe
    const store = db.getMemoryStore();
    const existing = store.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
    }

    const newUser = {
      id: 'usr-' + Date.now().toString(36),
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      password_hash: 'hash_' + password,
      rol,
      telefono: telefono?.trim() || '+56 9 0000 0000',
      campus: campus?.trim() || 'Campus Casona UNAB',
      activo: true,
      created_at: new Date()
    };

    store.users.push(newUser);

    // Registro en MongoDB
    await mongoCollections.interactions.insertOne({
      eventType: 'USER_REGISTER',
      userId: newUser.id,
      userEmail: newUser.email,
      timestamp: new Date(),
      metadata: { rol: newUser.rol, campus: newUser.campus },
      clientIp: req.ip || '127.0.0.1'
    });

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol,
        campus: newUser.campus,
        telefono: newUser.telefono
      },
      token: 'token-jwt-simulado-' + newUser.id
    });
  } catch (err) {
    console.error('Error en register:', err);
    return res.status(500).json({ error: 'Error interno al registrar usuario.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Debe ingresar correo y contraseña.' });
    }

    const store = db.getMemoryStore();
    const user = store.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas. Usuario no encontrado.' });
    }

    // Comprobación de contraseña simple para demo/test
    if (user.password_hash !== 'hash_' + password && user.password_hash !== password) {
      return res.status(401).json({ error: 'Credenciales inválidas. Contraseña incorrecta.' });
    }

    // Registro en MongoDB
    await mongoCollections.interactions.insertOne({
      eventType: 'USER_LOGIN',
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      metadata: { rol: user.rol, campus: user.campus },
      clientIp: req.ip || '127.0.0.1'
    });

    return res.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        campus: user.campus,
        telefono: user.telefono
      },
      token: 'token-jwt-simulado-' + user.id
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno en autenticación.' });
  }
}

export async function getProfile(req, res) {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId || 'usr-demo';
    const store = db.getMemoryStore();
    const user = store.users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'Perfil no encontrado.' });
    }

    // Métricas del usuario
    const ordersCount = store.orders.filter(o => o.comprador_id === user.id).length;
    const productsPublished = store.products.filter(p => p.vendedor_id === user.id && p.activo !== false);

    return res.json({
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        campus: user.campus,
        telefono: user.telefono,
        created_at: user.created_at
      },
      stats: {
        ordersCount,
        productsCount: productsPublished.length,
        products: productsPublished
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al consultar perfil.' });
  }
}

export async function switchRole(req, res) {
  try {
    const { userId, targetRole } = req.body;
    const store = db.getMemoryStore();
    const user = store.users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const nuevoRol = targetRole || (user.rol === 'vendedor' ? 'comprador' : 'vendedor');
    user.rol = nuevoRol;

    await mongoCollections.audit_logs.insertOne({
      entity: 'User',
      entityId: user.id,
      action: 'SWITCH_ROLE',
      performedBy: user.id,
      timestamp: new Date(),
      changes: { newRole: nuevoRol }
    });

    return res.json({
      message: 'Rol actualizado exitosamente',
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al cambiar de rol.' });
  }
}

export async function listSellers(req, res) {
  try {
    const store = db.getMemoryStore();
    const sellers = store.users.filter(u => u.rol === 'vendedor' || u.rol === 'ambos');
    const result = sellers.map(s => ({
      id: s.id,
      nombre: s.nombre,
      campus: s.campus,
      productosActivos: store.products.filter(p => p.vendedor_id === s.id && p.activo !== false).length
    }));
    return res.json({ sellers: result, total: result.length });
  } catch (err) {
    return res.status(500).json({ error: 'Error listando vendedores.' });
  }
}
