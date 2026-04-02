import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import { getAllApplies } from "@/lib/actions/apply.actions";
import ApplyTable from "../components/ApplyTable";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);

  if (!adminStatus) {
    redirect("/dashboard");
  }

  // ✅ fetch all applies with normalization
  const applies = await getAllApplies();

  return (
    <>
      <section className="py-2 md:py-5">
        <div className="wrapper flex flex-wrap justify-between items-center">
          <h3 className="text-3xl font-bold text-center sm:text-left">
            Registration Applications
          </h3>
        </div>
      </section>

      <div className="wrapper my-8">
        <ApplyTable applies={applies} />
      </div>
    </>
  );
};

export default Page;
