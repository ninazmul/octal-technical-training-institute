"use server";

import { connectToDatabase } from "../database";
import { ApplyParams } from "@/types";
import { handleError, sanitizeApplies, sanitizeApply } from "../utils";
import Apply from "../database/models/apply.model";
import { sendRegistrationSMS } from "../mailer/sendRegistrationSMS";
import { logActivity } from "./activity-log.actions";
import { sendSystemNotificationEmail } from "../mailer/sendSystemNotificationEmail";
import { DashboardDateFilterResolved } from "../dashboard-date-filter";

export type SerializedApply = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  createdAt: string;
  updatedAt: string;
};

export type ApplyListFilter = {
  dateFilter?: Pick<DashboardDateFilterResolved, "startDate" | "endDate">;
};

// 🔹 Create
export const applyRegistration = async (params: ApplyParams) => {
  try {
    await connectToDatabase();

    // 2. Create Registration
    const apply = await Apply.create(params);

    // 3. Async SMS (non-blocking)
    if (apply.phone) {
      const smsMessage = `Hi ${apply.name}, your registration is confirmed. We’ll contact you soon with course details and next steps. - Octal TTI`;

      await sendRegistrationSMS(apply.phone, smsMessage);
    }

    const emailMessage = `New registration received:\n\nName: ${apply.name}\nEmail: ${apply.email}\nMessage: ${apply.message || "No message provided"}`;
    await sendSystemNotificationEmail({
      subject: "New Registration",
      message: emailMessage,
    });

    return sanitizeApply(apply);
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 🔹 Get All
export const getAllApplies = async (
  filter?: ApplyListFilter,
): Promise<SerializedApply[]> => {
  try {
    await connectToDatabase();
    const dateQuery: Record<string, Date> = {};
    if (filter?.dateFilter?.startDate) {
      dateQuery.$gte = filter.dateFilter.startDate;
    }
    if (filter?.dateFilter?.endDate) {
      dateQuery.$lte = filter.dateFilter.endDate;
    }

    const query: Record<string, unknown> = {};
    if (Object.keys(dateQuery).length > 0) {
      query.createdAt = dateQuery;
    }

    const applies = await Apply.find(query).sort({ createdAt: -1 });
    return sanitizeApplies(applies);
  } catch (error) {
    handleError(error);
    return [];
  }
};

// 🔹 Update
export const updateApply = async (
  applyId: string,
  updateData: Partial<ApplyParams>,
) => {
  try {
    await connectToDatabase();
    const apply = await Apply.findByIdAndUpdate(applyId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!apply) throw new Error("Apply not found");

    await logActivity("UPDATE", "Quick Registration", `Updated quick registration status/details for ${apply.name}`);

    return sanitizeApply(apply);
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 🔹 Delete
export const deleteApply = async (applyId: string) => {
  try {
    await connectToDatabase();

    const applyToDelete = await Apply.findById(applyId);
    if (!applyToDelete) throw new Error("Apply not found");

    const apply = await Apply.findByIdAndDelete(applyId);
    if (!apply) throw new Error("Apply not found");

    await logActivity("DELETE", "Quick Registration", `Deleted quick registration for ${applyToDelete.name}`);

    return { success: true };
  } catch (error) {
    handleError(error);
    throw error;
  }
};
