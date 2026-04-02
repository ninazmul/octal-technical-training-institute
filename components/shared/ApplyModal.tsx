"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GraduationCap } from "lucide-react";
import ApplyForm from "@/app/dashboard/components/ApplyForm";
import { ICourseSafe } from "@/lib/database/models/course.model";

interface ApplyModalProps {
  courses?: ICourseSafe[];
}

const ApplyModal = ({ courses }: ApplyModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full w-4/5 md:w-1/2 lg:w-1/2 mx-auto lg:mx-0 text-white bg-primary font-semibold shadow-lg cursor-pointer transition-transform hover:scale-105">
          <GraduationCap size={22} />
          এনরোল করুন
        </Button>
      </DialogTrigger>

      <DialogContent
        className="
          w-full md:w-[95vw]
          max-w-[95vw]
          sm:max-w-3xl
          max-h-[90vh]
          overflow-y-auto
          overflow-x-hidden
          bg-white dark:bg-gray-800
          p-4 sm:p-6
          font-bengali
        "
      >
        <DialogHeader>
          <DialogTitle>কোর্স রেজিস্ট্রেশন</DialogTitle>
        </DialogHeader>

        <p className="mb-4 text-sm text-muted-foreground font-bengali">
          আপনার পছন্দের কোর্সে আবেদন করুন এবং সিট নিশ্চিত করুন। সীমিত সিট, তাই
          এখনই আবেদন করুন!
        </p>

        <ApplyForm
          type="Create"
          onSuccess={() => setOpen(false)}
          courses={courses}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ApplyModal;
