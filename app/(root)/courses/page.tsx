import { Metadata } from "next";
import { getCourses } from "@/lib/actions/course.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import CoursesClient from "@/components/shared/CoursesClient";
import { generateCourseListSchema, generateBreadcrumbSchema } from "@/lib/structured-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "কোর্স সমূহ | Octal Technical Training Institute",
  description:
    "NSDA ও BTEB অনুমোদিত কোর্সসমূহ ব্রাউজ করুন। ডিজাইন, ওয়েব ডেভেলপমেন্ট, প্রোগ্রামিং, নেটওয়ার্কিং সহ বিভিন্ন প্রযুক্তি বিষয়ক কোর্সে ভর্তি হোন।",
  keywords: [
    "Technical Courses",
    "NSDA Courses",
    "BTEB Courses",
    "Web Development",
    "Programming",
    "IT Training Bangladesh",
    "Octal Technical Training Institute",
    "কোর্স",
    "প্রশিক্ষণ",
  ],
  alternates: {
    canonical: "https://octal.edu.bd/courses",
  },
  openGraph: {
    title: "কোর্স সমূহ | Octal Technical Training Institute",
    description:
      "NSDA ও BTEB অনুমোদিত কোর্সসমূহ ব্রাউজ করুন। ডিজাইন, ওয়েব ডেভেলপমেন্ট, প্রোগ্রামিং, নেটওয়ার্কিং সহ বিভিন্ন প্রযুক্তি বিষয়ক কোর্সে ভর্তি হোন।",
    url: "https://octal.edu.bd/courses",
    siteName: "Octal Technical Training Institute",
    images: [
      {
        url: "https://octal.edu.bd/assets/images/placeholder.png",
        width: 1200,
        height: 630,
        alt: "Octal Technical Training Institute Courses",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "কোর্স সমূহ | Octal Technical Training Institute",
    description:
      "NSDA ও BTEB অনুমোদিত কোর্সসমূহ ব্রাউজ করুন।",
    images: "/assets/images/placeholder.png",
  },
};

export default async function CoursesPage() {
  const [courses, setting] = await Promise.all([
    getCourses({ status: "active" }),
    getSetting(),
  ]);

  const themeColor = setting?.theme || "#0055CE";

  // JSON-LD: Course list schema
  const courseListSchema = generateCourseListSchema({
    courses: courses.map((c) => ({
      name: c.title,
      description: c.description.replace(/<[^>]+>/g, "").slice(0, 160),
      url: `https://octal.edu.bd/courses/${c._id}`,
      image: c.photo,
      price: c.discountPrice || c.price || c.rplPrice,
    })),
  });

  // JSON-LD: Breadcrumb
  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: "Home", url: "https://octal.edu.bd" },
      { name: "Courses", url: "https://octal.edu.bd/courses" },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(courseListSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <CoursesClient
        initialCourses={courses}
        themeColor={themeColor}
      />
    </>
  );
}
