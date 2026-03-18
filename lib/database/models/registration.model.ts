import { Document, Schema, Types, model, models } from "mongoose";

// -------------------- Interface --------------------
export interface IRegistration extends Document {
  _id: Types.ObjectId;

  // Student Info
  englishName: string;
  fathersName: string;
  mothersName: string;
  gender: string;
  email: string;
  number: string;
  whatsApp?: string;
  occupation?: string;
  institution?: string;
  address: string;
  photo?: string;

  // Course Reference
  course: Types.ObjectId;

  // Auto-generated Registration Number
  registrationNumber: string;

  // Status & Management
  status: "Pending" | "Ongoing" | "Completed" | "Closed";
  certificateStatus: "Not Certified" | "Certified";
  paymentAmount: number;
  paymentStatus: "Unpaid" | "Partial" | "Paid";

  // Transaction Info
  transactionId?: string; // reference from payment gateway/bank
  paymentMethod?:
    | "Cash"
    | "Card"
    | "Bank Transfer"
    | "Mobile Payment"
    | "Other";

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// -------------------- Schema --------------------
const RegistrationSchema = new Schema<IRegistration>(
  {
    englishName: { type: String, required: true, trim: true },
    fathersName: { type: String, required: true, trim: true },
    mothersName: { type: String, required: true, trim: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    email: { type: String, required: true, trim: true },
    number: { type: String, required: true, trim: true },
    whatsApp: { type: String, trim: true },
    occupation: { type: String, trim: true },
    institution: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    photo: { type: String },

    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },

    registrationNumber: { type: String, unique: true },

    // New fields
    status: {
      type: String,
      enum: ["Pending", "Ongoing", "Completed", "Closed"],
      default: "Pending",
    },
    certificateStatus: {
      type: String,
      enum: ["Not Certified", "Certified"],
      default: "Not Certified",
    },
    paymentAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Partial", "Paid"],
      default: "Unpaid",
    },
    transactionId: { type: String, trim: true },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "Bank Transfer", "Mobile Payment", "Other"],
    },
  },
  { timestamps: true },
);

// -------------------- Auto-generate Registration Number --------------------
RegistrationSchema.pre<IRegistration>("save", async function (next) {
  if (!this.registrationNumber) {
    const year = new Date().getFullYear();
    const count = await model<IRegistration>("Registration").countDocuments();
    this.registrationNumber = `REG-${year}-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

// -------------------- Model --------------------
const Registration =
  models.Registration ||
  model<IRegistration>("Registration", RegistrationSchema);

export default Registration;
