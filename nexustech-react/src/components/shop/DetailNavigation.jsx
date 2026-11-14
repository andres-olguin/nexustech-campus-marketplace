import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { formatNumber } from '../../utils/format.js';

export default function DetailNavigation({ index, count, onMove }) {
  if (count < 2) return null;
  return <nav className="nt-detail-navigation" aria-label="Navegación entre artículos">
    <div>
      {index > 0 && <Button variant="secondary" icon="arrow-left" aria-label="Artículo anterior" onClick={() => onMove(-1)}>
        <span>Anterior</span>
      </Button>}
    </div>
    <span className="nt-detail-position" role="status" aria-atomic="true">Artículo {formatNumber(index + 1)} de {formatNumber(count)}</span>
    <div>
      {index + 1 < count && <Button variant="secondary" aria-label="Artículo siguiente" onClick={() => onMove(1)}>
        <span>Siguiente</span><Icon name="arrow" size={18} />
      </Button>}
    </div>
  </nav>;
}
