"use server";

import { AddPhotoParams } from "@/types";
import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Gallery from "../database/models/gallery.model";

export const addPhoto = async ({ title, image }: AddPhotoParams) => {
  try {
    await connectToDatabase();

    const newPhoto = await Gallery.create({ title, image });

    return JSON.parse(JSON.stringify(newPhoto));
  } catch (error) {
    handleError(error);
  }
};

export const getAllPhoto = async () => {
  try {
    await connectToDatabase();

    const gallery = await Gallery.find();

    return JSON.parse(JSON.stringify(gallery));
  } catch (error) {
    handleError(error);
  }
};

export const deletePhoto = async (photoId: string) => {
  try {
    await connectToDatabase();

    const deletedPhoto = await Gallery.findByIdAndDelete(photoId);

    if (!deletedPhoto) {
      throw new Error("Photo not found");
    }

    return { message: "Photo deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
