"use client";

import React, { useState } from "react";
import { IProduct } from "@/lib/database/models/product.model";
import ProductSelector from "./ProductSelector";
import CheckoutForm from "./CheckoutForm";
import { ISetting } from "@/lib/database/models/setting.model";
import { motion } from "framer-motion";

export default function CheckoutPage({
  setting,
  products,
}: {
  setting: ISetting;
  products: IProduct[] | undefined;
}) {
  const themeColor = setting.theme || "#000000";
  const [selectedProducts, setSelectedProducts] = useState<
    { product: IProduct; quantity: number }[]
  >([]);

  return (
    <main className="max-w-5xl mx-auto py-12 px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-8"
      >
        <div
          className="text-2xl md:text-3xl font-bold px-4 py-3 rounded-xl text-white shadow-md inline-block"
          style={{ backgroundColor: themeColor }}
        >
          Fill the form to place your order.
        </div>
      </motion.div>

      {/* Checkout Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{ borderColor: themeColor }}
        className="p-4 md:p-8 rounded-xl border shadow-lg bg-white"
      >
        {/* Product Selector */}
        <ProductSelector
          setting={setting}
          products={products}
          selectedItems={selectedProducts}
          setSelectedItems={setSelectedProducts}
        />

        {/* Checkout Form */}
        <CheckoutForm
          setting={setting}
          products={selectedProducts}
          onReset={() => setSelectedProducts([])}
        />
      </motion.div>
    </main>
  );
}
