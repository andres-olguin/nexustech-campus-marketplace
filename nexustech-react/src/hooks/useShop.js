import { useEffect, useMemo, useState } from 'react';
import { createProducts } from '../data/createProducts.js';
import initialOrders from '../data/ordersDemo.json';
import { categories, finishes } from '../utils/format.js';
import { placeholder } from '../data/imageAssets.js';
import api from '../services/backendApi.js';

const KEY = 'nexustech-react-v3';
const initialProducts = createProducts();
const initialIds = new Set(initialProducts.map((product) => product.id));
const cloneOrders = () => initialOrders.map((order) => ({ ...order, items: order.items.map((item) => ({ ...item })) }));

const freshState = () => ({
  version: 3,
  publicaciones: [],
  modificados: {},
  eliminados: [],
  carrito: [],
  favoritos: [],
  usuario: {
    id: 'usr-demo',
    nombre: 'Estudiante UNAB',
    email: 'estudiante@uandresbello.edu',
    rol: 'ambos',
    campus: 'Campus República UNAB'
  },
  pedidos: cloneOrders(),
  consultas: [],
  transacciones: []
});

const validProduct = (p) => p && typeof p.id === 'string' && typeof p.nombre === 'string' && p.nombre.trim().length >= 3;

function readState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.version === 3 && Array.isArray(data.publicaciones) && Array.isArray(data.carrito) && Array.isArray(data.pedidos)) {
        return data;
      }
    }
  } catch {
    // Almacenamiento no disponible o corrupto
  }
  return freshState();
}

