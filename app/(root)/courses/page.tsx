"use server";

import { getActiveCourses } from "@/lib/actions/course.actions";
import Image from "next/image";
import { getSetting } from "@/lib/actions";
import Link from "next/link";

export default async function CoursesPage() {
  const setting = await getSetting();
  const courses = await getActiveCourses();
  const themeColor = setting?.theme || "#0055CE";

  return (
    <main className="w-full py-12 md:py-20 px-6 md:px-12">
      <div className="text-center mb-12">
        <h1
          className="text-4xl md:text-5xl font-bold"
          style={{ color: themeColor }}
        >
          আমাদের সক্রিয় কোর্সসমূহ
        </h1>
        <p className="mt-4 text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
          বর্তমানে চালু থাকা কোর্সগুলোতে ভর্তি হয়ে আপনার দক্ষতা বৃদ্ধি করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {courses && courses.length > 0 ? (
          courses.map((course) => (
            <div
              key={course._id.toString()}
              className="border rounded-2xl overflow-hidden shadow-md flex flex-col bg-white hover:scale-[1.02] transition"
            >
              <div className="relative w-full h-48">
                <Image
                  src={course.photo || "/assets/images/placeholder.png"}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5 flex flex-col flex-1 text-left">
                {/* Title wrapped in Link */}
                <Link href={`/courses/${course._id}`} prefetch>
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900 line-clamp-2 hover:text-primary transition">
                    {course.title}
                  </h3>
                </Link>

                <div className="mt-auto flex justify-between items-center">
                  {course.discountPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-red-500 line-through text-sm">
                        টাকা {course.price}
                      </span>
                      <span className="font-bold text-lg text-primary">
                        টাকা {course.discountPrice}
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold text-lg text-primary">
                      টাকা {course.price}
                    </span>
                  )}

                  {course.isActive && (
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${themeColor}20`,
                        color: themeColor,
                      }}
                    >
                      সক্রিয়
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            বর্তমানে কোনো সক্রিয় কোর্স নেই।
          </p>
        )}
      </div>
    </main>
  );
}
