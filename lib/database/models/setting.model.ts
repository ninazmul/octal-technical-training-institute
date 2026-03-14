import { Document, Schema, Types, model, models } from "mongoose";

export interface IFeedback {
  name?: string;
  photo?: string;
  rating?: number;
  comment?: string;
}

export interface ITestimonial {
  badge?: string;
  title?: string;
  description?: string;
  totalCustomers?: number;
  totalDistricts?: number;
  totalReOrders?: number;
  feedbacks?: IFeedback[];
}

export interface IFaqItem {
  question?: string;
  answer?: string;
}

export interface IFaq {
  badge?: string;
  title?: string;
  description?: string;
  items?: IFaqItem[];
}

export interface IFeatures {
  badge?: string;
  title?: string;
  description?: string;
  image?: string;
  weGiveYou?: string[];
  weDoNotGiveYou?: string[];
}

export interface IHowToIdentify {
  badge?: string;
  title?: string;
  description?: string;
  image?: string;
  features?: string[];
}

export interface ISetting extends Document {
  _id: Types.ObjectId;

  // Branding & Contact
  logo?: string;
  favicon?: string;
  name?: string;
  tagline?: string;
  description?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  theme?: string;

  // Social Media
  facebook?: string;
  instagram?: string;
  twitter?: string;
  facebookGroup?: string;
  youtube?: string;

  // Policies
  returnPolicy?: string;
  termsOfService?: string;
  privacyPolicy?: string;

  // Hero Section
  hero?: {
    title?: string;
    description?: string;
    image?: string;
    offerStartDate?: Date;
    offerEndDate?: Date;
  };

  // Features (single object with arrays inside)
  features?: IFeatures;

  // How To Identify (single object with arrays inside)
  howToIdentify?: IHowToIdentify;

  // Testimonials (single object with feedbacks array)
  testimonials?: ITestimonial;

  // FAQs (single object with items array)
  faqs?: IFaq;

  createdAt?: Date;
  updatedAt?: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    logo: { type: String },
    favicon: { type: String },
    name: { type: String },
    tagline: { type: String },
    description: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    address: { type: String },
    theme: { type: String },

    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    facebookGroup: { type: String },
    youtube: { type: String },

    returnPolicy: { type: String },
    termsOfService: { type: String },
    privacyPolicy: { type: String },

    hero: {
      title: { type: String },
      description: { type: String },
      image: { type: String },
      offerStartDate: { type: Date },
      offerEndDate: { type: Date },
    },

    features: {
      badge: { type: String, default: "" },
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      image: { type: String, default: "" },
      weGiveYou: { type: [String], default: [] },
      weDoNotGiveYou: { type: [String], default: [] },
    },

    howToIdentify: {
      badge: { type: String, default: "" },
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      image: { type: String, default: "" },
      features: { type: [String], default: [] },
    },

    testimonials: {
      badge: { type: String, default: "" },
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      totalCustomers: { type: Number, default: 0 },
      totalDistricts: { type: Number, default: 0 },
      totalReOrders: { type: Number, default: 0 },
      feedbacks: [
        {
          name: { type: String, default: "" },
          photo: { type: String, default: "" },
          rating: { type: Number, default: 0 },
          comment: { type: String, default: "" },
        },
      ],
    },

    faqs: {
      badge: { type: String, default: "" },
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      items: [
        {
          question: { type: String, default: "" },
          answer: { type: String, default: "" },
        },
      ],
    },
  },
  { timestamps: true },
);

const Setting = models.Setting || model<ISetting>("Setting", SettingSchema);
export default Setting;
