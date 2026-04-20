"use server";

import { connectToDatabase } from "../database";
import { ApplyParams } from "@/types";
import { handleError, sanitizeApplies, sanitizeApply } from "../utils";
import Apply from "../database/models/apply.model";
import { sendRegistrationSMS } from "../mailer/sendRegistrationSMS";
import { sendSystemNotificationEmail } from "../mailer/sendSystemNotificationEmail";

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
export const getAllApplies = async () => {
  try {
    await connectToDatabase();
    const applies = await Apply.find();
    return sanitizeApplies(applies);
  } catch (error) {
    handleError(error);
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
    const apply = await Apply.findByIdAndDelete(applyId);
    if (!apply) throw new Error("Apply not found");
    return { success: true };
  } catch (error) {
    handleError(error);
    throw error;
  }
};
