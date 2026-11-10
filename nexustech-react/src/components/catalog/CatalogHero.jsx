import hero from "../../assets/images/laptop.jpg";
import Badge from "../ui/Badge.jsx";
import Icon from "../ui/Icon.jsx";
export default function CatalogHero({ count, onPublish }) {
  return (
    <section className="nt-hero" aria-labelledby="catalogo-titulo">
      <div className="nt-hero-copy">
        <Badge>TECNOLOGÍA PARA TU COMUNIDAD</Badge>
        <h1 id="catalogo-titulo">
          Tecnología que resuelve <span>problemas reales.</span>
        </h1>
        <p>
          Encuentra hardware y soluciones informáticas en el marketplace de tu
          campus.
        </p>
        <div className="nt-hero-meta">
          <span>
            <Icon name="grid" size={17} />
            <strong>{count.toLocaleString("es-CL")}</strong> publicaciones
            consultadas
          </span>
          <button onClick={onPublish}>
            Comparte tu equipo
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </div>
      <div className="nt-hero-visual">
        <img
          src={hero}
          alt="Computadora portátil, imagen representativa del catálogo"
        />
        <div className="nt-hero-photo-note">
          <span>PARA TU PRÓXIMO PROYECTO</span>
          <strong>Encuentra tu siguiente equipo.</strong>
        </div>
        <div className="nt-hero-chip">
          <Icon name="cpu" size={20} />
          <span>
            Hardware & soluciones<small>Campus Hub UNAB</small>
          </span>
        </div>
      </div>
    </section>
  );
}
