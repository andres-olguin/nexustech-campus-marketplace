import unabLogo from "../../assets/images/logos/logo-unab.png";
import mastertechLogo from "../../assets/images/logos/logo-mastertech.png";
import Icon from "../ui/Icon.jsx";

export default function Footer() {
  return (
    <footer className="nt-footer">
      <div className="nt-footer-main">
        {/* Columna 1: NexusTech Brand */}
        <div className="nt-footer-col nt-footer-brand">
          <div className="nt-footer-brand-title">
            <span className="nt-brand-mark nt-brand-mark-small">
              <Icon name="cpu" size={20} />
            </span>
            <strong>
              NEXUS<span>TECH</span>
            </strong>
          </div>
          <p className="nt-footer-desc">
            Campus Marketplace — Plataforma de intercambio y comercio de tecnología
            diseñada para la comunidad estudiantil y académica.
          </p>
          <div className="nt-footer-tech-stack">
            <span className="nt-tech-tag">NestJS 11</span>
            <span className="nt-tech-tag">PostgreSQL 16</span>
            <span className="nt-tech-tag">React 19</span>
            <span className="nt-tech-tag">TypeORM</span>
            <span className="nt-tech-tag">Docker</span>
          </div>
        </div>

        {/* Columna 2: Contexto Académico UNAB */}
        <div className="nt-footer-col nt-footer-academic">
          <span className="nt-footer-heading">PROYECTO ACADÉMICO</span>
          <div className="nt-unab-card">
            <img
              src={unabLogo}
              alt="Universidad Andrés Bello"
              className="nt-unab-footer-logo"
            />
            <p>
              Desarrollado para la asignatura <strong>Taller de Integración 3</strong>.
              Escuela de Tecnologías de la Información, Facultad de Ingeniería.
            </p>
            <div className="nt-campus-badges">
              <span>Sede Santiago</span>
              <span>Sede Viña del Mar</span>
              <span>Sede Concepción</span>
            </div>
          </div>
        </div>

        {/* Columna 3: Colaboración MasterTech */}
        <div className="nt-footer-col nt-footer-partner">
          <span className="nt-footer-heading">APOYO DE INDUSTRIA</span>
          <div className="nt-partner-card">
            <div className="nt-partner-header">
              <img
                src={mastertechLogo}
                alt="Logo MasterTech"
                className="nt-partner-logo"
              />
              <div>
                <strong>MasterTech SpA</strong>
                <small>Colaborador técnico y metodológico</small>
              </div>
            </div>
            <p>
              Desarrollado con apoyo en arquitectura de software, prácticas de
              integración continua y estándares profesionales de ingeniería.
            </p>
          </div>
        </div>
      </div>

      {/* Franja inferior: advertencias de simulación y enlaces rápidos */}
      <div className="nt-footer-bottom">
        <div className="nt-footer-disclaimer">
          <span className="nt-sim-badge">ENTORNO ACADÉMICO</span>
          <span>
            Todas las operaciones, pagos y despachos son simulados sin validez financiera ni tributaria.
          </span>
        </div>
        <div className="nt-footer-nav">
          <a href="#/catalogo">Catálogo</a>
          <span className="nt-dot-sep">·</span>
          <a href="#/favoritos">Favoritos</a>
          <span className="nt-dot-sep">·</span>
          <a href="#/rastreo">Pedidos y ventas</a>
          <span className="nt-dot-sep">·</span>
          <a href="#/historial">Actividad</a>
          <span className="nt-dot-sep">·</span>
          <a href="#/contacto">Contacto</a>
        </div>
        <small className="nt-footer-copy">
          NexusTech © 2026 · Proyecto académico Universidad Andrés Bello.
        </small>
      </div>
    </footer>
  );
}
