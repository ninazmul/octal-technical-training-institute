import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getOlympiadBySlugPublic } from "@/lib/actions/olympiad.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import OlympiadRegistrationClient from "@/components/shared/OlympiadRegistrationClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const olympiad = await getOlympiadBySlugPublic(slug);

  if (!olympiad) {
    return { title: "Register for Olympiad | Octal LMS" };
  }

  return {
    title: `Register: ${olympiad.title} | Octal Technical Training Institute`,
    description: `Register online for ${olympiad.title}. Registration closes on ${new Date(olympiad.registrationDeadline).toLocaleDateString()}.`,
    alternates: {
      canonical: `https://octal.edu.bd/olympiads/${slug}/register`,
    },
  };
}

export default async function OlympiadRegisterPage({ params }: PageProps) {
  const { slug } = await params;
  const [olympiad, settings] = await Promise.all([
    getOlympiadBySlugPublic(slug),
    getSetting(),
  ]);

  if (!olympiad) {
    notFound();
  }

  // Verify registration window is open
  const lifecycle = olympiad.lifecycle;
  if (!lifecycle.canRegister) {
    redirect(`/olympiads/${slug}?message=registration-closed`);
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-6 md:px-12">
      <OlympiadRegistrationClient
        olympiad={olympiad}
        themeColor={settings?.theme || "#0055CE"}
      />
    </div>
  );
}
