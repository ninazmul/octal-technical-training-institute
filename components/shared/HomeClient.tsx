"use client";

import { ISettingSafe } from "@/lib/database/models/setting.model";
import Hero from "./Hero";
import LMSFeatures from "./LMSFeatures";
import Feedback from "./Feedback";
import FAQ from "./FAQ";
import OurMentors from "./OurMentors";
import { ICourseSafe } from "@/lib/database/models/course.model";
import CoursesContent from "./CoursesContent";

export default function Home({
  setting,
  courses,
}: {
  setting: ISettingSafe | null;
  courses?: ICourseSafe[];
}) {
  return (
    <main>
      <Hero setting={setting} />
      <section id="courses">
        <CoursesContent setting={setting} courses={courses} />
      </section>
      <LMSFeatures setting={setting} />
      <OurMentors setting={setting} />
      <Feedback setting={setting} />
      <FAQ setting={setting} />
    </main>
  );
}
