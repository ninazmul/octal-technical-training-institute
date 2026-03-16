"use client";

import { ISetting } from "@/lib/database/models/setting.model";
import Hero from "./Hero";
import LMSFeatures from "./LMSFeatures";
import Feedback from "./Feedback";
import FAQ from "./FAQ";
import OurMentors from "./OurMentors";

export default function Home({ setting }: { setting: ISetting }) {
  return (
    <main>
      <Hero setting={setting} />
      <LMSFeatures setting={setting} />
      <OurMentors setting={setting} />
      <Feedback setting={setting} />
      <FAQ setting={setting} />
    </main>
  );
}
