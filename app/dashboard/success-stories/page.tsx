import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getAllSuccessStories } from "@/lib/actions/success-stories.actions";
import SuccessStoriesForm from "../components/SuccessStoriesForm";
import SuccessStoriesTable from "../components/SuccessStoriesTable";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);

  if (!adminStatus) {
    redirect("/dashboard");
  }

  const successStories = await getAllSuccessStories();

  return (
    <>
      <section className="py-2 md:py-5">
        <Sheet>
          <div className="wrapper flex flex-wrap justify-between items-center">
            <h3 className="text-3xl font-bold text-center sm:text-left">
              Success Stories
            </h3>

            <SheetTrigger>
              <Button size="lg" className="rounded-full">
                Add New Story
              </Button>
            </SheetTrigger>
          </div>

          <SheetContent className="bg-white">
            <SheetHeader>
              <SheetTitle>Submit a New Story</SheetTitle>
              <SheetDescription>
                Complete the form below to share a success story. Include a
                clear title and any relevant file uploads to make it easy for
                users to understand and engage with your story.
              </SheetDescription>
            </SheetHeader>

            <div className="py-5">
              <SuccessStoriesForm type="Create" />
            </div>
          </SheetContent>
        </Sheet>
      </section>

      <div className="wrapper my-8">
        <SuccessStoriesTable successStories={successStories} />
      </div>
    </>
  );
};

export default Page;
