import { Metadata } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import ComplainContent from "@/components/shared/ComplainContent";
import { generateBreadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Grievance & Complaints | Octal Technical Training Institute",
  description:
    "Submit your complaint, feedback, or grievance directly to the administration of Octal Technical Training Institute for quick resolution.",
  alternates: {
    canonical: "https://octal.edu.bd/complain",
  },
  openGraph: {
    title: "Grievance & Complaints | Octal Technical Training Institute",
    description:
      "Submit your complaint, feedback, or grievance directly to Octal Technical Training Institute.",
    url: "https://octal.edu.bd/complain",
    siteName: "Octal Technical Training Institute",
    type: "website",
  },
};

export default async function Page() {
  const settings = await getSetting();

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: "Home", url: "https://octal.edu.bd" },
      { name: "Complaints & Grievances", url: "https://octal.edu.bd/complain" },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ComplainContent settings={settings} />
    </>
  );
}