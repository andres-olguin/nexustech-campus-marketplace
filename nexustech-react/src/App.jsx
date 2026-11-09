import { useCallback, useEffect, useRef, useState } from 'react';
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
import EditPriceForm from './components/shop/EditPriceForm.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import TrackingPage from './pages/TrackingPage.jsx';
import useHashRoute from './hooks/useHashRoute.js';
import useShop from './hooks/useShop.js';
import useExchangeRate from './hooks/useExchangeRate.js';

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
    const titles = { catalogo: 'Catálogo', favoritos: 'Favoritos', rastreo: 'Rastreo', contacto: 'Contacto', acceso: 'Acceso' };
    document.title = titles[route] + ' · NexusTech Campus Hub';
  }, [route]);

  const usdRate = showUSD ? exchange.rate?.value : null;
  const close = () => setWindow(null);
  const openCart = () => setWindow({ type: 'cart' });
  const openPublish = useCallback(() => setWindow({ type: 'publish' }), []);
  const openDetail = useCallback((product) => setWindow({ type: 'detail', product }), []);
  const openDelete = useCallback((product) => setWindow({ type: 'delete', product }), []);
  const openPrice = useCallback((product) => setWindow({ type: 'price', product }), []);
  function publish(values) {
    shop.publish(values);
    setCatalogVersion((current) => current + 1);
    close();
    location.hash = '/catalogo';
  }
  function addFromDetail(id, quantity, finish) {
    shop.addToCart(id, quantity, finish);
    openCart();
  }
  function buyFromDetail(id, quantity, finish) {
    shop.addToCart(id, quantity, finish);
    setWindow({ type: 'checkout' });
  }
  function confirmOrder(values) {
    const order = shop.checkout(values);
    if (order) setWindow({ type: 'confirmed', order });
  }
  const title = !window ? '' : window.type === 'detail' ? window.product.nombre : ({
    cart: 'Tu carrito', publish: 'Publicar producto', checkout: 'Despacho y pedido simulado',
    confirmed: 'Pedido confirmado', delete: 'Eliminar publicación', reset: 'Restaurar demostración', price: 'Editar precio',
  })[window.type];
  const descriptions = {
    cart: 'Revisa tus productos, cantidades y acabados.', publish: 'Comparte un equipo o solución con tu comunidad.',
    checkout: 'Compra de demostración, sin cobro real.', confirmed: 'Tu orden local ya tiene un código de seguimiento.',
    price: 'Actualiza el precio de tu publicación en pesos chilenos.',
    delete: 'Puedes deshacer esta acción desde el mensaje de confirmación.', reset: 'Se restablecerán el catálogo, el carrito, los favoritos, la sesión y los pedidos de esta demostración.',
  };

  return <div className="nt-app"><a className="nt-skip" href="#contenido" onClick={(event) => { event.preventDefault(); main.current?.focus(); main.current?.scrollIntoView({ block: 'start' }); }}>Ir al contenido</a><Navbar route={route} cartCount={shop.cartCount} favoriteCount={shop.favoriteSet.size} user={shop.user} onCart={openCart} onPublish={openPublish} /><main ref={main} className="nt-main" id="contenido" tabIndex={-1}>
    {shop.storage === 'session' && <Alert title="Cambios durante esta sesión">El navegador no permite conservar la demostración al recargar.</Alert>}
    {(route === 'catalogo' || route === 'favoritos') && <CatalogPage key={route + catalogVersion} shop={shop} favoriteOnly={route === 'favoritos'} onDetail={openDetail} onDelete={openDelete} onEditPrice={openPrice} onPublish={openPublish} exchange={exchange} showUSD={showUSD} onCurrency={setShowUSD} />}
    {route === 'rastreo' && <TrackingPage key={trackingCode} orders={shop.orders} onAdvance={shop.advanceOrder} initialCode={trackingCode} />}
    {route === 'contacto' && <ContactPage onSave={shop.saveContact} contacts={shop.contacts} />}
    {route === 'acceso' && <LoginPage user={shop.user} onLogin={shop.login} onLogout={shop.logout} />}
    <Footer storage={shop.storage} onReset={() => setWindow({ type: 'reset' })} />
  </main>
    {shop.notice && <div className="nt-notice-area"><Alert tone="success" title={shop.notice.title} onDismiss={shop.dismissNotice} action={shop.notice.undo ? <Button variant="secondary" icon="undo" onClick={shop.undoDelete}>Deshacer</Button> : null}>{shop.notice.message}</Alert></div>}
    <Dialog open={Boolean(window)} title={title} description={window?.type === 'detail' ? 'Detalles, opciones y reseñas de ejemplo.' : descriptions[window?.type]} onClose={close} wide={window?.type === 'detail'} drawer={window?.type === 'cart'}>
      {window?.type === 'cart' && <CartPanel shop={shop} onCheckout={() => setWindow({ type: 'checkout' })} onClose={close} usdRate={usdRate} />}
      {window?.type === 'detail' && <ProductDetail key={window.product.id} product={window.product} usdRate={usdRate} onAdd={addFromDetail} onBuy={buyFromDetail} />}
      {window?.type === 'publish' && <PublishForm user={shop.user} onSave={publish} onCancel={close} />}
      {window?.type === 'price' && <EditPriceForm key={window.product.id} product={window.product} usdRate={usdRate} onCancel={close} onSave={(price) => { if (shop.updatePrice(window.product.id, price)) close(); }} />}
      {window?.type === 'checkout' && <CheckoutForm total={shop.total} user={shop.user} onConfirm={confirmOrder} onCancel={openCart} />}
      {window?.type === 'confirmed' && <div className="nt-order-confirmation"><span className="nt-success-symbol"><Icon name="check" size={32} /></span><p>Código de seguimiento</p><strong>{window.order.codigo}</strong><p>El pedido quedó guardado para consultar su avance.</p><a className="btn nt-button nt-button--primary" href="#/rastreo" onClick={() => { setTrackingCode(window.order.codigo); close(); }}>Ver seguimiento<Icon name="arrow" size={18} /></a><Button variant="ghost" onClick={close}>Seguir explorando</Button></div>}
      {window?.type === 'delete' && <><p className="nt-confirm-product">{window.product.nombre}</p><div className="nt-form-actions"><Button variant="secondary" onClick={close}>Cancelar</Button><Button variant="danger" icon="trash" onClick={() => { shop.deleteProduct(window.product.id); close(); }}>Eliminar publicación</Button></div></>}
      {window?.type === 'reset' && <div className="nt-form-actions"><Button variant="secondary" onClick={close}>Cancelar</Button><Button onClick={() => { shop.resetDemo(); setCatalogVersion((n) => n + 1); setTrackingCode(''); close(); location.hash = '/catalogo'; }}>Restaurar datos de ejemplo</Button></div>}
    </Dialog>
  </div>;
}
