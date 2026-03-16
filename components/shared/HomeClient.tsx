"use client";

import { ISetting } from "@/lib/database/models/setting.model";
import Hero from "./Hero";
import LMSFeatures from "./LMSFeatures";
import Feedback from "./Feedback";
import FAQ from "./FAQ";
import OurMentors from "./OurMentors";
import { ICourse } from "@/lib/database/models/course.model";
import CoursesContent from "./CoursesContent";

export default function Home({
  setting,
  courses,
}: {
  setting: ISetting;
  courses?: ICourse[];
}) {
  return (
    <main>
      <Hero setting={setting} />
      <CoursesContent setting={setting} courses={courses} />
      <LMSFeatures setting={setting} />
      <OurMentors setting={setting} />
      <Feedback setting={setting} />
      <FAQ setting={setting} />
    </main>
  );
}
