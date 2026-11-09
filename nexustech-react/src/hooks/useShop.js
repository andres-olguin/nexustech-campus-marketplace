import { useCallback, useEffect, useMemo, useState } from 'react';
import { createProducts } from '../data/createProducts.js';
import initialOrders from '../data/ordersDemo.json';
import { categories, finishes, formatCLP } from '../utils/format.js';
import { isValidPrice } from '../utils/pricing.js';
import { placeholder } from '../data/imageAssets.js';

const KEY = 'nexustech-react-v2';
const initialProducts = createProducts();
const initialIds = new Set(initialProducts.map((product) => product.id));
const cloneOrders = () => initialOrders.map((order) => ({ ...order, items: order.items.map((item) => ({ ...item })) }));
const freshState = () => ({ version: 2, publicaciones: [], eliminados: [], carrito: [], favoritos: [], usuario: null, pedidos: cloneOrders(), consultas: [] });
const validProduct = (p) => p && typeof p.id === 'string' && typeof p.nombre === 'string' && p.nombre.trim().length >= 3 && categories.includes(p.categoria) && Number.isInteger(p.precio) && p.precio >= 1000 && typeof p.descripcion === 'string' && typeof p.vendedor === 'string';

function readState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.version !== 2 || !Array.isArray(data.publicaciones) || !data.publicaciones.every(validProduct) || !Array.isArray(data.eliminados) || !Array.isArray(data.carrito) || !Array.isArray(data.favoritos) || !Array.isArray(data.pedidos) || !Array.isArray(data.consultas)) throw new Error('Formato inválido');
      const publicaciones = data.publicaciones.filter((p, i, all) => !initialIds.has(p.id) && all.findIndex((x) => x.id === p.id) === i);
      const eliminados = [...new Set(data.eliminados.filter((id) => initialIds.has(id)))];
      const ids = new Set([...initialProducts.filter((p) => !eliminados.includes(p.id)), ...publicaciones].map((p) => p.id));
      return {
        ...freshState(),
        publicaciones,
        eliminados,
        carrito: data.carrito.filter((item) => ids.has(item.id) && finishes.includes(item.acabado) && Number.isInteger(item.cantidad) && item.cantidad >= 1 && item.cantidad <= 99),
        favoritos: [...new Set(data.favoritos.filter((id) => ids.has(id)))],
        usuario: data.usuario && typeof data.usuario.nombre === 'string' && typeof data.usuario.email === 'string' ? { nombre: data.usuario.nombre, email: data.usuario.email } : null,
        pedidos: data.pedidos.filter((p) => p && typeof p.codigo === 'string' && Number.isInteger(p.paso) && p.paso >= 0 && p.paso <= 3 && typeof p.ciudad === 'string' && Array.isArray(p.items) && Number.isFinite(p.total) && !Number.isNaN(Date.parse(p.fecha))),
        consultas: data.consultas.filter((c) => c && typeof c.codigo === 'string' && typeof c.mensaje === 'string'),
      };
    }
  } catch {
    // Los datos mal formados o el almacenamiento bloqueado no impiden abrir la demo.
  }
  return freshState();
}

