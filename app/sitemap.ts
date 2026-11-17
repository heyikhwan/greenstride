import type { MetadataRoute } from "next";
export const dynamic = "force-static";

import { SITE_URL } from "@/lib/site";
import { DOCUMENTS } from "@/lib/event";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date("2026-11-17");
  return [
    { url: `${SITE_URL}/`, lastModified: updated, changeFrequency: "daily", priority: 1, images: [`${SITE_URL}/opengraph-image.jpg`] },
    ...DOCUMENTS.map((d) => ({ url: `${SITE_URL}${d.href}`, lastModified: updated, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
