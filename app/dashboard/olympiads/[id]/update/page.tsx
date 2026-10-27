import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOlympiadByIdAdmin } from "@/lib/actions/olympiad.actions";
import OlympiadForm from "@/app/dashboard/components/OlympiadForm";

export const metadata: Metadata = {
  title: "Update Olympiad | OCTAL LMS Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function UpdateOlympiadPage({ params }: PageProps) {
  const { id } = await params;
  const olympiad = await getOlympiadByIdAdmin(id);

  if (!olympiad) {
    notFound();
  }

  return (
    <div className="p-4 md:p-6">
      <OlympiadForm type="Update" olympiad={olympiad} olympiadId={id} />
    </div>
  );
}
