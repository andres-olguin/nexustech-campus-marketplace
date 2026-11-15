import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import PriceDisplay from '../ui/PriceDisplay.jsx';
import Alert from '../ui/Alert.jsx';
import { useState } from 'react';
import { isValidPrice, MAX_PRICE, MIN_PRICE, PRICE_ERROR } from '../../utils/pricing.js';

export default function EditPriceForm({ product, usdRate, busy, onSave, onCancel }) {
  const [value, setValue] = useState(String(product.price));
  const [error, setError] = useState('');
  const amount = Number(value);
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    if (!isValidPrice(amount)) {
      setError(PRICE_ERROR);
      return;
    }
    setError('');
    try { await onSave(amount); } catch (err) { setError(err.message); }
  }
  return <form onSubmit={submit} aria-busy={busy}>
    {error && <Alert tone="error">{error}</Alert>}
    <div className="nt-price-edit-product">
      <strong>{product.name}</strong>
      <span>Precio actual</span>
      <PriceDisplay amount={product.price} usdRate={usdRate} />
    </div>
    <Field label="Nuevo precio en CLP" name="precio" type="number" inputMode="numeric"
      min={MIN_PRICE} max={MAX_PRICE} step="1" autoFocus required
      value={value} onChange={event => setValue(event.target.value)} onFocus={event => event.target.select()}
      hint="Se actualiza el catálogo y el carrito. Los pedidos ya creados conservan su precio." />
    {isValidPrice(amount) && amount !== product.price && <div className="nt-price-edit-preview">
      <span>Así se verá el nuevo precio</span><PriceDisplay amount={amount} usdRate={usdRate} />
    </div>}
    <div className="nt-form-actions">
      <Button variant="secondary" onClick={onCancel} disabled={busy}>Cancelar</Button>
      <Button type="submit" icon="check" disabled={busy || amount === product.price}>{busy ? 'Guardando…' : 'Guardar precio'}</Button>
    </div>
  </form>;
}
