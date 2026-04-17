"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Trainer from "../database/models/trainer.model";
import { TrainerParams } from "@/types";
import { sendRegistrationSMS } from "../mailer/sendRegistrationSMS";
import { sendSystemNotificationEmail } from "../mailer/sendSystemNotificationEmail";

const BRAND_NAME = "Octal Technical Training Institute";

const buildTrainerSMS = (name: string) =>
  `Hi ${name}, your trainer application has been received. Our team will review it and contact you shortly with next steps. - ${BRAND_NAME}`;

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

export const getAllTrainers = async () => {
  try {
    await connectToDatabase();

    const trainers = await Trainer.find().lean();

    return JSON.parse(JSON.stringify(trainers));
  } catch (error) {
    handleError(error);
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
