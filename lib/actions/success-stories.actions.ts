"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import { SuccessStoriesParams } from "@/types";
import { revalidatePath } from "next/cache";
import SuccessStories from "../database/models/success-stories.model";

// ====== CREATE SuccessStories
export const createSuccessStories = async (params: SuccessStoriesParams) => {
  try {
    await connectToDatabase();

    const newSuccessStories = await SuccessStories.create(params);

    revalidatePath("/SuccessStoriess");

    return JSON.parse(JSON.stringify(newSuccessStories));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL successStories
export const getAllSuccessStories = async () => {
  try {
    await connectToDatabase();

    const successStoriess = await SuccessStories.find().sort({ createdAt: -1 }).lean();

    return JSON.parse(JSON.stringify(successStoriess));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET SuccessStories BY ID
export const getSuccessStoriesById = async (SuccessStoriesId: string) => {
  try {
    await connectToDatabase();

    const successStories = await SuccessStories.findById(SuccessStoriesId).lean();

    if (!successStories) {
      throw new Error("SuccessStories not found");
    }

    return JSON.parse(JSON.stringify(successStories));
  } catch (error) {
    handleError(error);
  }
};

// ====== UPDATE SuccessStories
export const updateSuccessStories = async (
  SuccessStoriesId: string,
  updateData: Partial<SuccessStoriesParams>,
) => {
  try {
    await connectToDatabase();

    const updatedSuccessStories = await SuccessStories.findByIdAndUpdate(SuccessStoriesId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedSuccessStories) {
      throw new Error("SuccessStories not found");
    }

    revalidatePath("/SuccessStoriess");

    return JSON.parse(JSON.stringify(updatedSuccessStories));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE SuccessStories
export const deleteSuccessStories = async (SuccessStoriesId: string) => {
  try {
    await connectToDatabase();

    const deletedSuccessStories = await SuccessStories.findByIdAndDelete(SuccessStoriesId);

    if (!deletedSuccessStories) {
      throw new Error("SuccessStories not found");
    }

    revalidatePath("/SuccessStoriess");

    return { message: "SuccessStories deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
