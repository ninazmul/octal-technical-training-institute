"use client";

import { IProduct } from "@/lib/database/models/product.model";
import { ISetting } from "@/lib/database/models/setting.model";
import Image from "next/image";

interface ProductSelectorProps {
  setting: ISetting;
  products: IProduct[] | undefined;
  selectedItems: { product: IProduct; quantity: number }[];
  setSelectedItems: React.Dispatch<
    React.SetStateAction<{ product: IProduct; quantity: number }[]>
  >;
}

export default function ProductSelector({
  setting,
  products,
  selectedItems,
  setSelectedItems,
}: ProductSelectorProps) {
  const themeColor = setting.theme || "#000000";

  const updateQuantity = (product: IProduct, qty: number) => {
    if (qty <= 0) {
      // remove product if qty is 0
      setSelectedItems([]);
      return;
    }

    // always replace previous selection with the new one
    setSelectedItems([{ product, quantity: qty }]);
  };

  return (
    <div className="w-full border rounded-lg p-4 md:p-6 shadow-md">
      <h2 className="text-lg md:text-xl font-semibold mb-4">Select Product</h2>
      <div className="flex flex-col gap-4">
        {products?.map((product) => {
          const selected = selectedItems.find(
            (item) => item.product._id === product._id,
          );
          const qty = selected?.quantity || 0;

          return (
            <div
              key={product._id.toString()}
              className={`flex flex-col sm:flex-row sm:items-center gap-4 border p-3 rounded-md transition-colors`}
              style={{
                borderColor: qty > 0 ? themeColor : "#e5e7eb",
                backgroundColor: qty > 0 ? `${themeColor}15` : "transparent",
              }}
            >
              <Image
                src={product.mainImage || "/assets/images/logo.png"}
                alt={product.title}
                width={80}
                height={80}
                className="rounded-md object-cover mx-auto sm:mx-0"
              />
              <div className="flex-1 text-center sm:text-left">
                <p
                  className="font-semibold"
                  style={{ color: qty > 0 ? themeColor : "inherit" }}
                >
                  {product.title}
                </p>
                <p className="text-green-600 font-bold">
                  ৳ {product.price}
                  {product.oldPrice && (
                    <span className="text-gray-400 line-through ml-2">
                      ৳ {product.oldPrice}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center justify-center sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(product, qty - 1)}
                  className="px-2 py-1 border rounded-md"
                  style={{ borderColor: themeColor, color: themeColor }}
                >
                  -
                </button>
                <span className="px-3 font-semibold">{qty}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(product, qty + 1)}
                  className="px-2 py-1 border rounded-md"
                  style={{ borderColor: themeColor, color: themeColor }}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
