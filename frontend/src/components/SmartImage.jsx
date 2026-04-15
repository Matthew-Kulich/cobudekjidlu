import { useEffect, useState } from "react";

const PLACEHOLDER_IMAGE = "/images/recipe-placeholder.svg";

export function SmartImage({ src, alt, className, loading = "lazy" }) {
  const [imageSrc, setImageSrc] = useState(src || PLACEHOLDER_IMAGE);

  useEffect(() => {
    setImageSrc(src || PLACEHOLDER_IMAGE);
  }, [src]);

  return (
    <img
      className={className}
      src={imageSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setImageSrc(PLACEHOLDER_IMAGE)}
    />
  );
}
