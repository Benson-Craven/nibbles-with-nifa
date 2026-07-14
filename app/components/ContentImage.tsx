import Image from "next/image";

import { normalizeMediaSource } from "@/lib/media";

type ContentImageProps = {
  alt?: string;
  children?: React.ReactNode;
  className?: string;
  priority?: boolean;
  sizes: string;
  src?: string;
};

export function ContentImage({
  alt,
  children,
  className,
  priority = false,
  sizes,
  src,
}: ContentImageProps) {
  const imageSource = normalizeMediaSource(src);
  const imageAlt = alt?.trim();
  const hasAuthoredImage = Boolean(imageSource && imageAlt);

  return (
    <div
      className={["content-image", className].filter(Boolean).join(" ")}
      data-media-state={hasAuthoredImage ? "authored" : "missing"}
    >
      {imageSource && imageAlt ? (
        <Image
          alt={imageAlt}
          fill
          priority={priority}
          sizes={sizes}
          src={imageSource}
        />
      ) : (
        <ContentImageFallback />
      )}
      {children}
    </div>
  );
}

export function ContentImageFallback() {
  return (
    <div aria-hidden="true" className="content-image__fallback">
      <i>N</i>
    </div>
  );
}
