import { Document, Schema, Types, model, models } from "mongoose";

export interface IAttemptAnswer {
  questionId: Types.ObjectId;
  selectedOptions?: string[];
  textAnswer?: string;
  isMarkedForReview?: boolean;
  savedAt: Date;
  marksAwarded?: number;
  isCorrect?: boolean;
  manualFeedback?: string;
}

export interface IOlympiadAttempt extends Document {
  _id: Types.ObjectId;
  olympiadId: Types.ObjectId;
  registrationId: Types.ObjectId;
  studentEmail: string;
  studentName: string;
  studentInstitution?: string;
  studentGrade?: string;
  startedAt: Date;
  effectiveDeadline: Date;
  submittedAt?: Date;
  status: "in_progress" | "submitted" | "timed_out" | "evaluated";
  questionOrder: string[]; // Snapshot of question IDs in assigned sequence
  answers: IAttemptAnswer[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  requiresManualGrading: boolean;
  manualGradingCompleted: boolean;
  gradedBy?: string;
  gradedAt?: Date;
  rank?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AttemptAnswerSchema = new Schema<IAttemptAnswer>(
  {
    questionId: { type: Schema.Types.ObjectId, required: true },
    selectedOptions: [{ type: String }],
    textAnswer: { type: String },
    isMarkedForReview: { type: Boolean, default: false },
    savedAt: { type: Date, default: Date.now },
    marksAwarded: { type: Number },
    isCorrect: { type: Boolean },
    manualFeedback: { type: String },
  },
  { _id: false },
);

const OlympiadAttemptSchema = new Schema<IOlympiadAttempt>(
  {
    olympiadId: {
      type: Schema.Types.ObjectId,
      ref: "Olympiad",
      required: true,
      index: true,
    },
    registrationId: {
      type: Schema.Types.ObjectId,
      ref: "OlympiadRegistration",
      required: true,
      index: true,
    },
    studentEmail: { type: String, required: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    studentInstitution: { type: String, trim: true },
    studentGrade: { type: String, trim: true },
    startedAt: { type: Date, required: true },
    effectiveDeadline: { type: Date, required: true },
    submittedAt: { type: Date },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "timed_out", "evaluated"],
      default: "in_progress",
    },
    questionOrder: [{ type: String }],
    answers: [AttemptAnswerSchema],
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    unansweredCount: { type: Number, default: 0 },
    requiresManualGrading: { type: Boolean, default: false },
    manualGradingCompleted: { type: Boolean, default: false },
    gradedBy: { type: String },
    gradedAt: { type: Date },
    rank: { type: Number },
  },
  { timestamps: true },
);

// One attempt per registration per olympiad
OlympiadAttemptSchema.index(
  { olympiadId: 1, registrationId: 1 },
  { unique: true },
);
OlympiadAttemptSchema.index({ olympiadId: 1, status: 1 });
OlympiadAttemptSchema.index({ olympiadId: 1, totalScore: -1, submittedAt: 1 });
OlympiadAttemptSchema.index({ studentEmail: 1 });

const OlympiadAttempt =
  models.OlympiadAttempt ||
  model<IOlympiadAttempt>("OlympiadAttempt", OlympiadAttemptSchema);

export default OlympiadAttempt;
