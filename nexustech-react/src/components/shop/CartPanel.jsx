import Button from '../ui/Button.jsx';
import Alert from '../ui/Alert.jsx';
import ProductImage from '../ui/ProductImage.jsx';
import { formatCLP } from '../../utils/format.js';
export default function CartPanel({ shop, onCheckout }) {
  if (!shop.user) return <Alert><a href="#/acceso">Inicia sesión</a> para usar tu carrito.</Alert>;
  if (shop.account.status === 'loading') return <p role="status">Cargando carrito…</p>;
  if (shop.account.error) return <Alert tone="error">{shop.account.error.message}<Button onClick={shop.refresh}>Reintentar</Button></Alert>;
  const items = shop.cart?.items || [];
  if (!items.length) return <p>Tu carrito está vacío.</p>;
  const mutate = action => shop.act(() => shop.run(action, 'Carrito actualizado.'));
  return <div className="nt-cart-panel"><ul className="nt-cart-list">{items.map(i => <li key={i.productId} className="nt-cart-item"><ProductImage src={i.product.imageUrl} alt={i.product.name} /><div className="nt-cart-item-copy"><h3>{i.product.name}</h3><strong>{formatCLP(i.product.price * i.quantity)}</strong><p>Stock: {i.product.stock}{!i.product.isActive && ' · Publicación archivada'}</p><div className="nt-quantity"><Button variant="ghost" aria-label={'Reducir cantidad de ' + i.product.name} disabled={shop.busy || i.quantity <= 1} onClick={() => mutate(() => shop.api.setQuantity(i.productId, i.quantity - 1))}>−</Button><span>{i.quantity}</span><Button variant="ghost" aria-label={'Aumentar cantidad de ' + i.product.name} disabled={shop.busy || i.quantity >= Math.min(100, i.product.stock) || !i.product.isActive} onClick={() => mutate(() => shop.api.setQuantity(i.productId, i.quantity + 1))}>+</Button></div></div><Button variant="ghost" aria-label={'Quitar del carrito: ' + i.product.name} disabled={shop.busy} onClick={() => mutate(() => shop.api.removeCart(i.productId))}>Quitar</Button></li>)}</ul><div className="nt-cart-summary"><strong>Total: {formatCLP(shop.cart.total)}</strong><Button disabled={shop.busy || items.some(i => !i.product.isActive || i.quantity > i.product.stock)} onClick={onCheckout}>Continuar con pedido simulado</Button><small>Sin cobro real. El servidor revalida precios e inventario.</small></div></div>;
}
