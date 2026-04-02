"use server";

import { connectToDatabase } from "../database";
import { ApplyParams } from "@/types";
import { handleError } from "../utils";
import Apply from "../database/models/apply.model";
import { sendRegistrationSMS } from "../mailer/sendRegistrationSMS";

// 🔹 Create
export const applyRegistration = async (params: ApplyParams) => {
  try {
    await connectToDatabase();

    // 2. Create Registration
    const apply = await Apply.create(params);

    // 3. Async SMS (non-blocking)
    if (apply.phone) {
      const smsMessage = `Hi ${apply.name}, your registration is confirmed. We’ll contact you soon with course details and next steps. - Octal Technical Training Institute`;

      setImmediate(() => {
        sendRegistrationSMS(apply.phone, smsMessage).catch((err) => {
          console.error("SMS error:", err);
        });
      });
    }

    return apply.toObject();
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 🔹 Get All
export const getAllApplies = async () => {
  try {
    await connectToDatabase();

    const apply = await Apply.find().lean();

    return JSON.parse(JSON.stringify(apply));
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
    }).lean();

    if (!apply) {
      throw new Error("Apply not found");
    }

    return apply;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 🔹 Delete
export const deleteApply = async (applyId: string) => {
  try {
    await connectToDatabase();

    const apply = await Apply.findByIdAndDelete(applyId).lean();

    if (!apply) {
      throw new Error("Apply not found");
    }

    return { success: true };
  } catch (error) {
    handleError(error);
    throw error;
  }
};
