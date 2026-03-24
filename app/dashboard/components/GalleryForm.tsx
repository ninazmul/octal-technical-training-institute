"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { addPhoto } from "@/lib/actions/gallery.actions";
import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { FileUploader } from "@/components/shared/FileUploader";

export const galleryFormSchema = z.object({
  title: z.string().min(3, "Name must be at least 3 characters."),
  image: z.string(),
});

const GalleryForm = ({ userId, type }: { userId: string; type: "Create" }) => {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);

  const { startUpload } = useUploadThing("mediaUploader");

  const form = useForm<z.infer<typeof galleryFormSchema>>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: {
      title: "",
      image: "",
    },
  });

  async function onSubmit(values: z.infer<typeof galleryFormSchema>) {
    let uploadedImageUrl = values.image;

    if (files.length > 0) {
      const uploadedImages = await startUpload(files);

      if (!uploadedImages) {
        return;
      }

      uploadedImageUrl = uploadedImages[0].url;
    }

    try {
      if (type === "Create" && userId) {
        const newPhoto = await addPhoto({
          Title: values.title,
          Image: uploadedImageUrl,
        });

        if (newPhoto) {
          form.reset({
            title: "",
            image: "",
          });
          router.push(`/dashboard/gallery`);
        }
      }
    } catch (error) {
      console.error("Photo uploading failed", error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        {/* Name Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input placeholder="Title" {...field} className="input-field" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Photo Field */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl className="h-72">
                <FileUploader
                  onFieldChange={field.onChange}
                  imageUrl={field.value}
                  setFiles={setFiles}
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
          {form.formState.isSubmitting ? "Uploading..." : "Add Photo"}
        </Button>
      </form>
    </Form>
  );
};

export default GalleryForm;