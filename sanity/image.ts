import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

import { client } from "./client";

const builder = imageUrlBuilder(client);

export function urlForImage(source: unknown) {
  return builder.image(source as SanityImageSource);
}
