import { Document, Schema, Types, model, models } from "mongoose";

export type CouponDiscountType = "fixed" | "percent";

export interface ICoupon extends Document {
  _id: Types.ObjectId;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      required: true,
      enum: ["fixed", "percent"],
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Coupon = models.Coupon || model<ICoupon>("Coupon", CouponSchema);

export default Coupon;
