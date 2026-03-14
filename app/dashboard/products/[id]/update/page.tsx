// import ProductForm from "@/app/dashboard/components/ProductForm";
// import { getProductById } from "@/lib/actions/product.actions";
// import { redirect } from "next/navigation";

// type PageProps = {
//   params: Promise<{ id: string }>;
// };
// const UpdatePage = async ({ params }: PageProps) => {
//   const { id } = await params;

//   const product = await getProductById(id);
//   if (!product) redirect("/dashboard/products");

//   return (
//     <div className="max-w-5xl mx-auto px-4 py-8">
//       <h2 className="text-3xl font-bold mb-6">Update Product</h2>
//       <ProductForm
//         type="Update"
//         product={product}
//         productId={id}
//       />
//     </div>
//   );
// };

// export default UpdatePage;

import React from 'react'

export default function page() {
  return (
    <div>page</div>
  )
}
