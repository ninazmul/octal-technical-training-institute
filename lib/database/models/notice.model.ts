import { Document, Schema, Types, model, models } from "mongoose";

export interface INotice extends Document {
  _id: Types.ObjectId;
  title: string;
  file?: string;
  createdAt: Date; // make required, not optional
}

const NoticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true },
    file: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }, // ensures createdAt and updatedAt are always present
);

// TTL index: expire documents 45 days after creation
NoticeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 45 * 24 * 60 * 60 });

const Notice = models.Notice || model<INotice>("Notice", NoticeSchema);

export default Notice;
