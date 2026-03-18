import { getRegistrationById } from "@/lib/actions/registration.actions";
import RegistrationDetailsClient from "../../components/RegistrationDetailsClient";
import { getCourseById } from "@/lib/actions/course.actions";
import { getSetting } from "@/lib/actions";

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
    <RegistrationDetailsClient registration={registration} course={course} settings={settings} />
  );
};

export default RegistrationPage;
