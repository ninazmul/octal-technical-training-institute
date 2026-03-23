import SuccessStoryContent from "@/components/shared/SuccessStoryContent";
import { getSetting } from "@/lib/actions/setting.actions";
import { getAllSuccessStories } from "@/lib/actions/success-stories.actions";
import { getPlaylistVideos } from "@/lib/actions/youtube.actions";

export default async function NoticePage() {
  const settings = await getSetting();
  const stories = await getAllSuccessStories();

  const playlistId = process.env.YOUTUBE_PLAYLIST_ID || "";

  const videos = await getPlaylistVideos(playlistId);

  return <SuccessStoryContent settings={settings} stories={stories} videos={videos} />;
}
