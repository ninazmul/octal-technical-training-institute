import { Document, Schema, Types, model, models } from "mongoose";

// -------------------- Interface --------------------
export interface ICourse extends Document {
  _id: Types.ObjectId;
  title: string;
  photo: string;
  description: string;
  prerequisites?: string[];
  modules: {
    title: string;
    content: string;
  }[];
  price: number;
  discountPrice?: number;
  seats: number;
  isActive: boolean;
  batch?: string;
  sku?: string;
  courseStartDate?: string;
  registrationDeadline?: string;
  schedule?: {
    day?: string;
    start?: string;
    end?: string;
  }[];
  duration?: string;
  sessions?: string;

  createdAt: Date;
  updatedAt: Date;
}

// -------------------- Schema --------------------
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
      },
    ],
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    seats: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    batch: { type: String },
    sku: { type: String, unique: true, sparse: true },
    courseStartDate: { type: String },
    registrationDeadline: { type: String },
    schedule: [
      {
        day: { type: String },
        start: { type: String },
        end: { type: String },
      },
    ],
    duration: { type: String },
    sessions: { type: String },
  },
  { timestamps: true },
);

// -------------------- Model --------------------
const Course = models.Course || model<ICourse>("Course", CourseSchema);

export default Course;
