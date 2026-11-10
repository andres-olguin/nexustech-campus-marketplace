import { useState } from "react";
import Button from "../ui/Button.jsx";
import Field from "../ui/Field.jsx";
import Alert from "../ui/Alert.jsx";
export default function PublishForm({
  initialProduct,
  categories,
  busy,
  onSave,
  onCancel,
}) {
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const body = {
      name: form.get("name").trim(),
      description: form.get("description").trim(),
      categoryId: form.get("categoryId"),
      price: Number(form.get("price")),
      stock: Number(form.get("stock")),
    };
    if (form.get("imageUrl").trim())
      body.imageUrl = form.get("imageUrl").trim();
    try {
      await onSave(body);
    } catch (err) {
      setError(err.message);
    }
  }
  const p = initialProduct || {};
  return (
    <form onSubmit={submit} aria-busy={busy}>
      {error && <Alert tone="error">{error}</Alert>}
      <Field
        label="Nombre del producto"
        name="name"
        defaultValue={p.name || ""}
        required
        minLength={3}
        maxLength={160}
      />
      <Field
        label="Descripción"
        name="description"
        as="textarea"
        defaultValue={p.description || ""}
        required
        minLength={10}
        maxLength={2000}
        rows={3}
      />
      <div className="nt-form-row">
        <Field
          label="Categoría"
          name="categoryId"
          as="select"
          defaultValue={p.categoryId || ""}
          required
        >
          <option value="" disabled>
            Selecciona una categoría
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Field>
        <Field
          label="Precio en CLP"
          name="price"
          type="number"
          defaultValue={p.price || ""}
          required
          min={1000}
          max={2500000}
          step={1}
        />
      </div>
      <Field
        label="Stock"
        name="stock"
        type="number"
        defaultValue={p.stock ?? 1}
        required
        min={0}
        max={100000}
        step={1}
      />
      <Field
        label="Imagen HTTPS (opcional)"
        name="imageUrl"
        type="url"
        pattern="https://.*"
        maxLength={1000}
        defaultValue={p.imageUrl || ""}
        hint="Omitir para usar una imagen representativa. No se admiten archivos adjuntos."
      />
      {!categories.length && (
        <Alert>Crea primero una categoría desde Mi cuenta.</Alert>
      )}
      <div className="nt-form-actions">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          Cancelar
        </Button>
        <Button type="submit" disabled={busy || !categories.length}>
          {busy
            ? "Guardando…"
            : initialProduct
              ? "Guardar cambios"
              : "Publicar producto"}
        </Button>
      </div>
    </form>
  );
}
