import HomeClient from "@/components/shared/HomeClient";
import { getCourses } from "@/lib/actions/course.actions";
import { getAllNotices } from "@/lib/actions/notice.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { generateFAQSchema } from "@/lib/structured-data";

export const revalidate = 60;

export default async function Home() {
  const setting = await getSetting();
  const courses = await getCourses({ status: "active" }); // or "all"
  const notices = await getAllNotices();

  const faqs = setting?.faqs?.items || [];
  const faqSchema = faqs.length > 0 ? generateFAQSchema({ items: faqs }) : null;

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <HomeClient setting={setting} courses={courses} notices={notices} />
    </>
  );
}
