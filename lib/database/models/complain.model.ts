import { Document, Schema, Types, model, models } from "mongoose";

export interface IComplain extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  details: string;
  proof?: string;

  createdAt: Date;
  updatedAt: Date;
}

const ComplainSchema = new Schema<IComplain>(
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
    details: {
      type: String,
      required: true,
      trim: true,
    },
    proof: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Complain =
  models.Complain || model<IComplain>("Complain", ComplainSchema);

export default Complain;
