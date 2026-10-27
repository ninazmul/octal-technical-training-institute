import { Document, Schema, Types, model, models } from "mongoose";

export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "descriptive"
  | "fill_in_the_blank";

export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export interface IQuestionOption {
  id: string;
  text: string;
  image?: string;
}

export interface IOlympiadQuestion extends Document {
  _id: Types.ObjectId;
  olympiadId: Types.ObjectId;
  questionText: string;
  questionType: QuestionType;
  image?: string;
  explanation?: string;
  marks: number;
  negativeMarks?: number;
  difficulty: DifficultyLevel;
  topic?: string;
  order: number;
  options: IQuestionOption[];
  correctAnswers: string[]; // Option IDs or accepted string answers
  caseSensitive?: boolean; // For short answer / fill in the blank
  partialCredit: boolean; // For multiple choice
  gradingRubric?: string; // For descriptive evaluation
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionOptionSchema = new Schema<IQuestionOption>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    image: { type: String },
  },
  { _id: false },
);

const OlympiadQuestionSchema = new Schema<IOlympiadQuestion>(
  {
    olympiadId: {
      type: Schema.Types.ObjectId,
      ref: "Olympiad",
      required: true,
      index: true,
    },
    questionText: { type: String, required: true },
    questionType: {
      type: String,
      enum: [
        "single_choice",
        "multiple_choice",
        "true_false",
        "short_answer",
        "descriptive",
        "fill_in_the_blank",
      ],
      required: true,
    },
    image: { type: String },
    explanation: { type: String },
    marks: { type: Number, required: true, min: 0.5, default: 1 },
    negativeMarks: { type: Number, default: 0 },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    topic: { type: String, trim: true },
    order: { type: Number, default: 0 },
    options: [QuestionOptionSchema],
    correctAnswers: [{ type: String, required: true }],
    caseSensitive: { type: Boolean, default: false },
    partialCredit: { type: Boolean, default: false },
    gradingRubric: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Indexes
OlympiadQuestionSchema.index({ olympiadId: 1, order: 1 });
OlympiadQuestionSchema.index({ olympiadId: 1, isActive: 1 });

const OlympiadQuestion =
  models.OlympiadQuestion ||
  model<IOlympiadQuestion>("OlympiadQuestion", OlympiadQuestionSchema);

export default OlympiadQuestion;
