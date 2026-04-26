import type { MetadataRoute } from "next";
import { clubConfig } from "@/club.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: clubConfig.name,
    short_name: clubConfig.shortName,
    description: clubConfig.brand.tagline,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f1e7",
    theme_color: "#1a1f1c",
    categories: ["lifestyle", "sports", "social"],
    lang: "en-US",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
