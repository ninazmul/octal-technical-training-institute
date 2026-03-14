// import OrderTable from "../components/OrderTable";
// import { getAllOrders } from "@/lib/actions/order.actions";

// const Page = async () => {
//   const orders = await getAllOrders();
//   const plainOrders = orders?.map((order) =>
//     order.toObject ? order.toObject() : order,
//   );
//   return (
//     <>
//       <section className=" py-2 md:py-5">
//         <div className="wrapper flex flex-wrap justify-between items-center">
//           <h3 className="text-3xl font-bold text-center sm:text-left">
//             All Orders
//           </h3>
//         </div>
//       </section>

//       <div className="wrapper my-8">
//         <OrderTable orders={plainOrders || []} />
//       </div>
//     </>
//   );
// };

// export default Page;

import React from 'react'

export default function page() {
  return (
    <div>page</div>
  )
}
