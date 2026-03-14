import Image from "next/image";
import { BadgeCheck, CreditCard, StickyNote } from "lucide-react";
import InvoiceDownloader from "../../components/InvoiceDownloader";
import { getSetting } from "@/lib/actions/setting.actions";
import { getOrderById } from "@/lib/actions/order.actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

const OrderDetails = async ({ params }: PageProps) => {
  const { id } = await params;
  const order = await getOrderById(id);
  const setting = await getSetting();

  if (!order) {
    return (
      <div className="px-4 py-10 text-center text-xl text-destructive">
        Order not found.
      </div>
    );
  }

  const InfoItem = ({
    label,
    value,
  }: {
    label: React.ReactNode;
    value: React.ReactNode;
  }) => (
    <p>
      <strong>{label}:</strong> {value}
    </p>
  );

  const formatDate = (date: Date | string | undefined) =>
    date ? new Date(date).toLocaleString() : "N/A";

  const Badge = ({
    status,
    color = "default",
  }: {
    status: string;
    color?: "green" | "red" | "blue" | "pink" | "default";
  }) => {
    const base = "inline-block px-2 py-0.5 rounded text-xs font-medium";
    const colorMap: Record<string, string> = {
      green: "bg-green-100 text-green-700",
      red: "bg-red-100 text-red-700",
      blue: "bg-blue-100 text-blue-700",
      pink: "bg-pink-100 text-pink-700",
      default: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={`${base} ${colorMap[color || "default"]}`}>
        {status}
      </span>
    );
  };

  return (
    <section className="px-4 py-10 max-w-3xl mx-auto space-y-8">
      <div className="border rounded-xl p-6 shadow space-y-6 bg-white">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-6">
          <div>
            <h2 className="text-2xl font-bold">{setting?.name || "Shop"}</h2>
            <p className="text-sm text-gray-600">{setting?.email}</p>
            <p className="text-sm text-gray-600">{setting?.phoneNumber}</p>
          </div>

          <div className="text-right">
            <h1 className="text-4xl font-extrabold text-orange-600">INVOICE</h1>
            <p className="mt-2 text-sm">
              <span className="font-semibold">Invoice ID:</span> #{order._id.toString()}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Date:</span>{" "}
              {formatDate(order.createdAt)}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Status:</span>{" "}
              <Badge
                status={order.status}
                color={
                  order.status === "delivered"
                    ? "green"
                    : order.status === "cancelled"
                      ? "red"
                      : "blue"
                }
              />
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-green-500" /> Customer Info
          </h2>
          {[
            ["Name", order.customerName],
            ["Phone", order.phone],
            ["City", order.city],
            ["Address", order.address],
          ].map(([label, value], idx) => (
            <InfoItem key={idx} label={label} value={value} />
          ))}
        </div>

        {/* Product Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" /> Product Info
          </h2>
          <div className="border rounded-lg shadow-sm p-4 flex gap-4 bg-muted/10">
            <div className="w-24 flex-shrink-0">
              <Image
                src={order.productImage}
                alt={order.productTitle}
                width={96}
                height={96}
                className="rounded-md object-cover w-full h-24"
              />
            </div>
            <div className="flex-1 text-sm space-y-1">
              <p className="font-semibold text-base">{order.productTitle}</p>
              <p>
                <span className="font-medium">Unit Price:</span>{" "}
                {order.unitPrice}৳
              </p>
              <p>
                <span className="font-medium">Quantity:</span> {order.quantity}
              </p>
              <p>
                <span className="font-medium">Total Price:</span>{" "}
                {order.totalPrice}৳
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div>
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-yellow-600" /> Notes
            </h2>
            <p>{order.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-right text-sm text-muted-foreground pt-6 border-t">
          Last updated: {formatDate(order.updatedAt)}
        </div>
      </div>

      {/* Invoice Downloader */}
      <InvoiceDownloader order={order} setting={setting} />
    </section>
  );
};

export default OrderDetails;
