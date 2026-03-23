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
import {
  createSuccessStories,
  updateSuccessStories,
} from "@/lib/actions/success-stories.actions";
import { ISuccessStories } from "@/lib/database/models/success-stories.model";
import { FileUploader } from "@/components/shared/FileUploader";
import { RichTextEditor } from "@/components/shared/RichTextEditor";

export const successStoriesFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().min(5, "Description must be at least 5 characters."),
  photo: z.string().optional(),
});

const SuccessStoriesForm = ({
  type,
  successStoriesId,
  successStories,
}: {
  type: "Create" | "Update";
  successStoriesId?: string;
  successStories?: ISuccessStories;
}) => {
  const router = useRouter();
  const { startUpload } = useUploadThing("mediaUploader");

  const form = useForm<z.infer<typeof successStoriesFormSchema>>({
    resolver: zodResolver(successStoriesFormSchema),
    defaultValues: {
      title: successStories?.title || "",
      description: successStories?.description || "",
      photo: successStories?.photo || "",
    },
  });

  async function onSubmit(values: z.infer<typeof successStoriesFormSchema>) {

    try {
      const payload = {
        title: values.title,
        description: values.description,
        photo: values.photo || "",
      };

      if (type === "Create") {
        const newStory = await createSuccessStories(payload);
        if (newStory) {
          form.reset({ title: "", description: "", photo: "" });
          router.push("/dashboard/success-stories");
        }
      } else if (type === "Update" && successStoriesId) {
        const updatedStory = await updateSuccessStories(
          successStoriesId,
          payload,
        );
        if (updatedStory) {
          router.push("/dashboard/success-stories");
        }
      }
    } catch (error) {
      console.error("Success Stories form failed", error);
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
                  placeholder="Enter title"
                  {...field}
                  className="input-field"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value || ""}
                  onChange={(val) => field.onChange(val)}
                />
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
              <FormLabel>Photo</FormLabel>
              <FormControl>
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
          {form.formState.isSubmitting
            ? "Submitting..."
            : type === "Create"
              ? "Create Story"
              : "Update Story"}
        </Button>
      </form>
    </Form>
  );
};

export default SuccessStoriesForm;
