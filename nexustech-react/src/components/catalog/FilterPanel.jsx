import { useEffect, useState } from 'react';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import Icon from '../ui/Icon.jsx';
import { categories, formatCLP, formatNumber } from '../../utils/format.js';
import { MAX_PRICE } from '../../utils/pricing.js';
import { SPEC_GROUPS } from '../../utils/productSpecs.js';

function TechnicalFilters({ options, selections, onChange }) {
  const groups = SPEC_GROUPS.map((group) => ({
    ...group,
    fields: group.fields.filter(({ key }) => options[key]?.length),
  })).filter(({ fields }) => fields.length);
  if (!groups.length) return null;

  return <div className="nt-facets">
    {groups.map(({ id, label, fields }) => {
      const selectedCount = fields.filter(({ key }) => selections[key]).length;
      return <details className="nt-facet-group" key={id} open={id === 'general' || undefined}>
        <summary>
          <strong>{label}</strong>
          {selectedCount > 0 && <span className="nt-filter-count">{selectedCount}</span>}
          <Icon name="chevron" size={15} />
        </summary>
        <div className="nt-facet-fields">
          {fields.map(({ key, label: fieldLabel }) => <Field key={key} label={fieldLabel} as="select"
            value={selections[key] || ''} onChange={(event) => onChange(key, event.target.value)}>
            <option value="">Cualquiera</option>
            {options[key].map(({ value, count, label: choiceLabel }) => <option key={value} value={value}
              disabled={count === 0 && selections[key] !== value}>{choiceLabel} · {formatNumber(count)}</option>)}
          </Field>)}
        </div>
      </details>;
    })}
  </div>;
}

export default function FilterPanel({ category, onCategory, maxPrice, onMaxPrice, onClear, activeCount, options, selections, onFacetChange }) {
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
      <TechnicalFilters options={options} selections={selections} onChange={onFacetChange} />
      <div className="nt-filter-note"><Icon name="shield" size={17} /><p>Publicaciones y pedidos de demostración.</p></div>
    </div>
  </aside>;
}
