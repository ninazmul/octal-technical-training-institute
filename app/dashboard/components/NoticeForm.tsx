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
import { useRouter } from "next/navigation";
import { createNotice, updateNotice } from "@/lib/actions/notice.actions";
import { INotice } from "@/lib/database/models/notice.model";
import { PdfUploader } from "@/components/shared/PdfUploader";
import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";

export const noticeFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  file: z.string().optional(),
});

const NoticeForm = ({
  type,
  noticeId,
  notices,
}: {
  type: "Create" | "Update";
  noticeId?: string;
  notices?: INotice;
}) => {
  const router = useRouter();
  const [file, setFile] = useState<File[]>([]);
  const { startUpload } = useUploadThing("mediaUploader");

  const form = useForm<z.infer<typeof noticeFormSchema>>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: {
      title: notices?.title || "",
      file: notices?.file || "",
    },
  });

  async function onSubmit(values: z.infer<typeof noticeFormSchema>) {
    let uploadedLinkUrl = values.file;

    if (file.length > 0) {
      const uploaded = await startUpload(file);
      if (uploaded && uploaded.length > 0) {
        uploadedLinkUrl = uploaded[0].url;
      }
    }

    try {
      const noticeData = {
        ...values,
        file: uploadedLinkUrl || "",
      };

      if (type === "Create") {
        const newNotice = await createNotice(noticeData);
        if (newNotice) {
          form.reset();
          router.push("/dashboard/notices");
        }
      } else if (type === "Update" && noticeId) {
        const updatedNotice = await updateNotice(noticeId, noticeData);
        if (updatedNotice) {
          router.push("/dashboard/notices");
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
        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Notice Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter notice title"
                  {...field}
                  className="input-field"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File Upload (kept intact) */}
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload Resource File</FormLabel>
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

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="button col-span-2 w-full"
        >
          {form.formState.isSubmitting
            ? "Submitting..."
            : type === "Create"
              ? "Create Notice"
              : "Update Notice"}
        </Button>
      </form>
    </Form>
  );
};

export default NoticeForm;
