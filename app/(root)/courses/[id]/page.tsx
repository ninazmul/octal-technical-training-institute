import { Metadata } from "next";
import { getCourseById } from "@/lib/actions/course.actions";
import CourseDetailsClient from "@/components/shared/CourseDetailsClient";

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

  return <CourseDetailsClient course={course} />;
};

export default CoursePage;
