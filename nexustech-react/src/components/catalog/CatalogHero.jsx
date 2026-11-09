import hero from '../../assets/images/laptop.jpg';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { formatNumber } from '../../utils/format.js';

export default function CatalogHero({ count, onExplore, onPublish }) {
  return <section className="nt-hero" aria-labelledby="catalogo-titulo" style={{ '--nt-hero-image': 'url("' + hero + '")' }}>
    <div className="nt-hero-visual" aria-hidden="true" />
    <div className="nt-hero-copy">
      <span className="nt-hero-kicker"><span /> MARKETPLACE DEL CAMPUS</span>
      <h1 id="catalogo-titulo">Tu próximo equipo <span>empieza aquí.</span></h1>
      <p>Hardware y tecnología para estudiar, crear y trabajar.</p>
      <div className="nt-hero-actions">
        <Button icon="search" onClick={onExplore}>Explorar catálogo</Button>
        <Button variant="secondary" icon="plus" onClick={onPublish}>Publicar equipo</Button>
      </div>
    </div>
    <span className="nt-hero-count"><Icon name="grid" size={17} /><strong>{formatNumber(count)}</strong> productos de ejemplo</span>
  </section>;
}
