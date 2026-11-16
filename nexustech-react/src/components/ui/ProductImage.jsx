import { useState } from 'react';
import { placeholder, representativeLiveImage } from '../../data/imageAssets.js';
export default function ProductImage({ src, alt, className = '', loading = 'lazy', decoding = 'async', ...props }) {
  const [failed, setFailed] = useState(null);
  // Primero imagen propia del vendedor; si falta, referencia local identificada.
  const candidate = src || representativeLiveImage(alt) || placeholder;
  return <img src={failed === candidate ? placeholder : candidate}
    alt={alt} className={className} loading={loading} decoding={decoding}
    onError={() => setFailed(candidate)} {...props} />;
}
