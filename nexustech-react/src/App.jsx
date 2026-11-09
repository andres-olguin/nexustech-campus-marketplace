import { useEffect, useRef, useState } from 'react';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import Alert from './components/ui/Alert.jsx';
import Button from './components/ui/Button.jsx';
import Dialog from './components/ui/Dialog.jsx';
import Icon from './components/ui/Icon.jsx';
import CartPanel from './components/shop/CartPanel.jsx';
import CheckoutForm from './components/shop/CheckoutForm.jsx';
import ProductDetail from './components/shop/ProductDetail.jsx';
import PublishForm from './components/shop/PublishForm.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import TrackingPage from './pages/TrackingPage.jsx';
import InteractionsPage from './pages/InteractionsPage.jsx';
import useHashRoute from './hooks/useHashRoute.js';
import useShop from './hooks/useShop.js';
import useExchangeRate from './hooks/useExchangeRate.js';
import { formatCLP } from './utils/format.js';

export default function App() {
  const shop = useShop();
  const exchange = useExchangeRate();
  const route = useHashRoute();
  const [window, setWindow] = useState(null);
  const [showUSD, setShowUSD] = useState(false);
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [trackingCode, setTrackingCode] = useState('');
  const main = useRef(null);
  const previousRoute = useRef(route);

  useEffect(() => {
    if (previousRoute.current !== route) {
      main.current?.focus({ preventScroll: true });
      globalThis.scrollTo({ top: 0 });
      previousRoute.current = route;
    }
    const titles = {
      catalogo: 'Catálogo',
      favoritos: 'Favoritos',
      rastreo: 'Rastreo y Estados',
      historial: 'Historial MongoDB',
      contacto: 'Contacto',
      acceso: 'Mi Cuenta'
    };
    document.title = (titles[route] || 'Catálogo') + ' · NexusTech Campus Hub UNAB';
  }, [route]);

  const usdRate = showUSD && exchange.status === 'success' ? exchange.rate.value : null;
  const close = () => setWindow(null);
  const openCart = () => setWindow({ type: 'cart' });
  const openPublish = () => setWindow({ type: 'publish' });
  const openEdit = (product) => setWindow({ type: 'edit', product });

  function publish(values) {
    shop.publish(values);
    setCatalogVersion((current) => current + 1);
    close();
    location.hash = '/catalogo';
  }

  function handleEdit(values, id) {
    shop.editProduct(id, values);
    setCatalogVersion((current) => current + 1);
    close();
  }

  function addFromDetail(id, quantity, finish) {
    shop.addToCart(id, quantity, finish);
    openCart();
  }

  function buyFromDetail(id, quantity, finish) {
    shop.addToCart(id, quantity, finish);
    setWindow({ type: 'checkout' });
  }

  function confirmOrder(values, paymentResult) {
    const order = shop.checkout(values, paymentResult);
    if (order) setWindow({ type: 'confirmed', order, voucher: paymentResult });
  }

  const title = !window
    ? ''
    : window.type === 'detail'
    ? window.product.nombre
    : ({
        cart: 'Tu carrito',
        publish: 'Publicar producto',
        edit: `Editar producto: ${window.product?.nombre || ''}`,
        checkout: 'Despacho y Pago Webpay Plus Simulado',
        confirmed: 'Compra y Pedido Confirmados',
        delete: 'Eliminar publicación',
        reset: 'Restaurar demostración'
      })[window.type];

  const descriptions = {
    cart: 'Revisa tus productos, cantidades y acabados.',
    publish: 'Comparte un equipo o solución con tu comunidad universitaria.',
    edit: 'Actualiza el precio, disponibilidad o especificaciones.',
    checkout: 'Pasarela académica simulada Transbank Webpay Plus · Cero riesgo financiero.',
    confirmed: 'Transacción autorizada y orden registrada con código de seguimiento.',
    delete: 'Puedes deshacer esta acción desde el mensaje de confirmación.',
    reset: 'Se restablecerán el catálogo, el carrito, los favoritos, la sesión y los pedidos de esta demostración.'
  };

  return (
    <div className="nt-app">
      <a
        className="nt-skip"
        href="#contenido"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
          main.current?.scrollIntoView({ block: 'start' });
        }}
      >
        Ir al contenido
      </a>

      <Navbar
        route={route}
        cartCount={shop.cartCount}
        favoriteCount={shop.favoriteSet.size}
        user={shop.user}
        backendOnline={shop.backendStatus.online}
        onCart={openCart}
        onPublish={openPublish}
      />

      <main ref={main} className="nt-main" id="contenido" tabIndex={-1}>
        {shop.storage === 'session' && (
          <Alert title="Cambios durante esta sesión">
            El almacenamiento persistente local está restringido en este navegador.
          </Alert>
        )}

        {(route === 'catalogo' || route === 'favoritos') && (
          <CatalogPage
            key={route + catalogVersion}
            shop={shop}
            favoriteOnly={route === 'favoritos'}
            onDetail={(product) => setWindow({ type: 'detail', product })}
            onEdit={openEdit}
            onDelete={(product) => setWindow({ type: 'delete', product })}
            onPublish={openPublish}
            exchange={exchange}
            showUSD={showUSD}
            onCurrency={setShowUSD}
          />
        )}

        {route === 'rastreo' && (
          <TrackingPage
            key={trackingCode}
            orders={shop.orders}
            onAdvance={shop.advanceOrder}
            initialCode={trackingCode}
          />
        )}

        {route === 'historial' && <InteractionsPage />}

        {route === 'contacto' && (
          <ContactPage onSave={shop.saveContact} contacts={shop.contacts} />
        )}

        {route === 'acceso' && (
          <LoginPage
            user={shop.user}
            onLogin={shop.login}
            onLogout={shop.logout}
            onSwitchRole={shop.switchRole}
            onPublish={openPublish}
            onEditProduct={openEdit}
            products={shop.products}
            orders={shop.orders}
          />
        )}

        <Footer storage={shop.storage} onReset={() => setWindow({ type: 'reset' })} />
      </main>

      {shop.notice && (
        <div className="nt-notice-area">
          <Alert
            tone="success"
            title={shop.notice.title}
            onDismiss={shop.dismissNotice}
            action={
              shop.notice.undo ? (
                <Button variant="secondary" icon="undo" onClick={shop.undoDelete}>
                  Deshacer
                </Button>
              ) : null
            }
          >
            {shop.notice.message}
          </Alert>
        </div>
      )}

      <Dialog
        open={Boolean(window)}
        title={title}
        description={window?.type === 'detail' ? 'Detalles, opciones y especificaciones.' : descriptions[window?.type]}
        onClose={close}
        wide={window?.type === 'detail' || window?.type === 'checkout'}
        drawer={window?.type === 'cart'}
      >
        {window?.type === 'cart' && (
          <CartPanel
            shop={shop}
            onCheckout={() => setWindow({ type: 'checkout' })}
            onClose={close}
            usdRate={usdRate}
          />
        )}

        {window?.type === 'detail' && (
          <ProductDetail
            key={window.product.id}
            product={window.product}
            usdRate={usdRate}
            onAdd={addFromDetail}
            onBuy={buyFromDetail}
          />
        )}

        {window?.type === 'publish' && (
          <PublishForm user={shop.user} onSave={publish} onCancel={close} />
        )}

        {window?.type === 'edit' && (
          <PublishForm
            initialProduct={window.product}
            user={shop.user}
            onSave={handleEdit}
            onCancel={close}
          />
        )}

        {window?.type === 'checkout' && (
          <CheckoutForm
            total={shop.total}
            user={shop.user}
            onConfirm={confirmOrder}
            onCancel={openCart}
          />
        )}

        {window?.type === 'confirmed' && (
          <div className="nt-order-confirmation">
            <span className="nt-success-symbol">
              <Icon name="check" size={34} />
            </span>
            <h3>¡Pago Autorizado y Pedido Generado!</h3>
            <p className="nt-voucher-note">
              Tu transacción simulada por <strong>{formatCLP(window.order.total)}</strong> fue aprobada.
            </p>

            <div className="nt-voucher-card">
              <div className="nt-voucher-header">
                <Icon name="shield" size={18} />
                <span>COMPROBANTE WEBPAY PLUS</span>
              </div>
              <div className="nt-voucher-grid">
                <div>
                  <small>Código Seguimiento</small>
                  <strong>{window.order.codigo}</strong>
                </div>
                <div>
                  <small>Autorización</small>
                  <strong>{window.voucher?.codigoAutorizacion || 'AUTH-748921'}</strong>
                </div>
                <div>
                  <small>Tarjeta</small>
                  <span>{window.voucher?.tarjeta || '•••• •••• •••• 4242'}</span>
                </div>
                <div>
                  <small>Destino</small>
                  <span>{window.order.ciudad}</span>
                </div>
              </div>
            </div>

            <div className="nt-confirmation-buttons">
              <a
                className="btn nt-button nt-button--primary"
                href="#/rastreo"
                onClick={() => {
                  setTrackingCode(window.order.codigo);
                  close();
                }}
              >
                Ver seguimiento del pedido
                <Icon name="arrow" size={18} />
              </a>
              <Button variant="ghost" onClick={close}>
                Seguir explorando
              </Button>
            </div>
          </div>
        )}

        {window?.type === 'delete' && (
          <>
            <p className="nt-confirm-product">{window.product.nombre}</p>
            <div className="nt-form-actions">
              <Button variant="secondary" onClick={close}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                icon="trash"
                onClick={() => {
                  shop.deleteProduct(window.product.id);
                  close();
                }}
              >
                Eliminar publicación
              </Button>
            </div>
          </>
        )}

        {window?.type === 'reset' && (
          <div className="nt-form-actions">
            <Button variant="secondary" onClick={close}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                shop.resetDemo();
                setCatalogVersion((n) => n + 1);
                setTrackingCode('');
                close();
                location.hash = '/catalogo';
              }}
            >
              Restaurar datos de ejemplo
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
