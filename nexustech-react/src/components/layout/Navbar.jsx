import { useState } from "react";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
export default function Navbar({
  route,
  cartCount,
  favoriteCount,
  user,
  onCart,
  onPublish,
}) {
  const [open, setOpen] = useState(false);
  const links = [
    ["catalogo", "Catálogo"],
    ["favoritos", "Favoritos"],
    ["rastreo", "Pedidos"],
    ["historial", "Actividad"],
  ];
  return (
    <header className="nt-header">
      <div className="nt-nav-shell">
        <a
          className="nt-brand"
          href="#/catalogo"
          aria-label="NexusTech, inicio"
        >
          <span className="nt-brand-mark">
            <Icon name="cpu" size={25} />
          </span>
          <span>
            <strong>
              NEXUS<span>TECH</span>
            </strong>
            <small>CAMPUS MARKETPLACE</small>
          </span>
        </a>
        <nav
          className={"nt-navigation" + (open ? " is-open" : "")}
          id="nexus-menu"
          aria-label="Navegación principal"
        >
          {links.map(([value, label]) => (
            <a
              key={value}
              href={"#/" + value}
              aria-current={route === value ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
              {value === "favoritos" && favoriteCount
                ? ` (${favoriteCount})`
                : ""}
            </a>
          ))}
          <a
            href="#/acceso"
            className="nt-mobile-auth"
            onClick={() => setOpen(false)}
          >
            Mi cuenta
          </a>
        </nav>
        <div className="nt-nav-actions">
          <Button variant="secondary" icon="plus" onClick={onPublish}>
            Publicar
          </Button>
          <Button
            icon="cart"
            aria-label={"Abrir carrito, " + cartCount + " unidades"}
            onClick={onCart}
          >
            <span className="nt-cart-label">Carrito</span>
            <span className="nt-count">{cartCount}</span>
          </Button>
          <a className="nt-auth-link" href="#/acceso">
            {user ? (
              <>
                <span className="nt-avatar">{user.name[0].toUpperCase()}</span>
                <span className="nt-account-label">Mi cuenta</span>
              </>
            ) : (
              "Ingresar"
            )}
          </a>
          <Button
            variant="ghost"
            icon={open ? "close" : "menu"}
            className="nt-menu-toggle nt-icon-button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="nexus-menu"
            onClick={() => setOpen(!open)}
          />
        </div>
      </div>
    </header>
  );
}
