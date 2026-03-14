"use client";

import { ISetting } from "@/lib/database/models/setting.model";
import Hero from "./Hero";
import Feature from "./Feature";
import LMSFeatures from "./LMSFeatures";
import Feedback from "./Feedback";
import FAQ from "./FAQ";

export default function Home({ setting }: { setting: ISetting }) {
  return (
    <main>
      <Hero setting={setting} />
      <Feature setting={setting} />
      <LMSFeatures setting={setting} />
      <Feedback setting={setting} />
      <FAQ setting={setting} />
    </main>
  );
}
