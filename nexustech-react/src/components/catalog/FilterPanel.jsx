import { useEffect, useState } from 'react';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import Icon from '../ui/Icon.jsx';
import { categories, formatCLP } from '../../utils/format.js';
import { MAX_PRICE } from '../../utils/pricing.js';

export default function FilterPanel({ category, onCategory, maxPrice, onMaxPrice, onClear, activeCount }) {
  const [open, setOpen] = useState(() => window.matchMedia('(min-width: 992px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 992px)');
    const update = (event) => setOpen(event.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const priceLabel = formatCLP(maxPrice);

  return <aside className="nt-filter-panel" aria-label="Filtros del catálogo" data-expanded={open}>
    <div className="nt-filter-heading">
      <button type="button" className="nt-filter-toggle" aria-expanded={open} aria-controls="nexus-filters" onClick={() => setOpen(!open)}>
        <Icon name="filter" size={19} /><strong>Filtros</strong>
        {activeCount > 0 && <span className="nt-filter-count">{activeCount}</span>}
        <Icon name="chevron" size={16} />
      </button>
      <Button variant="ghost" className="nt-clear-filters" onClick={onClear} disabled={!activeCount}>Limpiar</Button>
    </div>
    <div className="nt-filter-body" id="nexus-filters" hidden={!open}>
      <Field label="Categoría" as="select" value={category} onChange={(event) => onCategory(event.target.value)}>
        <option value="all">Todas las líneas</option>
        {categories.map((cat) => <option key={cat}>{cat}</option>)}
      </Field>
      <div className="nt-budget">
        <label htmlFor="presupuesto">Presupuesto máximo</label>
        <strong>{priceLabel} <small>CLP</small></strong>
        <input id="presupuesto" type="range" min="0" max={MAX_PRICE} step="25000" value={maxPrice}
          aria-valuetext={priceLabel + ' pesos chilenos'} onChange={(event) => onMaxPrice(Number(event.target.value))} />
        <span><span>$0</span><span>{formatCLP(MAX_PRICE)}</span></span>
      </div>
      <div className="nt-filter-note"><Icon name="shield" size={17} /><p>Publicaciones y pedidos de demostración.</p></div>
    </div>
  </aside>;
}
