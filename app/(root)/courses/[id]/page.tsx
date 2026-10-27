import { Metadata } from "next";
import { getCourseById } from "@/lib/actions/course.actions";
import CourseDetailsClient from "@/components/shared/CourseDetailsClient";
import {
  generateCourseSchema,
  generateBreadcrumbSchema,
} from "@/lib/structured-data";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    return {
      title: "Course Not Found | Octal Technical Training Institute",
      description: "The requested course could not be found.",
    };
  }

  return {
    title: `${course.title} | Octal Technical Training Institute`,
    description: course.description.replace(/<[^>]+>/g, "").slice(0, 160),
    keywords: [
      course.title,
      course.category,
      "Octal Technical Training Institute",
      "NSDA",
      "BTEB",
      "Technical Education",
      "Vocational Training",
      "Certification",
    ],
    alternates: {
      canonical: `https://octal.edu.bd/courses/${course._id}`,
    },
    openGraph: {
      title: `${course.title} | Octal Technical Training Institute`,
      description: course.description.replace(/<[^>]+>/g, "").slice(0, 200),
      url: `https://octal.edu.bd/courses/${course._id}`,
      siteName: "Octal Technical Training Institute",
      images: [
        {
          url:
            course.photo ||
            "https://octal.edu.bd/assets/images/placeholder.png",
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${course.title} | Octal Technical Training Institute`,
      description: course.description.replace(/<[^>]+>/g, "").slice(0, 200),
      images: [course.photo || "/assets/images/placeholder.png"],
    },
  };
}

const CoursePage = async ({ params }: PageProps) => {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    return <div>Course not found</div>;
  }

  const courseSchema = generateCourseSchema({
    name: course.title,
    description: course.description.replace(/<[^>]+>/g, "").slice(0, 300),
    provider: "Octal Technical Training Institute",
    url: `https://octal.edu.bd/courses/${course._id}`,
    image: course.photo,
    price: course.discountPrice || course.price || course.rplPrice,
    priceCurrency: "BDT",
    mode: course.mode,
    startDate: course.courseStartDate,
    duration: course.duration,
    category: course.category,
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: "Home", url: "https://octal.edu.bd" },
      { name: "Courses", url: "https://octal.edu.bd/courses" },
      {
        name: course.title,
        url: `https://octal.edu.bd/courses/${course._id}`,
      },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(courseSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <CourseDetailsClient course={course} />
    </>
  );
};

export default CoursePage;
