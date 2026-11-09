import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import useValidatedForm from '../../hooks/useValidatedForm.js';
import { categories } from '../../utils/format.js';

function validate(values) {
  const errors = {};
  if (values.nombre.trim().length < 3) errors.nombre = 'Ingresa un nombre de al menos 3 caracteres.';
  const price = Number(values.precio);
  if (!values.precio || isNaN(price) || price < 1000 || price > 5000000) {
    errors.precio = 'Ingresa un precio entero entre $1.000 y $5.000.000.';
  }
  if (!categories.includes(values.categoria)) errors.categoria = 'Selecciona una categoría válida.';
  if (values.imagen && values.imagen.trim()) {
    try {
      if (new URL(values.imagen.trim()).protocol !== 'https:') throw new Error();
    } catch {
      errors.imagen = 'Usa un enlace de imagen que comience con https://.';
    }
  }
  if (values.descripcion.trim().length < 10) errors.descripcion = 'Describe el producto con al menos 10 caracteres.';
  if (values.vendedor.trim().length < 2) errors.vendedor = 'Ingresa el nombre del responsable o vendedor.';
  return errors;
}

export default function PublishForm({ initialProduct = null, user, onSave, onCancel }) {
  const isEditing = Boolean(initialProduct);

  const initialValues = {
    nombre: initialProduct?.nombre || '',
    categoria: initialProduct?.categoria || 'Hardware',
    precio: initialProduct?.precio !== undefined ? String(initialProduct.precio) : '',
    imagen: initialProduct?.imagen || '',
    descripcion: initialProduct?.descripcion || '',
    vendedor: initialProduct?.vendedor || user?.nombre || 'Estudiante UNAB',
    stock: initialProduct?.stock !== undefined ? String(initialProduct.stock) : '3',
    condicion: initialProduct?.condicion || 'Como nuevo'
  };

  const form = useValidatedForm(initialValues, validate, (values) => {
    onSave(values, initialProduct?.id);
  });

  const props = (name) => ({
    name,
    value: form.values[name],
    onChange: form.change,
    error: form.errors[name]
  });

  return (
    <form ref={form.ref} onSubmit={form.submit} noValidate>
      <p className="nt-demo-hint">
        {isEditing
          ? 'Modifica las características, precio o stock del producto seleccionado.'
          : 'Publica un equipo, componente o solución técnica en el Campus Marketplace.'}
      </p>

      <Field
        label="Nombre del producto"
        {...props('nombre')}
        autoFocus
        required
        maxLength={160}
        placeholder="Ej. Teclado mecánico inalámbrico Hot-Swap"
      />

      <div className="nt-form-row">
        <Field
          label="Precio en CLP"
          {...props('precio')}
          type="number"
          min="1000"
          max="5000000"
          step="1"
          required
          placeholder="65000"
        />
        <Field label="Categoría" {...props('categoria')} as="select" required>
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </Field>
      </div>

      <div className="nt-form-row">
        <Field
          label="Unidades en stock"
          {...props('stock')}
          type="number"
          min="1"
          max="99"
          required
        />
        <Field label="Condición" {...props('condicion')} as="select" required>
          <option value="Nuevo">Nuevo (Sellado)</option>
          <option value="Como nuevo">Como nuevo (Poco uso)</option>
          <option value="Buen estado">Buen estado (Operativo)</option>
        </Field>
      </div>

      <Field
        label="Enlace de fotografía HTTPS (opcional)"
        {...props('imagen')}
        type="url"
        maxLength={1000}
        placeholder="https://images.unsplash.com/..."
        hint="Si lo dejas vacío, se asigna una imagen referencial del catálogo."
      />

      <Field
        label="Descripción y especificaciones"
        {...props('descripcion')}
        as="textarea"
        rows={3}
        required
        maxLength={2000}
        placeholder="Describe el estado estético, componentes incluidos y garantía."
      />

      <Field
        label="Vendedor responsable"
        {...props('vendedor')}
        required
        maxLength={80}
      />

      <div className="nt-form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" icon={isEditing ? 'check' : 'plus'}>
          {isEditing ? 'Guardar cambios' : 'Publicar producto'}
        </Button>
      </div>
    </form>
  );
}
