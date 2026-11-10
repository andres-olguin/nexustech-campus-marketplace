import RatingStars from "./RatingStars.jsx";

export default function ReviewCard({ review }) {
  const author = review.author || review.userName || "Usuario";
  const initial = author[0]?.toUpperCase() || "U";
  const dateText = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Fecha no registrada";
  const features = Array.isArray(review.featuresEvaluated)
    ? review.featuresEvaluated
    : [];

  return (
    <article className="nt-review-card">
      <div className="nt-review-header">
        <span className="nt-review-avatar" aria-hidden="true">
          {initial}
        </span>
        <div className="nt-review-author-block">
          <strong>{author}</strong>
          <small>{dateText}</small>
        </div>
        <div className="nt-review-badges">
          {review.isDemo && (
            <span className="nt-demo-review-badge">
              Reseña de demostración
            </span>
          )}
          <RatingStars rating={review.rating} size={14} />
        </div>
      </div>

      {review.title && <h4 className="nt-review-title">{review.title}</h4>}
      <p className="nt-review-comment">{review.comment}</p>

      {features.length > 0 && (
        <div
          className="nt-review-features"
          aria-label="Características evaluadas"
        >
          {features.map((feat) => (
            <span key={feat} className="nt-feature-chip">
              {feat}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
