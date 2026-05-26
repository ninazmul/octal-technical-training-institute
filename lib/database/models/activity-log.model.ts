import { Document, Schema, Types, model, models } from "mongoose";

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  adminEmail: string;
  adminName: string;
  role: string;
  action: string;      // CREATE, UPDATE, DELETE, TOGGLE_STATUS, etc.
  target: string;      // Course, Coupon, Notice, etc.
  details: string;     // Text description of what was done
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    adminEmail: { type: String, required: true },
    adminName: { type: String, required: true },
    role: { type: String, required: true },
    action: { type: String, required: true },
    target: { type: String, required: true },
    details: { type: String, required: true },
  },
  { timestamps: true }
);

const ActivityLog = models.ActivityLog || model<IActivityLog>("ActivityLog", ActivityLogSchema);

export default ActivityLog;
