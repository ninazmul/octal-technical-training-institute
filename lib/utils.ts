import { type ClassValue, clsx } from "clsx";

import { twMerge } from "tailwind-merge";
import qs from "query-string";

import { UrlQueryParams, RemoveUrlQueryParams } from "@/types";
import { ICourse, ICourseSafe } from "./database/models/course.model";
import { ISetting, ISettingSafe } from "./database/models/setting.model";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
    timeZone: "Australia/Sydney", // Sydney time zone
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
    timeZone: "Australia/Sydney", // Sydney time zone
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
    timeZone: "Australia/Sydney", // Sydney time zone
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions,
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions,
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions,
  );

  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export const formatPrice = (price: string) => {
  const amount = parseFloat(price);
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
  }).format(amount);

  return formattedPrice;
};

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true },
  );
}

export function removeKeysFromQuery({
  params,
  keysToRemove,
}: RemoveUrlQueryParams) {
  const currentUrl = qs.parse(params);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true },
  );
}

export const handleError = (error: unknown) => {
  console.error(error);
  throw new Error(typeof error === "string" ? error : JSON.stringify(error));
};

export const generateOrderId = () => {
  const date = new Date();
  const datePart = `${date.getFullYear()}${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `ORD-${datePart}-${randomPart}`;
};

export function sanitizeCourse(course: ICourse): ICourseSafe {
  return {
    _id: course._id.toString(),
    title: course.title,
    category: course.category,
    mode: course.mode,
    photo: course.photo,
    description: course.description,
    prerequisites: course.prerequisites ?? [],
    modules: (course.modules ?? []).map((m) => ({
      title: m.title ?? "",
      content: m.content ?? "",
      // drop nested _id entirely, since ICourseSafe doesn’t include it
    })),
    price: course.price,
    discountPrice: course.discountPrice ?? undefined,
    seats: course.seats ?? 0,
    isActive: course.isActive ?? false,
    batch: course.batch ?? "",
    sku: course.sku ?? "",
    courseStartDate: course.courseStartDate ?? "",
    registrationDeadline: course.registrationDeadline ?? "",
    schedule: (course.schedule ?? []).map((s) => ({
      day: s.day ?? "",
      start: s.start ?? "",
      end: s.end ?? "",
      // drop nested _id entirely
    })),
    duration: course.duration ?? "",
    sessions: course.sessions ?? "",
    createdAt: course.createdAt?.toISOString() ?? "",
    updatedAt: course.updatedAt?.toISOString() ?? "",
  };
}

export function sanitizeCourses(courses: ICourse[]): ICourseSafe[] {
  return courses.map(sanitizeCourse);
}

export function sanitizeSetting(setting: ISetting | null): ISettingSafe | null {
  if (!setting) return null;

  return {
    _id: setting._id.toString(),
    logo: setting.logo ?? "",
    favicon: setting.favicon ?? "",
    name: setting.name ?? "",
    tagline: setting.tagline ?? "",
    description: setting.description ?? "",
    email: setting.email ?? "",
    phoneNumber: setting.phoneNumber ?? "",
    address: setting.address ?? "",
    theme: setting.theme ?? "",
    facebook: setting.facebook ?? "",
    instagram: setting.instagram ?? "",
    twitter: setting.twitter ?? "",
    facebookGroup: setting.facebookGroup ?? "",
    youtube: setting.youtube ?? "",
    returnPolicy: setting.returnPolicy ?? "",
    termsOfService: setting.termsOfService ?? "",
    privacyPolicy: setting.privacyPolicy ?? "",
    hero: setting.hero
      ? {
          title: setting.hero.title ?? "",
          description: setting.hero.description ?? "",
          image: setting.hero.image ?? "",
          offerStartDate: setting.hero.offerStartDate ?? "",
          offerEndDate: setting.hero.offerEndDate ?? "",
        }
      : undefined,
    popup: setting.popup
      ? {
          image: setting.popup.image ?? "",
          offerStartDate: setting.popup.offerStartDate ?? "",
          offerEndDate: setting.popup.offerEndDate ?? "",
        }
      : undefined,
    features: setting.features
      ? {
          badge: setting.features.badge ?? "",
          title: setting.features.title ?? "",
          description: setting.features.description ?? "",
          items: (setting.features.items ?? []).map((item) => ({
            title: item.title ?? "",
            description: item.description ?? "",
            icon: item.icon ?? "",
          })),
        }
      : undefined,
    testimonials: setting.testimonials
      ? {
          badge: setting.testimonials.badge ?? "",
          title: setting.testimonials.title ?? "",
          description: setting.testimonials.description ?? "",
          totalEnrollment: setting.testimonials.totalEnrollment ?? 0,
          totalSucceededStudents:
            setting.testimonials.totalSucceededStudents ?? 0,
          totalIndustryExperts: setting.testimonials.totalIndustryExperts ?? 0,
          feedbacks: (setting.testimonials.feedbacks ?? []).map((f) => ({
            name: f.name ?? "",
            photo: f.photo ?? "",
            rating: f.rating ?? 0,
            comment: f.comment ?? "",
          })),
        }
      : undefined,
    partners: setting.partners
      ? {
          badge: setting.partners.badge ?? "",
          title: setting.partners.title ?? "",
          description: setting.partners.description ?? "",
          logos: (setting.partners.logos ?? []).map((f) => ({
            name: f.name ?? "",
            photo: f.photo ?? "",
          })),
        }
      : undefined,
    ourMentors: setting.ourMentors
      ? {
          badge: setting.ourMentors.badge ?? "",
          title: setting.ourMentors.title ?? "",
          description: setting.ourMentors.description ?? "",
          mentors: (setting.ourMentors.mentors ?? []).map((m) => ({
            name: m.name ?? "",
            photo: m.photo ?? "",
            expertise: m.expertise ?? "",
            social: {
              facebook: m.social?.facebook ?? "",
              linkedIn: m.social?.linkedIn ?? "",
              twitter: m.social?.twitter ?? "",
              other: m.social?.other ?? "",
            },
          })),
        }
      : undefined,
    faqs: setting.faqs
      ? {
          badge: setting.faqs.badge ?? "",
          title: setting.faqs.title ?? "",
          description: setting.faqs.description ?? "",
          items: (setting.faqs.items ?? []).map((i) => ({
            question: i.question ?? "",
            answer: i.answer ?? "",
          })),
        }
      : undefined,
    createdAt: setting.createdAt ? setting.createdAt.toISOString() : "",
    updatedAt: setting.updatedAt ? setting.updatedAt.toISOString() : "",
  };
}
