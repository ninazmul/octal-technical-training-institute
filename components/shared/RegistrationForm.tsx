"use client";

import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter } from "next/navigation";
// import { createRegistration } from "@/lib/actions/registration.actions";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ICourseSafe } from "@/lib/database/models/course.model";
import { useUploadThing } from "@/lib/uploadthing";
import { FileUploader } from "@/components/shared/FileUploader";
import toast from "react-hot-toast";

// -------------------- Schema --------------------
const registrationFormSchema = z.object({
  englishName: z.string().min(1, "English name is required"),
  fathersName: z.string().min(1, "Father's name is required"),
  mothersName: z.string().min(1, "Mother's name is required"),
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Gender is required",
  }),
  email: z.string().email("Valid email is required"),
  number: z.string().min(1, "Phone number is required"),
  whatsApp: z.string().min(1, "WhatsApp number is required"),
  occupation: z.string().min(1, "Occupation is required"),
  institution: z.string().min(1, "Institution is required"),
  address: z.string().min(1, "Address is required"),
  photo: z.string().min(1, "Photo is required"),
  couponCode: z.string().optional(),
  paymentAmount: z.number(), // new field
});

type CouponPreview = {
  code: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
};

type RegistrationFormProps = {
  course: ICourseSafe;
  email: string;
};

export default function RegistrationForm({
  course,
  email,
}: RegistrationFormProps) {
  // const router = useRouter();
  const { startUpload } = useUploadThing("mediaUploader");
  const baseAmount = course.discountPrice ?? course.price;
  const [couponPreview, setCouponPreview] = useState<CouponPreview | null>(
    null,
  );
  const [couponLoading, setCouponLoading] = useState(false);

  const form = useForm<z.infer<typeof registrationFormSchema>>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      englishName: "",
      fathersName: "",
      mothersName: "",
      gender: "Male",
      email: email,
      number: "",
      whatsApp: "",
      occupation: "",
      institution: "",
      address: "",
      photo: "",
      couponCode: "",
      paymentAmount: baseAmount, // auto-fill
    },
  });

  async function applyCoupon() {
    const couponCode = form.getValues("couponCode")?.trim();

    if (!couponCode) {
      setCouponPreview(null);
      form.setValue("paymentAmount", baseAmount);
      toast.error("Enter a coupon code");
      return;
    }

    try {
      setCouponLoading(true);
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode,
          courseId: course._id,
        }),
      });

      const data = await res.json();
      if (!data.valid) {
        setCouponPreview(null);
        form.setValue("paymentAmount", baseAmount);
        toast.error(data.message || "Invalid coupon");
        return;
      }

      const preview: CouponPreview = {
        code: data.code,
        originalAmount: data.originalAmount,
        discountAmount: data.discountAmount,
        finalAmount: data.finalAmount,
      };

      setCouponPreview(preview);
      form.setValue("couponCode", preview.code);
      form.setValue("paymentAmount", preview.finalAmount);
      toast.success("Coupon applied");
    } catch (error) {
      console.error(error);
      toast.error("Unable to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof registrationFormSchema>) {
    try {
      // 1. Create pending registration
      const res = await fetch("/api/registration/create-pending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          courseId: course._id,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      if (!data.paymentRequired) {
        toast.success("Registration completed");
        window.location.href = "/registration";
        return;
      }

      // 2. Initiate payment
      const paymentRes = await fetch("/api/paystation/initiate-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId: data.registrationId,
        }),
      });

      const paymentData = await paymentRes.json();

      if (paymentData.status !== "success") {
        throw new Error(paymentData.message);
      }

      window.location.href = paymentData.payment_url;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  }

  // async function onSubmit(values: z.infer<typeof registrationFormSchema>) {
  //   try {
  //     const payload = {
  //       ...values,
  //       email,
  //       courseId: course._id.toString(),
  //       paymentAmount: course.discountPrice ?? course.price,
  //     };
  //     const registration = await createRegistration(payload);

  //     if (registration) {
  //       toast.success(
  //         `Registration successful! Your registration number is ${registration.registrationNumber}`,
  //       );
  //       form.reset();
  //       // router.push("/registrations");
  //     }
  //   } catch (error) {
  //     console.error("Registration failed", error);
  //     toast.error("Something went wrong.");
  //   }
  // }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <h2 className="text-2xl font-bold">Register for {course.title}</h2>

        <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
          <div className="flex justify-between text-sm">
            <span>Course fee</span>
            <span>৳{baseAmount.toLocaleString()}</span>
          </div>
          {couponPreview && (
            <div className="flex justify-between text-sm text-green-700">
              <span>Coupon ({couponPreview.code})</span>
              <span>-৳{couponPreview.discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <span>Payable amount</span>
            <span>
              ৳
              {(couponPreview?.finalAmount ?? baseAmount).toLocaleString()}
            </span>
          </div>
        </div>

        {/* English Name */}
        <FormField
          control={form.control}
          name="englishName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>English Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter English name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Father’s Name */}
        <FormField
          control={form.control}
          name="fathersName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Father&apos;s Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter father's name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mother’s Name */}
        <FormField
          control={form.control}
          name="mothersName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mother&apos;s Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter mother's name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gender */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full border rounded px-3 py-2"
                  defaultValue={field.value}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  {...field}
                  value={email} // fill from props
                  disabled // make field read-only
                  className="bg-gray-100 cursor-not-allowed"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Number */}
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* WhatsApp */}
        <FormField
          control={form.control}
          name="whatsApp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter WhatsApp number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Occupation */}
        <FormField
          control={form.control}
          name="occupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Occupation</FormLabel>
              <FormControl>
                <Input placeholder="Enter occupation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Institution */}
        <FormField
          control={form.control}
          name="institution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Institution</FormLabel>
              <FormControl>
                <Input placeholder="Enter institution" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Photo */}
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passport Size Photo</FormLabel>
              <FormControl>
                <FileUploader
                  imageUrl={field.value}
                  setFiles={() => {}}
                  onFieldChange={async (_blobUrl, files) => {
                    if (files?.length) {
                      const uploaded = await startUpload(files);
                      if (uploaded?.[0]) field.onChange(uploaded[0].url);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Coupon */}
        <FormField
          control={form.control}
          name="couponCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coupon Code</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder="Enter coupon code"
                    {...field}
                    onChange={(event) => {
                      field.onChange(event.target.value.toUpperCase());
                      setCouponPreview(null);
                      form.setValue("paymentAmount", baseAmount);
                    }}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  className="px-4 py-2 rounded-md bg-primary text-white font-semibold disabled:opacity-60"
                >
                  Apply
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors"
        >
          Register
        </button>
      </form>
    </Form>
  );
}
