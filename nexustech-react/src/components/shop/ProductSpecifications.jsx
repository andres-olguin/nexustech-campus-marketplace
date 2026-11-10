import Icon from '../ui/Icon.jsx';
import { productSpecRows } from '../../utils/productSpecs.js';

export default function ProductSpecifications({ product }) {
  const rows = productSpecRows(product);
  if (!rows.length) return null;
  return <details className="nt-product-specs">
    <summary><strong>Ficha técnica</strong><Icon name="chevron" size={15} /></summary>
    <dl className="nt-spec-rows">
      {rows.map(({ key, label, value }) => <div key={key}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
  </details>;
}
