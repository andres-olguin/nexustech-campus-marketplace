import { useState } from "react";
import { useRemote } from "../hooks/useShop.js";
import Alert from "../components/ui/Alert.jsx";
import Button from "../components/ui/Button.jsx";
import Field from "../components/ui/Field.jsx";
import Pagination from "../components/catalog/Pagination.jsx";
import { formatCLP } from "../utils/format.js";
export const statusLabels = {
  confirmed: "Confirmado",
  preparing: "En preparación",
  shipped: "Despacho declarado",
  delivered: "Entrega declarada",
  cancelled: "Cancelado",
};
const nextStatus = {
  confirmed: "preparing",
  preparing: "shipped",
  shipped: "delivered",
};
export default function TrackingPage({ shop }) {
  const [seller, setSeller] = useState(false);
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const result = useRemote(
    (signal) => (shop.session ? shop.api.orders(page, seller, signal) : null),
    [shop.api, shop.session, shop.revision, seller, page],
  );
  async function lookup(event) {
    event.preventDefault();
    setError("");
    setDetail(null);
    setSearching(true);
    try {
      setDetail(
        await shop.api.order(
          new FormData(event.currentTarget).get("orderId").trim(),
        ),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }
  function mutate(action) {
    setDetail(null);
    shop.act(() => shop.run(action, "Estado actualizado en el servidor."));
  }
  const visible = detail && !seller ? [detail] : result.data?.items || [];
  return (
    <section>
      <header className="nt-page-heading">
        <span className="nt-eyebrow">SEGUIMIENTO DE TU CUENTA</span>
        <h1>
          Pedidos y ventas<span>.</span>
        </h1>
        <p>
          Estados declarados por cada vendedor. Seguimiento SIMULADO, sin
          transporte ni cobros reales.
        </p>
      </header>
      {!shop.user ? (
        <Alert>
          <a href="#/acceso">Inicia sesión</a> para consultar tus pedidos.
        </Alert>
      ) : (
        <>
          <div className="nt-form-actions">
            <Button
              variant={!seller ? "primary" : "secondary"}
              onClick={() => {
                setSeller(false);
                setPage(1);
                setDetail(null);
              }}
            >
              Mis compras
            </Button>
            <Button
              variant={seller ? "primary" : "secondary"}
              onClick={() => {
                setSeller(true);
                setPage(1);
                setDetail(null);
              }}
            >
              Mis ventas
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setDetail(null);
                shop.refresh();
              }}
            >
              Actualizar pedidos
            </Button>
          </div>
          {!seller && (
            <form className="nt-order-lookup" onSubmit={lookup}>
              <Field
                label="UUID de un pedido propio"
                name="orderId"
                required
                placeholder="UUID completo del pedido"
              />
              <Button type="submit" disabled={searching}>
                {searching ? "Consultando…" : "Consultar pedido"}
              </Button>
            </form>
          )}
          {error && <Alert tone="error">{error}</Alert>}
          {result.status === "loading" ? (
            <p role="status">Cargando pedidos…</p>
          ) : result.error ? (
            <Alert tone="error">
              {result.error.message}
              <Button onClick={shop.refresh}>Reintentar</Button>
            </Alert>
          ) : !visible.length ? (
            <p>No hay pedidos para esta vista.</p>
          ) : (
            <div className="nt-orders-list">
              {visible.map((o) => {
                const status = seller ? o.fulfillment.status : o.status;
                return (
                  <article key={o.id} className="nt-order-card">
                    <div className="nt-order-header">
                      <h2>
                        Pedido <span className="nt-id">{o.id}</span>
                      </h2>
                      <strong>{statusLabels[status]} · SIMULADO</strong>
                    </div>
                    <p>
                      {new Date(o.createdAt).toLocaleString("es-CL")} ·{" "}
                      {o.shippingAddress}
                    </p>
                    <ul>
                      {o.items.map((i) => (
                        <li key={i.id}>
                          {i.name} × {i.quantity} —{" "}
                          {formatCLP(i.unitPrice * i.quantity)}
                        </li>
                      ))}
                    </ul>
                    <p>
                      {seller ? "Subtotal de tus productos" : "Total"}:{" "}
                      <strong>
                        {formatCLP(seller ? o.subtotal : o.total)}
                      </strong>
                    </p>
                    {!seller && (
                      <>
                        <h3>Avance por vendedor</h3>
                        <ul>
                          {o.fulfillments.map((f) => (
                            <li key={f.id}>
                              <span className="nt-id">
                                Vendedor {f.sellerId}
                              </span>
                              : <strong>{statusLabels[f.status]}</strong>
                            </li>
                          ))}
                        </ul>
                        <p>
                          Transacción SIMULADA:{" "}
                          {o.transactions
                            .map((t) =>
                              t.status === "reversed"
                                ? "revertida"
                                : "aprobada",
                            )
                            .join(", ")}
                          . Sin validez financiera.
                        </p>
                        <Button
                          variant="danger"
                          disabled={
                            shop.busy ||
                            !o.fulfillments.length ||
                            !o.fulfillments.every(
                              (f) => f.status === "confirmed",
                            )
                          }
                          onClick={() => mutate(() => shop.api.cancel(o.id))}
                        >
                          Cancelar pedido
                        </Button>
                        <small>
                          Solo antes de que cualquier vendedor inicie
                          preparación.
                        </small>
                      </>
                    )}
                    {seller && (
                      <>
                        <p>
                          Estado global del pedido:{" "}
                          {statusLabels[o.orderStatus]}
                        </p>
                        <Button
                          disabled={shop.busy || !nextStatus[status]}
                          onClick={() =>
                            mutate(() =>
                              shop.api.advance(o.id, nextStatus[status]),
                            )
                          }
                        >
                          {nextStatus[status]
                            ? "Marcar: " + statusLabels[nextStatus[status]]
                            : "Sin transición disponible"}
                        </Button>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          )}
          {!detail && result.data && (
            <Pagination
              page={page}
              totalPages={Math.max(
                1,
                Math.ceil(result.data.total / result.data.limit),
              )}
              onChange={setPage}
            />
          )}
        </>
      )}
    </section>
  );
}
