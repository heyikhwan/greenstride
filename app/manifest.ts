import type { MetadataRoute } from "next";
export const dynamic = "force-static";

import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.shareDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#f3f7ec",
    theme_color: SITE.themeColor,
    lang: "id",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
