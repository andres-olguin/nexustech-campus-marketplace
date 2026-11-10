import Alert from "../components/ui/Alert.jsx";
import Card from "../components/ui/Card.jsx";
import Icon from "../components/ui/Icon.jsx";

export default function InteractionsPage() {
  return (
    <section className="nt-interactions-page">
      <header className="nt-page-heading">
        <span className="nt-eyebrow">TELEMETRÍA & ACTIVIDAD ACADÉMICA</span>
        <h1>
          Historial de actividad<span>.</span>
        </h1>
        <p>
          Módulo de eventos y auditoría documental diseñado para persistencia en MongoDB.
        </p>
      </header>

      <Alert title="Estado del módulo NoSQL — Entrega Hito 3">
        El módulo de actividad documental <strong>ActivityModule</strong> está diseñado para
        consumir eventos desacoplados mediante <code>EventEmitter2</code> hacia MongoDB.
        Para preservar la integridad transaccional y evitar fallbacks ficticios en memoria,
        las transacciones comerciales se gestionan con ACID estricto en PostgreSQL.
        Puedes consultar tus compras y despachos en{" "}
        <a href="#/rastreo" className="nt-link-strong">Pedidos y ventas</a>.
      </Alert>

      <div className="nt-activity-grid">
        <Card title="Arquitectura de Eventos Desacoplada">
          <p className="nt-card-p">
            NexusTech implementa una arquitectura híbrida donde PostgreSQL maneja la
            integridad relacional de pedidos y productos, mientras que los eventos de
            interacción se emiten asíncronamente:
          </p>
          <ul className="nt-event-list">
            <li>
              <span className="nt-event-badge">product.created</span>
              <span>Registro de nueva publicación por vendedor autenticado</span>
            </li>
            <li>
              <span className="nt-event-badge">product.updated</span>
              <span>Modificación de precio, stock o archivo lógico de producto</span>
            </li>
            <li>
              <span className="nt-event-badge">order.created</span>
              <span>Confirmación de pedido simulado tras descuento transaccional</span>
            </li>
            <li>
              <span className="nt-event-badge">order.fulfillment.updated</span>
              <span>Actualización de despacho multi-vendedor en campus UNAB</span>
            </li>
          </ul>
        </Card>

        <Card title="Garantías de Seguridad y Privacidad">
          <div className="nt-security-points">
            <div className="nt-sec-item">
              <Icon name="check" size={18} />
              <div>
                <strong>Sin datos personales en logs</strong>
                <p>No se almacenan contraseñas, tokens JWT ni direcciones físicas en eventos.</p>
              </div>
            </div>
            <div className="nt-sec-item">
              <Icon name="check" size={18} />
              <div>
                <strong>Aislamiento de persistencia</strong>
                <p>Una eventual caída del servicio de telemetría jamás revierte compras SQL confirmadas.</p>
              </div>
            </div>
            <div className="nt-sec-item">
              <Icon name="check" size={18} />
              <div>
                <strong>Autenticación canónica</strong>
                <p>Toda acción queda firmada con el identificador criptográfico del actor JWT.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
