// "use client";

// import { useState, useMemo, useEffect } from "react";
// import { changeOrderStatus, deleteOrder } from "@/lib/actions/order.actions";
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
// import { Trash, SortAsc, SortDesc, ChevronDown, Pencil } from "lucide-react";
// import toast from "react-hot-toast";
// import Image from "next/image";
// import { IOrder } from "@/lib/database/models/order.model";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { UpdateOrderModal } from "@/components/shared/UpdateOrderModal";

// const STATUS_STYLES: Record<IOrder["status"], string> = {
//   pending: "bg-yellow-100 text-yellow-800",
//   confirmed: "bg-blue-100 text-blue-800",
//   shipped: "bg-purple-100 text-purple-800",
//   delivered: "bg-green-100 text-green-800",
//   cancelled: "bg-red-100 text-red-800",
// };

// const OrderTable = ({ orders: initialOrders }: { orders: IOrder[] }) => {
//   const [orders, setOrders] = useState<IOrder[]>(initialOrders);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortKey, setSortKey] = useState<keyof IOrder | null>(null);
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
//   const [editingOrder, setEditingOrder] = useState<IOrder | null>(null);

//   useEffect(() => setCurrentPage(1), [searchQuery]);

//   const filteredOrders = useMemo(() => {
//     const filtered = orders.filter(
//       (o) =>
//         o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         o.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         o.phone.includes(searchQuery),
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
//   }, [orders, searchQuery, sortKey, sortOrder]);

//   const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

//   const paginatedOrders = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return filteredOrders.slice(start, start + itemsPerPage);
//   }, [filteredOrders, currentPage, itemsPerPage]);

//   const handleDeleteOrder = async (orderId: string) => {
//     try {
//       await deleteOrder(orderId);
//       toast.success("Order deleted successfully");
//       if (paginatedOrders.length === 1 && currentPage > 1) {
//         setCurrentPage((prev) => prev - 1);
//       }
//     } catch (err) {
//       toast.error("Failed to delete order");
//       console.error(err);
//     } finally {
//       setConfirmDeleteId(null);
//     }
//   };

//   const handleSort = (key: keyof IOrder) => {
//     if (sortKey === key) {
//       setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
//     } else {
//       setSortKey(key);
//       setSortOrder("asc");
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <Input
//         placeholder="Search by customer, product, or phone"
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//         className="mb-4 w-full md:w-1/2 lg:w-1/3"
//       />

//       <Table className="border border-gray-200 rounded-md">
//         <TableHeader>
//           <TableRow className="whitespace-nowrap">
//             <TableHead>#</TableHead>
//             <TableHead>Product</TableHead>
//             <TableHead>
//               <div
//                 className="flex items-center gap-2 cursor-pointer"
//                 onClick={() => handleSort("unitPrice")}
//               >
//                 Unit Price{" "}
//                 {sortKey === "unitPrice" &&
//                   (sortOrder === "asc" ? (
//                     <SortAsc size={16} />
//                   ) : (
//                     <SortDesc size={16} />
//                   ))}
//               </div>
//             </TableHead>
//             <TableHead>
//               <div
//                 className="flex items-center gap-2 cursor-pointer"
//                 onClick={() => handleSort("quantity")}
//               >
//                 Quantity{" "}
//                 {sortKey === "quantity" &&
//                   (sortOrder === "asc" ? (
//                     <SortAsc size={16} />
//                   ) : (
//                     <SortDesc size={16} />
//                   ))}
//               </div>
//             </TableHead>
//             <TableHead>Total</TableHead>
//             <TableHead>Customer</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead>Actions</TableHead>
//           </TableRow>
//         </TableHeader>

//         <TableBody>
//           {paginatedOrders.length === 0 ? (
//             <TableRow>
//               <TableCell colSpan={10} className="text-center py-6">
//                 No orders found.
//               </TableCell>
//             </TableRow>
//           ) : (
//             paginatedOrders.map((order, index) => (
//               <TableRow
//                 key={order._id.toString()}
//                 className="hover:bg-gray-100"
//               >
//                 <TableCell className="text-center align-middle">
//                   {(currentPage - 1) * itemsPerPage + index + 1}
//                 </TableCell>

//                 {/* Product */}
//                 <TableCell className="flex items-center gap-2 align-middle whitespace-nowrap">
//                   <Image
//                     src={order.productImage || "/assets/images/placeholder.png"}
//                     alt={order.productTitle}
//                     height={40}
//                     width={40}
//                     className="object-cover rounded-md"
//                   />
//                   <span className="line-clamp-1 truncate max-w-52">
//                     {order.productTitle}
//                   </span>
//                 </TableCell>

