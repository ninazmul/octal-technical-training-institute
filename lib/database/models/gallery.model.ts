import { Document, Schema, Types, model, models } from "mongoose";

export interface IGallery extends Document {
  _id: Types.ObjectId;
  title: string;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const GallerySchema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    image: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

const Gallery = models.Gallery || model("Gallery", GallerySchema);

export default Gallery;