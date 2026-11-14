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
  const isDemo = Boolean(p.isDemo);
  const detailTarget = isDemo ? p : p.id;

  const stockClass =
    p.stock > 3
      ? "nt-stock-available"
      : p.stock > 0
        ? "nt-stock-low"
        : "nt-stock-empty";

  const stockLabel =
    p.stock > 3
      ? `Stock: ${p.stock}`
      : p.stock > 0
        ? `Últimas ${p.stock} un.`
        : "Agotado";

  return (
    <article className="nt-product-card">
      <div className="nt-product-photo">
        <button
          className="nt-photo-button"
          onClick={() => onDetail(detailTarget)}
          aria-label={"Ver detalle de " + p.name}
        >
          <ProductImage src={p.imageUrl} alt={p.name} loading="lazy" />
        </button>
        <span className={"nt-photo-label" + (!p.isActive ? " is-archived" : "")}>
          {isDemo
            ? p.isIllustration
              ? "ILUSTRACIÓN · DEMO"
              : "DEMO · VIÑA DEL MAR"
            : p.isActive
              ? "VIÑA DEL MAR"
              : "ARCHIVADO"}
        </span>
        {p.condition && (
          <span
            className={
              "nt-condition-pill" +
              (p.condition === "Nuevo" ? " is-new" : " is-used")
            }
          >
            {p.condition}
          </span>
        )}
        <div className="nt-product-tools">
          {!isDemo && (
            <Button
              variant="ghost"
              className={
                "nt-icon-button nt-fav-button" + (favorite ? " is-active" : "")
              }
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
          )}
          {own && !isDemo && (
            <>
              <Button
                variant="ghost"
                icon="edit"
                className="nt-icon-button"
                aria-label={"Editar producto: " + p.name}
                onClick={() => onEdit(p)}
                disabled={busy}
              />
              <Button
                variant="ghost"
                icon="trash"
                className="nt-icon-button"
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
          <Badge variant="muted">
            {category || p.category || "General"}
            {p.subcategory ? ` · ${p.subcategory}` : ""}
          </Badge>
          <span className={"nt-stock-tag " + stockClass}>{stockLabel}</span>
        </div>

        <h3 className="nt-card-title">
          <button onClick={() => onDetail(detailTarget)}>{p.name}</button>
        </h3>

        <p className="nt-product-seller">
          {isDemo
            ? p.sellerLabel || "Catálogo de demostración"
            : own
              ? "Tu publicación propia"
              : "Vendedor estudiante · " + p.sellerId.slice(0, 8)}
        </p>

        <div className="nt-product-price">
          <strong>{formatCLP(p.price)}</strong>
          <small className="nt-price-currency">CLP</small>
        </div>

        <div className="nt-product-buttons">
          <Button variant="secondary" onClick={() => onDetail(detailTarget)}>
            Ver detalle
          </Button>
          {isDemo ? (
            <Button
              variant="ghost"
              onClick={() => onDetail(detailTarget)}
              aria-label={"Ver reseñas y especificaciones de " + p.name}
            >
              Ver reseñas
            </Button>
          ) : (
            <Button
              icon="plus"
              disabled={busy || own || !p.isActive || p.stock < 1}
              onClick={() => onAdd(p.id)}
              aria-label={"Agregar al carrito: " + p.name}
            >
              {own ? "Propio" : p.stock ? "Agregar" : "Agotado"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
