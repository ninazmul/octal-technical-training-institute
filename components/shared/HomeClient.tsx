"use client";

import { ISetting } from "@/lib/database/models/setting.model";
import Hero from "./Hero";
import Feature from "./Feature";
import HowToIdentify from "./HowToIdentify";
import RiskFreeOrder from "./RiskFreeOrder";
import Feedback from "./Feedback";
import Footer from "./Footer";
import FAQ from "./FAQ";
import Checkout from "./Checkout";
import { IProduct } from "@/lib/database/models/product.model";

export default function Home({
  setting,
  products,
}: {
  setting: ISetting;
  products: IProduct[] | undefined;
}) {
  return (
    <main>
      <Hero setting={setting} />
      <Feature setting={setting} />
      <HowToIdentify setting={setting} />
      <RiskFreeOrder setting={setting} />
      <Feedback setting={setting} />
      <FAQ setting={setting} />
      <div id="checkout">
        <Checkout setting={setting} products={products} />
      </div>
      <Footer setting={setting} />
    </main>
  );
}
