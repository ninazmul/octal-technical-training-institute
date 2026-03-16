import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import { getAllCourses } from "@/lib/actions/course.actions";
import CourseTable from "../components/CourseTable";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);

  if (!adminStatus) {
    redirect("/dashboard");
  }

  const courses = (await getAllCourses()) || [];

  return (
    <>
      <section className=" py-2 md:py-5">
        <div className="wrapper flex flex-wrap justify-between items-center">
          <h3 className="text-3xl font-bold text-center sm:text-left">
            All Courses
          </h3>
          <a href="/dashboard/courses/create" className="w-full md:w-max">
            <Button size="lg" className="rounded-full w-full">
              Add Course
            </Button>
          </a>
        </div>
      </section>

      <div className="wrapper my-8">
        <CourseTable courses={courses} />
      </div>
    </>
  );
};

export default Page;
