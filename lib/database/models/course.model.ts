import { Document, Schema, Types, model, models } from "mongoose";

// Interface for Course
export interface ICourse extends Document {
  _id: Types.ObjectId;
  title: string;
  photo: string;
  description: string;
  prerequisites?: string[];
  modules: {
    title: string;
    content: string;
    videoUrl?: string;
  }[];
  price: number;
  discountPrice?: number;
  seats: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for Course
const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    photo: { type: String, required: true },
    description: { type: String, required: true },
    prerequisites: { type: [String], default: [] },
    modules: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        videoUrl: { type: String },
      },
    ],
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    seats: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Model creation
const Course = models.Course || model<ICourse>("Course", CourseSchema);

export default Course;
