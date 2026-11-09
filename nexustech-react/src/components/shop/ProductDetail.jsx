import { useState } from 'react';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import ProductImage from '../ui/ProductImage.jsx';
import Alert from '../ui/Alert.jsx';
import { formatCLP } from '../../utils/format.js';
export default function ProductDetail({ product: p, shop, onAdded }) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const own = shop.user?.id === p.sellerId;
  async function add() {
    if (!shop.user) { location.hash = '/acceso'; return; }
    try { await shop.run(() => shop.api.setQuantity(p.id, quantity), 'Carrito actualizado.'); onAdded(); } catch (err) { setError(err.message); }
  }
  return <div className="nt-detail-grid"><ProductImage src={p.imageUrl} alt={p.name} className="nt-detail-photo" /><div><h3>{p.name}</h3><strong className="nt-detail-price">{formatCLP(p.price)}</strong><p>{p.description}</p><p>Stock consultado: {p.stock}</p><p>Vendedor: {own ? 'Tu cuenta' : p.sellerId}</p><Field label="Cantidad" type="number" min={1} max={Math.min(p.stock, 100)} step={1} value={quantity} onChange={e => setQuantity(Number(e.target.value))} /><Button disabled={shop.busy || own || !p.isActive || !Number.isInteger(quantity) || quantity < 1 || quantity > Math.min(100, p.stock)} onClick={add}>Añadir al carrito</Button>{error && <Alert tone="error">{error}</Alert>}<p className="nt-muted">Reseñas y variantes no disponibles. El stock se valida nuevamente al confirmar.</p></div></div>;
}
