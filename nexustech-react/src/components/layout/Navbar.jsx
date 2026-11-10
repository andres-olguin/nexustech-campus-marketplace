import { useState } from "react";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import unabIsotipo from "../../assets/images/logos/isotipo-unab.png";
import mastertechLogo from "../../assets/images/logos/logo-mastertech.png";

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
    ["contacto", "Contacto"],
  ];

  return (
    <header className="nt-header">
      {/* Franja institucional superior UNAB / MasterTech */}
      <aside className="nt-academic-ribbon" aria-label="Contexto institucional">
        <div className="nt-ribbon-shell">
          <div className="nt-ribbon-left">
            <img
              src={unabIsotipo}
              alt="Isotipo Universidad Andrés Bello"
              className="nt-ribbon-logo"
            />
            <span className="nt-ribbon-text">
              <strong>UNAB · Sede Viña del Mar</strong>
              <span className="nt-ribbon-sep">·</span>
              <span className="nt-ribbon-pill">Desarrollo Web y Móvil · Hito 3</span>
            </span>
          </div>
          <div className="nt-ribbon-right">
            <span className="nt-ribbon-partner">
              <img
                src={mastertechLogo}
                alt="Emblema MasterTech"
                className="nt-ribbon-partner-logo"
              />
              <span>Desarrollado con apoyo de <strong>MasterTech SpA</strong></span>
            </span>
          </div>
        </div>
      </aside>

      {/* Barra de navegación principal NexusTech */}
      <div className="nt-nav-shell">
        <a
          className="nt-brand"
          href="#/catalogo"
          aria-label="NexusTech Campus Marketplace, ir al inicio"
        >
          <span className="nt-brand-mark">
            <Icon name="cpu" size={24} />
          </span>
          <span className="nt-brand-text">
            <strong>
              NEXUS<span>TECH</span>
            </strong>
            <small>MARKETPLACE ESTUDIANTIL · VIÑA DEL MAR</small>
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
              {value === "favoritos" && favoriteCount > 0 && (
                <span className="nt-nav-pill">{favoriteCount}</span>
              )}
            </a>
          ))}
          <a
            href="#/acceso"
            className="nt-mobile-auth"
            onClick={() => setOpen(false)}
          >
            {user ? "Mi cuenta (" + user.name + ")" : "Ingresar / Registro"}
          </a>
        </nav>

        <div className="nt-nav-actions">
          <Button
            variant="secondary"
            icon="plus"
            onClick={onPublish}
            className="nt-btn-publish"
          >
            Publicar
          </Button>

          <Button
            icon="cart"
            aria-label={"Abrir carrito, " + cartCount + " unidades"}
            onClick={onCart}
            className="nt-btn-cart"
          >
            <span className="nt-cart-label">Carrito</span>
            <span className="nt-count">{cartCount}</span>
          </Button>

          <a
            className="nt-auth-link"
            href="#/acceso"
            aria-label={user ? "Mi cuenta: " + user.name : "Iniciar sesión o registrarse"}
          >
            {user ? (
              <>
                <span className="nt-avatar">{user.name[0].toUpperCase()}</span>
                <span className="nt-account-label">Mi cuenta</span>
              </>
            ) : (
              <span className="nt-login-cta">Ingresar</span>
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
