"use server";

import { revalidatePath } from "next/cache";
import { handleError, sanitizeSetting } from "../utils";
import { connectToDatabase } from "../database";
import { logActivity } from "./activity-log.actions";
import Setting, {
  ISetting,
  ISettingSafe,
} from "../database/models/setting.model";
import { SettingParams } from "@/types";
import { Types } from "mongoose";

// ====== CREATE SETTING (only if none exists)
export const createSetting = async (
  params: SettingParams,
): Promise<ISettingSafe | null> => {
  try {
    await connectToDatabase();

    const existing = await Setting.findOne().lean<ISetting>();
    if (existing) {
      throw new Error("Settings already exist");
    }

    const newSetting = await Setting.create({
      ...params,
      popups: validatePopupLinks(params.popups),
    });
    return sanitizeSetting(newSetting.toObject() as ISetting);
  } catch (error) {
    handleError(error);
    return null;
  }
};

// ----- In-memory cache -----
let cachedSetting: ISettingSafe | null = null;
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
  popup: { image: "" },
  popups: [],
  certificate: "",
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
  partners: {
    badge: "",
    title: "",
    description: "",
    logos: [],
  },
  faqs: { badge: "", title: "", description: "", items: [] },
  links: [],
  maintenanceMode: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function validatePopupLinks(popups: SettingParams["popups"] = []) {
  return (popups || []).map((popup) => {
    const link = popup.link?.trim() || "";
    const safe = !link ||
      (/^https?:\/\//i.test(link) && !/[\\\u0000-\u001f]/.test(link)) ||
      (link.startsWith("/") && !link.startsWith("//") && !/[\\\u0000-\u001f]/.test(link));
    if (!safe) throw new Error("Popup links must use http(s) or a site-relative path.");
    return { ...popup, link };
  });
}

// ====== GET SETTING WITH CACHE ======
export const getSetting = async (): Promise<ISettingSafe | null> => {
  try {
    const now = Date.now();

    if (cachedSetting && now - cacheTimestamp < CACHE_TTL) {
      return JSON.parse(JSON.stringify(cachedSetting));
    }

    await connectToDatabase();

    let setting = await Setting.findOne().lean<ISetting>();

    if (!setting) {
      setting = await Setting.create(DEFAULT_SETTING);
    }

    cachedSetting = sanitizeSetting(setting);
    cacheTimestamp = now;

    return JSON.parse(JSON.stringify(cachedSetting));
  } catch (error) {
    handleError(error);
    return null; // matches Promise<ISettingSafe | null>
  }
};

// ====== UPSERT SETTING WITH CACHE REFRESH ======
export const upsertSetting = async (
  updateData: Partial<SettingParams>,
): Promise<ISettingSafe | null> => {
  try {
    await connectToDatabase();

    const safeUpdateData: Partial<SettingParams> = { ...updateData };
    if (updateData.popups) {
      safeUpdateData.popups = validatePopupLinks(updateData.popups);
      safeUpdateData.popup = { image: "", link: "", offerStartDate: "", offerEndDate: "" };
    }

    const setting = await Setting.findOneAndUpdate(
      {},
      { $set: safeUpdateData },
      {
        new: true,
        upsert: true,
        runValidators: true,
        lean: true, // returns plain object
      },
    );

    if (!setting) {
      return null;
    }

    await logActivity("UPDATE", "Setting", "Updated landing page settings configuration");

    // setting here is a plain object, not ISetting
    cachedSetting = JSON.parse(
      JSON.stringify(sanitizeSetting(setting as unknown as ISetting)),
    );
    cacheTimestamp = Date.now();

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return JSON.parse(JSON.stringify(cachedSetting));
  } catch (error) {
    handleError(error);
    return null;
  }
};
