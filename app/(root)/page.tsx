import HomeClient from "@/components/shared/HomeClient";
import { getActiveCourses } from "@/lib/actions/course.actions";
import { getSetting } from "@/lib/actions/setting.actions";

export const revalidate = 60;

export default async function Home() {
  const setting = await getSetting();
  const courses = await getActiveCourses();
  return <HomeClient setting={setting} courses={courses} />;
}
