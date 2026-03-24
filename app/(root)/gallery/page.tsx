import GalleryContent from "@/components/shared/GalleryContent";
import { getAllPhoto } from "@/lib/actions/gallery.actions";
import { getSetting } from "@/lib/actions/setting.actions";

export default async function Page() {
  const settings = await getSetting();
  const photos = await getAllPhoto();

  return <GalleryContent settings={settings} photos={photos} />;
}
