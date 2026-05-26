"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database";
import Coupon, {
  CouponDiscountType,
} from "../database/models/coupon.model";
import { handleError } from "../utils";
import { logActivity } from "./activity-log.actions";

export type SerializedCoupon = {
  _id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CouponParams = {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  isActive?: boolean;
};

export type CouponValidationResult =
  | {
      valid: true;
      code: string;
      discountType: CouponDiscountType;
      discountValue: number;
      originalAmount: number;
      discountAmount: number;
      finalAmount: number;
    }
  | {
      valid: false;
      message: string;
      originalAmount: number;
      discountAmount: 0;
      finalAmount: number;
    };

function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}

function toISODateOrNull(value: unknown): string | null {
  if (!value) return null;
  const date = new Date(value as string | Date);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function serializeCoupon(raw: Record<string, unknown>): SerializedCoupon {
  return {
    _id: String(raw["_id"] ?? ""),
    code: String(raw["code"] ?? ""),
    discountType:
      raw["discountType"] === "percent" ? "percent" : "fixed",
    discountValue: Number(raw["discountValue"] ?? 0),
    isActive: Boolean(raw["isActive"]),
    createdAt: toISODateOrNull(raw["createdAt"]),
    updatedAt: toISODateOrNull(raw["updatedAt"]),
  };
}

function calculateCouponDiscount(
  amount: number,
  discountType: CouponDiscountType,
  discountValue: number,
) {
  const originalAmount = Math.max(0, Number(amount) || 0);
  const value = Math.max(0, Number(discountValue) || 0);
  const rawDiscount =
    discountType === "percent" ? (originalAmount * value) / 100 : value;
  const discountAmount = Math.min(originalAmount, Math.round(rawDiscount));
  const finalAmount = Math.max(0, originalAmount - discountAmount);

  return {
    originalAmount,
    discountAmount,
    finalAmount,
  };
}

function validateCouponInput(data: CouponParams) {
  const code = normalizeCouponCode(data.code);
  const discountType = data.discountType;
  const discountValue = Number(data.discountValue);

  if (!code) throw new Error("Coupon code is required");
  if (!["fixed", "percent"].includes(discountType)) {
    throw new Error("Invalid coupon type");
  }
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    throw new Error("Discount value must be greater than 0");
  }
  if (discountType === "percent" && discountValue > 100) {
    throw new Error("Percent discount cannot exceed 100");
  }

  return {
    code,
    discountType,
    discountValue,
    isActive: data.isActive ?? true,
  };
}

export const getCoupons = async (): Promise<SerializedCoupon[]> => {
  try {
    await connectToDatabase();

    const coupons = await Coupon.find()
      .sort({ createdAt: -1 })
      .lean<Record<string, unknown>[]>();

    return coupons.map(serializeCoupon);
  } catch (error) {
    handleError(error);
    return [];
  }
};

export const createCoupon = async (
  data: CouponParams,
): Promise<SerializedCoupon | undefined> => {
  try {
    await connectToDatabase();

    const coupon = await Coupon.create(validateCouponInput(data));

    await logActivity("CREATE", "Coupon", `Created coupon code '${coupon.code}' with ${coupon.discountValue}${coupon.discountType === "percent" ? "%" : " TK"} discount`);

    revalidatePath("/dashboard/coupons");
    return serializeCoupon(coupon.toObject());
  } catch (error) {
    handleError(error);
  }
};

export const updateCoupon = async (
  couponId: string,
  data: CouponParams,
): Promise<SerializedCoupon | undefined> => {
  try {
    await connectToDatabase();

    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      { $set: validateCouponInput(data) },
      { new: true, runValidators: true },
    ).lean<Record<string, unknown>>();

    if (!coupon) throw new Error("Coupon not found");

    await logActivity("UPDATE", "Coupon", `Updated coupon code '${coupon.code}'`);

    revalidatePath("/dashboard/coupons");
    return serializeCoupon(coupon);
  } catch (error) {
    handleError(error);
  }
};

export const deleteCoupon = async (
  couponId: string,
): Promise<{ message: string } | undefined> => {
  try {
    await connectToDatabase();

    const couponToDelete = await Coupon.findById(couponId);
    if (!couponToDelete) throw new Error("Coupon not found");

    const deleted = await Coupon.findByIdAndDelete(couponId);
    if (!deleted) throw new Error("Coupon not found");

    await logActivity("DELETE", "Coupon", `Deleted coupon code '${couponToDelete.code}'`);

    revalidatePath("/dashboard/coupons");
    return { message: "Coupon deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};

export const validateCoupon = async (
  code: string,
  amount: number,
): Promise<CouponValidationResult> => {
  const originalAmount = Math.max(0, Number(amount) || 0);

  try {
    await connectToDatabase();

    const normalizedCode = normalizeCouponCode(code);
    if (!normalizedCode) {
      return {
        valid: false,
        message: "Coupon code is required",
        originalAmount,
        discountAmount: 0,
        finalAmount: originalAmount,
      };
    }

    const coupon = await Coupon.findOne({ code: normalizedCode }).lean<{
      code: string;
      discountType: CouponDiscountType;
      discountValue: number;
      isActive: boolean;
    }>();

    if (!coupon || !coupon.isActive) {
      return {
        valid: false,
        message: "Invalid or inactive coupon",
        originalAmount,
        discountAmount: 0,
        finalAmount: originalAmount,
      };
    }

    const { discountAmount, finalAmount } = calculateCouponDiscount(
      originalAmount,
      coupon.discountType,
      coupon.discountValue,
    );

    return {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      originalAmount,
      discountAmount,
      finalAmount,
    };
  } catch (error) {
    handleError(error);
    return {
      valid: false,
      message: "Unable to validate coupon",
      originalAmount,
      discountAmount: 0,
      finalAmount: originalAmount,
    };
  }
};
