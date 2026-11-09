import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import useValidatedForm from '../../hooks/useValidatedForm.js';
import { categories } from '../../utils/format.js';
import { isValidPrice, MAX_PRICE, MIN_PRICE, PRICE_ERROR } from '../../utils/pricing.js';

function validate(values) {
  const errors = {};
  if (values.nombre.trim().length < 3) errors.nombre = 'Ingresa un nombre de al menos 3 caracteres.';
  if (!isValidPrice(Number(values.precio))) errors.precio = PRICE_ERROR;
  if (!categories.includes(values.categoria)) errors.categoria = 'Selecciona una categoría válida.';
  if (values.imagen.trim()) {
    try { if (new URL(values.imagen.trim()).protocol !== 'https:') throw new Error(); }
    catch { errors.imagen = 'Usa un enlace de imagen que comience con https://.'; }
  }
  if (values.descripcion.trim().length < 10) errors.descripcion = 'Describe el equipo con al menos 10 caracteres.';
  if (values.vendedor.trim().length < 2) errors.vendedor = 'Ingresa el nombre del responsable.';
  return errors;
}
export default function PublishForm({ user, onSave, onCancel }) {
  const form = useValidatedForm({ nombre: '', categoria: 'Hardware', precio: '', imagen: '', descripcion: '', vendedor: user?.nombre || '' }, validate, onSave);
  const props = (name) => ({ name, value: form.values[name], onChange: form.change, error: form.errors[name] });
  return <form ref={form.ref} onSubmit={form.submit} noValidate><Field label="Nombre del producto" {...props('nombre')} autoFocus required maxLength={160} placeholder="Ej. Teclado mecánico para programación" /><div className="nt-form-row"><Field label="Precio en CLP" {...props('precio')} type="number" inputMode="numeric" min={MIN_PRICE} max={MAX_PRICE} step="1" required placeholder="65000" /><Field label="Categoría" {...props('categoria')} as="select" required>{categories.map((cat) => <option key={cat}>{cat}</option>)}</Field></div><Field label="Enlace de imagen (opcional)" {...props('imagen')} type="url" maxLength={1000} placeholder="https://..." hint="Si lo dejas vacío, se usa una ilustración local." /><Field label="Descripción y estado" {...props('descripcion')} as="textarea" rows={3} required maxLength={2000} placeholder="Describe las especificaciones y el estado del equipo." /><Field label="Responsable de la publicación" {...props('vendedor')} required maxLength={80} /><div className="nt-form-actions"><Button variant="secondary" onClick={onCancel}>Cancelar</Button><Button type="submit" icon="plus">Publicar producto</Button></div></form>;
}
