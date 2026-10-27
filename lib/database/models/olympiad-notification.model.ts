import { Document, Schema, Types, model, models } from "mongoose";

export interface IOlympiadNotificationLog extends Document {
  _id: Types.ObjectId;
  olympiadId: Types.ObjectId;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName?: string;
  channel: "SMS" | "EMAIL";
  type:
    | "REGISTRATION_CONFIRMATION"
    | "REMINDER_24H"
    | "REMINDER_1H"
    | "EXAM_START"
    | "RESULTS_PUBLISHED"
    | "SCHEDULE_CHANGE"
    | "CUSTOM";
  subject?: string;
  message: string;
  status: "QUEUED" | "SENT" | "FAILED";
  idempotencyKey: string;
  providerResponse?: string;
  error?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OlympiadNotificationLogSchema =
  new Schema<IOlympiadNotificationLog>(
    {
      olympiadId: {
        type: Schema.Types.ObjectId,
        ref: "Olympiad",
        required: true,
        index: true,
      },
      recipientEmail: { type: String, trim: true },
      recipientPhone: { type: String, trim: true },
      recipientName: { type: String, trim: true },
      channel: { type: String, enum: ["SMS", "EMAIL"], required: true },
      type: {
        type: String,
        enum: [
          "REGISTRATION_CONFIRMATION",
          "REMINDER_24H",
          "REMINDER_1H",
          "EXAM_START",
          "RESULTS_PUBLISHED",
          "SCHEDULE_CHANGE",
          "CUSTOM",
        ],
        required: true,
      },
      subject: { type: String },
      message: { type: String, required: true },
      status: {
        type: String,
        enum: ["QUEUED", "SENT", "FAILED"],
        default: "QUEUED",
      },
      idempotencyKey: { type: String, required: true, unique: true },
      providerResponse: { type: String },
      error: { type: String },
      sentAt: { type: Date },
    },
    { timestamps: true },
  );

OlympiadNotificationLogSchema.index({ olympiadId: 1, channel: 1, type: 1 });

const OlympiadNotificationLog =
  models.OlympiadNotificationLog ||
  model<IOlympiadNotificationLog>(
    "OlympiadNotificationLog",
    OlympiadNotificationLogSchema,
  );

export default OlympiadNotificationLog;
