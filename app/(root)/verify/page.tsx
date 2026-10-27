import { Metadata } from "next";
import VerifyClient from "@/components/shared/VerifyClient";
import { generateBreadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Verify Certificate | Octal Technical Training Institute",
  description:
    "Verify the authenticity of student certificates and credentials issued by Octal Technical Training Institute.",
  keywords: [
    "Verify Certificate",
    "Certificate Authentication",
    "Credential Verification",
    "Octal Certificate Verification",
    "NSDA Verification",
  ],
  alternates: {
    canonical: "https://octal.edu.bd/verify",
  },
  openGraph: {
    title: "Verify Certificate | Octal Technical Training Institute",
    description:
      "Verify the authenticity of student certificates and credentials issued by Octal Technical Training Institute.",
    url: "https://octal.edu.bd/verify",
    siteName: "Octal Technical Training Institute",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verify Certificate | Octal Technical Training Institute",
    description:
      "Verify the authenticity of student certificates and credentials issued by Octal Technical Training Institute.",
  },
};

export default function CertificateSearchPage() {
  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: "Home", url: "https://octal.edu.bd" },
      { name: "Verify Certificate", url: "https://octal.edu.bd/verify" },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <VerifyClient />
    </>
  );
}
