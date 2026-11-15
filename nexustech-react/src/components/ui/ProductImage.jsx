import { useState } from 'react';
import { placeholder } from '../../data/imageAssets.js';
export default function ProductImage({ src, alt, className = '', loading = 'lazy', decoding = 'async', ...props }) {
  const [failed, setFailed] = useState(null);
  return <img src={failed === src ? placeholder : src || placeholder} alt={alt} className={className} loading={loading} decoding={decoding} onError={() => setFailed(src)} {...props} />;
}
