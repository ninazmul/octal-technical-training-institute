"use server";

import { connectToDatabase } from "../database";
import { handleError } from "../utils";
import Registration, {
  IRegistration,
} from "../database/models/registration.model";
import Course from "../database/models/course.model";

// -------------------- Params --------------------
export type RegistrationParams = {
  englishName: string;
  bengaliName: string;
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
};

// -------------------- Create Registration --------------------
export const createRegistration = async (
  data: RegistrationParams,
): Promise<IRegistration | undefined> => {
  try {
    await connectToDatabase();

    // Ensure course exists
    const course = await Course.findById(data.courseId);
    if (!course) throw new Error("Course not found");

    // Registration number is auto-generated in the model pre-save hook
    const newRegistration = await Registration.create({
      ...data,
      course: course._id,
    });

    return newRegistration.toObject() as IRegistration;
  } catch (error) {
    handleError(error);
  }
};

// -------------------- Get All Registrations --------------------
export const getRegistrations = async (): Promise<IRegistration[]> => {
  try {
    await connectToDatabase();
    const registrations = await Registration.find()
      .populate("course", "title category batch price discountPrice")
      .lean<IRegistration[]>();

    // Each registration will include its auto-generated registrationNumber
    return registrations;
  } catch (error) {
    handleError(error);
    return [];
  }
};

// -------------------- Get Registration By ID --------------------
export const getRegistrationById = async (
  registrationId: string,
): Promise<IRegistration | null> => {
  try {
    await connectToDatabase();
    const registration = await Registration.findById(registrationId)
      .populate("course", "title category batch price discountPrice")
      .lean<IRegistration>();

    return registration || null;
  } catch (error) {
    handleError(error);
    return null;
  }
};

// -------------------- Get Registrations By Course --------------------
export const getRegistrationsByCourse = async (
  courseId: string,
): Promise<IRegistration[]> => {
  try {
    await connectToDatabase();
    const registrations = await Registration.find({ course: courseId })
      .populate("course", "title category batch")
      .lean<IRegistration[]>();

    return registrations;
  } catch (error) {
    handleError(error);
    return [];
  }
};

// -------------------- Get Registration By Registration Number --------------------
export const getRegistrationByNumber = async (
  registrationNumber: string,
): Promise<IRegistration | null> => {
  try {
    await connectToDatabase();

    const registration = await Registration.findOne({ registrationNumber })
      .populate("course", "title category batch price discountPrice")
      .lean<IRegistration>();

    if (!registration) throw new Error("Registration not found");

    return registration;
  } catch (error) {
    handleError(error);
    return null;
  }
};

// -------------------- Update Registration --------------------
export const updateRegistration = async (
  registrationId: string,
  data: Partial<RegistrationParams>,
): Promise<IRegistration | undefined> => {
  try {
    await connectToDatabase();
    const updatedRegistration = await Registration.findByIdAndUpdate(
      registrationId,
      data,
      { new: true, runValidators: true },
    ).lean<IRegistration>();

    if (!updatedRegistration) throw new Error("Registration not found");
    return updatedRegistration;
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
    const deletedRegistration =
      await Registration.findByIdAndDelete(registrationId).lean();
    if (!deletedRegistration) throw new Error("Registration not found");
    return { message: "Registration deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
