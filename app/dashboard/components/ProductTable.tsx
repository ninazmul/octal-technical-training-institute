// "use client";
// import { useState, useMemo, useEffect } from "react";
// import Link from "next/link";
// import {
//   deleteProduct,
//   toggleProductStatus,
// } from "@/lib/actions/product.actions";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Trash, SortAsc, SortDesc, Edit2 } from "lucide-react";
// import toast from "react-hot-toast";
// import { IProduct } from "@/lib/database/models/product.model";
// import Image from "next/image";
// import { Switch } from "@/components/ui/switch";
// const ProductTable = ({ products }: { products: IProduct[] }) => {
//   const [productList, setProductList] = useState<IProduct[]>(products);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortKey, setSortKey] = useState<keyof IProduct | null>(null);
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchQuery]);
//   const filteredProducts = useMemo(() => {
//     const filtered = productList.filter((p) =>
//       p.title.toLowerCase().includes(searchQuery.toLowerCase()),
//     );
//     if (!sortKey) return filtered;
//     return [...filtered].sort((a, b) => {
//       const valueA = a[sortKey];
//       const valueB = b[sortKey];
//       if (typeof valueA === "number" && typeof valueB === "number") {
//         return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
//       }
//       const strA = String(valueA ?? "").toLowerCase();
//       const strB = String(valueB ?? "").toLowerCase();
//       if (strA < strB) return sortOrder === "asc" ? -1 : 1;
//       if (strA > strB) return sortOrder === "asc" ? 1 : -1;
//       return 0;
//     });
//   }, [productList, searchQuery, sortKey, sortOrder]);
//   const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
//   const paginatedProducts = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return filteredProducts.slice(start, start + itemsPerPage);
//   }, [filteredProducts, currentPage, itemsPerPage]);
//   const handleDeleteProduct = async (productId: string) => {
//     try {
//       await deleteProduct(productId);
//       toast.success("Product deleted successfully");
//       setProductList((prev) =>
//         prev.filter((p) => p._id.toString() !== productId),
//       );
//       if (paginatedProducts.length === 1 && currentPage > 1) {
//         setCurrentPage((prev) => prev - 1);
//       }
//     } catch (error) {
//       toast.error("Failed to delete product");
//       console.error(error);
//     } finally {
//       setConfirmDeleteId(null);
//     }
//   };
//   const handleSort = (key: keyof IProduct) => {
//     if (sortKey === key) {
//       setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
//     } else {
//       setSortKey(key);
//       setSortOrder("asc");
//     }
//   };
//   const handleToggleActive = async (productId: string) => {
//     try {
//       const updated = await toggleProductStatus(productId);
//       if (!updated) {
//         toast.error("Failed to update product status");
//         return;
//       }
//       toast.success(
//         `Product status updated to ${updated.isActive ? "Active" : "Inactive"}`,
//       );
//       setProductList((prev) =>
//         prev.map((p) =>
//           p._id.toString() === productId
//             ? { ...(p.toObject ? p.toObject() : p), isActive: updated.isActive }
//             : p,
//         ),
//       );
//     } catch {
//       toast.error("Failed to update product status");
//     }
//   };
//   return (
//     <div className="space-y-4">
//       {" "}
//       <Input
//         placeholder="Search by title"
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//         className="mb-4 w-full md:w-1/2 lg:w-1/3"
//       />{" "}
//       <Table className="border border-gray-200 rounded-md">
//         {" "}
//         <TableHeader>
//           {" "}
//           <TableRow>
//             {" "}
//             <TableHead>#</TableHead>{" "}
//             {["title", "price", "oldPrice", "stock", "isActive"].map((key) => (
//               <TableHead key={key}>
//                 {" "}
//                 <div
//                   onClick={() => handleSort(key as keyof IProduct)}
//                   className="flex items-center gap-2 cursor-pointer"
//                 >
//                   {" "}
//                   {key.charAt(0).toUpperCase() + key.slice(1)}{" "}
//                   {sortKey === key &&
//                     (sortOrder === "asc" ? (
//                       <SortAsc size={16} />
//                     ) : (
//                       <SortDesc size={16} />
//                     ))}{" "}
//                 </div>{" "}
//               </TableHead>
//             ))}{" "}
//             <TableHead>Actions</TableHead>{" "}
//           </TableRow>{" "}
//         </TableHeader>{" "}
//         <TableBody>
//           {" "}
//           {paginatedProducts.length === 0 ? (
//             <TableRow>
//               {" "}
//               <TableCell colSpan={7} className="text-center py-6">
//                 {" "}
//                 No products found.{" "}
//               </TableCell>{" "}
//             </TableRow>
//           ) : (
//             paginatedProducts.map((product, index) => (
//               <TableRow key={index} className="hover:bg-gray-100">
//                 {" "}
//                 <TableCell>
//                   {" "}
//                   {(currentPage - 1) * itemsPerPage + index + 1}{" "}
//                 </TableCell>{" "}
//                 <TableCell className="flex items-center gap-2 whitespace-nowrap">
//                   {" "}
//                   <Image
//                     src={product.mainImage || "/assets/images/placeholder.png"}
//                     alt={product.title}
//                     height={40}
//                     width={40}
//                     className="w-10 h-10 object-cover rounded"
//                   />{" "}
//                   <span className="line-clamp-1 truncate">
//                     {product.title}
//                   </span>{" "}
//                 </TableCell>{" "}
//                 <TableCell>৳{product.price.toLocaleString()}</TableCell>{" "}
//                 <TableCell>
//                   {" "}
//                   {product.oldPrice
//                     ? `৳${product.oldPrice.toLocaleString()}`
//                     : "-"}{" "}
//                 </TableCell>{" "}
//                 <TableCell>{product.stock}</TableCell>{" "}
//                 <TableCell>
//                   <Switch
//                     checked={product.isActive}
//                     onCheckedChange={() =>
//                       handleToggleActive(product._id.toString())
//                     }
//                   />
//                 </TableCell>
//                 <TableCell className="flex items-center space-x-2">
//                   {" "}
//                   <Link href={`/dashboard/products/${product._id}/update`}>
//                     {" "}
//                     <Button
//                       variant="outline"
//                       size="icon"
//                       className="text-blue-500"
//                     >
//                       {" "}
//                       <Edit2 size={16} />{" "}
//                     </Button>{" "}
//                   </Link>{" "}
//                   <Button
//                     onClick={() => setConfirmDeleteId(product._id.toString())}
//                     variant="outline"
//                     size="icon"
//                     className="text-red-500 border-red-500 hover:bg-red-50"
//                   >
//                     {" "}
//                     <Trash size={16} />{" "}
//                   </Button>{" "}
//                 </TableCell>{" "}
//               </TableRow>
//             ))
//           )}{" "}
//         </TableBody>{" "}
//       </Table>
//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="flex justify-between items-center mt-4">
//           <span className="text-sm text-muted-foreground">
//             Showing{" "}
//             {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{" "}
//             {filteredProducts.length} products
//           </span>

