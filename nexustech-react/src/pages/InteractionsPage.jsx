import { useState } from "react";
import { useRemote } from "../hooks/useShop.js";
import Alert from "../components/ui/Alert.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Icon from "../components/ui/Icon.jsx";

export default function InteractionsPage({ shop }) {
  const [activeTab, setActiveTab] = useState("logs"); // 'logs' | 'messages'
  const [targetId, setTargetId] = useState("");
  const [targetType, setTargetType] = useState("product");
  const [receiverId, setReceiverId] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  // Consulta los logs de actividad en MongoDB del usuario actual
  const logsResult = useRemote(
    (signal) => (shop.session ? shop.api.myLogs(signal) : null),
    [shop.api, shop.session, shop.revision]
  );

  // Consulta las interacciones (mensajes) en MongoDB del usuario actual
  const interactionsResult = useRemote(
    (signal) => (shop.session ? shop.api.myInteractions(signal) : null),
    [shop.api, shop.session, shop.revision]
  );

  async function handleSendInteraction(e) {
    e.preventDefault();
    if (!targetId.trim() || !message.trim()) return;

    setSending(true);
    setSendResult(null);
    try {
      await shop.api.createInteraction({
        targetId: targetId.trim(),
        targetType,
        receiverId: receiverId.trim(),
        message: message.trim(),
      });
      setSendResult({ tone: "success", text: "Mensaje de interacción persistido exitosamente en MongoDB." });
      setMessage("");
      setTargetId("");
      shop.refresh(); // disparar recarga
    } catch (err) {
      setSendResult({ tone: "error", text: err.message || "Error al registrar interacción." });
    } finally {
      setSending(false);
    }
  }

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

      {shop.session ? (
        <Card title="Mis eventos y conversaciones">
      <div className="btn-group mb-4" role="group">
        <button
          type="button"
          className={`btn ${activeTab === 'logs' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('logs')}
        >
          Eventos de Auditoría ({Array.isArray(logsResult.data) ? logsResult.data.length : 0})
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'messages' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('messages')}
        >
          Conversaciones e Interacciones ({Array.isArray(interactionsResult.data) ? interactionsResult.data.length : 0})
        </button>
      </div>

      {/* Pestaña: Logs de Auditoría */}
      {activeTab === "logs" && (
        <div>
          {logsResult.status === "loading" && (
            <p className="text-muted">⏳ Conectando con MongoDB y cargando eventos...</p>
          )}

          {logsResult.status === "error" && (
            <Alert tone="error" title="No se pudo obtener la auditoría de MongoDB">
              {logsResult.error?.message || "Servicio MongoDB no disponible."}
            </Alert>
          )}

          {logsResult.status === "success" && (
            <div>
              {logsResult.data?.length === 0 ? (
                <div className="alert alert-secondary">
                  No hay eventos registrados aún. Realiza un checkout, crea una publicación o actualiza un estado para generar trazas en MongoDB.
                </div>
              ) : (
                <div className="list-group">
                  {logsResult.data.map((log, idx) => (
                    <div key={log._id || idx} className="list-group-item list-group-item-action flex-column align-items-start bg-dark text-light border-secondary mb-2">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1 text-info fw-bold">{log.eventName}</h6>
                        <small className="text-muted">{new Date(log.occurredAt).toLocaleString()}</small>
                      </div>
                      <p className="mb-1 small">
                        <strong>Recurso ID:</strong> <code>{log.resourceId}</code>
                      </p>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="small text-secondary bg-black p-2 rounded mt-1">
                          <strong>Metadatos:</strong> {JSON.stringify(log.metadata)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pestaña: Interacciones / Mensajes */}
      {activeTab === "messages" && (
        <div>
          <div className="card bg-dark text-light border-secondary mb-4">
            <div className="card-header border-secondary">
              <h5 className="mb-0">Enviar nueva consulta o mensaje a vendedor/comprador</h5>
            </div>
            <div className="card-body">
              {sendResult && (
                <div className={`alert alert-${sendResult.tone === 'success' ? 'success' : 'danger'}`}>
                  {sendResult.text}
                </div>
              )}
              <form onSubmit={handleSendInteraction}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small">Tipo de recurso</label>
                    <select
                      className="form-select bg-dark text-light border-secondary"
                      value={targetType}
                      onChange={(e) => setTargetType(e.target.value)}
                    >
                      <option value="product">Producto / Publicación</option>
                      <option value="order">Pedido</option>
                    </select>
                  </div>
                  <div className="col-md-8">
                    <label className="form-label small">UUID del Producto o Pedido</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary"
                      placeholder="Ej: 22222222-2222-4222-8222-222222222222"
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="receiver-id" className="form-label small">UUID del destinatario</label>
                    <input id="receiver-id" className="form-control" value={receiverId} onChange={e => setReceiverId(e.target.value)} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label small">Mensaje o consulta</label>
                    <textarea
                      className="form-control bg-dark text-light border-secondary"
                      rows="3"
                      placeholder="Escribe tu consulta o mensaje sobre el estado o características..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="col-12 text-end">
                    <Button type="submit" variant="primary" disabled={sending}>
                      {sending ? "Guardando en MongoDB..." : "Persistir en MongoDB"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <h5 className="mb-3">Mensajes e interacciones registradas</h5>
          {interactionsResult.status === "loading" && (
            <p className="text-muted">⏳ Cargando interacciones desde MongoDB...</p>
          )}
          {interactionsResult.status === "error" && (
            <Alert tone="error" title="Error cargando interacciones">
              {interactionsResult.error?.message}
            </Alert>
          )}
          {interactionsResult.status === "success" && (
            <div>
              {interactionsResult.data?.length === 0 ? (
                <div className="alert alert-secondary">
                  No hay interacciones registradas para tu usuario. Utiliza el formulario superior para crear la primera.
                </div>
              ) : (
                <div className="list-group">
                  {interactionsResult.data.map((msg, idx) => (
                    <div key={msg._id || idx} className="list-group-item bg-dark text-light border-secondary mb-2">
                      <div className="d-flex w-100 justify-content-between">
                        <span className="badge bg-info text-dark mb-1">{msg.targetType.toUpperCase()}</span>
                        <small className="text-muted">{new Date(msg.createdAt).toLocaleString()}</small>
                      </div>
                      <p className="mb-1">{msg.message}</p>
                      <small className="text-muted">Target UUID: <code>{msg.targetId}</code></small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

        </Card>
      ) : (
        <Alert title="Inicio de sesion requerido">
          Inicia sesion para consultar tus eventos y mensajes privados. <a href="#/acceso">Ingresar</a>.
        </Alert>
      )}

      <Alert title="Privacidad y persistencia">
        Tus mensajes solo son visibles para sus participantes. Los eventos de publicaciones
        y pedidos se conservan en una cola SQL duradera antes de entregarse a MongoDB.
        Si un mensaje no se puede guardar, se informa el error. Puedes consultar tus compras en{" "}
        <a href="#/rastreo" className="nt-link-strong">Pedidos y ventas</a>.
      </Alert>

      <div className="nt-activity-grid">
        <Card title="Arquitectura de Eventos Desacoplada">
          <p className="nt-card-p">
            NexusTech implementa una arquitectura híbrida donde PostgreSQL maneja la
            integridad relacional de pedidos y productos, mientras que los eventos de
            interacción se entregan asíncronamente:
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
                <p>El servidor verifica el JWT y registra el identificador del actor autenticado.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
