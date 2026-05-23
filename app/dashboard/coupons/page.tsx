import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAdminRole, isAdmin } from "@/lib/actions/admin.actions";
import { getCoupons } from "@/lib/actions/coupon.actions";
import { getUserEmailById } from "@/lib/actions/user.actions";
import CouponTable from "../components/CouponTable";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const role = await getAdminRole(email);

  if (!adminStatus || role !== "Admin") {
    redirect("/dashboard");
  }

  const coupons = await getCoupons();

  return (
    <>
      <section className="py-2 md:py-5">
        <div className="wrapper flex flex-wrap justify-between items-center">
          <h3 className="text-3xl font-bold text-center sm:text-left">
            Coupons
          </h3>
        </div>
      </section>

      <div className="wrapper my-8">
        <CouponTable coupons={coupons} />
      </div>
    </>
  );
};

export default Page;