//           <div className="flex items-center space-x-2">
//             <Button
//               disabled={currentPage === 1}
//               onClick={() => setCurrentPage((prev) => prev - 1)}
//               size="sm"
//             >
//               Previous
//             </Button>

//             <span className="text-sm">
//               Page {currentPage} of {totalPages}
//             </span>

//             <Button
//               disabled={currentPage === totalPages}
//               onClick={() => setCurrentPage((prev) => prev + 1)}
//               size="sm"
//             >
//               Next
//             </Button>
//           </div>
//         </div>
//       )}
//       {/* Delete Confirmation */}
//       {confirmDeleteId && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
//           <div className="bg-white p-6 rounded-md space-y-4 max-w-sm w-full">
//             <p className="text-lg font-semibold">
//               Are you sure you want to delete this product?
//             </p>

//             <div className="flex justify-end space-x-2">
//               <Button
//                 onClick={() => setConfirmDeleteId(null)}
//                 variant="outline"
//               >
//                 Cancel
//               </Button>

//               <Button
//                 onClick={() => handleDeleteProduct(confirmDeleteId)}
//                 variant="destructive"
//               >
//                 Confirm
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProductTable;

import React from 'react'

export default function ProductTable() {
  return (
    <div>ProductTable</div>
  )
}
