import { Document, Schema, Types, model, models } from "mongoose";

export interface IProduct extends Document {
  _id: Types.ObjectId;
  title: string;
  mainImage: string;
  price: number;
  oldPrice?: number;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    mainImage: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Product = models.Product || model("Product", ProductSchema);

export default Product;
