"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import { NoticeParams } from "@/types";
import { revalidatePath } from "next/cache";
import Notice from "../database/models/notice.model";

// ====== CREATE Notice
export const createNotice = async (params: NoticeParams) => {
  try {
    await connectToDatabase();

    const newNotice = await Notice.create(params);

    revalidatePath("/Notices");

    return JSON.parse(JSON.stringify(newNotice));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL NoticeS
export const getAllNotices = async () => {
  try {
    await connectToDatabase();

    const Notices = await Notice.find().sort({ createdAt: -1 }).lean();

    return JSON.parse(JSON.stringify(Notices));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET Notice BY ID
export const getNoticeById = async (NoticeId: string) => {
  try {
    await connectToDatabase();

    const notice = await Notice.findById(NoticeId).lean();

    if (!notice) {
      throw new Error("Notice not found");
    }

    return JSON.parse(JSON.stringify(notice));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET NoticeS BY EMAIL
export const getNoticesByEmail = async (email: string) => {
  try {
    await connectToDatabase();

    const Notices = await Notice.find({ email }).lean();

    if (!Notices || Notices.length === 0) {
      console.log(`No Notices found for email: ${email}`);
      return null;
    }

    return JSON.parse(JSON.stringify(Notices));
  } catch (error) {
    console.error("Error fetching Notices by email:", error);
    handleError(error);
  }
};

// ====== UPDATE Notice
export const updateNotice = async (
  NoticeId: string,
  updateData: Partial<NoticeParams>,
) => {
  try {
    await connectToDatabase();

    const updatedNotice = await Notice.findByIdAndUpdate(NoticeId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedNotice) {
      throw new Error("Notice not found");
    }

    revalidatePath("/Notices");

    return JSON.parse(JSON.stringify(updatedNotice));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE Notice
export const deleteNotice = async (NoticeId: string) => {
  try {
    await connectToDatabase();

    const deletedNotice = await Notice.findByIdAndDelete(NoticeId);

    if (!deletedNotice) {
      throw new Error("Notice not found");
    }

    revalidatePath("/Notices");

    return { message: "Notice deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
