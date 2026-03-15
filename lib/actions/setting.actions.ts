"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Setting, { ISetting } from "../database/models/setting.model";
import { SettingParams } from "@/types";
import { Types } from "mongoose";

// ====== CREATE SETTING (only if none exists)
export const createSetting = async (
  params: SettingParams,
): Promise<ISetting | null> => {
  try {
    await connectToDatabase();

    const existing = await Setting.findOne().lean<ISetting>();
    if (existing) {
      throw new Error("Settings already exist");
    }

    const newSetting = await Setting.create(params);
    return JSON.parse(JSON.stringify(newSetting)) as ISetting; // consistent plain object
  } catch (error) {
    handleError(error);
    return null;
  }
};

// Default template for a brand-new setting
const DEFAULT_SETTING: Partial<ISetting> = {
  _id: new Types.ObjectId(),
  logo: "",
  favicon: "",
  name: "Default Site",
  tagline: "",
  description: "",
  email: "",
  phoneNumber: "",
  address: "",
  theme: "light",

  facebook: "",
  instagram: "",
  twitter: "",
  facebookGroup: "",
  youtube: "",

  returnPolicy: "",
  termsOfService: "",
  privacyPolicy: "",

  hero: {
    title: "",
    description: "",
    image: "",
    offerStartDate: new Date(),
    offerEndDate: new Date(),
  },

  features: {
    badge: "",
    title: "",
    description: "",
    image: "",
    weGiveYou: [],
    weDoNotGiveYou: [],
  },

  testimonials: {
    badge: "",
    title: "",
    description: "",
    totalEnrollment: 0,
    totalSucceededStudents: 0,
    totalIndustryExperts: 0,
    feedbacks: [],
  },

  ourMentors: {
    badge: "",
    title: "",
    description: "",
    mentors: [],
  },

  faqs: {
    badge: "",
    title: "",
    description: "",
    items: [],
  },

  createdAt: new Date(),
  updatedAt: new Date(),
};

export const getSetting = async (): Promise<ISetting> => {
  try {
    await connectToDatabase();

    let setting = await Setting.findOne().lean<ISetting>();

    if (!setting) {
      // Create default setting in DB
      setting = await Setting.create(DEFAULT_SETTING);
    }

    return JSON.parse(JSON.stringify(setting)) as ISetting;
  } catch (error) {
    handleError(error);
    throw new Error("Unable to fetch setting");
  }
};

// ====== UPSERT SETTING (update if exists, else create)
export const upsertSetting = async (
  updateData: Partial<SettingParams>,
): Promise<ISetting | null> => {
  try {
    await connectToDatabase();

    const setting = await Setting.findOneAndUpdate(
      {}, // always target the single settings doc
      { $set: updateData },
      {
        new: true, // return updated doc
        upsert: true, // create if none exists
        runValidators: true,
        lean: true, // return plain object
      },
    );

    return setting ? (JSON.parse(JSON.stringify(setting)) as ISetting) : null;
  } catch (error) {
    handleError(error);
    return null;
  }
};
