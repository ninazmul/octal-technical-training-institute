import NoticeContent from "@/components/shared/NoticeContent";
import { getSetting } from "@/lib/actions/setting.actions";


export default async function NoticePage() {
  const settings = await getSetting();

  return <NoticeContent settings={settings} />;
}