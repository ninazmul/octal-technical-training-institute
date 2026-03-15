import { Metadata } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import AboutContent from "@/components/shared/AboutContent";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about our mission, mentors, and how we help students succeed.",
};

export default async function AboutPage() {
  const settings = await getSetting();

  return <AboutContent settings={settings} />;
}