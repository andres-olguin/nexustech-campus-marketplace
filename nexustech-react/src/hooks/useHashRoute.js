import { useEffect, useState } from 'react';
const pages = ['catalogo', 'favoritos', 'rastreo', 'historial', 'contacto', 'acceso'];
function readRoute() {
  const page = location.hash.replace(/^#\/?/, '').split('?')[0];
  return pages.includes(page) ? page : 'catalogo';
}
export default function useHashRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const change = () => setRoute(readRoute());
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  return route;
}
