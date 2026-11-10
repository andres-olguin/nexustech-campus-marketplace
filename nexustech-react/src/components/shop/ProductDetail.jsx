import { useState } from "react";
import Button from "../ui/Button.jsx";
import Field from "../ui/Field.jsx";
import ProductImage from "../ui/ProductImage.jsx";
import Alert from "../ui/Alert.jsx";
import Badge from "../ui/Badge.jsx";
import ReviewsSection from "../reviews/ReviewsSection.jsx";
import { formatCLP } from "../../utils/format.js";

export default function ProductDetail({ product: p, shop, onAdded }) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const isDemo = Boolean(p.isDemo);
  const own = !isDemo && shop.user?.id === p.sellerId;
  const specs = Array.isArray(p.specs) ? p.specs : [];

  async function add() {
    if (isDemo) return;
    if (!shop.user) {
      location.hash = "/acceso";
      return;
    }
    try {
      await shop.run(
        () => shop.api.setQuantity(p.id, quantity),
        "Carrito actualizado.",
      );
      onAdded();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="nt-product-detail-wrap">
      <div className="nt-detail-grid">
        <ProductImage
          src={p.imageUrl}
          alt={p.name}
          className="nt-detail-photo"
        />
        <div>
          <div className="nt-detail-badges">
            {p.category && <Badge variant="muted">{p.category}</Badge>}
            {p.condition && (
              <Badge variant={p.condition === "Nuevo" ? "success" : "cyan"}>
                Estado: {p.condition}
              </Badge>
            )}
            {isDemo && (
              <span className="nt-demo-review-badge">
                Catálogo de demostración
              </span>
            )}
          </div>

          <h3>{p.name}</h3>
          <strong className="nt-detail-price">{formatCLP(p.price)}</strong>
          <p>{p.description}</p>

          {specs.length > 0 && (
            <ul className="nt-detail-specs" aria-label="Características del producto">
              {specs.map((spec) => (
                <li key={spec}>{spec}</li>
              ))}
            </ul>
          )}

          <p className="nt-detail-meta-line">
            <strong>Stock disponible:</strong>{" "}
            {p.stock > 0 ? `${p.stock} unidades` : "Agotado"}
          </p>
          <p className="nt-detail-meta-line">
            <strong>Vendedor:</strong>{" "}
            {isDemo
              ? p.sellerLabel || "Catálogo demostrativo"
              : own
                ? "Tu cuenta"
                : p.sellerId}
          </p>

          {isDemo ? (
            <Alert title="Vista previa de catálogo">
              Este ítem pertenece al catálogo de demostración de 48 productos.
              Para comprar o agregar al carrito real, publica o selecciona un
              producto guardado en PostgreSQL.
            </Alert>
          ) : (
            <>
              <Field
                label="Cantidad"
                type="number"
                min={1}
                max={Math.min(p.stock, 100)}
                step={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <Button
                disabled={
                  shop.busy ||
                  own ||
                  !p.isActive ||
                  p.stock < 1 ||
                  !Number.isInteger(quantity) ||
                  quantity < 1 ||
                  quantity > Math.min(100, p.stock)
                }
                onClick={add}
              >
                {p.stock < 1 ? "Agotado" : "Añadir al carrito"}
              </Button>
              {error && <Alert tone="error">{error}</Alert>}
              <p className="nt-muted nt-detail-note">
                El stock se valida nuevamente al confirmar el pedido en el servidor.
              </p>
            </>
          )}
        </div>
      </div>

      <ReviewsSection product={p} shop={shop} />
    </div>
  );
}
