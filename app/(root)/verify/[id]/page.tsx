import { getRegistrationByNumber } from "@/lib/actions/registration.actions";
import { getCourseById } from "@/lib/actions/course.actions";
import { XCircle } from "lucide-react";
import VerifyCertificateView from "@/components/shared/VerifyCertificateView";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ id: string }>;
};

const VerifyPage = async ({ params }: PageProps) => {
  const { id } = await params; // certificate number from URL
  const registration = await getRegistrationByNumber(id);

  if (!registration || registration.certificateStatus === "Not Certified") {
    return (
      <main className="max-w-3xl mx-auto py-20 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Certificate Not Verified
        </h1>
        <p className="text-gray-600">
          No valid certificate found for number <strong>{id}</strong>. Please
          check the number or contact support.
        </p>
      </main>
    );
  }

  const course = await getCourseById(registration.course._id);

  return (
    <main className="">
      <VerifyCertificateView registration={registration} course={course} />
    </main>
  );
};

export default VerifyPage;
