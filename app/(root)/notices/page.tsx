import { Metadata } from "next";
import NoticeContent from "@/components/shared/NoticeContent";
import { getSetting } from "@/lib/actions/setting.actions";
import { generateBreadcrumbSchema } from "@/lib/structured-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Notices & Announcements | Octal Technical Training Institute",
  description:
    "Stay updated with the latest official notices, exam schedules, course announcements, and events from Octal Technical Training Institute.",
  keywords: [
    "Notices",
    "Announcements",
    "Exam Schedule",
    "Octal Technical Training Institute",
    "Course Updates",
  ],
  alternates: {
    canonical: "https://octal.edu.bd/notices",
  },
  openGraph: {
    title: "Notices & Announcements | Octal Technical Training Institute",
    description:
      "Stay updated with the latest notices, exam schedules, and events from Octal Technical Training Institute.",
    url: "https://octal.edu.bd/notices",
    siteName: "Octal Technical Training Institute",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Notices & Announcements | Octal Technical Training Institute",
    description:
      "Stay updated with latest notices and announcements from Octal Technical Training Institute.",
  },
};

export default async function NoticePage() {
  const settings = await getSetting();

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: "Home", url: "https://octal.edu.bd" },
      { name: "Notices", url: "https://octal.edu.bd/notices" },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <NoticeContent settings={settings} />
    </>
  );
}