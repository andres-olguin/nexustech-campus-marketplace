import { useState } from 'react';
import { placeholder, localProductImage, representativeLiveImage } from '../../data/imageAssets.js';
export default function ProductImage({ src, alt, className = '', loading = 'lazy', decoding = 'async', ...props }) {
  const [failed, setFailed] = useState(null);
  // Primero imagen propia del vendedor; si falta, referencia local identificada.
  const cached = src?.startsWith('https://images.unsplash.com/') ? localProductImage(src) : null;
  const candidate = (cached && cached !== placeholder ? cached : null) || src || representativeLiveImage(alt);
  const fallback = representativeLiveImage(alt);
  return <img src={failed === candidate ? fallback : candidate}
    alt={alt} className={className} loading={loading} decoding={decoding}
    onError={() => setFailed(candidate)} {...props} />;
}
