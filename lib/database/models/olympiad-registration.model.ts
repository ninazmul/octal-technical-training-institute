import { Document, Schema, Types, model, models } from "mongoose";

export interface IOlympiadRegistration extends Document {
  _id: Types.ObjectId;
  olympiadId: Types.ObjectId;
  registrationNumber: string;
  studentName: string;
  email: string;
  phoneNumber: string;
  institution: string;
  grade: string;
  rollNumber: string;
  district?: string;
  dateOfBirth?: string;
  guardianPhone?: string;
  photo?: string;
  customData?: Record<string, any>;
  clerkUserId?: string;
  status: "Confirmed" | "Cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OlympiadRegistrationSchema = new Schema<IOlympiadRegistration>(
  {
    olympiadId: {
      type: Schema.Types.ObjectId,
      ref: "Olympiad",
      required: true,
      index: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    studentName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phoneNumber: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    dateOfBirth: { type: String, trim: true },
    guardianPhone: { type: String, trim: true },
    photo: { type: String, trim: true },
    customData: { type: Schema.Types.Mixed },
    clerkUserId: { type: String, index: true },
    status: {
      type: String,
      enum: ["Confirmed", "Cancelled"],
      default: "Confirmed",
    },
  },
  { timestamps: true },
);

// Indexes: prevent duplicate registration per olympiad per student
OlympiadRegistrationSchema.index(
  { olympiadId: 1, email: 1 },
  { unique: true, partialFilterExpression: { status: "Confirmed" } },
);
OlympiadRegistrationSchema.index({ olympiadId: 1, phoneNumber: 1 });
OlympiadRegistrationSchema.index({ olympiadId: 1, status: 1 });

const OlympiadRegistration =
  models.OlympiadRegistration ||
  model<IOlympiadRegistration>(
    "OlympiadRegistration",
    OlympiadRegistrationSchema,
  );

export default OlympiadRegistration;
