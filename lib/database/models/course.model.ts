import { Document, Schema, Types, model, models } from "mongoose";

// -------------------- Interface --------------------
export interface ICourse extends Document {
  _id: Types.ObjectId;

  // Basic Info
  title: string;
  category: string;
  mode: "Online" | "Offline";
  photo: string;
  description: string;
  prerequisites: string[];

  // Course Content
  modules: {
    title: string;
    content: string;
  }[];

  // Pricing & Seats
  price: number;
  discountPrice?: number;
  seats: number;
  certification?: string;

  // Meta Info
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

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseSafe {
  _id: string;
  title: string;
  category: string;
  mode: "Online" | "Offline";
  photo: string;
  description: string;
  prerequisites?: string[];
  modules: { title: string; content: string }[];
  price: number;
  discountPrice?: number;
  seats?: number;
  certification?: string;
  isActive?: boolean;
  batch?: string;
  sku?: string;
  courseStartDate?: string;
  registrationDeadline?: string;
  schedule?: { day?: string; start?: string; end?: string }[];
  duration?: string;
  sessions?: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------- Schema --------------------
const CourseSchema = new Schema<ICourse>(
  {
    // Basic Info
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    mode: {
      type: String,
      enum: ["Online", "Offline"],
      default: "Online",
      required: true,
    },
    photo: { type: String, required: true },
    description: { type: String, required: true },
    prerequisites: { type: [String], default: [] },

    // Course Content
    modules: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],

    // Pricing & Seats
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    seats: { type: Number, required: true, default: 0 },
    certification: { type: String },

    // Meta Info
    isActive: { type: Boolean, default: true },
    batch: { type: String, trim: true },
    sku: { type: String, unique: true, sparse: true, trim: true },
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
