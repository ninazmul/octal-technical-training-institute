import { Metadata } from "next";
import GalleryContent from "@/components/shared/GalleryContent";
import { getAllPhoto } from "@/lib/actions/gallery.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { generateBreadcrumbSchema } from "@/lib/structured-data";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Photo Gallery | Octal Technical Training Institute",
  description:
    "Explore the campus life, training sessions, workshops, practical labs, and student achievements at Octal Technical Training Institute.",
  keywords: [
    "Octal Gallery",
    "Campus Photos",
    "Training Labs",
    "Technical Institute Gallery",
    "Student Activities",
  ],
  alternates: {
    canonical: "https://octal.edu.bd/gallery",
  },
  openGraph: {
    title: "Photo Gallery | Octal Technical Training Institute",
    description:
      "Explore campus life, training sessions, and student achievements at Octal Technical Training Institute.",
    url: "https://octal.edu.bd/gallery",
    siteName: "Octal Technical Training Institute",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Photo Gallery | Octal Technical Training Institute",
    description:
      "Explore campus life, training sessions, and student achievements at Octal Technical Training Institute.",
  },
};

export default async function Page() {
  const settings = await getSetting();
  const photos = await getAllPhoto();

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: "Home", url: "https://octal.edu.bd" },
      { name: "Gallery", url: "https://octal.edu.bd/gallery" },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <GalleryContent settings={settings} photos={photos} />
    </>
  );
}
