import { Metadata } from "next";
import { Inter, DM_Serif_Display, Hind_Siliguri } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/lib/structured-data";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bengali",
});

export const metadata: Metadata = {
  title:
    "Octal Technical Training Institute | NSDA & BTEB Authorized Assessment Institute",
  description:
    "Octal Technical Training Institute is an NSDA & BTEB authorized assessment institute committed to providing high-quality technical education, skills development, and certification services.",
  keywords: [
    "Technical Training",
    "NSDA",
    "BTEB",
    "Skills Development",
    "Vocational Education",
    "Certification",
    "Octal Technical Training Institute",
  ],
  metadataBase: new URL("https://octal.edu.bd"),
  icons: {
    icon: "./favicon.ico",
    shortcut: "./favicon.ico",
    apple: "/assets/images/placeholder.png",
  },
  alternates: {
    canonical: "https://octal.edu.bd/",
  },
  openGraph: {
    title:
      "Octal Technical Training Institute | NSDA & BTEB Authorized Assessment Institute",
    description:
      "Octal Technical Training Institute empowers learners with accredited training programs and certifications under NSDA & BTEB authorization.",
    url: "https://octal.edu.bd/",
    siteName: "Octal Technical Training Institute",
    images: [
      {
        url: "https://octal.edu.bd/assets/images/placeholder.png",
        width: 1200,
        height: 630,
        alt: "Octal Technical Training Institute",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Octal Technical Training Institute | NSDA & BTEB Authorized Assessment Institute",
    description:
      "Discover accredited training and certification opportunities at Octal Technical Training Institute, authorized by NSDA & BTEB.",
    images: ["/assets/images/placeholder.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = generateOrganizationSchema({
    name: "Octal Technical Training Institute",
    url: "https://octal.edu.bd",
    logo: "https://octal.edu.bd/assets/images/placeholder.png",
    description:
      "NSDA & BTEB authorized assessment institute providing high-quality technical education, skills development, and certification services in Bangladesh.",
    email: "info@octal.edu.bd",
    socialLinks: [
      "https://www.facebook.com/octaltti",
    ],
  });

  const websiteSchema = generateWebSiteSchema({
    siteUrl: "https://octal.edu.bd",
    searchUrl: "https://octal.edu.bd/courses",
  });

  return (
    <ClerkProvider
      publishableKey={
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
        "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k"
      }
    >
      <html lang="bn">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationSchema),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(websiteSchema),
            }}
          />
        </head>
        <body
          className={`${inter.variable} ${dmSerif.variable} ${hindSiliguri.variable} font-sans`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
