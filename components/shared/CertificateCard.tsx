import { SerializedRegistration } from "@/lib/actions/registration.actions";
import { ICourseSafe } from "@/lib/database/models/course.model";
import { User, BookOpen } from "lucide-react";

const CertificateCard = ({
  registration,
  course
}: {
  registration: SerializedRegistration;
  course: ICourseSafe | null;
}) => (
  <div className="bg-white shadow-xl rounded-2xl overflow-hidden mt-10">
    <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
      <h2 className="text-2xl font-bold">{registration.englishName}</h2>
      <p className="text-sm opacity-90">
        Certificate #: {registration.registrationNumber}
      </p>
    </div>
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
            <span
              className={
                registration.certificateStatus === "Certified"
                  ? "text-green-600 font-semibold"
                  : "text-red-600 font-semibold"
              }
            >
              {registration.certificateStatus}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

export default CertificateCard;
