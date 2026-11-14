import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import PriceDisplay from '../ui/PriceDisplay.jsx';
import useValidatedForm from '../../hooks/useValidatedForm.js';
import { isValidPrice, MAX_PRICE, MIN_PRICE, PRICE_ERROR } from '../../utils/pricing.js';

function validate({ precio }) {
  return isValidPrice(Number(precio)) ? {} : { precio: PRICE_ERROR };
}

export default function EditPriceForm({ product, usdRate, onSave, onCancel }) {
  const form = useValidatedForm({ precio: String(product.precio) }, validate, ({ precio }) => onSave(Number(precio)));
  const amount = Number(form.values.precio);
  return <form ref={form.ref} onSubmit={form.submit} noValidate>
    <div className="nt-price-edit-product">
      <strong>{product.nombre}</strong>
      <span>Precio actual</span>
      <PriceDisplay amount={product.precio} usdRate={usdRate} />
    </div>
    <Field label="Nuevo precio en CLP" name="precio" type="number" inputMode="numeric"
      min={MIN_PRICE} max={MAX_PRICE} step="1" autoFocus required
      value={form.values.precio} onChange={form.change} onFocus={(event) => event.target.select()}
      error={form.errors.precio} hint="El nuevo precio se aplica al catálogo y a tu carrito." />
    {isValidPrice(amount) && amount !== product.precio && <div className="nt-price-edit-preview">
      <span>Así se verá el nuevo precio</span><PriceDisplay amount={amount} usdRate={usdRate} />
    </div>}
    <div className="nt-form-actions">
      <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
      <Button type="submit" icon="check">Guardar precio</Button>
    </div>
  </form>;
}
