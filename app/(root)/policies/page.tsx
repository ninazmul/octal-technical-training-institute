import Loader from "@/components/shared/Loader";
import PoliciesContent from "@/components/shared/PoliciesContent";
import { getSetting } from "@/lib/actions/setting.actions";
import { ISettingSafe } from "@/lib/database/models/setting.model";

export default async function PoliciesPage() {
  const settings: ISettingSafe | null = await getSetting();

  if (!settings) {
    return <Loader />;
  }

  return <PoliciesContent settings={settings} />;
}
