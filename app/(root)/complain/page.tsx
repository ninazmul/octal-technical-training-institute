import { Metadata } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import ComplainContent from "@/components/shared/ComplainContent";

export const metadata: Metadata = {
  title: "Complain Us",
};

export default async function Page() {
  const settings = await getSetting();

  return <ComplainContent settings={settings} />;
}