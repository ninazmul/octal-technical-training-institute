export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";
import { ISetting } from "@/lib/database/models/setting.model";
import { getSetting } from "@/lib/actions/setting.actions";

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

function stripHtml(html?: string) {
  return html?.replace(/<[^>]+>/g, "") || "";
}

export async function generateMetadata(): Promise<Metadata> {
  const settings: ISetting | null = await getSetting();

  const siteName = settings?.name || "Online Store";
  const tagline = settings?.tagline || "";
  const cleanDescription =
    stripHtml(settings?.description) ||
    "Shop high-quality products online in Bangladesh with fast delivery and secure checkout.";

  return {
    title: {
      default: tagline
        ? `${siteName} – ${tagline}`
        : `${siteName} – Shop Online in Bangladesh`,
      template: `%s | ${siteName}`,
    },

    description: cleanDescription,

    metadataBase: new URL(
      "https://octal-technical-training-institute-one.vercel.app",
    ),

    alternates: {
      canonical: "/",
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },

    openGraph: {
      type: "website",
      locale: "en_BD",
      url: "https://octal-technical-training-institute-one.vercel.app",
      siteName,
      title: tagline
        ? `${siteName} – ${tagline}`
        : `${siteName} – Trusted Online Store in Bangladesh`,
      description: cleanDescription,
      images: [
        {
          url:
            settings?.logo ||
            "https://octal-technical-training-institute-one.vercel.app/assets/images/logo.png",
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: tagline
        ? `${siteName} – ${tagline}`
        : `${siteName} – Shop Online in Bangladesh`,
      description: cleanDescription,
      images: [
        settings?.logo ||
          "https://octal-technical-training-institute-one.vercel.app/assets/images/logo.png",
      ],
    },

    icons: {
      icon: settings?.favicon || "/assets/images/logo.png",
      apple: "/assets/images/logo.png",
    },

    category: "ecommerce",
  };
}

export async function generateStaticParams() {
  // optional for i18n or static params, else omit if unused
  return [];
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} ${dmSerif.variable} font-sans bg-white`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
