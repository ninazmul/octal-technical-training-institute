import { ICourse } from "@/lib/database/models/course.model";

// types/course.ts
export type ICourseLean = Omit<
  ICourse,
  // remove all Mongoose document methods
  | "$assertPopulated"
  | "$clearModifiedPaths"
  | "$clone"
  | "$createModifiedPathsSnapshot"
  | "$depopulate"
  | "$getAllSubdocs"
  | "$getPopulatedPaths"
  | "$isDeleted"
  | "$isEmpty"
  | "$isDefault"
  | "$isDirectModified"
  | "$isDeleted"
  | "$isModified"
  | "$isSelected"
  | "$session"
  | "$toObject"
  | "$validateSync"
  // etc… basically all Document methods
> & { _id: string }; // we’ll serialize _id to string