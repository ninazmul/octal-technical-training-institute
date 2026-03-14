import HomeClient from "@/components/shared/HomeClient";
import { getActiveProducts } from "@/lib/actions/product.actions";
import { getSetting } from "@/lib/actions/setting.actions";

export default async function Home() {
  const setting = await getSetting();
  const products = await getActiveProducts();

  return <HomeClient setting={setting} products={products} />;
}
