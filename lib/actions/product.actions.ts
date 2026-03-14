"use server";

import { connectToDatabase } from "../database";
import { handleError } from "../utils";
import Product, { IProduct } from "../database/models/product.model";

export type ProductParams = {
  title: string;
  mainImage: string;
  price: number;
  oldPrice?: number;
  stock?: number;
  isActive?: boolean;
};

// -------------------- CREATE --------------------
export const createProduct = async (data: ProductParams) => {
  try {
    await connectToDatabase();
    const newProduct = await Product.create(data);
    return JSON.parse(JSON.stringify(newProduct)) as IProduct;
  } catch (error) {
    handleError(error);
  }
};

// -------------------- GET ALL --------------------
// Get all products (both active & inactive)
export const getAllProducts = async () => {
  try {
    await connectToDatabase();
    const products = await Product.find({}).lean();
    return JSON.parse(JSON.stringify(products)) as IProduct[];
  } catch (error) {
    handleError(error);
  }
};

// -------------------- GET ONLY ACTIVE --------------------
export const getActiveProducts = async () => {
  try {
    await connectToDatabase();
    const products = await Product.find({ isActive: true }).lean();
    return JSON.parse(JSON.stringify(products)) as IProduct[];
  } catch (error) {
    handleError(error);
  }
};

// -------------------- GET BY ID --------------------
export const getProductById = async (productId: string) => {
  try {
    await connectToDatabase();
    const product = await Product.findById(productId).lean();
    if (!product) throw new Error("Product not found");
    return JSON.parse(JSON.stringify(product)) as IProduct;
  } catch (error) {
    handleError(error);
  }
};

// -------------------- UPDATE --------------------
export const updateProduct = async (
  productId: string,
  data: Partial<ProductParams>,
) => {
  try {
    await connectToDatabase();
    const updatedProduct = await Product.findByIdAndUpdate(productId, data, {
      new: true,
    }).lean();
    if (!updatedProduct) throw new Error("Product not found");
    return JSON.parse(JSON.stringify(updatedProduct)) as IProduct;
  } catch (error) {
    handleError(error);
  }
};

// -------------------- TOGGLE ACTIVE --------------------
export const toggleProductStatus = async (productId: string) => {
  try {
    await connectToDatabase();
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    product.isActive = !product.isActive;
    await product.save();

    return JSON.parse(JSON.stringify(product)) as IProduct;
  } catch (error) {
    handleError(error);
  }
};

// -------------------- DELETE --------------------
export const deleteProduct = async (productId: string) => {
  try {
    await connectToDatabase();
    const deletedProduct = await Product.findByIdAndDelete(productId).lean();
    if (!deletedProduct) throw new Error("Product not found");

    return { message: "Product deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
