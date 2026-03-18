// app/dashboard/registrations/page.tsx
"use server";

import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import {
  getRegistrations,
  SerializedRegistration,
} from "@/lib/actions/registration.actions";
import RegistrationTable, {
  RegistrationItem,
} from "../components/RegistrationTable";

function normalizeRegistration(r: SerializedRegistration): RegistrationItem {
  const mapStr = (v: string | null): string | undefined =>
    v == null ? undefined : v;
  const mapNum = (v: number | null): number | undefined =>
    v == null ? undefined : v;

  const course =
    r.course == null
      ? undefined
      : typeof r.course === "string"
        ? r.course
        : { _id: r.course._id };

  return {
    _id: r._id,
    englishName: mapStr(r.englishName),
    bengaliName: mapStr(r.bengaliName),
    fathersName: mapStr(r.fathersName),
    mothersName: mapStr(r.mothersName),
    gender: mapStr(r.gender),
    email: mapStr(r.email),
    number: mapStr(r.number),
    whatsApp: mapStr(r.whatsApp),
    occupation: mapStr(r.occupation),
    institution: mapStr(r.institution),
    address: mapStr(r.address),
    photo: mapStr(r.photo),
    course,
    registrationNumber: mapStr(r.registrationNumber),
    status: mapStr(r.status),
    certificateStatus: mapStr(r.certificateStatus),
    paymentAmount: mapNum(r.paymentAmount),
    paymentStatus: mapStr(r.paymentStatus),
    transactionId: mapStr(r.transactionId),
    paymentMethod: mapStr(r.paymentMethod),
    createdAt: r.createdAt ?? undefined,
    updatedAt: r.updatedAt ?? undefined,
  };
}

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);

  if (!adminStatus) {
    redirect("/dashboard");
  }

  const registrationsRaw: SerializedRegistration[] = await getRegistrations();

  const registrations: RegistrationItem[] = registrationsRaw.map(
    normalizeRegistration,
  );

  return (
    <>
      <section className="py-2 md:py-5">
        <div className="wrapper flex flex-wrap justify-between items-center">
          <h3 className="text-3xl font-bold text-center sm:text-left">
            All Registrations
          </h3>
        </div>
      </section>

      <div className="wrapper my-8">
        <RegistrationTable registrations={registrations} />
      </div>
    </>
  );
};

export default Page;
