import { getRegistrationById } from "@/lib/actions/registration.actions";
import { getCourseById } from "@/lib/actions/course.actions";
import { getSetting } from "@/lib/actions";
import RegistrationDetailsClient from "@/app/dashboard/components/RegistrationDetailsClient";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ id: string }>;
};

const RegistrationPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const registration = await getRegistrationById(id);
  const settings = await getSetting();

  if (!registration) {
    return <div>Registration not found</div>;
  }

  const course = await getCourseById(registration.course._id);

  return (
    <main className="max-w-7xl mx-auto">
      <RegistrationDetailsClient
        registration={registration}
        course={course}
        settings={settings}
      />
    </main>
  );
};

export default RegistrationPage;
