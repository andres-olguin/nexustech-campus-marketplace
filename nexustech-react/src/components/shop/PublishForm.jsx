import { useState } from "react";
import Button from "../ui/Button.jsx";
import Field from "../ui/Field.jsx";
import Alert from "../ui/Alert.jsx";
import { PRODUCT_PROFILES } from "../../data/filterProfiles.js";
import { describeProduct } from "../../utils/connectedCatalog.js";
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
    body.technical = describeProduct({
      name: body.name,
      description: body.description,
      profileId: form.get("productType"),
      brand: form.get("brand").trim(),
      series: form.get("series").trim(),
      text: form.get("technicalText").trim(),
    });
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
      <details className="nt-product-specs nt-publish-specs" open={p.technical ? true : undefined}>
        <summary>Datos para los filtros <span>Opcional</span></summary>
        <div className="nt-product-specs-body">
          <Field label="Tipo de producto" name="productType" as="select" defaultValue={p.technical?.profile ?? ""}>
            <option value="">Detectar por el nombre</option>
            {PRODUCT_PROFILES.map(profile => <option key={profile.id} value={profile.id}>{profile.label}</option>)}
          </Field>
          <div className="nt-form-row">
            <Field label="Marca" name="brand" maxLength={80} defaultValue={p.technical?.values?.brand ?? ""} />
            <Field label="Línea o serie" name="series" maxLength={80} defaultValue={p.technical?.values?.series ?? ""} />
          </div>
          <Field label="Especificaciones técnicas" name="technicalText" as="textarea" maxLength={1500}
            defaultValue={p.technical?.text ?? ""} rows={3}
            placeholder="Ej.: 2×8 GB DDR4 DIMM, 3200 MT/s"
            hint="Los filtros se generan a partir de los datos declarados. Incluye las unidades." />
        </div>
      </details>
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
