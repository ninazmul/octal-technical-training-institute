"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createRegistration } from "@/lib/actions/registration.actions";
import toast from "react-hot-toast";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const trx_id = params.get("trx_id");

    if (status === "Successful" && trx_id) {
      const data = JSON.parse(localStorage.getItem("registrationData") || "{}");

      createRegistration({
        ...data,
        transactionId: trx_id,
        paymentStatus: "Paid",
        paymentMethod: "Mobile Payment", // or Card / Bank Transfer
      })
        .then((reg) => {
          toast.success(
            `Registration successful! Number: ${reg?.registrationNumber}`,
          );
          localStorage.removeItem("registrationData");
          router.push("/registrations");
        })
        .catch(() => toast.error("Registration save failed"));
    } else {
      toast.error("Payment failed or cancelled");
      router.push("/courses");
    }
  }, [router]);

  return <div className="text-center py-12">Processing payment...</div>;
}