export default function useShop() {
  const [state, setState] = useState(readState);
  const [storage, setStorage] = useState('loading');
  const [notice, setNotice] = useState(null);
  const [removed, setRemoved] = useState(null);
  const [backendStatus, setBackendStatus] = useState({ online: false, checking: true });

  // Sincronización en LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      setStorage('saved');
    } catch {
      setStorage('session');
    }
  }, [state]);

  // Verificar backend al montar
  useEffect(() => {
    api.checkHealth().then((res) => {
      setBackendStatus({ online: res.success, checking: false, details: res.data });
    });
  }, []);

  // Temporizador de avisos
  useEffect(() => {
    if (!notice || notice.undo) return;
    const timer = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Catálogo unificado con modificaciones y nuevos productos
  const products = useMemo(() => {
    const base = initialProducts.filter((p) => !state.eliminados.includes(p.id));
    const mergedBase = base.map((p) => (state.modificados[p.id] ? { ...p, ...state.modificados[p.id] } : p));
    const activeCustom = state.publicaciones.filter((p) => !state.eliminados.includes(p.id)).map((p) => (state.modificados[p.id] ? { ...p, ...state.modificados[p.id] } : p));
    return [...activeCustom, ...mergedBase];
  }, [state.publicaciones, state.eliminados, state.modificados]);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const cart = state.carrito.map((item) => ({ ...byId.get(item.id), ...item })).filter((item) => item.nombre);
  const total = cart.reduce((sum, item) => sum + (item.precio || 0) * item.cantidad, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0);
  const favoriteSet = useMemo(() => new Set(state.favoritos), [state.favoritos]);

  function addToCart(id, quantity = 1, finish = finishes[0]) {
    const product = byId.get(id);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || !finishes.includes(finish)) return;

    setState((current) => {
      const found = current.carrito.some((item) => item.id === id && item.acabado === finish);
      return {
        ...current,
        carrito: found
          ? current.carrito.map((item) => (item.id === id && item.acabado === finish ? { ...item, cantidad: Math.min(99, item.cantidad + quantity) } : item))
          : [...current.carrito, { id, acabado: finish, cantidad: Math.min(99, quantity) }]
      };
    });

    setNotice({ title: 'Producto agregado', message: `${product.nombre} (${finish}) está en tu carrito.` });

    // Telemetría MongoDB
    api.logInteraction('ADD_TO_CART', { finish, quantity, price: product.precio, name: product.nombre }, id);
  }

  function changeQuantity(id, finish, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return;
    setState((current) => ({
      ...current,
      carrito: current.carrito.map((item) => (item.id === id && item.acabado === finish ? { ...item, cantidad: quantity } : item))
    }));
  }

  function removeFromCart(id, finish) {
    setState((current) => ({
      ...current,
      carrito: current.carrito.filter((item) => !(item.id === id && item.acabado === finish))
    }));
  }

  function toggleFavorite(id) {
    if (!byId.has(id)) return;
    const isFav = favoriteSet.has(id);
    setState((current) => ({
      ...current,
      favoritos: isFav ? current.favoritos.filter((x) => x !== id) : [...current.favoritos, id]
    }));
    // Telemetría MongoDB
    api.logInteraction(isFav ? 'REMOVE_FAVORITE' : 'ADD_FAVORITE', { id }, id);
  }

  async function publish(values) {
    const product = {
      id: 'prod-' + crypto.randomUUID().slice(0, 8),
      nombre: values.nombre.trim(),
      categoria: values.categoria,
      precio: Number(values.precio),
      imagen: values.imagen?.trim() || placeholder,
      descripcion: values.descripcion.trim(),
      vendedor: values.vendedor?.trim() || state.usuario?.nombre || 'Estudiante UNAB',
      vendedor_id: state.usuario?.id || 'usr-demo',
      contacto: state.usuario?.email || 'contacto@uandresbello.edu',
      stock: Number(values.stock) || 3,
      condicion: values.condicion || 'Como nuevo',
      reseñas: []
    };

    setState((current) => ({ ...current, publicaciones: [product, ...current.publicaciones] }));
    setNotice({ title: 'Publicación creada en el catálogo', message: `"${product.nombre}" fue publicado por ${product.vendedor}.` });

    // Enviar al backend si está online
    api.createProduct({
      nombre: product.nombre,
      categoria: product.categoria,
      precio: product.precio,
      imagen: product.imagen,
      descripcion: product.descripcion,
      vendedor_nombre: product.vendedor,
      vendedor_id: product.vendedor_id,
      stock: product.stock,
      condicion: product.condicion
    });

    return product;
  }

  async function editProduct(id, values) {
    const current = byId.get(id);
    if (!current) return;

    const updated = {
      ...current,
      nombre: values.nombre ? values.nombre.trim() : current.nombre,
      categoria: values.categoria || current.categoria,
      precio: values.precio !== undefined ? Number(values.precio) : current.precio,
      descripcion: values.descripcion ? values.descripcion.trim() : current.descripcion,
      stock: values.stock !== undefined ? Number(values.stock) : current.stock,
      condicion: values.condicion || current.condicion
    };

    setState((prev) => ({
      ...prev,
      modificados: { ...prev.modificados, [id]: updated }
    }));

    setNotice({ title: 'Publicación modificada', message: `Se actualizaron los datos de "${updated.nombre}".` });

    api.updateProduct(id, updated);
    return updated;
  }

  function deleteProduct(id) {
    const product = byId.get(id);
    if (!product) return;
    setRemoved({ product, favorite: favoriteSet.has(id), cart: state.carrito.filter((item) => item.id === id) });
    setState((current) => ({
      ...current,
      publicaciones: current.publicaciones.filter((p) => p.id !== id),
      eliminados: [...new Set([...current.eliminados, id])],
      favoritos: current.favoritos.filter((x) => x !== id),
      carrito: current.carrito.filter((item) => item.id !== id)
    }));
    setNotice({ title: 'Publicación eliminada', message: 'Se retiró el producto del catálogo.', undo: true });

    api.deleteProduct(id);
  }

  function undoDelete() {
    if (!removed) return;
    const { product, favorite, cart: oldCart } = removed;
    setState((current) => ({
      ...current,
      eliminados: current.eliminados.filter((id) => id !== product.id),
      favoritos: favorite ? [...new Set([...current.favoritos, product.id])] : current.favoritos,
      carrito: [...current.carrito, ...oldCart.filter((item) => !current.carrito.some((c) => c.id === item.id && c.acabado === item.acabado))]
    }));
    setRemoved(null);
    setNotice({ title: 'Publicación recuperada', message: 'El producto volvió al catálogo.' });

    api.restoreProduct(product.id);
  }

  async function checkout(values, paymentResult = null) {
    if (!cart.length) return null;
    let code;
    do {
      code = 'TRK-' + (100000 + Math.floor(Math.random() * 900000));
    } while (state.pedidos.some((p) => p.codigo === code));

    const order = {
      codigo: code,
      fecha: new Date().toISOString(),
      nombre: values.nombre.trim(),
      email: values.email.trim(),
      direccion: values.direccion.trim(),
      ciudad: values.ciudad.trim(),
      origen: 'Campus Hub UNAB Santiago',
      paso: 0,
      estado: 'Pedido Confirmado',
      total,
      metodo_pago: paymentResult?.metodo || 'Webpay Plus Simulado',
      transaccion: paymentResult || { codigoAutorizacion: 'AUTH-DEMO-99', estado: 'AUTHORIZED' },
      items: cart.map((item) => ({ id: item.id, nombre: item.nombre, precio: item.precio, cantidad: item.cantidad, acabado: item.acabado }))
    };

    setState((current) => ({
      ...current,
      carrito: [],
      pedidos: [order, ...current.pedidos]
    }));

    setNotice({ title: 'Compra simulada exitosa', message: `Pedido ${code} confirmado. Pago Webpay autorizado.` });

    api.createOrder(order);
    return order;
  }

  function advanceOrder(code) {
    setState((current) => ({
      ...current,
      pedidos: current.pedidos.map((p) => (p.codigo === code ? { ...p, paso: Math.min(3, p.paso + 1) } : p))
    }));
    api.advanceOrderStatus(code);
  }

  async function login(values) {
    const userObj = {
      id: values.id || 'usr-' + Date.now().toString(36),
      nombre: values.nombre.trim(),
      email: values.email.trim(),
      rol: values.rol || 'ambos',
      campus: values.campus || 'Campus República UNAB',
      telefono: values.telefono || '+56 9 8888 7777'
    };
    setState((current) => ({ ...current, usuario: userObj }));
    setNotice({ title: 'Sesión iniciada', message: `Bienvenido(a), ${userObj.nombre} (${userObj.rol.toUpperCase()}).` });

    api.login(values.email, values.password);
  }

  function logout() {
    setState((current) => ({ ...current, usuario: null }));
    setNotice({ title: 'Sesión cerrada', message: 'Has cerrado sesión en NexusTech.' });
  }

  function switchRole(newRole) {
    if (!state.usuario) return;
    const target = newRole || (state.usuario.rol === 'vendedor' ? 'comprador' : 'vendedor');
    setState((current) => ({
      ...current,
      usuario: { ...current.usuario, rol: target }
    }));
    setNotice({ title: 'Modo de cuenta cambiado', message: `Ahora estás operando como ${target.toUpperCase()}.` });
    api.switchRole(state.usuario.id, target);
  }

  function saveContact(values) {
    const code = 'CONS-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    setState((current) => ({
      ...current,
      consultas: [{ codigo: code, nombre: values.nombre.trim(), email: values.email.trim(), mensaje: values.mensaje.trim(), fecha: new Date().toISOString() }, ...current.consultas]
    }));
    return code;
  }

  function resetDemo() {
    setState(freshState());
    setRemoved(null);
    setNotice({ title: 'Demostración restaurada', message: 'Se restableció el catálogo y datos de prueba.' });
  }

  return {
    products,
    cart,
    total,
    cartCount,
    favoriteSet,
    user: state.usuario,
    orders: state.pedidos,
    contacts: state.consultas,
    storage,
    backendStatus,
    notice,
    dismissNotice: () => setNotice(null),
    addToCart,
    changeQuantity,
    removeFromCart,
    toggleFavorite,
    publish,
    editProduct,
    deleteProduct,
    undoDelete,
    checkout,
    advanceOrder,
    login,
    logout,
    switchRole,
    saveContact,
    resetDemo
  };
}
