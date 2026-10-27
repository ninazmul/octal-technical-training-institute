import { Document, Schema, Types, model, models } from "mongoose";

export type OlympiadStatus = "Draft" | "Published" | "Cancelled" | "Archived";

export interface IOlympiadCustomField {
  fieldName: string;
  fieldLabel: string;
  fieldType: "text" | "number" | "select";
  required: boolean;
  options?: string[];
}

export interface IOlympiad extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  banner?: string;
  category: string;
  targetClasses: string[];
  eligibility?: string;
  organizer: string;
  registrationStartDate: Date;
  registrationDeadline: Date;
  examStartDate: Date;
  examEndDate: Date;
  durationMinutes: number;
  maxCapacity?: number;
  totalMarks: number;
  passingMarks?: number;
  negativeMarking: {
    enabled: boolean;
    penaltyPerQuestion: number;
  };
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  allowBackNavigation: boolean;
  allowReview: boolean;
  showResultsImmediately: boolean;
  resultsPublishDate: Date;
  isResultsPublic: boolean;
  instructions?: string;
  rules?: string;
  prizes?: string;
  status: OlympiadStatus;
  cancellationReason?: string;
  customFields: IOlympiadCustomField[];
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomFieldSchema = new Schema<IOlympiadCustomField>(
  {
    fieldName: { type: String, required: true },
    fieldLabel: { type: String, required: true },
    fieldType: {
      type: String,
      enum: ["text", "number", "select"],
      default: "text",
    },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
  },
  { _id: false },
);

const OlympiadSchema = new Schema<IOlympiad>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    shortDescription: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    banner: { type: String },
    category: { type: String, required: true, trim: true },
    targetClasses: [{ type: String, required: true }],
    eligibility: { type: String },
    organizer: { type: String, default: "Octal Technical Training Institute" },
    registrationStartDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    examStartDate: { type: Date, required: true },
    examEndDate: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    maxCapacity: { type: Number, default: 0 }, // 0 = unlimited
    totalMarks: { type: Number, default: 100 },
    passingMarks: { type: Number, default: 40 },
    negativeMarking: {
      enabled: { type: Boolean, default: false },
      penaltyPerQuestion: { type: Number, default: 0.25 },
    },
    randomizeQuestions: { type: Boolean, default: true },
    randomizeOptions: { type: Boolean, default: true },
    allowBackNavigation: { type: Boolean, default: true },
    allowReview: { type: Boolean, default: true },
    showResultsImmediately: { type: Boolean, default: false },
    resultsPublishDate: { type: Date, required: true },
    isResultsPublic: { type: Boolean, default: true },
    instructions: { type: String },
    rules: { type: String },
    prizes: { type: String },
    status: {
      type: String,
      enum: ["Draft", "Published", "Cancelled", "Archived"],
      default: "Draft",
    },
    cancellationReason: { type: String },
    customFields: [CustomFieldSchema],
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true },
);

// Indexes for fast lookup, filtering, and ordering
OlympiadSchema.index({ status: 1, registrationStartDate: 1, registrationDeadline: 1 });
OlympiadSchema.index({ status: 1, examStartDate: 1, examEndDate: 1 });
OlympiadSchema.index({ category: 1 });
OlympiadSchema.index({ createdAt: -1 });

const Olympiad =
  models.Olympiad || model<IOlympiad>("Olympiad", OlympiadSchema);

export default Olympiad;
