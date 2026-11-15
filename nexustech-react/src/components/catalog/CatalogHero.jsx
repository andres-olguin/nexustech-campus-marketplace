import hero from "../../assets/images/laptop.jpg";
import Badge from "../ui/Badge.jsx";
import Icon from "../ui/Icon.jsx";
import unabIsotipo from "../../assets/images/logos/isotipo-unab.png";
import mastertechLogo from "../../assets/images/logos/logo-mastertech.png";

export default function CatalogHero({ count, onPublish }) {
  return (
    <section className="nt-hero" aria-labelledby="catalogo-titulo">
      <div className="nt-hero-copy">
        <div className="nt-hero-badges">
          <span className="nt-academic-chip">
            <img src={unabIsotipo} alt="UNAB" className="nt-mini-logo" />
            <span>UNAB · SEDE VIÑA DEL MAR · DESARROLLO WEB Y MÓVIL</span>
          </span>
          <Badge variant="cyan">HITO 3 · PROTOTIPO ESTUDIANTIL</Badge>
        </div>

        <h1 id="catalogo-titulo">
          Tecnología que resuelve <span>problemas reales.</span>
        </h1>
        <p>
          Encuentra hardware, componentes y soluciones informáticas entre
          estudiantes de Viña del Mar. Catálogo con persistencia SQL y stock en
          tiempo real.
        </p>

        <div className="nt-hero-meta">
          <span className="nt-meta-item">
            <Icon name="grid" size={17} />
            <span>
              <strong>{count.toLocaleString("es-CL")}</strong> publicaciones disponibles
            </span>
          </span>
          <button className="nt-hero-cta" onClick={onPublish}>
            Publicar mi equipo
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </div>

      <div className="nt-hero-visual">
        <div className="nt-hero-image-wrap">
          <img
            src={hero}
            alt="Computadora portátil, imagen representativa del catálogo tecnológico"
          />
          <div className="nt-hero-photo-note">
            <span>COMUNIDAD UNIVERSITARIA</span>
            <strong>Encuentra tu próximo equipo informático.</strong>
          </div>
        </div>

        {/* Chips flotantes institucionales */}
        <div className="nt-hero-chip nt-hero-chip-top">
          <Icon name="cpu" size={20} />
          <span>
            Hardware & soluciones
            <small>Sede Viña del Mar</small>
          </span>
        </div>

        <div className="nt-hero-chip nt-hero-chip-bottom">
          <img src={mastertechLogo} alt="MasterTech" className="nt-mini-logo-partner" />
          <span>
            Desarrollo Full Stack
            <small>Apoyo MasterTech SpA</small>
          </span>
        </div>
      </div>
    </section>
  );
}
