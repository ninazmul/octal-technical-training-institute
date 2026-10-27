import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOlympiadByIdAdmin } from "@/lib/actions/olympiad.actions";
import { getQuestionsForOlympiadAdmin } from "@/lib/actions/olympiad-question.actions";
import { getOlympiadRegistrationsAdmin } from "@/lib/actions/olympiad-registration.actions";
import { getOlympiadAttemptsAdmin } from "@/lib/actions/olympiad-exam.actions";
import OlympiadHub from "@/app/dashboard/components/OlympiadHub";

export const metadata: Metadata = {
  title: "Olympiad Management Hub | OCTAL LMS Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OlympiadDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [olympiad, questions, registrationsData, attemptsData] =
    await Promise.all([
      getOlympiadByIdAdmin(id),
      getQuestionsForOlympiadAdmin(id),
      getOlympiadRegistrationsAdmin(id, { limit: 1000 }),
      getOlympiadAttemptsAdmin(id, { limit: 1000 }),
    ]);

  if (!olympiad) {
    notFound();
  }

  return (
    <div className="p-4 md:p-6">
      <OlympiadHub
        olympiad={olympiad}
        questions={questions || []}
        registrations={registrationsData?.registrations || []}
        attempts={attemptsData?.attempts || []}
      />
    </div>
  );
}
