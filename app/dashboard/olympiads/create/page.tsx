import { Metadata } from "next";
import OlympiadForm from "@/app/dashboard/components/OlympiadForm";

export const metadata: Metadata = {
  title: "Create Olympiad | OCTAL LMS Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CreateOlympiadPage() {
  return (
    <div className="p-4 md:p-6">
      <OlympiadForm type="Create" />
    </div>
  );
}
