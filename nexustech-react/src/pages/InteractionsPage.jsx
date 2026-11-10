import Alert from "../components/ui/Alert.jsx";
export default function InteractionsPage() {
  return (
    <section>
      <header className="nt-page-heading">
        <span className="nt-eyebrow">ACTIVIDAD</span>
        <h1>
          Historial de actividad<span>.</span>
        </h1>
      </header>
      <Alert title="Historial temporalmente no disponible">
        El módulo de actividad MongoDB aún está pendiente de integración con
        NestJS. No se consultan servicios alternativos ni se muestran eventos de
        ejemplo. Tus pedidos pueden consultarse en{" "}
        <a href="#/rastreo">Pedidos y ventas</a>.
      </Alert>
    </section>
  );
}
