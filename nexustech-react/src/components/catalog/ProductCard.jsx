import { memo } from 'react';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import ProductImage from '../ui/ProductImage.jsx';
import PriceDisplay from '../ui/PriceDisplay.jsx';

// Los datos y las acciones pertenecen al padre; la tarjeta solo presenta el producto.
export default memo(function ProductCard({ product, favorite, onFavorite, onDetail, onAdd, onDelete, onEditPrice, usdRate }) {
  return <article className="nt-product-card">
    <div className="nt-product-photo">
      <button className="nt-photo-button" onClick={() => onDetail(product)} aria-label={'Ver detalle de ' + product.nombre}><ProductImage src={product.imagen} alt={product.nombre} loading="lazy" /></button>
      <div className="nt-product-tools">
        <Button variant="ghost" className="nt-icon-button" aria-label={(favorite ? 'Quitar de favoritos: ' : 'Guardar en favoritos: ') + product.nombre} aria-pressed={favorite} onClick={() => onFavorite(product.id)}><Icon name="heart" filled={favorite} size={19} /></Button>
        {onDelete && <Button variant="ghost" icon="trash" className="nt-icon-button nt-delete" aria-label={'Eliminar publicación: ' + product.nombre} onClick={() => onDelete(product)} />}
      </div>
    </div>
    <div className="nt-product-body">
      <div className="nt-product-meta"><Badge tone="muted">{product.categoria}</Badge>{onEditPrice && <span>Tu publicación</span>}</div>
      <h3><button onClick={() => onDetail(product)} title={product.nombre}>{product.nombre}</button></h3>
      <p className="nt-product-seller"><Icon name="user" size={14} />{product.vendedor}</p>
      <div className="nt-product-price">
        <PriceDisplay amount={product.precio} usdRate={usdRate} />
        {onEditPrice && <Button variant="ghost" icon="edit" className="nt-edit-price" aria-label={'Editar precio de ' + product.nombre} onClick={() => onEditPrice(product)}>Editar precio</Button>}
      </div>
      <div className="nt-product-buttons">
        <Button variant="secondary" onClick={() => onDetail(product)}>Ver detalle</Button>
        <Button icon="plus" aria-label={'Agregar al carrito: ' + product.nombre} onClick={() => onAdd(product.id)}>Agregar</Button>
      </div>
    </div>
  </article>;
});
