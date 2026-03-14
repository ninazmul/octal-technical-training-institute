"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { useUploadThing } from "@/lib/uploadthing";
import { FileUploader } from "@/components/shared/FileUploader";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { IProduct } from "@/lib/database/models/product.model";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const productFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  mainImage: z.string().min(1, "Product image is required"),
  price: z.coerce.number().min(0, "Price is required"),
  oldPrice: z.coerce.number().optional(),
  stock: z.coerce.number().min(0, "Stock is required"),
  isActive: z.boolean().default(true),
});

type ProductFormProps = {
  type: "Create" | "Update";
  product?: IProduct & { source?: string };
  productId?: string;
};

const ProductForm = ({ type, product, productId }: ProductFormProps) => {
  const router = useRouter();
  const { startUpload } = useUploadThing("imageUploader");

  const initialValues =
    product && type === "Update"
      ? {
          title: product.title,
          mainImage: product.mainImage,
          price: product.price,
          oldPrice: product.oldPrice,
          stock: product.stock,
          isActive: product.isActive,
        }
      : {
          title: "",
          mainImage: "",
          price: 0,
          oldPrice: undefined,
          stock: 0,
          isActive: true,
        };

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: z.infer<typeof productFormSchema>) {
    try {
      const payload = { ...values };

      if (type === "Create") {
        const newProduct = await createProduct(payload);
        if (newProduct) {
          form.reset();
          toast.success("Product created successfully!");
          router.push("/dashboard/products");
        }
      } else if (type === "Update" && productId) {
        const updatedProduct = await updateProduct(productId, payload);
        if (updatedProduct) {
          form.reset();
          toast.success("Product updated successfully!");
          router.push("/dashboard/products");
        }
      }
    } catch (error) {
      console.error("Product submission failed", error);
      toast.error("Something went wrong.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 rounded-lg border bg-white p-6 shadow-sm"
      >
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter product title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Upload */}
        <FormField
          control={form.control}
          name="mainImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Image</FormLabel>
              <FormControl>
                <FileUploader
                  imageUrl={field.value}
                  setFiles={() => {}}
                  onFieldChange={async (_blobUrl, files) => {
                    if (files && files.length > 0) {
                      const uploaded = await startUpload(files);
                      if (uploaded?.[0]) {
                        field.onChange(uploaded[0].url);
                      }
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Old Price */}
        <FormField
          control={form.control}
          name="oldPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Old Price</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Stock */}
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active Toggle */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Active</FormLabel>
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? "Submitting..." : `${type} Product`}
        </Button>
      </form>
    </Form>
  );
};

export default ProductForm;
