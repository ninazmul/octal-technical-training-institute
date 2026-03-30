import { getRegistrationByNumber } from "@/lib/actions/registration.actions";
import { getCourseById } from "@/lib/actions/course.actions";
import { getSetting } from "@/lib/actions";
import { CheckCircle, XCircle, User, BookOpen } from "lucide-react";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ id: string }>;
};

const VerifyPage = async ({ params }: PageProps) => {
  const { id } = await params; // registrationNumber from URL
  const registration = await getRegistrationByNumber(id);
  const settings = await getSetting();

  if (!registration) {
    return (
      <main className="max-w-3xl mx-auto py-20 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Registration Not Verified
        </h1>
        <p className="text-gray-600">
          No registration found for number <strong>{id}</strong>. Please check
          the number or contact support.
        </p>
      </main>
    );
  }

  const course = await getCourseById(registration.course._id);

  return (
    <main className="max-w-4xl mx-auto py-20 px-6">
      <div className="text-center mb-10">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1
          className="text-4xl font-extrabold mb-4"
          style={{ color: settings?.theme || "#0055CE" }}
        >
          Registration Verified
        </h1>
        <p className="text-gray-600">
          The registration details below have been successfully verified.
        </p>
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
          <h2 className="text-2xl font-bold">{registration.englishName}</h2>
          <p className="text-sm opacity-90">
            Registration #: {registration.registrationNumber}
          </p>
        </div>

        {/* Details */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800">
          <div>
            <User className="w-5 h-5 inline-block mr-2 text-primary" />
            <strong>Personal Info</strong>
            <ul className="mt-2 text-sm space-y-1">
              <li>
                <strong>Father’s Name:</strong> {registration.fathersName}
              </li>
              <li>
                <strong>Mother’s Name:</strong> {registration.mothersName}
              </li>
              <li>
                <strong>Gender:</strong> {registration.gender}
              </li>
              <li>
                <strong>Email:</strong> {registration.email}
              </li>
              <li>
                <strong>Phone:</strong> {registration.number}
              </li>
              {registration.whatsApp && (
                <li>
                  <strong>WhatsApp:</strong> {registration.whatsApp}
                </li>
              )}
              <li>
                <strong>Occupation:</strong> {registration.occupation}
              </li>
              <li>
                <strong>Institution:</strong> {registration.institution}
              </li>
              <li>
                <strong>Address:</strong> {registration.address}
              </li>
            </ul>
          </div>

          <div>
            <BookOpen className="w-5 h-5 inline-block mr-2 text-primary" />
            <strong>Course Info</strong>
            <ul className="mt-2 text-sm space-y-1">
              <li>
                <strong>Course:</strong> {course?.title || "N/A"}
              </li>
              <li>
                <strong>Category:</strong> {course?.category || "N/A"}
              </li>
              <li>
                <strong>Batch:</strong> {course?.batch || "N/A"}
              </li>
              <li>
                <strong>Mode:</strong> {course?.mode || "N/A"}
              </li>
              <li>
                <strong>Status:</strong> {registration.status}
              </li>
              <li>
                <strong>Certificate:</strong> {registration.certificateStatus}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default VerifyPage;
