import { useState } from "react";
import Alert from "../ui/Alert.jsx";
import Button from "../ui/Button.jsx";
import Field from "../ui/Field.jsx";
import { RatingSelector } from "./RatingStars.jsx";

const PRESET_FEATURES = [
  "Rendimiento",
  "Estado físico",
  "Relación precio/calidad",
  "Batería / Autonomía",
  "Conectividad",
];

export default function ReviewForm({
  isDemoProduct,
  authenticated,
  busy,
  onSubmit,
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [features, setFeatures] = useState([]);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function toggleFeature(feat) {
    setFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat],
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitted(false);

    if (rating < 1 || rating > 5) {
      setError("Selecciona una calificación de 1 a 5 estrellas.");
      return;
    }
    if (title.trim().length < 3) {
      setError("Ingresa un título breve de al menos 3 caracteres.");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Escribe tu opinión con al menos 10 caracteres.");
      return;
    }

    try {
      await onSubmit({
        rating,
        title: title.trim(),
        comment: comment.trim(),
        featuresEvaluated: features,
      });
      setTitle("");
      setComment("");
      setFeatures([]);
      setRating(5);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    }
  }

  if (isDemoProduct) {
    return (
      <Alert title="Formulario de reseñas (Solo en productos persistidos)">
        Los productos de demostración muestran reseñas ilustrativas locales. Para
        publicar una reseña persistente debes iniciar sesión y seleccionar un
        producto real del backend NestJS.
      </Alert>
    );
  }

  if (!authenticated) {
    return (
      <Alert title="Inicia sesión para opinar">
        <a href="#/acceso" className="nt-link-strong">
          Ingresa con tu cuenta
        </a>{" "}
        para escribir una reseña verificable en el servidor.
      </Alert>
    );
  }

  return (
    <form
      className="nt-review-form"
      onSubmit={handleSubmit}
      aria-label="Escribir una reseña"
      aria-busy={busy}
      noValidate
    >
      <h4>Escribir una opinión</h4>

      <div className="nt-field">
        <span className="nt-label">Calificación</span>
        <RatingSelector
          value={rating}
          onChange={setRating}
          disabled={busy}
        />
      </div>

      <Field
        label="Título de tu reseña"
        name="reviewTitle"
        placeholder="Ej: Excelente rendimiento en laboratorio"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        minLength={3}
        maxLength={100}
        disabled={busy}
      />

      <div className="nt-field">
        <span className="nt-label">Características destacadas (opcional)</span>
        <div
          className="nt-feature-picker"
          role="group"
          aria-label="Seleccionar características evaluadas"
        >
          {PRESET_FEATURES.map((feat) => {
            const selected = features.includes(feat);
            return (
              <button
                key={feat}
                type="button"
                aria-pressed={selected}
                disabled={busy}
                className={"nt-chip-btn" + (selected ? " is-active" : "")}
                onClick={() => toggleFeature(feat)}
              >
                {feat}
              </button>
            );
          })}
        </div>
      </div>

      <Field
        label="Detalle de tu experiencia"
        name="reviewComment"
        as="textarea"
        rows={3}
        placeholder="Describe el desempeño, estado físico o compatibilidad del producto..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
        minLength={10}
        maxLength={1000}
        hint={`${comment.trim().length}/1000 caracteres (mínimo 10)`}
        disabled={busy}
      />

      {error && <Alert tone="error">{error}</Alert>}
      {submitted && (
        <Alert tone="success">Reseña publicada en el servidor.</Alert>
      )}

      <div className="nt-review-form-actions">
        <Button type="submit" disabled={busy}>
          {busy ? "Enviando reseña…" : "Publicar reseña"}
        </Button>
      </div>
    </form>
  );
}
