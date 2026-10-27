import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://octal.edu.bd";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/api/",
          "/checkout/",
          "/maintenance/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
