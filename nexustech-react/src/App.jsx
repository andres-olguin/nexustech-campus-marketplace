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
import EditPriceForm from "./components/shop/EditPriceForm.jsx";
import DetailNavigation from "./components/shop/DetailNavigation.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import TrackingPage from "./pages/TrackingPage.jsx";
import InteractionsPage from "./pages/InteractionsPage.jsx";
import useHashRoute from "./hooks/useHashRoute.js";
import useShop from "./hooks/useShop.js";
import useExchangeRate from "./hooks/useExchangeRate.js";
import { formatCLP } from "./utils/format.js";
export default function App() {
  const shop = useShop();
  const route = useHashRoute();
  const main = useRef(null);
  const previous = useRef(route);
  const [dialog, setDialog] = useState(null);
  const [dialogError, setDialogError] = useState("");
  const [moving, setMoving] = useState(false);
  const detailRequest = useRef(null);
  const exchange = useExchangeRate();
  const [showUSD, setShowUSD] = useState(false);
  const usdRate = showUSD ? exchange.rate?.value : null;
  function cancelMove() {
    detailRequest.current?.abort();
    detailRequest.current = null;
    setMoving(false);
  }
  function open(value) {
    cancelMove();
    setDialogError("");
    setDialog(value);
  }
  function close() {
    if (!shop.busy) {
      cancelMove();
      setDialog(null);
    }
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
      cancelMove();
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
    if (!shop.session) {
      cancelMove();
      setDialog(null);
    }
  }, [shop.session]);
  function detail(product, navigation) {
    open({ type: "detail", product, navigation });
  }
  async function moveDetail(direction) {
    const nav = dialog?.navigation;
    if (!nav || detailRequest.current || shop.busy) return;
    const index = nav.index + direction;
    if (index < 0 || index >= nav.count) return;
    const page = Math.floor(index / nav.limit) + 1;
    const request = new AbortController();
    detailRequest.current = request;
    setDialogError("");
    setMoving(true);
    try {
      const items = page === nav.page ? nav.items : await nav.loadPage(page, request.signal);
      if (request.signal.aborted) return;
      const product = items[index % nav.limit];
      if (!product) throw new Error("Los resultados cambiaron. Cierra el detalle y actualiza el catálogo.");
      setDialog(current => current?.navigation === nav
        ? { ...current, product, navigation: { ...nav, index, page, items } }
        : current);
    } catch (error) {
      if (!request.signal.aborted) setDialogError(error.message);
    } finally {
      if (detailRequest.current === request) {
        detailRequest.current = null;
        setMoving(false);
      }
    }
  }
  async function savePrice(price) {
    await shop.run(() => shop.api.edit(dialog.product.id, { price }), "Precio actualizado en el servidor.");
    setDialog(null);
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
    price: "Editar precio",
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
            onPrice={(product) => open({ type: "price", product })}
            onArchive={(product) => open({ type: "archive", product })}
            onPublish={() => protectedOpen({ type: "publish" })}
            exchange={exchange}
            showUSD={showUSD}
            onCurrency={setShowUSD}
            usdRate={usdRate}
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
        viewKey={dialog?.type === "detail" ? dialog.product.id : undefined}
        navigation={dialog?.navigation && (
          <DetailNavigation index={dialog.navigation.index} count={dialog.navigation.count}
            onMove={moveDetail} busy={moving || shop.busy} />
        )}
        onKeyDown={event => {
          if (!dialog?.navigation || event.altKey || event.ctrlKey || event.metaKey ||
            event.target.closest("input, select, textarea, [contenteditable]")) return;
          if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            void moveDetail(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
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
            usdRate={usdRate}
            onAdded={() => open({ type: "cart" })}
          />
        )}
        {dialog?.type === "price" && (
          <EditPriceForm product={dialog.product} usdRate={usdRate} busy={shop.busy}
            onSave={savePrice} onCancel={close} />
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
