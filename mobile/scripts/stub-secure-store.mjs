// Sustituto de expo-secure-store para ejecutar el cliente HTTP de la app en Node.
const mem = new Map();
export const getItemAsync = async (k) => mem.get(k) ?? null;
export const setItemAsync = async (k, v) => { mem.set(k, v); };
export const deleteItemAsync = async (k) => { mem.delete(k); };
