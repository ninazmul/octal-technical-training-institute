import { Document, Schema, Types, model, models } from "mongoose";

export interface IOrder extends Document {
  _id: Types.ObjectId;
  product: Types.ObjectId;

  // Product snapshot
  productTitle: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;

  // Customer details
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;

  // Order management
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

  // Steadfast / shipping info
  trackingNumber?: string;
  consignmentId?: string;
  courier?: string;
  shippedAt?: Date;
  deliveredAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "LandingProduct",
      required: true,
    },

    // Snapshot fields
    productTitle: { type: String, required: true },
    productImage: { type: String, required: true },
    unitPrice: { type: Number, required: true },

    quantity: { type: Number, required: true, default: 1 },
    totalPrice: { type: Number, required: true },

    // Customer
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    notes: { type: String },

    // Order lifecycle
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // Shipping / courier info
    trackingNumber: { type: String },
    consignmentId: { type: String },
    courier: { type: String },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true },
);

const Order = models.Order || model<IOrder>("Order", OrderSchema);

export default Order;
