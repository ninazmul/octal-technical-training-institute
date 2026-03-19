import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import { getAllNotices } from "@/lib/actions/notice.actions";
import NoticeTable from "../components/NoticeTable";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import NoticeForm from "../components/NoticeForm";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);

  if (!adminStatus) {
    redirect("/dashboard");
  }

  // ✅ fetch all Notices with normalization
  const notices = await getAllNotices();

  return (
    <>
      <section className="py-2 md:py-5">
        <Sheet>
          <div className="wrapper flex flex-wrap justify-between items-center">
            <h3 className="text-3xl font-bold text-center sm:text-left">
              Notice Management
            </h3>

            <SheetTrigger>
              <Button size="lg" className="rounded-full">
                Add Notice
              </Button>
            </SheetTrigger>
          </div>

          <SheetContent className="bg-white">
            <SheetHeader>
              <SheetTitle>Create a New Notice</SheetTitle>
              <SheetDescription>
                Fill out the form below to add a new notice. Upload a file if
                needed and provide a clear title so users can easily identify
                it.
              </SheetDescription>
            </SheetHeader>

            <div className="py-5">
              <NoticeForm type="Create" />
            </div>
          </SheetContent>
        </Sheet>
      </section>

      <div className="wrapper my-8">
        <NoticeTable notices={notices} />
      </div>
    </>
  );
};

export default Page;
