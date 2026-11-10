import { useState } from "react";
import { useRemote } from "../hooks/useShop.js";
import Alert from "../components/ui/Alert.jsx";
import Button from "../components/ui/Button.jsx";
import Field from "../components/ui/Field.jsx";

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

  if (!shop.session) {
    return (
      <section className="container py-4">
        <header className="nt-page-heading mb-4">
          <span className="nt-eyebrow">PERSISTENCIA NOSQL (MONGODB)</span>
          <h1>Historial de Actividad e Interacciones<span>.</span></h1>
        </header>
        <Alert tone="warning" title="Inicio de sesión requerido">
          Debes iniciar sesión para consultar tu historial de auditoría y tus conversaciones en MongoDB.
          Ve a <a href="#/acceso">Iniciar Sesión</a>.
        </Alert>
      </section>
    );
  }

  return (
    <section className="container py-4">
      <header className="nt-page-heading mb-4">
        <span className="nt-eyebrow">PERSISTENCIA NOSQL (MONGODB)</span>
        <h1>Historial de Actividad e Interacciones<span>.</span></h1>
        <p className="text-muted">
          Persistencia documental desacoplada de PostgreSQL para auditoría de eventos y mensajes entre compradores y vendedores.
        </p>
      </header>

      {/* Selector de pestañas */}
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
    </section>
  );
}
