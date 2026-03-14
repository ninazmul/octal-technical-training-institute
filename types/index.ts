// ====== USER PARAMS
export type CreateUserParams = {
  clerkId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  photo: string;
};

export type UpdateUserParams = {
  firstName: string;
  lastName: string;
  username: string;
  photo: string;
};

// ====== ADMIN PARAMS
export type AdminParams = {
  Name: string;
  Email: string;
  Role: string;
};

// ====== URL QUERY PARAMS
export type UrlQueryParams = {
  params: string;
  key: string;
  value: string | null;
};

export type RemoveUrlQueryParams = {
  params: string;
  keysToRemove: string[];
};

// ====== SETTINGS PARAMS

export interface Feedback {
  name?: string;
  photo?: string;
  rating?: number;
  comment?: string;
}

export interface Mentor {
  name?: string;
  photo?: string;
  expertise?: string;
  social?: {
    facebook?: string;
    linkedIn?: string;
    twitter?: string;
    other?: string;
  };
}

export interface Testimonial {
  badge?: string;
  title?: string;
  description?: string;
  totalCustomers?: number;
  totalDistricts?: number;
  totalReOrders?: number;
  feedbacks?: Feedback[];
}

export interface OurMentors {
  badge?: string;
  title?: string;
  description?: string;
  mentors?: Mentor[];
}

export interface FaqItem {
  question?: string;
  answer?: string;
}

export interface Faq {
  badge?: string;
  title?: string;
  description?: string;
  items?: FaqItem[];
}

export interface Hero {
  title?: string;
  description?: string;
  image?: string;
  offerStartDate?: Date;
  offerEndDate?: Date;
}

export interface Features {
  badge?: string;
  title?: string;
  description?: string;
  image?: string;
  weGiveYou?: string[];
  weDoNotGiveYou?: string[];
}

export interface HowToIdentify {
  badge?: string;
  title?: string;
  description?: string;
  image?: string;
  features?: string[];
}

export interface SettingParams {
  // ===== Branding & Contact =====
  logo?: string;
  favicon?: string;
  name?: string;
  tagline?: string;
  description?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  theme?: string;

  // ===== Social Media =====
  facebook?: string;
  instagram?: string;
  twitter?: string;
  facebookGroup?: string;
  youtube?: string;

  // ===== Policies =====
  returnPolicy?: string;
  termsOfService?: string;
  privacyPolicy?: string;

  // ===== Hero Section =====
  hero?: Hero;

  // ===== Features =====
  features?: Features; // single object

  // ===== Testimonials =====
  testimonials?: Testimonial; // single object with feedbacks array

  // ===== Our Mentors =====
  ourMentors?: OurMentors; // single object with mentors array

  // ===== FAQs =====
  faqs?: Faq; // single object with items array

  createdAt?: Date;
  updatedAt?: Date;
}
