// import { IOrder } from "@/lib/database/models/order.model";
// import { ISetting } from "@/lib/database/models/setting.model";
// import Image from "next/image";

// type InvoiceTemplateProps = {
//   order: IOrder;
//   setting: ISetting | null;
// };

// export default function InvoiceTemplate({
//   order,
//   setting,
// }: InvoiceTemplateProps) {
//   const formatDate = (date: Date | string | undefined) =>
//     date ? new Date(date).toLocaleDateString() : "N/A";

//   return (
//     <div className="w-[210mm] min-h-[297mm] p-10 bg-white text-gray-800 font-sans">
//       {/* Header */}
//       <div className="flex justify-between items-center border-b pb-6">
//         {/* Shop Info */}
//         <div>
//           <h2 className="text-2xl font-bold">{setting?.name || "Shop"}</h2>
//           <p className="text-sm text-gray-600">{setting?.email}</p>
//           <p className="text-sm text-gray-600">{setting?.phoneNumber}</p>
//         </div>

//         {/* Invoice Info */}
//         <div className="text-right">
//           <h1 className="text-4xl font-extrabold text-orange-600">INVOICE</h1>
//           <p className="mt-2 text-sm">
//             <span className="font-semibold">Invoice ID:</span> #
//             {order._id.toString()}
//           </p>
//           <p className="text-sm">
//             <span className="font-semibold">Date:</span>{" "}
//             {formatDate(order.createdAt)}
//           </p>
//           <p className="text-sm">
//             <span className="font-semibold">Status:</span>{" "}
//             {order.status.toUpperCase()}
//           </p>
//         </div>
//       </div>

//       {/* Customer Info */}
//       <div className="mt-6 border rounded-lg p-4 bg-gray-50">
//         <h3 className="font-semibold text-lg mb-2">Bill To:</h3>
//         <p className="font-medium text-gray-700">{order.customerName}</p>
//         <p className="text-gray-600">{order.phone}</p>
//         <p className="text-gray-600">
//           {order.address}, {order.city}
//         </p>
//       </div>

//       {/* Product Info */}
//       <div className="mt-8 border rounded-lg p-4 bg-gray-50 flex gap-4 items-center">
//         <div className="w-24 flex-shrink-0">
//           <Image
//             src={order.productImage}
//             alt={order.productTitle}
//             width={96}
//             height={96}
//             className="object-contain rounded-md border bg-white p-1"
//             unoptimized
//           />
//         </div>
//         <div className="flex-1 text-sm space-y-1">
//           <p className="font-semibold text-base">{order.productTitle}</p>
//           <p>
//             <span className="font-medium">Unit Price:</span> ৳
//             {order.unitPrice.toFixed(2)}
//           </p>
//           <p>
//             <span className="font-medium">Quantity:</span> {order.quantity}
//           </p>
//           <p className="font-medium">
//             Total Price: ৳{order.totalPrice.toFixed(2)}
//           </p>
//         </div>
//       </div>

//       {/* Notes */}
//       {order.notes && (
//         <div className="mt-8">
//           <p className="font-semibold mb-1">Customer Notes:</p>
//           <p className="text-sm text-gray-700">{order.notes}</p>
//         </div>
//       )}

//       {/* Footer */}
//       <div className="mt-12 border-t pt-4 text-center text-xs text-gray-500 space-y-1">
//         <p>Thank you for your business!</p>
//         <p>
//           {setting?.name} • {setting?.email} • {setting?.phoneNumber}
//         </p>
//       </div>
//     </div>
//   );
// }

import React from 'react'

export default function InvoiceTemplate() {
  return (
    <div>InvoiceTemplate</div>
  )
}
