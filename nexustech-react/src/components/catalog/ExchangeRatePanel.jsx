import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { isFreshDollarRate } from '../../services/publicApi.js';
import { formatDate, formatNumber } from '../../utils/format.js';

export default function ExchangeRatePanel({ exchange, showUSD, onCurrency }) {
  const { rate, loading, error, load } = exchange;
  const enableUSD = (refresh = false) => {
    onCurrency(true);
    load(refresh);
  };

  return <div className="nt-exchange" aria-label="Moneda del catálogo">
    <div className="nt-exchange-info">
      <span className="nt-exchange-icon"><Icon name="refresh" size={20} /></span>
      <div className="nt-exchange-copy">
        <strong>Moneda del catálogo</strong>
        {rate ? <p className="nt-rate-value">
          <strong>1 USD = {formatNumber(rate.value)} CLP</strong>
          <span> · {formatDate(rate.date)}</span>
          <a href="https://mindicador.cl" target="_blank" rel="noreferrer">Fuente</a>
        </p> : <p>Pesos chilenos · Referencia USD opcional</p>}
      </div>
    </div>
    <div className="nt-exchange-actions">
      <div className="nt-currency-options" role="group" aria-label="Referencia de precios">
        <Button variant="ghost" aria-pressed={!showUSD} onClick={() => onCurrency(false)}>CLP</Button>
        <Button variant="ghost" aria-pressed={showUSD} onClick={() => enableUSD()}>CLP + USD</Button>
      </div>
      <Button variant="secondary" icon={loading ? undefined : 'refresh'} className="nt-icon-button nt-rate-refresh"
        aria-label="Actualizar referencia USD" title="Actualizar referencia USD" disabled={loading} onClick={() => enableUSD(true)}>
        {loading && <span className="nt-spinner" aria-hidden="true" />}
      </Button>
    </div>
    {loading && <p className="nt-exchange-status" role="status">
      {rate ? 'Actualizando. Se mantiene la referencia anterior.' : 'Consultando referencia USD…'}
    </p>}
    {!loading && error && <p className="nt-exchange-status nt-exchange-warning" role="alert">
      {rate ? 'No se pudo actualizar. Se conserva la última referencia guardada.' : error}
    </p>}
    {!loading && !error && rate && showUSD && <p className="nt-exchange-status">
      {!isFreshDollarRate(rate) ? 'Última referencia guardada. ' : ''}Conversión aproximada; el pedido se calcula en CLP.
    </p>}
  </div>;
}
