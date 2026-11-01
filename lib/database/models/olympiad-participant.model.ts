import { Document, Schema, Types, model, models } from "mongoose";

/**
 * A single olympiad a participant has appeared in. Stored as a lightweight
 * reference so the directory can survive even if the source olympiad or its
 * registrations are later deleted.
 */
export interface IParticipantSource {
  olympiadId: Types.ObjectId;
  olympiadTitle: string;
  registrationNumber: string;
  participatedAt: Date;
}

export interface IOlympiadParticipant extends Document {
  _id: Types.ObjectId;
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
  sources: IParticipantSource[];
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSourceSchema = new Schema<IParticipantSource>(
  {
    olympiadId: { type: Schema.Types.ObjectId, ref: "Olympiad" },
    olympiadTitle: { type: String, trim: true },
    registrationNumber: { type: String, trim: true },
    participatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const OlympiadParticipantSchema = new Schema<IOlympiadParticipant>(
  {
    studentName: { type: String, required: true, trim: true },
    // Email is the natural identity key: one directory entry per person.
    email: { type: String, required: true, trim: true, lowercase: true },
    phoneNumber: { type: String, trim: true },
    institution: { type: String, trim: true },
    grade: { type: String, trim: true },
    rollNumber: { type: String, trim: true },
    district: { type: String, trim: true },
    dateOfBirth: { type: String, trim: true },
    guardianPhone: { type: String, trim: true },
    photo: { type: String, trim: true },
    sources: { type: [ParticipantSourceSchema], default: [] },
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

OlympiadParticipantSchema.index({ email: 1 }, { unique: true });
OlympiadParticipantSchema.index({ studentName: 1 });
OlympiadParticipantSchema.index({ institution: 1 });
OlympiadParticipantSchema.index({ createdAt: -1 });

const OlympiadParticipant =
  models.OlympiadParticipant ||
  model<IOlympiadParticipant>("OlympiadParticipant", OlympiadParticipantSchema);

export default OlympiadParticipant;
