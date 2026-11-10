import RatingStars from "./RatingStars.jsx";

export default function ReviewsSummary({ total = 0, average = 0, distribution = {} }) {
  const avgFormatted = total > 0 ? Number(average).toFixed(1) : "—";

  return (
    <div className="nt-reviews-summary" aria-label="Resumen de calificaciones">
      <div className="nt-reviews-score">
        <strong className="nt-score-big">{avgFormatted}</strong>
        <RatingStars rating={average} size={18} />
        <small>
          {total === 0
            ? "Sin reseñas aún"
            : total === 1
              ? "1 reseña registrada"
              : `${total} reseñas registradas`}
        </small>
      </div>

      <ul className="nt-reviews-bars" aria-label="Distribución de 1 a 5 estrellas">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = Number(distribution[stars] || 0);
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <li key={stars} className="nt-bar-row">
              <span className="nt-bar-label">{stars} ★</span>
              <div
                className="nt-bar-track"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${stars} estrellas: ${count} reseñas (${pct}%)`}
              >
                <div className="nt-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="nt-bar-count">{count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
