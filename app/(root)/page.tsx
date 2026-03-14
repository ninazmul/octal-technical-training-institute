import HomeClient from "@/components/shared/HomeClient";
import { getSetting } from "@/lib/actions/setting.actions";

export default async function Home() {
  const setting = await getSetting();

  return <HomeClient setting={setting} />;
}
