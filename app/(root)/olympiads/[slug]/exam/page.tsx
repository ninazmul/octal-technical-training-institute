import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOlympiadBySlugPublic } from "@/lib/actions/olympiad.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import OlympiadExamEngine from "@/components/shared/OlympiadExamEngine";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Live Examination Portal | Octal Technical Training Institute",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OlympiadExamPage({ params }: PageProps) {
  const { slug } = await params;
  const [olympiad, settings] = await Promise.all([
    getOlympiadBySlugPublic(slug),
    getSetting(),
  ]);

  if (!olympiad) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100/70 py-6 px-4 md:px-8">
      <OlympiadExamEngine
        olympiadSlug={slug}
        themeColor={settings?.theme || "#0055CE"}
      />
    </div>
  );
}
