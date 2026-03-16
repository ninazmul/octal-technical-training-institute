"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { FileUploader } from "@/components/shared/FileUploader";
import { createCourse, updateCourse } from "@/lib/actions/course.actions";
import { ICourse } from "@/lib/database/models/course.model";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const courseFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  photo: z.string().min(1, "Course photo is required"),
  description: z.string().min(1, "Description is required"),
  prerequisites: z.array(z.string()).optional(),
  modules: z
    .array(
      z.object({
        title: z.string().min(1, "Module title is required"),
        content: z.string().min(1, "Module content is required"),
        videoUrl: z.string().url().optional(),
      }),
    )
    .min(1, "At least one module is required"),
  price: z.coerce.number().min(0, "Price is required"),
  discountPrice: z.coerce.number().optional(),
  seats: z.coerce.number().min(0, "Seats are required"),
  isActive: z.boolean().default(true),
});

type CourseFormProps = {
  type: "Create" | "Update";
  course?: ICourse & { source?: string };
  courseId?: string;
};

const CourseForm = ({ type, course, courseId }: CourseFormProps) => {
  const router = useRouter();
  const { startUpload } = useUploadThing("imageUploader");

  const initialValues =
    course && type === "Update"
      ? {
          title: course.title,
          photo: course.photo,
          description: course.description,
          prerequisites: course.prerequisites || [],
          modules: course.modules,
          price: course.price,
          discountPrice: course.discountPrice,
          seats: course.seats,
          isActive: course.isActive,
        }
      : {
          title: "",
          photo: "",
          description: "",
          prerequisites: [""],
          modules: [{ title: "", content: "", videoUrl: "" }],
          price: 0,
          discountPrice: undefined,
          seats: 0,
          isActive: true,
        };

  const form = useForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: initialValues,
  });

  const modulesFieldArray = useFieldArray({
    control: form.control,
    name: "modules",
  });

  async function onSubmit(values: z.infer<typeof courseFormSchema>) {
    try {
      const payload = { ...values };

      if (type === "Create") {
        const newCourse = await createCourse(payload);
        if (newCourse) {
          form.reset();
          toast.success("Course created successfully!");
          router.push("/dashboard/courses");
        }
      } else if (type === "Update" && courseId) {
        const updatedCourse = await updateCourse(courseId, payload);
        if (updatedCourse) {
          form.reset();
          toast.success("Course updated successfully!");
          router.push("/dashboard/courses");
        }
      }
    } catch (error) {
      console.error("Course submission failed", error);
      toast.error("Something went wrong.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 rounded-lg border bg-white p-6 shadow-sm"
      >
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter course title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Photo Upload */}
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Photo</FormLabel>
              <FormControl>
                <FileUploader
                  imageUrl={field.value}
                  setFiles={() => {}}
                  onFieldChange={async (_blobUrl, files) => {
                    if (files && files.length > 0) {
                      const uploaded = await startUpload(files);
                      if (uploaded?.[0]) {
                        field.onChange(uploaded[0].url);
                      }
                    }
                  }}
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
                <Textarea placeholder="Enter course description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Prerequisites */}
        <FormField
          control={form.control}
          name="prerequisites"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prerequisites (comma separated)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter prerequisites"
                  value={field.value?.join(", ") || ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .split(",")
                        .map((p) => p.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Modules */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold">Modules</h3>
          {modulesFieldArray.fields.map((module, index) => (
            <div
              key={module.id}
              className="flex flex-col gap-2 rounded border p-4 shadow-sm"
            >
              <FormField
                control={form.control}
                name={`modules.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter module title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`modules.${index}.content`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter module content" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`modules.${index}.videoUrl`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter video URL (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => modulesFieldArray.remove(index)}
              >
                Remove Module
              </Button>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            onClick={() =>
              modulesFieldArray.append({ title: "", content: "", videoUrl: "" })
            }
          >
            Add Module
          </Button>
        </div>

        {/* Price */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Discount Price */}
        <FormField
          control={form.control}
          name="discountPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Price</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Seats */}
        <FormField
          control={form.control}
          name="seats"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seats</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active Toggle */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Active</FormLabel>
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              </FormControl>
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
          {form.formState.isSubmitting ? "Submitting..." : `${type} Course`}
        </Button>
      </form>
    </Form>
  );
};

export default CourseForm;