// Controlador local de la tienda. Los componentes reciben datos y callbacks.
export default function useShop() {
  const [state, setState] = useState(readState);
  const [storage, setStorage] = useState('loading');
  const [notice, setNotice] = useState(null);
  const [removed, setRemoved] = useState(null);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); setStorage('saved'); }
    catch { setStorage('session'); }
  }, [state]);
  useEffect(() => {
    if (!notice || notice.undo) return;
    const timer = setTimeout(() => setNotice(null), 6500);
    return () => clearTimeout(timer);
  }, [notice]);

  const availableExamples = useMemo(() => {
    const removedIds = new Set(state.eliminados);
    return initialProducts.filter((p) => !removedIds.has(p.id));
  }, [state.eliminados]);
  const products = useMemo(() => [...state.publicaciones, ...availableExamples], [state.publicaciones, availableExamples]);
  const editableIds = useMemo(() => new Set(state.publicaciones.map((p) => p.id)), [state.publicaciones]);
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const cart = useMemo(() => state.carrito.map((item) => ({ ...byId.get(item.id), ...item })).filter((item) => item.nombre), [state.carrito, byId]);
  const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0);
  const favoriteSet = useMemo(() => new Set(state.favoritos), [state.favoritos]);

  const addToCart = useCallback((id, quantity = 1, finish = finishes[0]) => {
    const product = byId.get(id);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || !finishes.includes(finish)) return;
    setState((current) => {
      const found = current.carrito.some((item) => item.id === id && item.acabado === finish);
      return { ...current, carrito: found
        ? current.carrito.map((item) => item.id === id && item.acabado === finish ? { ...item, cantidad: Math.min(99, item.cantidad + quantity) } : item)
        : [...current.carrito, { id, acabado: finish, cantidad: Math.min(99, quantity) }] };
    });
    setNotice({ title: 'Producto agregado', message: product.nombre + ' está en tu carrito.' });
  }, [byId]);
  function changeQuantity(id, finish, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return;
    setState((current) => ({ ...current, carrito: current.carrito.map((item) => item.id === id && item.acabado === finish ? { ...item, cantidad: quantity } : item) }));
  }
  function removeFromCart(id, finish) {
    setState((current) => ({ ...current, carrito: current.carrito.filter((item) => !(item.id === id && item.acabado === finish)) }));
  }
  const toggleFavorite = useCallback((id) => {
    if (!byId.has(id)) return;
    setState((current) => ({ ...current, favoritos: current.favoritos.includes(id) ? current.favoritos.filter((x) => x !== id) : [...current.favoritos, id] }));
  }, [byId]);
  function publish(values) {
    const product = {
      id: crypto.randomUUID(), nombre: values.nombre.trim(), categoria: values.categoria,
      precio: Number(values.precio), imagen: values.imagen.trim() || placeholder,
      descripcion: values.descripcion.trim(), vendedor: values.vendedor.trim(),
      contacto: state.usuario?.email || 'contacto de demostración', reseñas: [],
    };
    setState((current) => ({ ...current, publicaciones: [product, ...current.publicaciones] }));
    setNotice({ title: 'Publicación creada', message: 'Tu producto ya aparece en el catálogo.' });
    return product;
  }
  function updatePrice(id, price) {
    if (!editableIds.has(id) || !isValidPrice(price)) return false;
    const product = byId.get(id);
    if (product.precio === price) return true;
    setState((current) => ({
      ...current,
      publicaciones: current.publicaciones.map((p) => p.id === id ? { ...p, precio: price } : p),
    }));
    setNotice({ title: 'Precio actualizado', message: product.nombre + ' ahora cuesta ' + formatCLP(price) + '.' });
    return true;
  }
  function deleteProduct(id) {
    const product = byId.get(id);
    if (!product) return;
    setRemoved({ product, favorite: favoriteSet.has(id), cart: state.carrito.filter((item) => item.id === id) });
    setState((current) => ({
      ...current,
      publicaciones: current.publicaciones.filter((p) => p.id !== id),
      eliminados: initialIds.has(id) ? [...new Set([...current.eliminados, id])] : current.eliminados,
      favoritos: current.favoritos.filter((x) => x !== id),
      carrito: current.carrito.filter((item) => item.id !== id),
    }));
    setNotice({ title: 'Publicación eliminada', message: 'Se retiró el producto del catálogo, del carrito y de favoritos.', undo: true });
  }
  function undoDelete() {
    if (!removed) return;
    const { product, favorite, cart: oldCart } = removed;
    setState((current) => ({
      ...current,
      publicaciones: initialIds.has(product.id) || current.publicaciones.some((p) => p.id === product.id) ? current.publicaciones : [product, ...current.publicaciones],
      eliminados: current.eliminados.filter((id) => id !== product.id),
      favoritos: favorite ? [...new Set([...current.favoritos, product.id])] : current.favoritos,
      carrito: [...current.carrito, ...oldCart.filter((item) => !current.carrito.some((c) => c.id === item.id && c.acabado === item.acabado))],
    }));
    setRemoved(null);
    setNotice({ title: 'Publicación recuperada', message: 'El producto volvió a la tienda.' });
  }
  function checkout(values) {
    if (!cart.length) return null;
    let code;
    do { code = 'TRK-' + (100000 + crypto.getRandomValues(new Uint32Array(1))[0] % 900000); }
    while (state.pedidos.some((p) => p.codigo === code));
    const order = {
      codigo: code, fecha: new Date().toISOString(), nombre: values.nombre.trim(), email: values.email.trim(),
      direccion: values.direccion.trim(), ciudad: values.ciudad.trim(), origen: 'Santiago', paso: 0, total,
      items: cart.map((item) => ({ id: item.id, nombre: item.nombre, precio: item.precio, cantidad: item.cantidad, acabado: item.acabado })),
    };
    setState((current) => ({ ...current, carrito: [], pedidos: [order, ...current.pedidos] }));
    setNotice({ title: 'Pedido de demostración confirmado', message: 'Código de seguimiento: ' + code + '.' });
    return order;
  }
  function advanceOrder(code) {
    setState((current) => ({ ...current, pedidos: current.pedidos.map((p) => p.codigo === code ? { ...p, paso: Math.min(3, p.paso + 1) } : p) }));
  }
  function login(values) {
    setState((current) => ({ ...current, usuario: { nombre: values.nombre.trim(), email: values.email.trim() } }));
    setNotice({ title: 'Sesión de demostración iniciada', message: 'Bienvenido, ' + values.nombre.trim() + '.' });
  }
  function logout() {
    setState((current) => ({ ...current, usuario: null }));
    setNotice({ title: 'Sesión cerrada', message: 'El catálogo y tus productos guardados siguen disponibles.' });
  }
  function saveContact(values) {
    const code = 'CONS-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    setState((current) => ({ ...current, consultas: [{ codigo: code, nombre: values.nombre.trim(), email: values.email.trim(), mensaje: values.mensaje.trim() }, ...current.consultas] }));
    return code;
  }
  function resetDemo() {
    setState(freshState()); setRemoved(null);
    setNotice({ title: 'Demostración restaurada', message: 'Se recuperó el catálogo original y el pedido de ejemplo.' });
  }

  return { products, editableIds, cart, total, cartCount, favoriteSet, user: state.usuario, orders: state.pedidos, contacts: state.consultas, storage, notice, dismissNotice: () => setNotice(null), addToCart, changeQuantity, removeFromCart, toggleFavorite, publish, updatePrice, deleteProduct, undoDelete, checkout, advanceOrder, login, logout, saveContact, resetDemo };
}
