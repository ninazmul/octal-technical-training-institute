import { Metadata } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import ContactContent from "@/components/shared/ContactContent";
import { generateBreadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Contact Us | Octal Technical Training Institute",
  description:
    "Get in touch with Octal Technical Training Institute for admissions, course queries, certification, and technical training consultations.",
  keywords: [
    "Contact Octal",
    "Technical Training Admissions",
    "Office Address",
    "Octal Phone Number",
    "Octal Location",
  ],
  alternates: {
    canonical: "https://octal.edu.bd/contact",
  },
  openGraph: {
    title: "Contact Us | Octal Technical Training Institute",
    description:
      "Get in touch with Octal Technical Training Institute for admissions and queries.",
    url: "https://octal.edu.bd/contact",
    siteName: "Octal Technical Training Institute",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Octal Technical Training Institute",
    description:
      "Get in touch with Octal Technical Training Institute for admissions and course consultations.",
  },
};

export default async function ContactPage() {
  const settings = await getSetting();

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: "Home", url: "https://octal.edu.bd" },
      { name: "Contact", url: "https://octal.edu.bd/contact" },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ContactContent settings={settings} />
    </>
  );
}