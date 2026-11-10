import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import ProductImage from "../ui/ProductImage.jsx";
import { formatCLP } from "../../utils/format.js";
export default function ProductCard({
  product: p,
  category,
  favorite,
  onFavorite,
  onDetail,
  onAdd,
  onEdit,
  onArchive,
  own,
  busy,
}) {
  return (
    <article className="nt-product-card">
      <div className="nt-product-photo">
        <button
          className="nt-photo-button"
          onClick={() => onDetail(p.id)}
          aria-label={"Ver detalle de " + p.name}
        >
          <ProductImage src={p.imageUrl} alt={p.name} loading="lazy" />
        </button>
        <span className="nt-photo-label">
          {p.isActive ? "PUBLICACIÓN CAMPUS" : "ARCHIVADA"}
        </span>
        <div className="nt-product-tools">
          <Button
            variant="ghost"
            className="nt-icon-button"
            aria-label={
              (favorite ? "Quitar de favoritos: " : "Guardar en favoritos: ") +
              p.name
            }
            aria-pressed={favorite}
            disabled={busy}
            onClick={() => onFavorite(p.id)}
          >
            <Icon name="heart" filled={favorite} />
          </Button>
          {own && (
            <>
              <Button
                variant="ghost"
                icon="edit"
                aria-label={"Editar producto: " + p.name}
                onClick={() => onEdit(p)}
                disabled={busy}
              />
              <Button
                variant="ghost"
                icon="trash"
                aria-label={"Archivar publicación: " + p.name}
                onClick={() => onArchive(p)}
                disabled={busy}
              />
            </>
          )}
        </div>
      </div>
      <div className="nt-product-body">
        <div className="nt-card-meta">
          <Badge>{category || "Categoría"}</Badge>
          <span className="nt-stock-tag">Stock: {p.stock}</span>
        </div>
        <h3>
          <button onClick={() => onDetail(p.id)}>{p.name}</button>
        </h3>
        <p className="nt-product-seller">
          {own ? "Tu publicación" : "Vendedor " + p.sellerId.slice(0, 8)}
        </p>
        <div className="nt-product-price">
          <strong>{formatCLP(p.price)}</strong>
        </div>
        <div className="nt-product-buttons">
          <Button variant="secondary" onClick={() => onDetail(p.id)}>
            Ver detalle
          </Button>
          <Button
            icon="plus"
            disabled={busy || own || !p.isActive || p.stock < 1}
            onClick={() => onAdd(p.id)}
            aria-label={"Agregar al carrito: " + p.name}
          >
            {own ? "Propio" : p.stock ? "Agregar" : "Agotado"}
          </Button>
        </div>
      </div>
    </article>
  );
}
