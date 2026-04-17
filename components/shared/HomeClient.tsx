"use client";

import { ISettingSafe } from "@/lib/database/models/setting.model";
import Hero from "./Hero";
import LMSFeatures from "./LMSFeatures";
import Feedback from "./Feedback";
import FAQ from "./FAQ";
import OurMentors from "./OurMentors";
import { ICourseSafe } from "@/lib/database/models/course.model";
import CoursesContent from "./CoursesContent";
import Popup from "./Popup";
import OurPartners from "./OurPartners";
import { INotice } from "@/lib/database/models/notice.model";
import NoticeHeading from "./NoticeHeading";

export default function Home({
  setting,
  courses,
  notices,
}: {
  setting: ISettingSafe | null;
  courses?: ICourseSafe[];
  notices?: INotice[];
}) {
  return (
    <main>
      <Popup setting={setting} />
      <Hero setting={setting} courses={courses} />
      <NoticeHeading notices={notices} />
      <section id="courses">
        <CoursesContent setting={setting} courses={courses} />
      </section>
      <LMSFeatures setting={setting} />
      <OurMentors setting={setting} />
      <OurPartners setting={setting} />
      <Feedback setting={setting} />
      <FAQ setting={setting} />
    </main>
  );
}
