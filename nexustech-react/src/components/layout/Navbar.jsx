import { useState } from 'react';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import Badge from '../ui/Badge.jsx';

export default function Navbar({
  route,
  cartCount,
  favoriteCount,
  user,
  backendOnline = false,
  onCart,
  onPublish
}) {
  const [open, setOpen] = useState(false);
  const links = [
    ['catalogo', 'Catálogo'],
    ['favoritos', 'Favoritos'],
    ['rastreo', 'Rastreo'],
    ['historial', 'Historial MongoDB'],
    ['contacto', 'Contacto']
  ];

  const userRole = user?.rol || 'comprador';
  const isSeller = userRole === 'vendedor' || userRole === 'ambos';

  return (
    <header className="nt-header">
      <div className="nt-nav-shell">
        <a className="nt-brand" href="#/catalogo" aria-label="NexusTech, inicio">
          <span className="nt-brand-mark">
            <Icon name="cpu" size={25} />
          </span>
          <span>
            <strong>
              NEXUS<span>TECH</span>
            </strong>
            <small>CAMPUS HUB · UNAB</small>
          </span>
        </a>

        <div className="nt-backend-badge-pill" title="Estado de la integración PostgreSQL + MongoDB">
          <span className={`nt-status-dot ${backendOnline ? 'is-online' : 'is-standby'}`} />
          <span>{backendOnline ? 'API Fullstack Activa' : 'Modo Híbrido Resiliente'}</span>
        </div>

        <nav className={'nt-navigation' + (open ? ' is-open' : '')} id="nexus-menu" aria-label="Navegación principal">
          {links.map(([value, label]) => (
            <a
              key={value}
              href={'#/' + value}
              aria-current={route === value ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
          <a href="#/acceso" className="nt-mobile-auth" onClick={() => setOpen(false)}>
            {user ? `${user.nombre} (${userRole})` : 'Ingresar'}
          </a>
          {isSeller && (
            <Button
              variant="secondary"
              icon="plus"
              className="nt-mobile-publish"
              onClick={() => {
                setOpen(false);
                onPublish();
              }}
            >
              Publicar producto
            </Button>
          )}
        </nav>

        <div className="nt-nav-actions">
          {isSeller && (
            <Button variant="secondary" icon="plus" className="nt-desktop-publish" onClick={onPublish}>
              Publicar
            </Button>
          )}

          <a
            className="nt-nav-favorites"
            href="#/favoritos"
            aria-label={'Abrir favoritos, ' + favoriteCount + ' guardados'}
          >
            <Icon name="heart" />
            <span>{favoriteCount}</span>
          </a>

          <Button
            icon="cart"
            className="nt-cart-trigger"
            aria-label={'Abrir carrito, ' + cartCount + ' unidades'}
            onClick={onCart}
          >
            <span className="nt-cart-label">Carrito</span>
            <span className="nt-count">{cartCount}</span>
          </Button>

          <a className="nt-auth-link" href="#/acceso">
            {user ? (
              <>
                <span className="nt-avatar">{user.nombre.slice(0, 1).toUpperCase()}</span>
                <span>{user.nombre}</span>
              </>
            ) : (
              <>
                <Icon name="user" size={18} />
                <span>Ingresar</span>
              </>
            )}
          </a>

          <Button
            variant="ghost"
            icon={open ? 'close' : 'menu'}
            className="nt-menu-toggle nt-icon-button"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="nexus-menu"
            onClick={() => setOpen(!open)}
          />
        </div>
      </div>
    </header>
  );
}
