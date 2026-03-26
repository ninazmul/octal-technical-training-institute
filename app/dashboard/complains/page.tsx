import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import { getAllComplains } from "@/lib/actions/complain.actions";
import ComplainTable from "../components/ComplainTable";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);

  if (!adminStatus) {
    redirect("/dashboard");
  }

  // ✅ fetch all Complains with normalization
  const complains = await getAllComplains();

  return (
    <>
      <section className="py-2 md:py-5">
        <div className="wrapper flex flex-wrap justify-between items-center">
          <h3 className="text-3xl font-bold text-center sm:text-left">
            Complain Applications
          </h3>
        </div>
      </section>

      <div className="wrapper my-8">
        <ComplainTable complains={complains} />
      </div>
    </>
  );
};

export default Page;
