import { useEffect, useRef, useState } from "react";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import Alert from "./components/ui/Alert.jsx";
import Button from "./components/ui/Button.jsx";
import Dialog from "./components/ui/Dialog.jsx";
import CartPanel from "./components/shop/CartPanel.jsx";
import CheckoutForm from "./components/shop/CheckoutForm.jsx";
import ProductDetail from "./components/shop/ProductDetail.jsx";
import PublishForm from "./components/shop/PublishForm.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import TrackingPage from "./pages/TrackingPage.jsx";
import InteractionsPage from "./pages/InteractionsPage.jsx";
import useHashRoute from "./hooks/useHashRoute.js";
import useShop from "./hooks/useShop.js";
import { formatCLP } from "./utils/format.js";
export default function App() {
  const shop = useShop();
  const route = useHashRoute();
  const main = useRef(null);
  const previous = useRef(route);
  const [dialog, setDialog] = useState(null);
  const [dialogError, setDialogError] = useState("");
  function open(value) {
    setDialogError("");
    setDialog(value);
  }
  function close() {
    if (!shop.busy) setDialog(null);
  }
  function protectedOpen(value) {
    if (!shop.user) {
      location.hash = "/acceso";
      return;
    }
    open(value);
  }
  useEffect(() => {
    if (previous.current !== route) {
      setDialog(null);
      main.current?.focus({ preventScroll: true });
      globalThis.scrollTo({ top: 0 });
      previous.current = route;
    }
    document.title =
      ({
        catalogo: "Catálogo",
        favoritos: "Favoritos",
        acceso: "Mi cuenta",
        rastreo: "Pedidos y ventas",
        historial: "Actividad",
        contacto: "Contacto",
      }[route] || "Catálogo") + " · NexusTech";
  }, [route]);
  useEffect(() => {
    if (!shop.session) setDialog(null);
  }, [shop.session]);
  async function detail(target) {
    if (target && typeof target === "object" && target.isDemo) {
      open({ type: "detail", product: target });
      return;
    }
    try {
      const product = await shop.api.product(target);
      open({ type: "detail", product });
    } catch (error) {
      shop.setNotice({ tone: "error", message: error.message });
    }
  }
  async function publish(body) {
    await shop.run(
      () =>
        dialog.type === "edit"
          ? shop.api.edit(dialog.product.id, body)
          : shop.api.publish(body),
      "Publicación guardada en PostgreSQL.",
    );
    setDialog(null);
  }
  async function checkout(address) {
    const order = await shop.checkout(address);
    open({ type: "confirmed", order });
  }
  async function archive() {
    try {
      await shop.run(
        () => shop.api.archive(dialog.product.id),
        "Publicación archivada. Los pedidos conservan su historial.",
      );
      setDialog(null);
    } catch (error) {
      setDialogError(error.message);
    }
  }
  const titles = {
    cart: "Tu carrito",
    checkout: "Confirmar pedido simulado",
    publish: "Publicar producto",
    edit: "Editar producto",
    archive: "Archivar publicación",
    detail: dialog?.product?.name,
    confirmed: "Pedido registrado · SIMULADO",
  };
  return (
    <div className="nt-app">
      <a
        className="nt-skip"
        href="#contenido"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Ir al contenido
      </a>
      <Navbar
        route={route}
        user={shop.user}
        cartCount={
          shop.cart?.items.reduce((sum, i) => sum + i.quantity, 0) || 0
        }
        favoriteCount={shop.favoriteSet.size}
        onCart={() =>
          protectedOpen({ type: shop.attempt ? "checkout" : "cart" })
        }
        onPublish={() => protectedOpen({ type: "publish" })}
      />
      <main ref={main} id="contenido" tabIndex={-1} className="nt-main">
        {shop.notice && (
          <Alert tone={shop.notice.tone} onDismiss={shop.dismissNotice}>
            {shop.notice.message}
          </Alert>
        )}
        {shop.session && shop.account.error && route !== "acceso" && (
          <Alert
            tone="error"
            title="No se pudieron actualizar los datos de tu cuenta"
          >
            {shop.account.error.message}
            <Button onClick={shop.refresh}>Reintentar</Button>
          </Alert>
        )}
        {(route === "catalogo" || route === "favoritos") && (
          <CatalogPage
            key={route}
            shop={shop}
            favoriteOnly={route === "favoritos"}
            onDetail={detail}
            onEdit={(product) => open({ type: "edit", product })}
            onArchive={(product) => open({ type: "archive", product })}
            onPublish={() => protectedOpen({ type: "publish" })}
          />
        )}
        {route === "acceso" && (
          <LoginPage shop={shop} onPublish={() => open({ type: "publish" })} />
        )}
        {route === "rastreo" && <TrackingPage shop={shop} />}
        {route === "historial" && <InteractionsPage shop={shop} />}
        {route === "contacto" && (
          <Alert title="Contacto no disponible">
            No existe un servicio de mensajes en la API actual. No se enviarán
            ni guardarán consultas ficticias.
          </Alert>
        )}
        <Footer />
      </main>
      <Dialog
        open={Boolean(dialog)}
        title={titles[dialog?.type] || ""}
        onClose={close}
        wide={dialog?.type === "detail"}
        drawer={dialog?.type === "cart"}
      >
        {dialogError && <Alert tone="error">{dialogError}</Alert>}
        {dialog?.type === "cart" && (
          <CartPanel
            shop={shop}
            onCheckout={() => open({ type: "checkout" })}
          />
        )}
        {dialog?.type === "detail" && (
          <ProductDetail
            key={dialog.product.id}
            product={dialog.product}
            shop={shop}
            onAdded={() => open({ type: "cart" })}
          />
        )}
        {(dialog?.type === "publish" || dialog?.type === "edit") && (
          <PublishForm
            key={dialog.type + (dialog.product?.id || "")}
            initialProduct={dialog.product}
            categories={shop.categories.data || []}
            busy={shop.busy}
            onSave={publish}
            onCancel={close}
          />
        )}
        {dialog?.type === "checkout" && (
          <CheckoutForm
            shop={shop}
            onConfirm={checkout}
            onCancel={() => open({ type: "cart" })}
          />
        )}
        {dialog?.type === "confirmed" && (
          <div className="nt-order-confirmation">
            <h3>Pedido guardado en el servidor</h3>
            <Alert title="SIMULADO · SIN VALIDEZ FINANCIERA">
              No es un comprobante bancario u oficial. No se realizó ningún
              cobro.
            </Alert>
            <p>
              Pedido: <strong className="nt-id">{dialog.order.id}</strong>
            </p>
            <p>
              Total simulado: <strong>{formatCLP(dialog.order.total)}</strong>
            </p>
            <p>Destino: {dialog.order.shippingAddress}</p>
            <a
              className="btn nt-button nt-button--primary"
              href="#/rastreo"
              onClick={close}
            >
              Ver mis pedidos
            </a>
          </div>
        )}
        {dialog?.type === "archive" && (
          <>
            <p>
              Se retirará <strong>{dialog.product.name}</strong> del catálogo.
              No hay restauración disponible en esta API.
            </p>
            <div className="nt-form-actions">
              <Button variant="secondary" onClick={close} disabled={shop.busy}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={archive} disabled={shop.busy}>
                Confirmar archivado
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
}
