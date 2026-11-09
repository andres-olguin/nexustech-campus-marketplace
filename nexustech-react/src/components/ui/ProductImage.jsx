import { useState } from 'react';
import { placeholder } from '../../data/imageAssets.js';
export default function ProductImage({ src, alt, className = '', ...props }) {
  const [failed, setFailed] = useState(null);
  return <img src={failed === src ? placeholder : src || placeholder} alt={alt} className={className} decoding="async" onError={() => setFailed(src)} {...props} />;
}
