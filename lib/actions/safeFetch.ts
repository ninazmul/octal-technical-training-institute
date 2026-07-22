"use server";
import { handleError } from "../utils";

export const safeFetch = async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
  try {
    return await fn();
  } catch (err) {
    console.error("⚠️ Safe fetch error:", err);
    handleError(err);
    return undefined;
  }
};
