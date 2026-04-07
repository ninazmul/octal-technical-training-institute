import { auth } from "@clerk/nextjs/server";
import {
  getRegistrationsByEmail,
  SerializedRegistration,
} from "@/lib/actions/registration.actions";
import { getCourseById } from "@/lib/actions/course.actions";
import Image from "next/image";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { ICourse } from "@/lib/database/models/course.model";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSetting } from "@/lib/actions";

function normalizeRegistration(r: SerializedRegistration) {
  const mapStr = (v: string | null) => (v == null ? undefined : v);
  const mapNum = (v: number | null) => (v == null ? undefined : v);

  return {
    _id: r._id,
    englishName: mapStr(r.englishName),
    photo: mapStr(r.photo),
    courseId: typeof r.course === "string" ? r.course : r.course?._id,
    status: mapStr(r.status),
    paymentStatus: mapStr(r.paymentStatus),
    paymentAmount: mapNum(r.paymentAmount),
    registrationNumber: mapStr(r.registrationNumber),
    createdAt: r.createdAt ?? undefined,
  };
}

const Page = async () => {
  const settings = await getSetting();
  const themeColor = settings?.theme || "#0055CE";

  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);

  if (!userId) {
    redirect("/sign-in");
  }

  if (!email) {
    redirect("/sign-in");
  }

  const registrationRaw = await getRegistrationsByEmail(email);

  if (!registrationRaw) {
    redirect("/courses?message=no-registration");
  }

  const registrations = registrationRaw.map((r) => normalizeRegistration(r));

  const coursesMap: Record<string, ICourse | null> = {};

  await Promise.all(
    registrations.map(async (r) => {
      if (r.courseId && !coursesMap[r.courseId]) {
        const course = (await getCourseById(r.courseId)) as ICourse | null;
        coursesMap[r.courseId] = course;
      }
    }),
  );

  return (
    <section className="w-full py-16 min-h-screen px-6 md:px-12 max-w-7xl mx-auto">
      <div className="wrapper">
        {/* Page Title */}
        <div className="text-center mb-12 md:mb-16">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: themeColor }}
          >
            Your Enrollment Overview
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto text-sm sm:text-base">
            Track your course enrollments, monitor payment status, and access
            your learning details all in one place.
          </p>
        </div>

        {registrations.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center border rounded-xl p-10 bg-gray-50">
            <p className="text-lg font-medium text-gray-700 mb-2">
              No courses registered yet
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Browse available courses and register to get started.
            </p>
            <Link
              href="/courses"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition"
            >
              Go to Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrations.map((r) => {
              const course = r.courseId ? coursesMap[r.courseId] : null;

              return (
                <div
                  key={r._id}
                  className="border rounded-xl shadow hover:shadow-md transition p-5 flex flex-col gap-3 bg-white"
                >
                  {(course?.photo || r.photo) && (
                    <div className="w-full h-48 relative">
                      <Image
                        src={course?.photo || r.photo!}
                        alt="course"
                        fill
                        className="object-cover rounded-xl"
                      />
                    </div>
                  )}

                  <h4 className="text-xl font-semibold text-gray-900">
                    {r.englishName}
                  </h4>

                  {/* ✅ Registration Number */}
                  <p className="text-sm text-gray-700">
                    <strong>Registration #:</strong>{" "}
                    {r.registrationNumber || "N/A"}
                  </p>

                  <p className="text-sm text-gray-700">
                    <strong>Course:</strong> {course?.title || "N/A"}
                  </p>

                  <p className="text-sm text-gray-700">
                    <strong>Status:</strong> {r.status}
                  </p>

                  <p className="text-sm text-gray-700">
                    <strong>Payment:</strong> {r.paymentStatus}
                    {r.paymentAmount ? ` (${r.paymentAmount} BDT)` : ""}
                  </p>

                  <Link
                    href={`/registration/${r._id}`}
                    className="mt-3 inline-block px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-700-600 transition text-center"
                  >
                    View Details
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Page;
