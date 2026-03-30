import { CheckCircle, User, BookOpen } from "lucide-react";
import { SerializedRegistration } from "@/lib/actions/registration.actions";
import { ICourseSafe } from "@/lib/database/models/course.model";

type Props = {
  registration: SerializedRegistration;
  course: ICourseSafe | null;
};

export default function VerifyCertificateView({ registration, course }: Props) {
  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />

        <h1 className="text-4xl font-extrabold mb-4 text-primary">
          Certificate Verified
        </h1>

        <p className="text-gray-600">
          The certificate details below have been successfully verified.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
          <h2 className="text-2xl font-bold">{registration.englishName}</h2>
          <p className="text-sm opacity-90">
            Certificate #: {registration.registrationNumber}
          </p>
        </div>

        {/* Content */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800">
          {/* Personal Info */}
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

          {/* Course Info */}
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
                <strong>Certificate Status:</strong>{" "}
                <span className="text-green-600 font-semibold">
                  {registration.certificateStatus}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
