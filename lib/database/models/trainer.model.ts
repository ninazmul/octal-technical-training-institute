import { Document, Schema, Types, model, models } from "mongoose";

export interface ITrainer extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  address: string;
  cv?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TrainerSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    cv: { type: String },
  },
  { timestamps: true },
);

const Trainer = models.Trainer || model("Trainer", TrainerSchema);

export default Trainer;
