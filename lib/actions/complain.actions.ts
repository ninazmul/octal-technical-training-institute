"use server";

import { connectToDatabase } from "../database";
import Complain from "../database/models/complain.model";
import { ComplainParams } from "@/types";
import { handleError } from "../utils";
import { sendRegistrationSMS } from "../mailer/sendRegistrationSMS";
import { sendSystemNotificationEmail } from "../mailer/sendSystemNotificationEmail";

// 🔹 Create
const BRAND_NAME = "Octal Technical Training Institute";

const buildComplainSMS = (name: string) =>
  `Hi ${name}, we have received your complaint. Our team is reviewing it and will contact you shortly. - ${BRAND_NAME}`;

export const createComplain = async (params: ComplainParams) => {
  try {
    await connectToDatabase();

    const complain = await Complain.create(params);

    if (complain.phone) {
      const smsMessage = buildComplainSMS(complain.name);

      await sendRegistrationSMS(complain.phone, smsMessage);
    }

    // 🔹 Send notification email to CONTACT_RECEIVER
    const emailMessage = `New complaint received:\n\nName: ${complain.name}\nEmail: ${complain.email}\nMessage: ${complain.message || "No message provided"}`;
    await sendSystemNotificationEmail({
      subject: "New Complaint",
      message: emailMessage,
    });

    return complain.toObject();
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 🔹 Get All
export const getAllComplains = async () => {
  try {
    await connectToDatabase();

    const complains = await Complain.find().lean();

    return JSON.parse(JSON.stringify(complains));
  } catch (error) {
    handleError(error);
  }
};

// 🔹 Update
export const updateComplain = async (
  complainId: string,
  updateData: Partial<ComplainParams>,
) => {
  try {
    await connectToDatabase();

    const complain = await Complain.findByIdAndUpdate(complainId, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!complain) {
      throw new Error("Complain not found");
    }

    return complain;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 🔹 Delete
export const deleteComplain = async (complainId: string) => {
  try {
    await connectToDatabase();

    const complain = await Complain.findByIdAndDelete(complainId).lean();

    if (!complain) {
      throw new Error("Complain not found");
    }

    return { success: true };
  } catch (error) {
    handleError(error);
    throw error;
  }
};
