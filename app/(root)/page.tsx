import HomeClient from "@/components/shared/HomeClient";
import { getCourses } from "@/lib/actions/course.actions";
import { getSetting } from "@/lib/actions/setting.actions";

export const revalidate = 60;

export default async function Home() {
  const setting = await getSetting();
  const courses = await getCourses({ tab: "all" }); // or "all"
  return <HomeClient setting={setting} courses={courses} />;
}
