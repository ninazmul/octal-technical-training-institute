import { Metadata } from "next";
import { getParticipantDirectory } from "@/lib/actions/olympiad-participant.actions";
import ParticipantDirectoryTable from "@/app/dashboard/components/ParticipantDirectoryTable";

export const metadata: Metadata = {
  title: "Participant Directory | OCTAL LMS Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ParticipantDirectoryPage() {
  const data = await getParticipantDirectory({ page: 1, limit: 100 });

  return (
    <div className="p-4 md:p-6">
      <ParticipantDirectoryTable initialData={data} />
    </div>
  );
}
