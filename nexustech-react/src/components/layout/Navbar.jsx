import { useState } from 'react';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import DepartmentMenu from './DepartmentMenu.jsx';

export default function Navbar({ route, section, cartCount, favoriteCount, user, onCart, onPublish, onCatalogReselect }) {
  const [menu, setMenu] = useState(null);
  const open = menu === 'site';
  const links = [['catalogo', 'Catálogo'], ['favoritos', 'Favoritos'], ['rastreo', 'Rastreo'], ['contacto', 'Contacto']];
  return <header className="nt-header">
    <div className="nt-nav-shell">
      <a className="nt-brand" href="#/catalogo" aria-label="NexusTech, inicio"><span className="nt-brand-mark"><Icon name="cpu" size={25} /></span><span><strong>NEXUS<span>TECH</span></strong><small>CAMPUS HUB · UNAB</small></span></a>
      <nav className={'nt-navigation' + (open ? ' is-open' : '')} id="nexus-menu" aria-label="Navegación principal">
        {links.map(([value, label]) => <a key={value} href={'#/' + value} aria-current={route === value ? 'page' : undefined} onClick={() => setMenu(null)}>{label}</a>)}
        <a href="#/acceso" className="nt-mobile-auth" onClick={() => setMenu(null)}>{user ? 'Mi cuenta' : 'Ingresar'}</a>
        <Button variant="secondary" icon="plus" className="nt-mobile-publish" onClick={() => { setMenu(null); onPublish(); }}>Publicar producto</Button>
      </nav>
      <div className="nt-nav-actions">
        <Button variant="secondary" icon="plus" className="nt-desktop-publish" onClick={onPublish}>Publicar</Button>
        <a className="nt-nav-favorites" href="#/favoritos" aria-label={'Abrir favoritos, ' + favoriteCount + ' guardados'}><Icon name="heart" /><span>{favoriteCount}</span></a>
        <Button icon="cart" className="nt-cart-trigger" aria-label={'Abrir carrito, ' + cartCount + ' unidades'} onClick={onCart}><span className="nt-cart-label">Carrito</span><span className="nt-count">{cartCount}</span></Button>
        <a className="nt-auth-link" href="#/acceso">{user ? <><span className="nt-avatar">{user.nombre.slice(0, 1).toUpperCase()}</span><span>{user.nombre}</span></> : <><Icon name="user" size={18} /><span>Ingresar</span></>}</a>
        <Button variant="ghost" icon={open ? 'close' : 'menu'} className="nt-menu-toggle nt-icon-button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} aria-controls="nexus-menu" onClick={() => setMenu(open ? null : 'site')} />
      </div>
    </div>
    <DepartmentMenu activeId={open ? null : menu} onChange={setMenu} section={section} onReselect={onCatalogReselect} />
  </header>;
}
