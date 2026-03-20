"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invoice = params.get("invoice_number");

    if (!invoice) {
      toast.error("Invalid payment");
      router.push("/courses");
      return;
    }

    fetch("/api/paystation/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ invoice_number: invoice }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success("Payment successful!");
          router.push("/registrations");
        } else {
          toast.error("Payment verification failed");
          router.push("/courses");
        }
      });
  }, [router]);

  return <div className="text-center py-12">Verifying payment...</div>;
}
