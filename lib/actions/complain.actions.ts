"use server";

import { connectToDatabase } from "../database";
import Complain from "../database/models/complain.model";
import { ComplainParams } from "@/types";
import { handleError } from "../utils";

// 🔹 Create
export const createComplain = async (params: ComplainParams) => {
  try {
    await connectToDatabase();

    const complain = await Complain.create(params);

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
