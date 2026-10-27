import { Metadata } from "next";
import Loader from "@/components/shared/Loader";
import PoliciesContent from "@/components/shared/PoliciesContent";
import { getSetting } from "@/lib/actions/setting.actions";
import { ISettingSafe } from "@/lib/database/models/setting.model";
import { generateBreadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Policies & Terms | Octal Technical Training Institute",
  description:
    "Read the terms, privacy policy, and admission rules of Octal Technical Training Institute.",
  alternates: {
    canonical: "https://octal.edu.bd/policies",
  },
  openGraph: {
    title: "Policies & Terms | Octal Technical Training Institute",
    description:
      "Read the terms, privacy policy, and admission rules of Octal Technical Training Institute.",
    url: "https://octal.edu.bd/policies",
    siteName: "Octal Technical Training Institute",
    type: "website",
  },
};

export default async function PoliciesPage() {
  const settings: ISettingSafe | null = await getSetting();

  if (!settings) {
    return <Loader />;
  }

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: "Home", url: "https://octal.edu.bd" },
      { name: "Policies", url: "https://octal.edu.bd/policies" },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PoliciesContent settings={settings} />
    </>
  );
}
