"use client";

import { useEffect, useState } from "react";
// import { Card } from "@/components/ui/card";
import Loader from "@/components/shared/Loader";
import { ISetting } from "@/lib/database/models/setting.model";
import { getAllAdmins, getSetting } from "@/lib/actions"; // ✅ single import
// import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

// import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  // const [adminsCount, setAdminsCount] = useState(0);
  const [setting, setSetting] = useState<ISetting | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          // admins,
          siteSetting,
        ] = await Promise.all([
          getAllAdmins(),
          getSetting(),
        ]);

        // setAdminsCount(admins?.length ?? 0);
        setSetting(siteSetting ?? null);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  // // --- Calculated Stats ---
  // const totalRevenue = orders.reduce((sum, o) => {
  //   return sum + o.totalPrice;
  // }, 0);
  // const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;
  // const outOfStock = products.filter(
  //   (p) => !p.isActive || p.stock === 0,
  // ).length;
  // const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5);

  // const recentOrders = [...orders].slice(0, 5);

  // // --- Status Counts ---
  // const statusCounts = orders.reduce(
  //   (acc, o) => {
  //     acc[o.status] = (acc[o.status] || 0) + 1;
  //     return acc;
  //   },
  //   {} as Record<string, number>,
  // );

  // const statusColors: Record<string, string> = {
  //   pending: "#facc15",
  //   confirmed: "#3b82f6",
  //   shipped: "#8b5cf6",
  //   delivered: "#10b981",
  //   cancelled: "#ef4444",
  // };

  // // Pie Chart
  // const pieData = {
  //   labels: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
  //   datasets: [
  //     {
  //       data: [
  //         statusCounts["pending"] || 0,
  //         statusCounts["confirmed"] || 0,
  //         statusCounts["shipped"] || 0,
  //         statusCounts["delivered"] || 0,
  //         statusCounts["cancelled"] || 0,
  //       ],
  //       backgroundColor: [
  //         statusColors["pending"],
  //         statusColors["confirmed"],
  //         statusColors["shipped"],
  //         statusColors["delivered"],
  //         statusColors["cancelled"],
  //       ],
  //     },
  //   ],
  // };

  // // Monthly Revenue Bar Chart
  // const monthlyRevenueMap: Record<string, number> = {};
  // orders.forEach((order) => {
  //   const month = new Date(order.createdAt).toLocaleString("default", {
  //     month: "short",
  //     year: "numeric",
  //   });

  //   monthlyRevenueMap[month] =
  //     (monthlyRevenueMap[month] || 0) + (order.totalPrice || 0);
  // });

  // const barData = {
  //   labels: Object.keys(monthlyRevenueMap),
  //   datasets: [
  //     {
  //       label: "Revenue",
  //       data: Object.values(monthlyRevenueMap),
  //       backgroundColor: "#3b82f6",
  //     },
  //   ],
  // };

  // // Best-selling products
  // const productSales: Record<string, number> = {};
  // orders.forEach((order) => {
  //   productSales[order.productTitle] =
  //     (productSales[order.productTitle] || 0) + order.quantity;
  // });
  // const topProducts = Object.entries(productSales)
  //   .sort((a, b) => b[1] - a[1])
  //   .slice(0, 5);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {setting?.name ?? "Dashboard"}
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {/* <DashboardCard
          title="Total Orders"
          value={orders.length}
          color="blue"
        /> */}
        {/* <DashboardCard
          title="Total Revenue"
          value={totalRevenue}
          color="green"
        /> */}
        {/* <DashboardCard
          title="Average Order"
          value={Math.round(avgOrderValue)}
          color="yellow"
        />
        <DashboardCard
          title="Active Products"
          value={activeProducts.length}
          color="purple"
        />
        <DashboardCard title="Out of Stock" value={outOfStock} color="red" /> */}
        {/* <DashboardCard title="Total Admins" value={adminsCount} color="teal" /> */}
        {/* {(
          [
            "pending",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled",
          ] as OrderStatus[]
        ).map((status) => (
          <DashboardCard
            key={status}
            title={`${status.charAt(0).toUpperCase() + status.slice(1)} Orders`}
            value={statusCounts[status] || 0}
            color={status} // ✅ now fully type-safe
          />
        ))} */}
      </div>

      {/* Charts */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
        <Card className="p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Order Status Distribution
          </h2>
          <Pie data={pieData} />
        </Card>

        <Card className="md:col-span-2 p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
          <Bar data={barData} />
        </Card>
      </div> */}

      {/* Top Products */}
      {/* <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
          <ul>
            {topProducts.map(([title, qty], idx) => (
              <li
                key={idx}
                className="flex justify-between py-1 border-b last:border-b-0"
              >
                <span>{title}</span>
                <span className="font-semibold">{qty}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Low Stock Products</h2>
          <ul>
            {lowStock.length ? (
              lowStock.map((p, index) => (
                <li
                  key={index}
                  className="flex justify-between py-1 border-b last:border-b-0"
                >
                  <span>{p.title}</span>
                  <span className="font-semibold">{p.stock}</span>
                </li>
              ))
            ) : (
              <li>No low stock products</li>
            )}
          </ul>
        </Card>
      </div> */}

      {/* Recent Orders */}
      {/* <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2">Order ID</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">
                    {order._id.toString().slice(-6)}
                  </td>
                  <td className="px-4 py-2">{order.customerName}</td>
                  <td className="px-4 py-2">{order.totalPrice}</td>
                  <td className="px-4 py-2 capitalize">{order.status}</td>
                  <td className="px-4 py-2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}
    </div>
  );
};

// interface DashboardCardProps {
//   title: string;
//   value: number;
//   color: "blue" | "green" | "yellow" | "purple" | "red" | "teal" | OrderStatus;
// }

// const DashboardCard = ({ title, value, color }: DashboardCardProps) => {
//   const colors: Record<string, string> = {
//     blue: "#3b82f6",
//     green: "#10b981",
//     yellow: "#facc15",
//     purple: "#8b5cf6",
//     red: "#ef4444",
//     teal: "#14b8a6",
//     pending: "#facc15",
//     confirmed: "#3b82f6",
//     shipped: "#8b5cf6",
//     delivered: "#10b981",
//     cancelled: "#ef4444",
//   };
//   return (
//     <Card className="rounded-2xl shadow-md p-6 flex flex-col items-center">
//       <h3 className="text-gray-500 text-xs lg:text-sm">{title}</h3>
//       <div className="mt-4 w-16 h-16">
//         <CircularProgressbar
//           value={Math.min(value, 100)}
//           text={value.toString()}
//           styles={buildStyles({
//             textColor: colors[color],
//             pathColor: colors[color],
//             trailColor: "#eee",
//           })}
//         />
//       </div>
//     </Card>
//   );
// };

export default Dashboard;
