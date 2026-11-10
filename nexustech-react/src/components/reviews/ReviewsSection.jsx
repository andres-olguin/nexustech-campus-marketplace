import { useEffect, useState } from "react";
import Alert from "../ui/Alert.jsx";
import Button from "../ui/Button.jsx";
import Pagination from "../catalog/Pagination.jsx";
import ReviewsSummary from "./ReviewsSummary.jsx";
import ReviewCard from "./ReviewCard.jsx";
import ReviewForm from "./ReviewForm.jsx";

const DEMO_PAGE_SIZE = 3;

function computeStats(items) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of items) {
    const score = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 0)));
    distribution[score] += 1;
    sum += score;
  }
  return {
    total: items.length,
    average: items.length > 0 ? sum / items.length : 0,
    distribution,
  };
}

export default function ReviewsSection({ product, shop }) {
  const isDemo = Boolean(product.isDemo);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [state, setState] = useState({
    status: isDemo ? "success" : "loading",
    data: null,
    error: null,
  });

  useEffect(() => {
    setPage(1);
  }, [product.id]);

  useEffect(() => {
    if (isDemo) {
      const all = Array.isArray(product.reviews) ? product.reviews : [];
      const stats = computeStats(all);
      const start = (page - 1) * DEMO_PAGE_SIZE;
      setState({
        status: "success",
        data: {
          items: all.slice(start, start + DEMO_PAGE_SIZE),
          page,
          limit: DEMO_PAGE_SIZE,
          total: all.length,
          averageRating: stats.average,
          distribution: stats.distribution,
        },
        error: null,
      });
      return;
    }

    if (!shop?.api?.reviews) {
      setState({
        status: "error",
        data: null,
        error: { status: 501, message: "Cliente de reseñas no conectado." },
      });
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, status: "loading", error: null }));

    shop.api
      .reviews(product.id, page, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) {
          setState({ status: "success", data: res, error: null });
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setState({ status: "error", data: null, error: err });
      });

    return () => controller.abort();
  }, [isDemo, product.id, product.reviews, page, reloadKey, shop?.api]);

  async function handlePublishReview(payload) {
    setSubmitting(true);
    try {
      await shop.api.createReview(product.id, payload);
      setPage(1);
      setReloadKey((k) => k + 1);
    } catch (err) {
      if (err.status === 404 || err.status === 501) {
        throw new Error(
          "El endpoint de reseñas (/api/v1/products/:id/reviews) aún está pendiente de implementación en el backend NestJS.",
        );
      }
      throw err;
    } finally {
      setSubmitting(false);
    }
  }

  const data = state.data;
  const items = data?.items || [];
  const total = data?.total || 0;
  const limit = data?.limit || DEMO_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const stats = data?.distribution
    ? {
        total,
        average: data.averageRating ?? 0,
        distribution: data.distribution,
      }
    : computeStats(items);

  return (
    <section className="nt-reviews" aria-labelledby="resenas-titulo">
      <div className="nt-reviews-top">
        <div>
          <h3 id="resenas-titulo">Reseñas y calificaciones</h3>
          <p className="nt-muted">
            {isDemo
              ? "Opiniones ilustrativas del catálogo de demostración. No representan compras verificadas."
              : "Opiniones de la comunidad estudiantil consultadas desde la API."}
          </p>
        </div>
      </div>

      {state.status === "loading" && (
        <p role="status" className="nt-reviews-loading">
          <span className="nt-spinner" aria-hidden="true" />
          Cargando reseñas…
        </p>
      )}

      {state.status === "error" && (
        <>
          {state.error?.status === 404 ? (
            <Alert title="Módulo de reseñas pendiente en servidor">
              La interfaz de reseñas ya está lista y conectada al contrato{" "}
              <code>GET/POST /api/v1/products/:id/reviews</code>, a la espera de
              su implementación en el backend NestJS.
            </Alert>
          ) : (
            <Alert tone="error" title="No se pudieron cargar las reseñas">
              {state.error?.message || "Error al consultar reseñas."}{" "}
              <Button
                variant="secondary"
                onClick={() => setReloadKey((k) => k + 1)}
              >
                Reintentar
              </Button>
            </Alert>
          )}
        </>
      )}

      {state.status === "success" && (
        <>
          <ReviewsSummary
            total={stats.total}
            average={stats.average}
            distribution={stats.distribution}
          />

          {items.length === 0 ? (
            <div className="nt-reviews-empty">
              <p>Aún no hay reseñas para este producto.</p>
            </div>
          ) : (
            <div className="nt-reviews-list">
              {items.map((rev) => (
                <ReviewCard key={rev.id} review={rev} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          )}
        </>
      )}

      <ReviewForm
        isDemoProduct={isDemo}
        authenticated={Boolean(shop?.user)}
        busy={submitting}
        onSubmit={handlePublishReview}
      />
    </section>
  );
}
