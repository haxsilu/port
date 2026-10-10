import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/content";

// One page, so one entry. It still matters: the sitemap is what points a
// crawler at the canonical origin rather than whatever host it first saw.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
