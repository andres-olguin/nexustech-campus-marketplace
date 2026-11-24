import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, cleanUrl, configure, storage } from '../services/api';
import { DEFAULT_API_URL } from '../config';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null); // { accessToken, user }
  const [apiUrl, setApiUrlState] = useState(DEFAULT_API_URL);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const signOut = useCallback(async () => {
    configure({ token: null });
    setSession(null);
    setFavoriteIds(new Set());
    await storage.del('session');
  }, []);

  useEffect(() => {
    configure({ onUnauthorized: () => { signOut(); } });
  }, [signOut]);

  // Restaurar dirección de la API y sesión guardadas
  useEffect(() => {
    (async () => {
      const savedUrl = await storage.get('apiUrl');
      if (savedUrl) { configure({ baseUrl: savedUrl }); setApiUrlState(savedUrl); }
      const savedSession = await storage.get('session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          configure({ token: parsed.accessToken });
          setSession(parsed);
        } catch {}
      }
      setReady(true);
    })();
  }, []);

  const setApiUrl = useCallback(async (value) => {
    const url = cleanUrl(value);
    configure({ baseUrl: url });
    setApiUrlState(url);
    await storage.set('apiUrl', url);
  }, []);

  const startSession = useCallback(async (data) => {
    configure({ token: data.accessToken });
    setSession(data);
    await storage.set('session', JSON.stringify(data));
  }, []);

  const signIn = useCallback(async (email, password) => {
    const data = await api.login(email.trim().toLowerCase(), password);
    await startSession(data);
  }, [startSession]);

  const signUp = useCallback(async (email, password, name) => {
    await api.register(email.trim().toLowerCase(), password, name.trim());
    await signIn(email, password);
  }, [signIn]);

  // Favoritos compartidos entre pantallas (se sincronizan con la API)
  const loadFavorites = useCallback(async () => {
    const page = await api.favorites({ page: 1, limit: 100 });
    setFavoriteIds(new Set(page.items.map((f) => f.productId)));
    return page;
  }, []);

  const toggleFavorite = useCallback(async (productId) => {
    const was = favoriteIds.has(productId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      was ? next.delete(productId) : next.add(productId);
      return next;
    });
    try {
      was ? await api.removeFavorite(productId) : await api.addFavorite(productId);
    } catch (e) {
      // Revertir si la API rechazó el cambio
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        was ? next.add(productId) : next.delete(productId);
        return next;
      });
      throw e;
    }
  }, [favoriteIds]);

  useEffect(() => {
    if (session) loadFavorites().catch(() => {});
  }, [session, loadFavorites]);

  const value = useMemo(() => ({
    ready, session, user: session?.user, apiUrl, setApiUrl, signIn, signUp, signOut,
    favoriteIds, toggleFavorite, loadFavorites,
  }), [ready, session, apiUrl, setApiUrl, signIn, signUp, signOut, favoriteIds, toggleFavorite, loadFavorites]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
