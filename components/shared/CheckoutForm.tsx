"use client";

import React, { useState } from "react";
import { IProduct } from "@/lib/database/models/product.model";
import { createOrder } from "@/lib/actions/order.actions";
import toast from "react-hot-toast";
import { ISetting } from "@/lib/database/models/setting.model";
import dynamic from "next/dynamic";
import Link from "next/link";
const DistrictSelect = dynamic(() => import("./DistrictSelect"), {
  ssr: false,
});

interface CheckoutFormProps {
  setting: ISetting;
  products: { product: IProduct; quantity: number }[];
  onReset?: () => void; // optional callback to reset products in parent
}

export default function CheckoutForm({
  setting,
  products,
  onReset,
}: CheckoutFormProps) {
  const themeColor = setting.theme || "#000000";

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");

  const deliveryCharge = setting.deliveryCharge || {
    insideDhaka: "120",
    outSideDhaka: "120",
    PickupPoint: "0",
  };

  const productTotal = products.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const isDhaka = city.toLowerCase() === "dhaka";
  // deliveryFee is null if city not selected
  const deliveryFee: number | null = city
    ? isDhaka
      ? Number(deliveryCharge.insideDhaka)
      : Number(deliveryCharge.outSideDhaka)
    : null;

  // grand total includes delivery fee only if it's selected
  const grandTotal = productTotal + (deliveryFee ?? 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (products.length === 0) return alert("Please select products first");

    for (const item of products) {
      await createOrder({
        productId: item.product._id.toString(),
        quantity: item.quantity,
        customerName,
        phone,
        address,
        city,
        notes,
        deliveryFee: deliveryFee ?? undefined, // pass it here
      });
    }

    toast.success("Order placed successfully!");

    // ✅ Reset form fields
    setCustomerName("");
    setPhone("");
    setAddress("");
    setCity("");
    setNotes("");

    // ✅ Reset products in parent if callback provided
    if (onReset) onReset();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full border rounded-lg p-4 md:p-6 shadow-md mt-6"
    >
      {/* Billing Details */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Billing Details</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Your Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="border rounded-md px-3 py-2 w-full"
            required
          />
          <input
            type="tel"
            placeholder="+8801XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border rounded-md px-3 py-2 w-full"
            required
          />
          <textarea
            placeholder="Area, Street, House/Road No., Thana, etc."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border rounded-md px-3 py-2 w-full"
            rows={3}
            required
          />
          <DistrictSelect city={city} setCity={setCity} />
          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border rounded-md px-3 py-2 w-full"
            rows={2}
          />
        </div>
      </section>
      {/* Order Summary */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {products.length > 0 ? (
          <div className="flex flex-col gap-3 border rounded-lg p-4 bg-gray-50">
            {products.map((item) => (
              <div
                key={item.product._id.toString()}
                className="flex items-center justify-between gap-2 text-sm md:text-base px-4 py-2 rounded-md border"
                style={{
                  backgroundColor: themeColor + "20",
                  borderColor: themeColor,
                }}
              >
                <span className="font-semibold">
                  {item.product.title} × {item.quantity}
                </span>
                <span className="font-semibold">=</span>
                <span className="font-bold">
                  ৳{item.product.price * item.quantity}
                </span>
              </div>
            ))}

            <hr className="my-2" />

            <p className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span>৳{productTotal}</span>
            </p>
            {/* Only show delivery row if city is selected */}
            {deliveryFee !== null && (
              <p className="flex justify-between font-medium">
                <span>Delivery Charge</span>
                <span>{deliveryFee === 0 ? "Free" : `৳ ${deliveryFee}`}</span>
              </p>
            )}

            <hr className="my-2" />

            <p className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>৳ {grandTotal}</span>
            </p>

            <div className="mt-3 text-sm text-gray-600">
              <p>
                💳 Payment Method:{" "}
                <span className="font-medium">Cash on Delivery</span>
              </p>
              <p>
                🔒 Your personal data (name, phone, address) will only be used
                to process and deliver your order. See our{" "}
                <Link
                  href="/policies"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Policies
                </Link>
                .
              </p>
            </div>
          </div>
        ) : (
          <p>No products selected</p>
        )}

        <button
          type="submit"
          disabled={
            products.length === 0 ||
            !customerName ||
            !phone ||
            !address ||
            !city
          }
          className={`mt-6 w-full rounded-md py-3 font-bold text-white transition-all duration-300
          ${
            products.length === 0 ||
            !customerName ||
            !phone ||
            !address ||
            !city
              ? "bg-gray-400 cursor-not-allowed"
              : "hover:shadow-lg hover:scale-[1.02]"
          }`}
          style={{
            backgroundColor:
              products.length === 0 ||
              !customerName ||
              !phone ||
              !address ||
              !city
                ? "#9CA3AF"
                : themeColor,
          }}
        >
          Confirm Order ৳ {grandTotal}{" "}
          {deliveryFee === 0 ? "(Free Delivery)" : ""}
        </button>
      </section>
    </form>
  );
}
