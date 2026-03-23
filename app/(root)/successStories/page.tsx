import SuccessStoryContent from "@/components/shared/SuccessStoryContent";
import { getSetting } from "@/lib/actions/setting.actions";
import { getAllSuccessStories } from "@/lib/actions/success-stories.actions";

export default async function NoticePage() {
  const settings = await getSetting();
  const stories = await getAllSuccessStories();

  return <SuccessStoryContent settings={settings} stories={stories} />;
}
