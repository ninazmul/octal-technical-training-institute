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

// ----- In-memory cache -----
let cachedSetting: ISetting | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

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
  hero: { title: "", description: "", image: "" },
  features: { badge: "", title: "", description: "", items: [] },
  testimonials: {
    badge: "",
    title: "",
    description: "",
    totalEnrollment: 0,
    totalSucceededStudents: 0,
    totalIndustryExperts: 0,
    feedbacks: [],
  },
  ourMentors: { badge: "", title: "", description: "", mentors: [] },
  faqs: { badge: "", title: "", description: "", items: [] },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ====== GET SETTING WITH CACHE ======
export const getSetting = async (): Promise<ISetting> => {
  try {
    const now = Date.now();

    // Use cache if valid
    if (cachedSetting && now - cacheTimestamp < CACHE_TTL) {
      return cachedSetting;
    }

    await connectToDatabase();

    let setting = await Setting.findOne().lean<ISetting>();

    if (!setting) {
      setting = await Setting.create(DEFAULT_SETTING);
    }

    cachedSetting = JSON.parse(JSON.stringify(setting)) as ISetting;
    cacheTimestamp = now;

    return cachedSetting;
  } catch (error) {
    handleError(error);
    throw new Error("Unable to fetch setting");
  }
};

// ====== UPSERT SETTING WITH CACHE REFRESH ======
export const upsertSetting = async (
  updateData: Partial<SettingParams>,
): Promise<ISetting | null> => {
  try {
    await connectToDatabase();

    const setting = await Setting.findOneAndUpdate(
      {},
      { $set: updateData },
      {
        new: true,
        upsert: true,
        runValidators: true,
        lean: true,
      },
    );

    if (setting) {
      cachedSetting = JSON.parse(JSON.stringify(setting)) as ISetting;
      cacheTimestamp = Date.now();
    }

    return setting ? cachedSetting : null;
  } catch (error) {
    handleError(error);
    return null;
  }
};