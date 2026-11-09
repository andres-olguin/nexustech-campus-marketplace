import { useState } from 'react';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import Icon from '../ui/Icon.jsx';
import ProductImage from '../ui/ProductImage.jsx';
import ProductSpecifications from './ProductSpecifications.jsx';
import { finishes, formatCLP, formatUSD } from '../../utils/format.js';

export default function ProductDetail({ product, usdRate, onAdd, onBuy }) {
  const [quantity, setQuantity] = useState('1');
  const [finish, setFinish] = useState(finishes[0]);
  return <><div className="nt-detail-grid"><div><ProductImage src={product.imagen} alt={product.nombre} className="nt-detail-photo" /><div className="nt-seller-panel"><Icon name="user" /><div><span>VENDEDOR DE DEMOSTRACIÓN</span><strong>{product.vendedor}</strong><small>{product.contacto}</small></div></div></div><div><Badge>{product.categoria}</Badge><div className="nt-detail-price"><strong>{formatCLP(product.precio)}</strong>{usdRate && <span>≈ {formatUSD(product.precio / usdRate)}</span>}</div><p className="nt-muted">{product.descripcion}</p><div className="nt-form-row"><Field label="Cantidad" as="select" value={quantity} onChange={(e) => setQuantity(e.target.value)}>{[1, 2, 3].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'unidad' : 'unidades'}</option>)}</Field><Field label="Acabado / color" as="select" value={finish} onChange={(e) => setFinish(e.target.value)}>{finishes.map((value) => <option key={value}>{value}</option>)}</Field></div><div className="nt-detail-actions"><Button icon="cart" onClick={() => onAdd(product.id, Number(quantity), finish)}>Añadir al carrito</Button><Button variant="secondary" icon="arrow" onClick={() => onBuy(product.id, Number(quantity), finish)}>Comprar ahora</Button></div></div></div><ProductSpecifications product={product} /><section className="nt-reviews" aria-labelledby="resenas-titulo"><h3 id="resenas-titulo">Reseñas de ejemplo</h3>{product.reseñas?.length ? product.reseñas.map((review, index) => <article className="nt-review" key={review.usuario + index}><div className="nt-review-header"><span className="nt-review-avatar">{review.usuario.split(' ').slice(0, 2).map((part) => part[0]).join('')}</span><strong>{review.usuario}</strong><span className="nt-rating" role="img" aria-label={review.rating + ' de 5 estrellas'}>{Array.from({ length: 5 }, (_, i) => <Icon key={i} name="star" size={13} filled={i < review.rating} />)}</span></div><p>{review.texto}</p></article>) : <p className="nt-muted">Esta publicación todavía no tiene reseñas.</p>}</section></>;
}
