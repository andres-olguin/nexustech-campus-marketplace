import { useState } from 'react';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Field from '../components/ui/Field.jsx';
import Icon from '../components/ui/Icon.jsx';
import useValidatedForm from '../hooks/useValidatedForm.js';
import { formatCLP, formatDate } from '../utils/format.js';

const steps = [
  'Pedido Confirmado (Webpay)',
  'En Preparación por Vendedor',
  'En Tránsito al Campus',
  'Entregado en Campus UNAB'
];

export default function TrackingPage({ orders, onAdvance, initialCode = '' }) {
  const [selectedCode, setSelectedCode] = useState(initialCode.toUpperCase());
  const form = useValidatedForm(
    { codigo: initialCode },
    (values) => (values.codigo.trim() ? {} : { codigo: 'Ingresa un código de seguimiento.' }),
    (values) => setSelectedCode(values.codigo.trim().toUpperCase())
  );

  const selected = orders.find((order) => order.codigo.toUpperCase() === selectedCode);

  function select(code) {
    form.setValue('codigo', code);
    setSelectedCode(code.toUpperCase());
  }

  return (
    <>
      <header className="nt-page-heading">
        <span className="nt-eyebrow">SIGUE TU PEDIDO</span>
        <h1>
          Rastreo y Estados del Pedido<span>.</span>
        </h1>
        <p>Ciclo de vida completo del pedido desde la autorización Webpay hasta el retiro en campus.</p>
      </header>

      <div className="nt-tracking-search">
        <form ref={form.ref} onSubmit={form.submit} noValidate>
          <Field
            label="Código de seguimiento"
            name="codigo"
            value={form.values.codigo}
            onChange={form.change}
            error={form.errors.codigo}
            placeholder="TRK-123456 o TRK-987654"
            required
            maxLength={30}
          />
          <Button type="submit" icon="search">
            Consultar pedido
          </Button>
        </form>
        {orders.length > 0 && (
          <Button variant="ghost" onClick={() => select(orders[0].codigo)}>
            Ver último pedido ({orders[0].codigo})
            <Icon name="arrow" size={16} />
          </Button>
        )}
      </div>

      {selected ? (
        <Card className="nt-tracking-card">
          <div className="nt-tracking-title">
            <div>
              <span className="nt-eyebrow">CÓDIGO DE SEGUIMIENTO</span>
              <h2>{selected.codigo}</h2>
            </div>
            <Badge tone={selected.paso === 3 ? 'success' : 'cyan'}>
              {steps[selected.paso]}
            </Badge>
          </div>

          <ol className="nt-timeline">
            {steps.map((step, index) => (
              <li
                key={step}
                className={index < selected.paso ? 'is-done' : index === selected.paso ? 'is-current' : ''}
                aria-current={index === selected.paso ? 'step' : undefined}
              >
                <span className="nt-step-circle">
                  {index < selected.paso ? (
                    <Icon name="check" size={20} />
                  ) : index === selected.paso ? (
                    <Icon name={index === 3 ? 'check' : 'truck'} size={20} />
                  ) : (
                    index + 1
                  )}
                </span>
                <strong>{step}</strong>
                <small>
                  {index < selected.paso
                    ? 'Completado'
                    : index === selected.paso
                    ? 'Estado actual'
                    : 'Pendiente'}
                </small>
              </li>
            ))}
          </ol>

          <dl className="nt-order-summary">
            <div>
              <dt>Origen</dt>
              <dd>{selected.origen || 'Campus Hub Santiago'}</dd>
            </div>
            <div>
              <dt>Destino / Entrega</dt>
              <dd>{selected.ciudad} ({selected.direccion})</dd>
            </div>
            <div>
              <dt>Fecha de Emisión</dt>
              <dd>{formatDate(selected.fecha)}</dd>
            </div>
            <div>
              <dt>Total Pagado</dt>
              <dd>{formatCLP(selected.total)}</dd>
            </div>
            {selected.metodo_pago && (
              <div>
                <dt>Método de Pago</dt>
                <dd>{selected.metodo_pago}</dd>
              </div>
            )}
            {selected.transaccion?.codigoAutorizacion && (
              <div>
                <dt>Cód. Autorización</dt>
                <dd className="nt-auth-code">{selected.transaccion.codigoAutorizacion}</dd>
              </div>
            )}
          </dl>

          <ul className="nt-order-items">
            {selected.items.map((item, index) => (
              <li key={item.id + '-' + index}>
                <span>
                  {item.cantidad} × {item.nombre} {item.acabado ? `(${item.acabado})` : ''}
                </span>
                <strong>{formatCLP(item.precio * item.cantidad)}</strong>
              </li>
            ))}
          </ul>

          <div className="nt-tracking-actions">
            <p>
              Simulación de flujo logístico universitario. Haz clic para avanzar el estado:
            </p>
            <Button
              variant="secondary"
              icon="truck"
              disabled={selected.paso === 3}
              onClick={() => onAdvance(selected.codigo)}
            >
              {selected.paso === 3 ? 'Pedido ya entregado' : 'Avanzar al siguiente estado logístico'}
            </Button>
          </div>
        </Card>
      ) : selectedCode ? (
        <EmptyState
          title="No encontramos ese pedido"
          description="Revisa el código o elige un pedido guardado en este navegador."
          icon="package"
        />
      ) : (
        <EmptyState
          title="Tu pedido, paso a paso"
          description="Ingresa un código o prueba una guía para ver el seguimiento del paquete."
          icon="truck"
        />
      )}

      {orders.length > 0 && (
        <section className="nt-recent-orders" aria-labelledby="pedidos-recientes">
          <h2 id="pedidos-recientes">Pedidos Registrados ({orders.length})</h2>
          <div>
            {orders.slice(0, 8).map((order) => (
              <button key={order.codigo} onClick={() => select(order.codigo)}>
                <Icon name="package" />
                <span>
                  <strong>{order.codigo}</strong>
                  <small>
                    {order.ciudad} · {steps[order.paso] || 'Pendiente'} · {formatCLP(order.total)}
                  </small>
                </span>
                <Icon name="chevron" size={17} />
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
