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
import * as z from "zod";
import { createTrainer, updateTrainer } from "@/lib/actions/trainer.actions"; // <-- new action
import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { PdfUploader } from "@/components/shared/PdfUploader";
import toast from "react-hot-toast";
import { ITrainer } from "@/lib/database/models/trainer.model";

// Zod Schema for Trainer
export const TrainerFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(10, "Phone must be at least 10 characters."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  cv: z.string().optional(),
});

const TrainerForm = ({
  type,
  trainerId,
  trainers,
  onSuccess,
}: {
  type: "Create" | "Update";
  trainerId?: string;
  trainers?: ITrainer;
  onSuccess?: () => void;
}) => {
  const [file, setFile] = useState<File[]>([]);
  const { startUpload } = useUploadThing("mediaUploader");

  const form = useForm<z.infer<typeof TrainerFormSchema>>({
    resolver: zodResolver(TrainerFormSchema),
    defaultValues: {
      name: trainers?.name || "",
      email: trainers?.email || "",
      phone: trainers?.phone || "",
      address: trainers?.address || "",
      cv: trainers?.cv || "",
    },
  });

  async function onSubmit(values: z.infer<typeof TrainerFormSchema>) {
    let uploadedLinkUrl = values.cv;

    if (file.length > 0) {
      const uploaded = await startUpload(file);
      if (uploaded && uploaded.length > 0) {
        uploadedLinkUrl = uploaded[0].url;
      }
    }
    try {
      const trainerData = {
        ...values,
        cv: uploadedLinkUrl || "",
      };

      if (type === "Create") {
        const newTrainer = await createTrainer(trainerData);
        if (newTrainer) {
          form.reset();
          toast.success("Trainer form submitted!");
          onSuccess?.();
        }
      } else if (type === "Update" && trainerId) {
        const updatedTrainer = await updateTrainer(trainerId, trainerData);
        if (updatedTrainer) {
          toast.success("Trainer form submitted!");
          onSuccess?.();
        }
      }
    } catch (error) {
      console.error("Notice form failed", error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
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
              <FormControl>
                <Input placeholder="Phone" {...field} />
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
              <FormControl>
                <Input placeholder="Address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CV (optional) */}
        <FormField
          control={form.control}
          name="cv"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload CV/Resume</FormLabel>
              <FormControl className="h-72">
                <PdfUploader
                  onFieldChange={field.onChange}
                  fileUrl={field.value || ""}
                  setFiles={setFile}
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
          {form.formState.isSubmitting ? "Submitting..." : "Submit Form"}
        </Button>
      </form>
    </Form>
  );
};

export default TrainerForm;
