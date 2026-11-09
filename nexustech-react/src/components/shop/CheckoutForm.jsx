import { useState } from 'react';
import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import { formatCLP } from '../../utils/format.js';
export default function CheckoutForm({ shop, onConfirm, onCancel }) {
  const [error, setError] = useState('');
  const [address, setAddress] = useState(shop.attempt?.shippingAddress || '');
  async function submit(event) {
    event.preventDefault(); setError('');
    try { await onConfirm(shop.attempt?.shippingAddress || address.trim()); } catch (err) { setError(err.message); }
  }
  return <form onSubmit={submit} aria-busy={shop.busy}>
    <Alert title="Operación SIMULADA">Sin cobro real ni validez financiera. No ingreses datos de tarjeta. Usa datos sintéticos durante la demostración.</Alert>
    <p>Total consultado en carrito: <strong>{formatCLP(shop.cart?.total || 0)}</strong>. El servidor revalida precio y stock al confirmar.</p>
    <Field label="Dirección o punto de retiro" as="textarea" value={shop.attempt?.shippingAddress || address} onChange={e => setAddress(e.target.value)} required minLength={10} maxLength={500} disabled={shop.busy || Boolean(shop.attempt)} />
    {shop.attempt && <Alert title="Intento pendiente de verificar">Se conservarán la misma dirección y clave al reintentar. Consulta tus pedidos antes de iniciar otra compra. No recargues la página hasta resolver este intento.</Alert>}
    {error && <Alert tone="error">{error}</Alert>}
    <div className="nt-form-actions"><Button variant="secondary" onClick={onCancel} disabled={shop.busy}>Volver al carrito</Button><Button type="submit" disabled={shop.busy}>{shop.busy ? 'Verificando pedido…' : shop.attempt ? 'Reintentar mismo pedido' : 'Confirmar pedido simulado'}</Button></div>
  </form>;
}
