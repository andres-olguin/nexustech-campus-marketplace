// Dirección base de la API del Hito 3 (sin /api/v1).
// Se puede definir al compilar con EXPO_PUBLIC_API_URL o cambiar desde la pantalla de inicio de sesión.
// 10.0.2.2 es el localhost del PC visto desde el emulador de Android.
export const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3001';

export const COLORS = {
  primary: '#B3122D',
  primaryDark: '#8C0E23',
  bg: '#F5F5F7',
  card: '#FFFFFF',
  text: '#1D1D1F',
  muted: '#6E6E73',
  border: '#E2E2E6',
  ok: '#1B7F3B',
  warn: '#B26A00',
  danger: '#C62828',
};
