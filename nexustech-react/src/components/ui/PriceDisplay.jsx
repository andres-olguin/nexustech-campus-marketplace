import { formatCLP, formatUSD } from '../../utils/format.js';

export default function PriceDisplay({ amount, usdRate, className = '' }) {
  return <div className={'nt-price ' + className}>
    <div className="nt-price-main"><strong>{formatCLP(amount)}</strong><span>CLP</span></div>
    {usdRate > 0 && <span className="nt-price-usd">≈ {formatUSD(amount / usdRate)}</span>}
  </div>;
}
