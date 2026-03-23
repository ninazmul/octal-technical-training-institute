import { Document, Schema, Types, model, models } from "mongoose";

// -------------------- Interface --------------------
export interface ISuccessStories extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  photo: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface ISuccessStoriesSafe {
  _id: string;
  title: string;
  description: string;
  photo: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------- Schema --------------------
const SuccessStoriesSchema = new Schema<ISuccessStories>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    photo: { type: String, required: true },
  },
  { timestamps: true },
);

// -------------------- Model --------------------
const SuccessStories =
  models.SuccessStories ||
  model<ISuccessStories>("SuccessStories", SuccessStoriesSchema);

export default SuccessStories;
