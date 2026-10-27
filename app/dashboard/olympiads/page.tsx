import { Metadata } from "next";
import { getOlympiadsAdmin } from "@/lib/actions/olympiad.actions";
import OlympiadTable from "@/app/dashboard/components/OlympiadTable";

export const metadata: Metadata = {
  title: "Olympiads Management | OCTAL LMS Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardOlympiadsPage() {
  const data = await getOlympiadsAdmin({ page: 1, limit: 50 });

  return (
    <div className="p-4 md:p-6">
      <OlympiadTable initialData={data} />
    </div>
  );
}
