import { Metadata } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import AboutContent from "@/components/shared/AboutContent";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About Us | Octal Technical Training Institute",
    description:
      "Learn more about our mission, mentors, and how we help students succeed.",
    keywords: [
      "About Octal Technical Training Institute",
      "Mission",
      "Mentors",
      "Student Success",
      "NSDA",
      "BTEB",
    ],
    alternates: {
      canonical: "https://octal.edu.bd/about",
    },
    openGraph: {
      title: "About Us | Octal Technical Training Institute",
      description:
        "Learn more about our mission, mentors, and how we help students succeed.",
      url: "https://octal.edu.bd/about",
      siteName: "Octal Technical Training Institute",
      images: [
        {
          url: "https://octal.edu.bd/assets/images/placeholder.png",
          width: 1200,
          height: 630,
          alt: "About Octal Technical Training Institute",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "About Us | Octal Technical Training Institute",
      description:
        "Learn more about our mission, mentors, and how we help students succeed.",
      images: "/assets/images/placeholder.png",
    },
  };
}

export default async function AboutPage() {
  const settings = await getSetting();

  return <AboutContent settings={settings} />;
}
