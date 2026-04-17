"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Trainer from "../database/models/trainer.model";
import { TrainerParams } from "@/types";
import { sendRegistrationSMS } from "../mailer/sendRegistrationSMS";
import { sendSystemNotificationEmail } from "../mailer/sendSystemNotificationEmail";
import { DashboardDateFilterResolved } from "../dashboard-date-filter";

const BRAND_NAME = "Octal Technical Training Institute";

const buildTrainerSMS = (name: string) =>
  `Hi ${name}, your trainer application has been received. Our team will review it and contact you shortly with next steps. - ${BRAND_NAME}`;

export type SerializedTrainer = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  cv: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type TrainerListFilter = {
  dateFilter?: Pick<DashboardDateFilterResolved, "startDate" | "endDate">;
};

function serializeTrainer(raw: Record<string, unknown>): SerializedTrainer {
  return {
    _id: String(raw._id ?? ""),
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? ""),
    address: String(raw.address ?? ""),
    cv: raw.cv ? String(raw.cv) : null,
    createdAt: raw.createdAt ? new Date(String(raw.createdAt)).toISOString() : null,
    updatedAt: raw.updatedAt ? new Date(String(raw.updatedAt)).toISOString() : null,
  };
}

export const createTrainer = async (params: TrainerParams) => {
  try {
    await connectToDatabase();

    const newTrainer = await Trainer.create(params);

    if (newTrainer.phone) {
      const smsMessage = buildTrainerSMS(newTrainer.name);

      await sendRegistrationSMS(newTrainer.phone, smsMessage);
    }

    const emailMessage = `New trainer application received:\n\nName: ${newTrainer.name}\nEmail: ${newTrainer.email}\nMessage: ${newTrainer.message || "No message provided"}`;
    await sendSystemNotificationEmail({
      subject: "New Trainer Application",
      message: emailMessage,
    });

    return newTrainer.toObject();
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const getAllTrainers = async (
  filter?: TrainerListFilter,
): Promise<SerializedTrainer[]> => {
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

    const trainers = await Trainer.find(query)
      .sort({ createdAt: -1 })
      .lean<Record<string, unknown>[]>();

    return trainers.map(serializeTrainer);
  } catch (error) {
    handleError(error);
    return [];
  }
};

export const updateTrainer = async (
  trainerId: string,
  updateData: Partial<TrainerParams>,
) => {
  try {
    await connectToDatabase();

    const updatedTrainer = await Trainer.findByIdAndUpdate(
      trainerId,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedTrainer) {
      throw new Error("Trainer not found");
    }

    return JSON.parse(JSON.stringify(updatedTrainer));
  } catch (error) {
    handleError(error);
  }
};

export const deleteTrainer = async (trainerId: string) => {
  try {
    await connectToDatabase();

    const deletedTrainer = await Trainer.findByIdAndDelete(trainerId);

    if (!deletedTrainer) {
      throw new Error("Trainer not found");
    }

    return { message: "Trainer deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
