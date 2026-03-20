"use server";

import { connectToDatabase } from "../database";
import { handleError } from "../utils";
import Registration from "../database/models/registration.model";
import Course from "../database/models/course.model";

// -------------------- Serialized types --------------------
export type SerializedCourse = { _id: string };

export type SerializedRegistration = {
  _id: string;
  englishName: string | null;
  fathersName: string | null;
  mothersName: string | null;
  gender: string | null;
  email: string | null;
  number: string | null;
  whatsApp: string | null;
  occupation: string | null;
  institution: string | null;
  address: string | null;
  photo: string | null;
  course: {
    _id: string;
  };
  registrationNumber: string | null;
  status: string | null;
  certificateStatus: string | null;
  paymentAmount: number | null;
  paymentStatus: string | null;
  transactionId: string | null;
  paymentMethod: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

// -------------------- Params --------------------
export type RegistrationParams = {
  englishName: string;
  fathersName: string;
  mothersName: string;
  gender: string;
  email: string;
  number: string;
  whatsApp?: string;
  occupation?: string;
  institution?: string;
  address: string;
  photo?: string;
  courseId: string; // reference to Course

  // New management fields
  status?: "Pending" | "Ongoing" | "Completed" | "Closed";
  certificateStatus?: "Not Certified" | "Certified";
  paymentAmount?: number;
  paymentStatus?: "Pending" | "Paid" | "Failed";
  transactionId?: string;
  paymentMethod?:
    | "Cash"
    | "Card"
    | "Bank Transfer"
    | "Mobile Payment"
    | "Other";
};

// -------------------- Helpers --------------------
function toStringOrNull(val: unknown): string | null {
  if (val == null) return null;
  return String(val);
}

function parseNumberOrNull(val: unknown): number | null {
  if (val == null) return null;
  if (typeof val === "number") return val;
  if (typeof val === "string" && val.trim() !== "") {
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function isPopulatedCourse(obj: unknown): obj is Record<string, unknown> {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "_id" in (obj as Record<string, unknown>)
  );
}

function toISODateOrNull(val: unknown): string | null {
  if (val == null) return null;
  const d = new Date(val as string | Date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function serializeCourse(raw: unknown): SerializedCourse {
  if (raw == null) return { _id: "" }; // fallback _id
  if (typeof raw === "string") return { _id: raw };
  if (isPopulatedCourse(raw))
    return { _id: String((raw as Record<string, unknown>)["_id"] ?? "") };
  return { _id: "" }; // fallback
}

function serializeRegistration(
  raw: Record<string, unknown>,
): SerializedRegistration {
  return {
    _id: String(raw["_id"] ?? ""),
    englishName: toStringOrNull(raw["englishName"]),
    fathersName: toStringOrNull(raw["fathersName"]),
    mothersName: toStringOrNull(raw["mothersName"]),
    gender: toStringOrNull(raw["gender"]),
    email: toStringOrNull(raw["email"]),
    number: toStringOrNull(raw["number"]),
    whatsApp: toStringOrNull(raw["whatsApp"]),
    occupation: toStringOrNull(raw["occupation"]),
    institution: toStringOrNull(raw["institution"]),
    address: toStringOrNull(raw["address"]),
    photo: toStringOrNull(raw["photo"]),
    course: serializeCourse(raw["course"]),
    registrationNumber: toStringOrNull(raw["registrationNumber"]),
    status: toStringOrNull(raw["status"]),
    certificateStatus: toStringOrNull(raw["certificateStatus"]),
    paymentAmount: parseNumberOrNull(raw["paymentAmount"]),
    paymentStatus: toStringOrNull(raw["paymentStatus"]),
    transactionId: toStringOrNull(raw["transactionId"]),
    paymentMethod: toStringOrNull(raw["paymentMethod"]),
    createdAt: toISODateOrNull(raw["createdAt"]),
    updatedAt: toISODateOrNull(raw["updatedAt"]),
  };
}

// add near top of file (after helpers)
const STATUS_VALUES = ["Pending", "Ongoing", "Completed", "Closed"] as const;
const CERT_VALUES = ["Not Certified", "Certified"] as const;
const PAYMENT_STATUS_VALUES = ["Pending", "Paid", "Failed"] as const;
const PAYMENT_METHODS = [
  "Cash",
  "Card",
  "Bank Transfer",
  "Mobile Payment",
  "Other",
] as const;

function buildValidatedUpdate(
  data: Partial<RegistrationParams>,
): Partial<Record<string, unknown>> {
  const out: Partial<Record<string, unknown>> = {};

  // Status, certificate, payment fields
  if (data.status !== undefined && STATUS_VALUES.includes(data.status))
    out.status = data.status;

  if (
    data.certificateStatus !== undefined &&
    CERT_VALUES.includes(data.certificateStatus)
  )
    out.certificateStatus = data.certificateStatus;

  if (
    data.paymentStatus !== undefined &&
    PAYMENT_STATUS_VALUES.includes(data.paymentStatus)
  )
    out.paymentStatus = data.paymentStatus;

  if (
    data.paymentMethod !== undefined &&
    PAYMENT_METHODS.includes(data.paymentMethod)
  )
    out.paymentMethod = data.paymentMethod;

  if (data.paymentAmount !== undefined) {
    const n = Number(data.paymentAmount);
    if (Number.isFinite(n) && n >= 0) out.paymentAmount = n;
  }

  if (data.transactionId !== undefined) out.transactionId = data.transactionId;

  // Add editable personal fields from modal
  const editableFields = [
    "englishName",
    "fathersName",
    "mothersName",
    "gender",
    "email",
    "number",
    "whatsApp",
    "occupation",
    "institution",
    "address",
    "photo",
  ] as const;

  editableFields.forEach((key) => {
    if (data[key] !== undefined) out[key] = data[key];
  });

  return out;
}

// -------------------- Create Registration --------------------
export const createPendingRegistration = async (
  data: RegistrationParams,
): Promise<SerializedRegistration | undefined> => {
  try {
    await connectToDatabase();

    // Ensure course exists
    const course = await Course.findById(data.courseId);
    if (!course) throw new Error("Course not found");

    // Create registration (registrationNumber auto-generated in model)
    const created = await Registration.create({
      englishName: data.englishName,
      fathersName: data.fathersName,
      mothersName: data.mothersName,
      gender: data.gender,
      email: data.email,
      number: data.number,
      whatsApp: data.whatsApp,
      occupation: data.occupation,
      institution: data.institution,
      address: data.address,
      photo: data.photo,
      course: course._id,
      status: data.status ?? "Pending",
      certificateStatus: data.certificateStatus ?? "Not Certified",
      paymentAmount: data.paymentAmount ?? 0,
      paymentStatus: data.paymentStatus ?? "Pending",
      transactionId: data.transactionId ?? undefined,
      paymentMethod: data.paymentMethod ?? undefined,
    });

    // Serialize and return
    const leanObj = created.toObject
      ? (created.toObject() as Record<string, unknown>)
      : (created as unknown as Record<string, unknown>);
    return serializeRegistration(leanObj);
  } catch (error) {
    handleError(error);
  }
};

export const confirmRegistrationPayment = async (
  registrationId: string,
  trxData: {
    transactionId: string;
    paymentMethod?: string;
  },
): Promise<SerializedRegistration | undefined> => {
  try {
    await connectToDatabase();

    const registration = await Registration.findById(registrationId);
    if (!registration) throw new Error("Registration not found");

    // 🔒 Idempotency
    if (registration.paymentStatus === "Paid") {
      return serializeRegistration(registration.toObject());
    }

    // 🔥 Get course
    const course = await Course.findById(registration.course);
    if (!course) throw new Error("Course not found");

    const currentSeats = course.seats ? parseInt(course.seats, 10) : 0;

    if (currentSeats <= 0) {
      throw new Error("No seats available");
    }

    // ✅ Reduce seat ONLY AFTER PAYMENT
    course.seats = String(currentSeats - 1);
    await course.save();

    // ✅ Update registration
    registration.paymentStatus = "Paid";
    registration.transactionId = trxData.transactionId;
    registration.paymentMethod =
      (trxData.paymentMethod) ?? "Mobile Payment";

    await registration.save();

    return serializeRegistration(registration.toObject());
  } catch (error) {
    handleError(error);
  }
};

// -------------------- Get All Registrations --------------------
export const getRegistrations = async (): Promise<SerializedRegistration[]> => {
  try {
    await connectToDatabase();
    const raw = await Registration.find()
      .populate("course", "title category batch price discountPrice")
      .lean<Record<string, unknown>[]>();

    return raw.map((r) => serializeRegistration(r));
  } catch (error) {
    handleError(error);
    return [];
  }
};

// -------------------- Get Registration By ID --------------------
export const getRegistrationById = async (
  registrationId: string,
): Promise<SerializedRegistration | null> => {
  try {
    await connectToDatabase();
    const raw = await Registration.findById(registrationId)
      .populate("course", "title category batch price discountPrice")
      .lean<Record<string, unknown>>();

    if (!raw) return null;
    return serializeRegistration(raw);
  } catch (error) {
    handleError(error);
    return null;
  }
};

// -------------------- Get Registrations By Course --------------------
export const getRegistrationsByCourse = async (
  courseId: string,
): Promise<SerializedRegistration[]> => {
  try {
    await connectToDatabase();
    const raw = await Registration.find({ course: courseId })
      .populate("course", "title category batch")
      .lean<Record<string, unknown>[]>();

    return raw.map((r) => serializeRegistration(r));
  } catch (error) {
    handleError(error);
    return [];
  }
};

// -------------------- Get Registration By Registration Number --------------------
export const getRegistrationByNumber = async (
  registrationNumber: string,
): Promise<SerializedRegistration | null> => {
  try {
    await connectToDatabase();

    const raw = await Registration.findOne({ registrationNumber })
      .populate("course", "title category batch price discountPrice")
      .lean<Record<string, unknown>>();

    if (!raw) throw new Error("Registration not found");

    return serializeRegistration(raw);
  } catch (error) {
    handleError(error);
    return null;
  }
};

// -------------------- Get Registration By Email --------------------
export const getRegistrationByEmail = async (
  email: string,
): Promise<SerializedRegistration | null> => {
  try {
    await connectToDatabase();

    const raw = await Registration.findOne({ email })
      .populate("course", "title category batch price discountPrice")
      .lean<Record<string, unknown>>();

    if (!raw) return null;

    return serializeRegistration(raw);
  } catch (error) {
    handleError(error);
    return null;
  }
};

// -------------------- Update Registration --------------------
export const updateRegistration = async (
  registrationId: string,
  data: Partial<RegistrationParams>,
): Promise<SerializedRegistration | undefined> => {
  try {
    await connectToDatabase();

    const update = buildValidatedUpdate(data);
    if (Object.keys(update).length === 0) {
      throw new Error("No valid fields to update");
    }

    const updated = await Registration.findByIdAndUpdate(
      registrationId,
      { $set: update },
      { new: true, runValidators: true },
    )
      .populate("course", "title")
      .lean<Record<string, unknown>>();

    if (!updated) throw new Error("Registration not found");
    return serializeRegistration(updated);
  } catch (error) {
    handleError(error);
  }
};

// -------------------- Delete Registration --------------------
export const deleteRegistration = async (
  registrationId: string,
): Promise<{ message: string } | undefined> => {
  try {
    await connectToDatabase();
    const deleted =
      await Registration.findByIdAndDelete(registrationId).lean<
        Record<string, unknown>
      >();
    if (!deleted) throw new Error("Registration not found");
    return { message: "Registration deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
