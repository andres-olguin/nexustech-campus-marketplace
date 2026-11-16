import { useEffect, useState } from "react";
import { placeholder, localProductImage } from "../../data/imageAssets.js";
import { fallbackArtworkForProduct } from "../../data/productVisualFallback.js";

/** Muestra la foto del producto; ante URL ausente o fallida, usa una
 * ilustración del tipo exacto, identificada explícitamente en la tarjeta. */
export default function ProductImage({
  src, alt, visualKey = "", onFallbackChange,
  className = "", loading = "lazy", decoding = "async", ...props
}) {
  const [failedSource, setFailedSource] = useState(null);
  const cached = src?.startsWith("https://images.unsplash.com/") ? localProductImage(src) : null;
  const candidate = (cached && cached !== placeholder ? cached : null) || src || null;
  const usingFallback = !candidate || failedSource === candidate;
  const artwork = fallbackArtworkForProduct(alt, visualKey);

  useEffect(() => {
    onFallbackChange?.(usingFallback);
  }, [onFallbackChange, usingFallback]);

  return (
    <img
      src={usingFallback ? artwork : candidate}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      onError={() => {
        // Evita ciclos infinitos si el respaldo también fallara.
        if (!usingFallback) setFailedSource(candidate);
      }}
      {...props}
    />
  );
}
