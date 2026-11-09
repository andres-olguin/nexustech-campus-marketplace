import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import ProductImage from '../ui/ProductImage.jsx';
import { formatCLP, formatUSD } from '../../utils/format.js';

export default function ProductCard({
  product,
  favorite,
  onFavorite,
  onDetail,
  onAdd,
  onEdit,
  onDelete,
  usdRate,
  isSeller = false
}) {
  return (
    <article className="nt-product-card">
      <div className="nt-product-photo">
        <button
          className="nt-photo-button"
          onClick={() => onDetail(product)}
          aria-label={'Ver detalle de ' + product.nombre}
        >
          <ProductImage src={product.imagen} alt={product.nombre} loading="lazy" />
        </button>
        <span className="nt-photo-label">{product.condicion || 'PUBLICACIÓN CAMPUS'}</span>
        <div className="nt-product-tools">
          <Button
            variant="ghost"
            className="nt-icon-button"
            aria-label={(favorite ? 'Quitar de favoritos: ' : 'Guardar en favoritos: ') + product.nombre}
            aria-pressed={favorite}
            onClick={() => onFavorite(product.id)}
          >
            <Icon name="heart" filled={favorite} size={19} />
          </Button>

          {onEdit && (
            <Button
              variant="ghost"
              icon="edit"
              className="nt-icon-button nt-edit"
              aria-label={'Editar producto: ' + product.nombre}
              onClick={() => onEdit(product)}
            />
          )}

          {onDelete && (
            <Button
              variant="ghost"
              icon="trash"
              className="nt-icon-button nt-delete"
              aria-label={'Eliminar publicación: ' + product.nombre}
              onClick={() => onDelete(product)}
            />
          )}
        </div>
      </div>

      <div className="nt-product-body">
        <div className="nt-card-meta">
          <Badge tone="muted">{product.categoria}</Badge>
          {product.stock && <span className="nt-stock-tag">Stock: {product.stock}</span>}
        </div>

        <h3>
          <button onClick={() => onDetail(product)} title={product.nombre}>
            {product.nombre}
          </button>
        </h3>

        <p className="nt-product-seller">
          <Icon name="user" size={13} />
          {product.vendedor}
        </p>

        <div className="nt-product-price">
          <strong>{formatCLP(product.precio)}</strong>
          {usdRate && <span>≈ {formatUSD(product.precio / usdRate)}</span>}
        </div>

        <div className="nt-product-buttons">
          <Button variant="secondary" onClick={() => onDetail(product)}>
            Ver detalle
          </Button>
          <Button
            icon="plus"
            aria-label={'Agregar al carrito: ' + product.nombre}
            onClick={() => onAdd(product.id)}
          >
            Agregar
          </Button>
        </div>
      </div>
    </article>
  );
}
