"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import * as z from "zod";
import { useUploadThing } from "@/lib/uploadthing";
import toast from "react-hot-toast";
import { IComplain } from "@/lib/database/models/complain.model";
import { createComplain } from "@/lib/actions/complain.actions";
import { FileUploader } from "@/components/shared/FileUploader";

// Zod Schema
const ComplainFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  details: z.string().min(5, "Details must be at least 5 characters"),
  proof: z.string().optional(),
});

interface ComplainFormProps {
  type: "Create" | "Update";
  complain?: IComplain;
}

const ComplainForm = ({ type, complain }: ComplainFormProps) => {
  const { startUpload } = useUploadThing("mediaUploader");

  const form = useForm<z.infer<typeof ComplainFormSchema>>({
    resolver: zodResolver(ComplainFormSchema),
    defaultValues: {
      name: complain?.name || "",
      email: complain?.email || "",
      phone: complain?.phone || "",
      details: complain?.details || "",
      proof: complain?.proof || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof ComplainFormSchema>) => {
    try {
      const payload = { ...values };

      if (type === "Create") {
        const newComplain = await createComplain(payload);
        if (newComplain) {
          form.reset();
          toast.success(
            "Thank you for submitting your complain. We will review it soon.",
          );
        }
      }
      // TODO: handle Update logic if needed
    } catch (error) {
      console.error("Failed to submit complain form", error);
      toast.error("Submission failed");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        {/* Form Header */}
        <div className="text-center mb-6">
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ color: "#0055CE" }}
          >
            Complaint Form
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
            Please provide your details and describe your complaint below.
          </p>
        </div>

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="Name" {...field} />
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
              <FormLabel>Your Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Number</FormLabel>
              <FormControl>
                <Input placeholder="+880123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Details */}
        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Write Details</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your complaint in detail"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Proof Upload */}
        <FormField
          control={form.control}
          name="proof"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Upload Proof</FormLabel>
              <FormControl className="h-72">
                <FileUploader
                  imageUrl={field.value || ""}
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

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? "Submitting..." : "Submit Complain"}
        </Button>
      </form>
    </Form>
  );
};

export default ComplainForm;
