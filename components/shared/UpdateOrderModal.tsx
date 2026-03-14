"use client";

import { IOrder } from "@/lib/database/models/order.model";
import { updateOrder } from "@/lib/actions/order.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import React from "react";

interface UpdateOrderModalProps {
  order: IOrder;
  onClose: () => void;
  onUpdate: (updated: IOrder) => void;
}

export const UpdateOrderModal = ({
  order,
  onClose,
  onUpdate,
}: UpdateOrderModalProps) => {
  // Initialize React Hook Form
  const form = useForm({
    defaultValues: {
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      city: order.city,
      notes: order.notes || "",
      quantity: order.quantity,
      totalPrice: order.totalPrice,
    },
  });

  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: {
    customerName: string;
    phone: string;
    address: string;
    city: string;
    notes: string;
    quantity: number;
    totalPrice: number;
  }) => {
    try {
      setLoading(true);
      const updated = await updateOrder(order._id.toString(), values);
      if (updated) {
        toast.success("Order updated successfully");
        onUpdate(updated);
        onClose();
      } else {
        toast.error("Failed to update order");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white p-6 rounded-md space-y-6 max-w-md w-full shadow-lg overflow-auto">
        <h3 className="text-lg font-semibold">Update Order</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Customer Name */}
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter customer name" />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter phone number" />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* City */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter city" />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter address" />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Additional notes (optional)"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      placeholder="Enter quantity"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Total Price */}
            <FormField
              control={form.control}
              name="totalPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Price</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      placeholder="Enter total price"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
