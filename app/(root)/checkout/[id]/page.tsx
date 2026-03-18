import { getCourseById } from "@/lib/actions/course.actions";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import Checkout from "@/components/shared/Checkout";
import { redirect } from "next/navigation";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ id: string }>;
};

const CoursePage = async ({ params }: PageProps) => {
  const { id } = await params;
  const course = await getCourseById(id);

  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);

  if (!email) {
    redirect("/sign-in");
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return <Checkout course={course} email={email} />;
};

export default CoursePage;
