import { useEffect, useState } from 'react';
import { getCatalogSection } from '../data/departments.js';
const pages = ['catalogo', 'favoritos', 'rastreo', 'contacto', 'acceso'];
function readRoute() {
  const [page, query] = location.hash.replace(/^#\/?/, '').split('?');
  const route = pages.includes(page) ? page : 'catalogo';
  const section = route === 'catalogo' ? getCatalogSection(new URLSearchParams(query).get('seccion')) : null;
  return { route, section };
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
