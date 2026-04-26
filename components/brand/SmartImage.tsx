"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { PhotoFallback } from "./PhotoFallback";

interface SmartImageProps extends Omit<ImageProps, "onError"> {
  readonly fallbackLabel?: string;
}

/**
 * next/image with a graceful fallback if the file is missing.
 *
 * Avoids the "broken image" treatment when CHCC photography hasn't
 * been dropped into /public/club-assets/ yet — a realistic Phase 1
 * concern, since I can't write binary photos from this session.
 */
export function SmartImage({ fallbackLabel, alt, ...rest }: SmartImageProps) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return <PhotoFallback label={fallbackLabel ?? alt} className="absolute inset-0 size-full" />;
  }
  return <Image alt={alt} onError={() => setErrored(true)} {...rest} />;
}
