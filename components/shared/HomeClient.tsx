"use client";

import { ISetting } from "@/lib/database/models/setting.model";
import Hero from "./Hero";
import Feature from "./Feature";
import HowToIdentify from "./HowToIdentify";
import RiskFreeOrder from "./RiskFreeOrder";
import Feedback from "./Feedback";
import FAQ from "./FAQ";

export default function Home({
  setting,
}: {
  setting: ISetting;
}) {
  return (
    <main>
      <Hero setting={setting} />
      <Feature setting={setting} />
      <HowToIdentify setting={setting} />
      <RiskFreeOrder setting={setting} />
      <Feedback setting={setting} />
      <FAQ setting={setting} />
    </main>
  );
}
