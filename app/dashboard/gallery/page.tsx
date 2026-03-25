import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { getAllPhoto } from "@/lib/actions/gallery.actions";
import GalleryForm from "../components/GalleryForm";
import GalleryTable from "../components/GalleryTable";

const Page = async () => {

  const photos = await getAllPhoto();

  return (
    <>
      <section className=" py-2 md:py-5">
        <Sheet>
          <div className="wrapper flex flex-wrap justify-between items-center">
            <h3 className="h3-bold text-center sm:text-left">All Photos</h3>
            <SheetTrigger>
              <Button size="lg" className="rounded-full">
                Add Photo
              </Button>
            </SheetTrigger>
          </div>

          <SheetContent className="bg-white">
            <SheetHeader>
              <SheetTitle>Add Photo to Gallery</SheetTitle>
              <SheetDescription>
                Use this form to upload a photo to the gallery. Ensure the image
                is high-quality and follows the system&apos;s guidelines for
                proper display and organization within the gallery.
              </SheetDescription>
            </SheetHeader>
            <div className="py-5">
              <GalleryForm type="Create" />
            </div>
          </SheetContent>
        </Sheet>
      </section>

      <div className="wrapper my-8">
        <GalleryTable photos={photos} />
      </div>
    </>
  );
};

export default Page;