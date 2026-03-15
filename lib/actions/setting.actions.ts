"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Setting, { ISetting } from "../database/models/setting.model";
import { SettingParams } from "@/types";
import { Types } from "mongoose";

// ===== Default template
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
  ourMentors: { badge: "", title: "", description: "", mentors: [] },
  faqs: { badge: "", title: "", description: "", items: [] },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ===== In-memory cache variable
let cachedSetting: ISetting | null = null;

// ===== GET SETTING (with simple in-memory cache)
export const getSetting = async (): Promise<ISetting> => {
  try {
    // Return cached copy if available
    if (cachedSetting) return cachedSetting;

    await connectToDatabase();

    let setting = await Setting.findOne().lean<ISetting>();

    if (!setting) {
      // Create default setting in DB
      setting = await Setting.create(DEFAULT_SETTING);
    }

    // Store in cache
    cachedSetting = JSON.parse(JSON.stringify(setting)) as ISetting;
    return cachedSetting;
  } catch (error) {
    handleError(error);
    throw new Error("Unable to fetch setting");
  }
};

// ===== CREATE SETTING (only if none exists)
export const createSetting = async (
  params: SettingParams,
): Promise<ISetting | null> => {
  try {
    await connectToDatabase();

    const existing = await Setting.findOne().lean<ISetting>();
    if (existing) throw new Error("Settings already exist");

    const newSetting = await Setting.create(params);

    // Update cache
    cachedSetting = JSON.parse(JSON.stringify(newSetting)) as ISetting;
    return cachedSetting;
  } catch (error) {
    handleError(error);
    return null;
  }
};

// ===== UPSERT SETTING (update if exists, else create)
export const upsertSetting = async (
  updateData: Partial<SettingParams>,
): Promise<ISetting | null> => {
  try {
    await connectToDatabase();

    const setting = await Setting.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true, runValidators: true, lean: true },
    );

    if (!setting) return null;

    // Update cache
    cachedSetting = JSON.parse(JSON.stringify(setting)) as ISetting;
    return cachedSetting;
  } catch (error) {
    handleError(error);
    return null;
  }
};
