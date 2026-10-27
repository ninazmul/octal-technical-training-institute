import { Metadata } from "next";
import SuccessStoryContent from "@/components/shared/SuccessStoryContent";
import { getSetting } from "@/lib/actions/setting.actions";
import { getAllSuccessStories } from "@/lib/actions/success-stories.actions";
import { getPlaylistVideos } from "@/lib/actions/youtube.actions";
import { generateBreadcrumbSchema } from "@/lib/structured-data";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Success Stories | Octal Technical Training Institute",
  description:
    "Inspiring stories and testimonials from our graduates who built successful careers in technical and professional fields.",
  keywords: [
    "Success Stories",
    "Student Testimonials",
    "Career Success",
    "Octal Alumni",
    "Graduate Achievements",
  ],
  alternates: {
    canonical: "https://octal.edu.bd/successStories",
  },
  openGraph: {
    title: "Success Stories | Octal Technical Training Institute",
    description:
      "Inspiring stories and testimonials from our graduates who built successful careers.",
    url: "https://octal.edu.bd/successStories",
    siteName: "Octal Technical Training Institute",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Success Stories | Octal Technical Training Institute",
    description:
      "Inspiring stories and testimonials from graduates of Octal Technical Training Institute.",
  },
};

export default async function Page() {
  const settings = await getSetting();
  const stories = await getAllSuccessStories();

  const playlistId = process.env.YOUTUBE_PLAYLIST_ID || "";
  const videos = await getPlaylistVideos(playlistId);

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: "Home", url: "https://octal.edu.bd" },
      { name: "Success Stories", url: "https://octal.edu.bd/successStories" },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SuccessStoryContent settings={settings} stories={stories} videos={videos} />
    </>
  );
}
