import { useEffect, useState } from 'react';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';
import { formatDate } from '../utils/format.js';
import api from '../services/backendApi.js';

const EVENT_TYPES = [
  'Todos',
  'VIEW_PRODUCT',
  'ADD_TO_CART',
  'SEARCH_CATALOG',
  'SIMULATE_PAYMENT',
  'CREATE_ORDER',
  'USER_LOGIN',
  'USER_REGISTER'
];

export default function InteractionsPage() {
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('Todos');

  async function loadData() {
    setLoading(true);
    const params = filterType !== 'Todos' ? { eventType: filterType, limit: 50 } : { limit: 50 };
    const [eventsRes, analyticsRes] = await Promise.all([
      api.getInteractions(params),
      api.getAnalytics()
    ]);

    if (eventsRes.success && eventsRes.data?.data) {
      setEvents(eventsRes.data.data);
    } else {
      // Fallback local con eventos demostrativos
      setEvents([
        {
          _id: 'local-1',
          eventType: 'SIMULATE_PAYMENT',
          userEmail: 'estudiante@uandresbello.edu',
          timestamp: new Date().toISOString(),
          metadata: { provider: 'Webpay Plus', status: 'AUTHORIZED', authCode: 'AUTH-748921' }
        },
        {
          _id: 'local-2',
          eventType: 'ADD_TO_CART',
          userEmail: 'estudiante@uandresbello.edu',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          metadata: { name: 'Workstation Dell Precision 5570', quantity: 1 }
        },
        {
          _id: 'local-3',
          eventType: 'VIEW_PRODUCT',
          userEmail: 'estudiante@uandresbello.edu',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          metadata: { product: 'Apple MacBook Pro 16 M3 Max' }
        }
      ]);
    }

    if (analyticsRes.success && analyticsRes.data) {
      setAnalytics(analyticsRes.data);
    } else {
      setAnalytics({
        totalInteractionsLogged: 24,
        byEventType: {
          VIEW_PRODUCT: 12,
          ADD_TO_CART: 5,
          SIMULATE_PAYMENT: 3,
          SEARCH_CATALOG: 4
        },
        mongoStatus: {
          engine: 'MongoDB Community / BSON Document Store',
          database: 'nexustech_events',
          collections: ['interactions', 'audit_logs']
        }
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [filterType]);

  const toneMap = {
    VIEW_PRODUCT: 'muted',
    ADD_TO_CART: 'cyan',
    SEARCH_CATALOG: 'muted',
    SIMULATE_PAYMENT: 'primary',
    CREATE_ORDER: 'success',
    USER_LOGIN: 'muted',
    USER_REGISTER: 'primary'
  };

  return (
    <div className="nt-interactions-page">
      <header className="nt-page-heading">
        <span className="nt-eyebrow">PERSISTENCIA NO RELACIONAL · MONGODB</span>
        <h1>
          Historial de Interacciones & Telemetría<span>.</span>
        </h1>
        <p>Registro BSON en tiempo real de eventos de usuarios, navegación, carritos y transacciones en MongoDB.</p>
      </header>

      {analytics && (
        <div className="nt-mongo-overview-grid">
          <Card title="Base de Datos MongoDB" description="nexustech_events · Colección 'interactions'">
            <div className="nt-mongo-stat-header">
              <span className="nt-mongo-icon">
                <Icon name="cpu" size={28} />
              </span>
              <div>
                <strong>{analytics.mongoStatus?.database || 'nexustech_events'}</strong>
                <p>Motor: {analytics.mongoStatus?.engine || 'MongoDB 7.0 Document Engine'}</p>
              </div>
            </div>
            <div className="nt-collections-tags">
              <Badge tone="cyan">Colección: interactions</Badge>
              <Badge tone="muted">Colección: audit_logs</Badge>
            </div>
          </Card>

          <Card title="Métricas de Actividad" description="Volumen de eventos capturados">
            <div className="nt-activity-counters">
              <div>
                <span className="nt-count-big">{analytics.totalInteractionsLogged || events.length}</span>
                <small>Total Eventos</small>
              </div>
              <div>
                <span className="nt-count-big">{analytics.byEventType?.SIMULATE_PAYMENT || 0}</span>
                <small>Pagos Webpay</small>
              </div>
              <div>
                <span className="nt-count-big">{analytics.byEventType?.ADD_TO_CART || 0}</span>
                <small>Carritos</small>
              </div>
              <div>
                <span className="nt-count-big">{analytics.byEventType?.VIEW_PRODUCT || 0}</span>
                <small>Vistas Catálogo</small>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card
        title="Registro de Documentos BSON"
        description="Filtra por tipo de evento para inspeccionar la carga útil y metadatos."
      >
        <div className="nt-filter-chips">
          {EVENT_TYPES.map((type) => (
            <button
              key={type}
              className={`nt-chip-btn ${filterType === type ? 'is-active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type}
            </button>
          ))}
          <Button variant="secondary" icon="refresh" onClick={loadData}>
            Actualizar
          </Button>
        </div>

        {loading ? (
          <div className="nt-loading-box">
            <div className="nt-spinner" />
            <p>Consultando base de datos MongoDB...</p>
          </div>
        ) : events.length === 0 ? (
          <p className="nt-muted">No se registraron interacciones para este filtro.</p>
        ) : (
          <div className="nt-events-table">
            {events.map((ev, idx) => (
              <div key={ev._id || idx} className="nt-event-row">
                <div className="nt-event-meta">
                  <Badge tone={toneMap[ev.eventType] || 'muted'}>
                    {ev.eventType}
                  </Badge>
                  <span className="nt-event-time">
                    {formatDate(ev.timestamp)}
                  </span>
                </div>
                <div className="nt-event-body">
                  <strong>{ev.userEmail || ev.userId || 'Usuario anónimo'}</strong>
                  {ev.productName && <span>Producto: {ev.productName}</span>}
                  {ev.orderCode && <span>Orden: {ev.orderCode}</span>}
                  {ev.metadata && (
                    <code className="nt-event-json">
                      {JSON.stringify(ev.metadata)}
                    </code>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