//                 {/* Unit Price */}
//                 <TableCell className="align-middle">
//                   ৳{order.unitPrice.toLocaleString()}
//                 </TableCell>

//                 {/* Quantity */}
//                 <TableCell className="align-middle">{order.quantity}</TableCell>

//                 {/* Total */}
//                 <TableCell className="align-middle">
//                   ৳{order.totalPrice.toLocaleString()}
//                 </TableCell>

//                 {/* Customer */}
//                 <TableCell className="align-middle">
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <button className="flex items-center gap-2 text-left hover:underline whitespace-nowrap">
//                         {order.customerName} <ChevronDown size={14} />
//                       </button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent className="w-72 space-y-2 text-sm p-4">
//                       <div>
//                         <p className="text-muted-foreground">Name</p>
//                         <p className="font-medium">{order.customerName}</p>
//                       </div>
//                       <div>
//                         <p className="text-muted-foreground">Phone</p>
//                         <p className="font-medium">{order.phone}</p>
//                       </div>
//                       <div>
//                         <p className="text-muted-foreground">City</p>
//                         <p className="font-medium">{order.city}</p>
//                       </div>
//                       <div>
//                         <p className="text-muted-foreground">Address</p>
//                         <p className="font-medium break-words">
//                           {order.address}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-muted-foreground">Notes</p>
//                         <p className="font-medium break-words">
//                           {order.notes || "N/A"}
//                         </p>
//                       </div>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>

//                 {/* Status */}
//                 <TableCell className="align-middle">
//                   <select
//                     value={order.status}
//                     className={`px-3 py-1 rounded-full text-xs font-semibold border outline-none ${STATUS_STYLES[order.status]}`}
//                     onChange={async (e) => {
//                       const newStatus = e.target.value as IOrder["status"];
//                       try {
//                         const updated = await changeOrderStatus(
//                           order._id.toString(),
//                           newStatus,
//                         );
//                         toast.success(
//                           `Order status updated to ${updated?.status}`,
//                         );
//                         setOrders((prev) =>
//                           prev.map((o) =>
//                             o._id === order._id
//                               ? ((updated?.toObject
//                                   ? updated.toObject()
//                                   : updated) as IOrder)
//                               : o,
//                           ),
//                         );
//                       } catch {
//                         toast.error("Failed to update status");
//                       }
//                     }}
//                   >
//                     {Object.keys(STATUS_STYLES).map((status) => (
//                       <option key={status} value={status}>
//                         {status.charAt(0).toUpperCase() + status.slice(1)}
//                       </option>
//                     ))}
//                   </select>
//                 </TableCell>

//                 {/* Actions */}
//                 <TableCell className="align-middle">
//                   <div className="flex justify-center items-center gap-2 h-full">
//                     <Button
//                       onClick={() => setEditingOrder(order)}
//                       variant="outline"
//                       size="icon"
//                       className="text-blue-500 border-blue-500 hover:bg-blue-50"
//                     >
//                       <Pencil size={16} />
//                     </Button>

//                     <Button
//                       onClick={() => setConfirmDeleteId(order._id.toString())}
//                       variant="outline"
//                       size="icon"
//                       className="text-red-500 border-red-500 hover:bg-red-50"
//                     >
//                       <Trash size={16} />
//                     </Button>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ))
//           )}
//         </TableBody>
//       </Table>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="flex justify-between items-center mt-4">
//           <span className="text-sm text-muted-foreground">
//             Showing{" "}
//             {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{" "}
//             {filteredOrders.length} orders
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
//               Are you sure you want to delete this order?
//             </p>
//             <div className="flex justify-end space-x-2">
//               <Button
//                 onClick={() => setConfirmDeleteId(null)}
//                 variant="outline"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={() => handleDeleteOrder(confirmDeleteId)}
//                 variant="destructive"
//               >
//                 Confirm
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {editingOrder && (
//         <UpdateOrderModal
//           order={editingOrder}
//           onClose={() => setEditingOrder(null)}
//           onUpdate={(updated) => {
//             setOrders((prev) =>
//               prev.map((o) => (o._id === updated._id ? updated : o)),
//             );
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default OrderTable;

import React from 'react'

export default function OrderTable() {
  return (
    <div>OrderTable</div>
  )
}
