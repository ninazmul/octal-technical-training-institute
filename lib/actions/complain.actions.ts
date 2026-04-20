"use server";

import { connectToDatabase } from "../database";
import Complain from "../database/models/complain.model";
import { ComplainParams } from "@/types";
import { handleError } from "../utils";
import { sendRegistrationSMS } from "../mailer/sendRegistrationSMS";
import { sendSystemNotificationEmail } from "../mailer/sendSystemNotificationEmail";
import { DashboardDateFilterResolved } from "../dashboard-date-filter";

// 🔹 Create
const BRAND_NAME = "Octal TTI";

const buildComplainSMS = (name: string) =>
  `Hi ${name}, we have received your complaint. Our team is reviewing it and will contact you shortly. - ${BRAND_NAME}`;

export type SerializedComplain = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  details: string;
  proof: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type ComplainListFilter = {
  dateFilter?: Pick<DashboardDateFilterResolved, "startDate" | "endDate">;
};

function serializeComplain(raw: Record<string, unknown>): SerializedComplain {
  return {
    _id: String(raw._id ?? ""),
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? ""),
    details: String(raw.details ?? ""),
    proof: raw.proof ? String(raw.proof) : null,
    createdAt: raw.createdAt ? new Date(String(raw.createdAt)).toISOString() : null,
    updatedAt: raw.updatedAt ? new Date(String(raw.updatedAt)).toISOString() : null,
  };
}

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

    const complains = await Complain.find().lean<Record<string, unknown>[]>();

    return complains.map(serializeComplain);
  } catch (error) {
    handleError(error);
    return [];
  }
};

export const getComplains = async (
  filter?: ComplainListFilter,
): Promise<SerializedComplain[]> => {
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

    const complains = await Complain.find(query)
      .sort({ createdAt: -1 })
      .lean<Record<string, unknown>[]>();

    return complains.map(serializeComplain);
  } catch (error) {
    handleError(error);
    return [];
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
