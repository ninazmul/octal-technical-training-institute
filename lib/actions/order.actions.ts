"use server";

import { Types } from "mongoose";
import { connectToDatabase } from "../database";
import { handleError } from "../utils";
import Product from "../database/models/product.model";
import Order, { IOrder } from "../database/models/order.model";

export type CreateOrderInput = {
  productId: string;
  quantity?: number;

  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;

  deliveryFee?: number; // add this
};

export type UpdateOrderInput = Partial<CreateOrderInput> & {
  orderStatus?:
    | "Pending"
    | "Confirmed"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "Returned";
  totalPrice?: number; // admin override
};

// --- CREATE ORDER ---
export const createOrder = async (
  data: CreateOrderInput,
): Promise<IOrder | undefined> => {
  try {
    await connectToDatabase();

    const {
      productId,
      quantity = 1,
      customerName,
      phone,
      address,
      city,
      notes,
    } = data;

    if (!Types.ObjectId.isValid(productId))
      throw new Error("Invalid product ID");
    if (quantity < 1) throw new Error("Quantity must be at least 1");

    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");
    if (!product.isActive) throw new Error("Product is not available");
    if (product.stock < quantity) throw new Error("Not enough stock available");

    const order = await Order.create({
      product: product._id,
      productTitle: product.title,
      productImage: product.mainImage,
      unitPrice: product.price,
      quantity,
      totalPrice: product.price * quantity + (data.deliveryFee || 0), // ✅ include delivery fee
      customerName,
      phone,
      address,
      city,
      notes,
    });

    // Reduce stock
    product.stock -= quantity;
    await product.save();

    return JSON.parse(JSON.stringify(order)) as IOrder;
  } catch (error) {
    handleError(error);
  }
};

// --- GET ALL ORDERS ---
export const getAllOrders = async (): Promise<IOrder[] | undefined> => {
  try {
    await connectToDatabase();

    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(orders)) as IOrder[];
  } catch (error) {
    handleError(error);
  }
};

// --- GET ORDER BY ID ---
export const getOrderById = async (
  id: string | Types.ObjectId,
): Promise<IOrder | null> => {
  try {
    await connectToDatabase();

    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid order ID");

    const order = await Order.findById(id).lean();
    return order ? (JSON.parse(JSON.stringify(order)) as IOrder) : null;
  } catch (error) {
    handleError(error);
    return null;
  }
};

// --- UPDATE ORDER ---
export const updateOrder = async (
  id: string | Types.ObjectId,
  data: UpdateOrderInput,
): Promise<IOrder | undefined> => {
  try {
    await connectToDatabase();

    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid order ID");

    const order = await Order.findById(id);
    if (!order) throw new Error("Order not found");

    const deliveryFee = data.deliveryFee ?? 0;

    // --- HANDLE PRODUCT / QUANTITY UPDATE ---
    if (data.productId || data.quantity !== undefined) {
      const prevProduct = await Product.findById(order.product);
      if (!prevProduct) throw new Error("Previous product not found");

      const newProductId = data.productId ?? order.product.toString();
      const newProduct = await Product.findById(newProductId);
      if (!newProduct || !newProduct.isActive)
        throw new Error("Product not available");

      const newQuantity = data.quantity ?? order.quantity;

      // Restore previous product stock
      prevProduct.stock += order.quantity;
      await prevProduct.save();

      // Ensure new product has enough stock
      if (newProduct.stock < newQuantity)
        throw new Error("Insufficient stock for update");

      // Deduct new product stock
      newProduct.stock -= newQuantity;
      await newProduct.save();

      // Update product info in order
      order.product = newProduct._id;
      order.productTitle = newProduct.title;
      order.productImage = newProduct.mainImage;
      order.unitPrice = newProduct.price;
      order.quantity = newQuantity;

      // Auto-calculate totalPrice if admin did not override
      if (data.totalPrice === undefined) {
        order.totalPrice = newProduct.price * newQuantity + deliveryFee;
      }
    }

    // --- UPDATE CUSTOMER & ADMIN FIELDS ---
    if (data.customerName !== undefined) order.customerName = data.customerName;
    if (data.phone !== undefined) order.phone = data.phone;
    if (data.address !== undefined) order.address = data.address;
    if (data.city !== undefined) order.city = data.city;
    if (data.notes !== undefined) order.notes = data.notes;
    if (data.orderStatus !== undefined) order.orderStatus = data.orderStatus;

    // Admin override for totalPrice
    if (data.totalPrice !== undefined) order.totalPrice = data.totalPrice;

    await order.save();

    return JSON.parse(JSON.stringify(order)) as IOrder;
  } catch (error) {
    handleError(error);
  }
};

// --- CHANGE ORDER STATUS ---
export const changeOrderStatus = async (
  id: string | Types.ObjectId,
  status: IOrder["status"],
): Promise<IOrder | undefined> => {
  try {
    await connectToDatabase();

    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid order ID");

    const order = await Order.findById(id);
    if (!order) throw new Error("Order not found");

    order.status = status;
    await order.save();

    return JSON.parse(JSON.stringify(order)) as IOrder;
  } catch (error) {
    handleError(error);
  }
};

// --- DELETE ORDER ---
export const deleteOrder = async (
  id: string | Types.ObjectId,
): Promise<{ message: string } | undefined> => {
  try {
    await connectToDatabase();

    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid order ID");

    const order = await Order.findById(id);
    if (!order) throw new Error("Order not found");

    // Restore stock
    const product = await Product.findById(order.product);
    if (product) {
      product.stock += order.quantity;
      await product.save();
    }

    await Order.findByIdAndDelete(id);
    return { message: "Order deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
