import { useState } from "react";
import Button from "../ui/Button.jsx";
import Field from "../ui/Field.jsx";
import ProductImage from "../ui/ProductImage.jsx";
import Alert from "../ui/Alert.jsx";
import Badge from "../ui/Badge.jsx";
import ReviewsSection from "../reviews/ReviewsSection.jsx";
import { syntheticReviewsForProduct } from "../../data/syntheticReviews.js";
import PriceDisplay from "../ui/PriceDisplay.jsx";
import { SPEC_FIELDS } from "../../data/filterProfiles.js";
import { formatSpecValue } from "../../utils/productSpecs.js";

export default function ProductDetail({ product: p, shop, onAdded, usdRate }) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [asked, setAsked] = useState(false);
  const [messageError, setMessageError] = useState("");
  const isDemo = Boolean(p.isDemo);
  const isSeedDemo = !isDemo && /(?:\bdemo\b|\bprueba\b)/i.test(p.name);
  const own = !isDemo && shop.user?.id === p.sellerId;
  const specs = isDemo ? p.specs || [] : SPEC_FIELDS.filter(({ key, source }) =>
    !source && p.technical?.values?.[key] !== undefined).map(def => {
      const v = p.technical.values[def.key];
      return def.label.replace(/\s+m[ií]nim[oa]|\s+m[aá]xim[oa]/gi, "") + ": " +
        (Array.isArray(v) ? v : [v]).map(value => formatSpecValue(def, value)).join(", ");
    });

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
  async function ask(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = new FormData(form).get("message").trim();
    if (message.length < 2) {
      setMessageError("Escribe una pregunta de al menos 2 caracteres.");
      return;
    }
    setMessageError("");
    try {
      await shop.run(() => shop.api.createInteraction({
        targetId: p.id, receiverId: p.sellerId, targetType: "product", message,
      }));
      form.reset();
      setAsked(true);
    } catch (err) {
      setMessageError(err.message);
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
            {p.category && (
              <Badge variant="muted">
                {p.category}
                {p.subcategory ? ` · ${p.subcategory}` : ""}
              </Badge>
            )}
            {p.condition && (
              <Badge variant={p.condition === "Nuevo" ? "success" : "cyan"}>
                Estado: {p.condition}
              </Badge>
            )}
            {p.isIllustration && (
              <Badge variant="muted">Ilustración representativa</Badge>
            )}
            {isDemo && (
              <span className="nt-demo-review-badge">
                Catálogo de demostración
              </span>
            )}
          </div>

          <h3>{p.name}</h3>
          <PriceDisplay amount={p.price} usdRate={usdRate} className="nt-detail-price" />
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
              Este ítem pertenece al catálogo de demostración de 240 productos.
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
              {!own && p.isActive && (
                <details className="nt-product-specs">
                  <summary>Consultar al vendedor</summary>
                  <div className="nt-product-specs-body">
                    {shop.user ? (
                      <form onSubmit={ask}>
                        <Field label="Tu pregunta" name="message" as="textarea" rows={2}
                          required minLength={2} maxLength={1000} />
                        <Button type="submit" disabled={shop.busy}>Enviar consulta</Button>
                        {messageError && <Alert tone="error">{messageError}</Alert>}
                        {asked && !messageError && <p role="status">Consulta guardada. <a href="#/historial">Ver actividad</a></p>}
                      </form>
                    ) : <a href="#/acceso">Inicia sesión para enviar una consulta.</a>}
                  </div>
                </details>
              )}
            </>
          )}
        </div>
      </div>

      {(isDemo || isSeedDemo) && <ReviewsSection product={isDemo ? p : { ...p, isDemo: true, reviews: syntheticReviewsForProduct(p, 2) }} shop={shop} />}
    </div>
  );
}
