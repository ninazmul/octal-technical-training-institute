import { Document, Schema, Types, model, models } from "mongoose";

export interface IApply extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  course: string;

  createdAt: Date;
  updatedAt: Date;
}

const ApplySchema = new Schema<IApply>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Apply = models.Apply || model<IApply>("Apply", ApplySchema);

export default Apply;
