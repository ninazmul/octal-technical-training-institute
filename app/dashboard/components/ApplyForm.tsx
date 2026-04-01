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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import toast from "react-hot-toast";
import { IApply } from "@/lib/database/models/apply.model";
import { applyRegistration } from "@/lib/actions/apply.actions";
import { ICourseSafe } from "@/lib/database/models/course.model";

// Zod Schema
const ApplyFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  course: z.string().nonempty("Please select a course"),
});

interface ApplyFormProps {
  type: "Create" | "Update";
  apply?: IApply;
  courses?: ICourseSafe[];
  onSuccess?: () => void;
}

const ApplyForm = ({ type, apply, courses, onSuccess }: ApplyFormProps) => {
  const form = useForm<z.infer<typeof ApplyFormSchema>>({
    resolver: zodResolver(ApplyFormSchema),
    defaultValues: {
      name: apply?.name || "",
      email: apply?.email || "",
      phone: apply?.phone || "",
      course: apply?.course || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof ApplyFormSchema>) => {
    try {
      const payload = { ...values };

      if (type === "Create") {
        const newapply = await applyRegistration(payload);
        if (newapply) {
          form.reset();
          toast.success(
            "Thank you for submitting your apply. We will review it soon.",
          );
          onSuccess?.();
        }
      }
      // TODO: handle Update logic if needed
    } catch (error) {
      console.error("Failed to submit apply form", error);
      toast.error("Submission failed");
    }
  };

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

        {/* Course */}
        <FormField
          control={form.control}
          name="course"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Course</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>

                  <SelectContent>
                    {courses?.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          {form.formState.isSubmitting ? "Submitting..." : "Submit apply"}
        </Button>
      </form>
    </Form>
  );
};

export default ApplyForm;
