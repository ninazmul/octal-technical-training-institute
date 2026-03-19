import { Document, Schema, Types, model, models } from "mongoose";

export interface INotice extends Document {
  _id: Types.ObjectId;
  title: string;
  file: string;
  createdAt?: Date;
}

const NoticeSchema = new Schema({
  title: { type: String, required: true },
  file: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Notice = models.Notice || model("Notice", NoticeSchema);

export default Notice;
