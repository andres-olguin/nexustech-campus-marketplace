import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, createApiClient } from '../services/nestApi.js';

export function useRemote(load, dependencies) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading', data: null, error: null });
    Promise.resolve().then(() => load(controller.signal)).then(data => {
      if (!controller.signal.aborted) setState({ status: 'success', data, error: null });
    }).catch(error => { if (!controller.signal.aborted) setState({ status: 'error', data: null, error }); });
    return () => controller.abort();
  }, dependencies);
  return state;
}
export default function useShop() {
  const [session, setSession] = useState(null);
  const [notice, setNotice] = useState(null);
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const pendingCheckout = useRef(null);
  const pendingOwner = useRef(null);
  const [attempt, setAttempt] = useState(null);
  const [api] = useState(() => createApiClient({ onUnauthorized: () => {
    setSession(null);
    setNotice({ tone: 'error', message: 'Tu sesión venció. Inicia sesión nuevamente.' });
  } }));
  const categories = useRemote(signal => api.categories(signal), [api, revision]);
  const account = useRemote(async signal => {
    if (!session) return null;
    const [profile, cart, first] = await Promise.all([api.profile(signal), api.cart(signal), api.favorites(1, signal)]);
    const favorites = [...first.items];
    for (let page = 2; favorites.length < first.total; page++) {
      const next = await api.favorites(page, signal);
      if (!next.items.length) break;
      favorites.push(...next.items);
    }
    return { profile, cart, favorites };
  }, [api, session, revision]);
  useEffect(() => {
    if (!session) { api.setToken(null); return; }
    let expiry;
    try { expiry = JSON.parse(atob(session.accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp * 1000; }
    catch { setSession(null); return; }
    const expire = () => { api.setToken(null); setSession(null); setNotice({ tone: 'error', message: 'Tu sesión venció. Inicia sesión nuevamente. Si había una compra pendiente, verifica tus pedidos antes de iniciar otra.' }); };
    if (!Number.isFinite(expiry) || expiry <= Date.now()) { expire(); return; }
    const timer = setTimeout(expire, Math.min(expiry - Date.now(), 2147483647));
    return () => clearTimeout(timer);
  }, [api, session]);
  const run = useCallback(async (action, message) => {
    if (lock.current) throw new ApiError('Hay una operación en curso. Espera a que termine.');
    lock.current = true; setBusy(true);
    try {
      const result = await action();
      setRevision(v => v + 1);
      if (message) setNotice({ tone: 'success', message });
      return result;
    } catch (error) { if (error.status === 409) setRevision(v => v + 1); setNotice({ tone: 'error', message: error.message }); throw error; }
    finally { lock.current = false; setBusy(false); }
  }, []);
  const act = action => { void action().catch(() => {}); };
  async function authenticate(body, register) {
    const result = await run(() => register ? api.register(body) : api.login(body));
    if (pendingOwner.current !== result.user.id) { pendingCheckout.current = null; pendingOwner.current = null; setAttempt(null); }
    api.setToken(result.accessToken); setSession(result);
  }
  function logout() {
    api.setToken(null); setSession(null); pendingCheckout.current = null; pendingOwner.current = null; setAttempt(null); setNotice(null);
  }
  async function checkout(shippingAddress) {
    if (!pendingCheckout.current) {
      pendingCheckout.current = { shippingAddress, idempotencyKey: crypto.randomUUID() };
      pendingOwner.current = session.user.id;
      setAttempt(pendingCheckout.current);
    }
    try {
      const result = await run(() => api.checkout(pendingCheckout.current));
      pendingCheckout.current = null; setAttempt(null);
      return result;
    } catch (error) {
      if ([400, 403, 404, 409].includes(error.status)) { pendingCheckout.current = null; setAttempt(null); }
      throw error;
    }
  }
  const data = session && account.status === 'success' && account.data?.profile.id === session.user.id ? account.data : null;
  return { api, session, user: session?.user, profile: data?.profile, account, categories, busy, revision, notice, setNotice, run, act,
    dismissNotice: () => setNotice(null), authenticate, logout, checkout, attempt,
    cart: data?.cart || null, favorites: data?.favorites || [], favoriteSet: new Set(data?.favorites.map(f => f.productId) || []),
    refresh: () => setRevision(v => v + 1),
  };
}
