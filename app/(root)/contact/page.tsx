import { Metadata } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import ContactContent from "@/components/shared/ContactContent";

export const metadata: Metadata = {
  title: "Contact Us",
};

export default async function ContactPage() {
  const settings = await getSetting();

  return <ContactContent settings={settings} />;
}