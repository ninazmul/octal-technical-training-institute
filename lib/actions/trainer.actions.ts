"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Trainer from "../database/models/trainer.model";
import { TrainerParams } from "@/types";

export const createTrainer = async (params: TrainerParams) => {
  try {
    await connectToDatabase();

    const newTrainer = await Trainer.create(params);

    return JSON.parse(JSON.stringify(newTrainer));
  } catch (error) {
    handleError(error);
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

    const updatedTrainer = await Trainer.findByIdAndUpdate(trainerId, updateData, {
      new: true,
      runValidators: true,
    });

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