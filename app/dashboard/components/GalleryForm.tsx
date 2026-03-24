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
import { useUploadThing } from "@/lib/uploadthing";
import { addPhoto } from "@/lib/actions/gallery.actions";
import { FileUploader } from "@/components/shared/FileUploader";

export const galleryFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  image: z.string().optional(),
});

const GalleryForm = ({ userId, type }: { userId: string; type: "Create" }) => {
  const router = useRouter();
  const { startUpload } = useUploadThing("mediaUploader");

  const form = useForm<z.infer<typeof galleryFormSchema>>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: {
      title: "",
      image: "",
    },
  });

  async function onSubmit(values: z.infer<typeof galleryFormSchema>) {
    try {
      const uploadedImageUrl = values.image || "";

      // If user selected files, upload them
      if (
        uploadedImageUrl === "" &&
        values.image === "" &&
        form.getValues("image") === ""
      ) {
        // nothing yet, rely on FileUploader
      }

      if (uploadedImageUrl) {
        form.setValue("image", uploadedImageUrl);
      }

      if (type === "Create" && userId) {
        const newPhoto = await addPhoto({
          title: values.title,
          image: uploadedImageUrl,
        });

        if (newPhoto) {
          form.reset({ title: "", image: "" });
          router.push("/dashboard/gallery");
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
        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter photo title"
                  {...field}
                  className="input-field"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Field */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Photo</FormLabel>
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
