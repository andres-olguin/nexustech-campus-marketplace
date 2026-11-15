import Icon from "../ui/Icon.jsx";

export default function RatingStars({ rating = 0, size = 15, label }) {
  const clamped = Math.max(0, Math.min(5, Number(rating) || 0));
  const rounded = Math.round(clamped * 10) / 10;
  return (
    <span
      className="nt-stars"
      role="img"
      aria-label={label || `Calificación: ${rounded} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            "nt-star-item" + (star <= Math.round(clamped) ? " is-filled" : "")
          }
          aria-hidden="true"
        >
          <Icon name="star" size={size} filled={star <= Math.round(clamped)} />
        </span>
      ))}
    </span>
  );
}

export function RatingSelector({ value, onChange, disabled }) {
  const labels = {
    1: "1 estrella — Muy deficiente",
    2: "2 estrellas — Deficiente",
    3: "3 estrellas — Aceptable",
    4: "4 estrellas — Bueno",
    5: "5 estrellas — Excelente",
  };
  return (
    <div
      className="nt-rating-selector"
      role="radiogroup"
      aria-label="Seleccionar calificación de 1 a 5 estrellas"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={labels[star]}
            disabled={disabled}
            className={"nt-star-btn" + (active ? " is-active" : "")}
            onClick={() => onChange(star)}
          >
            <Icon name="star" size={20} filled={active} />
          </button>
        );
      })}
      <span className="nt-rating-selector-hint">
        {value ? labels[value] : "Elige una puntuación"}
      </span>
    </div>
  );
}
