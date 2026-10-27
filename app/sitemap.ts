import type { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/database";
import Course from "@/lib/database/models/course.model";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://octal.edu.bd";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/notices`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/successStories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/policies`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/verify`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/complain`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Dynamic course pages
  let coursePages: MetadataRoute.Sitemap = [];
  try {
    await connectToDatabase();
    const courses = await Course.find({ isActive: true })
      .select("_id updatedAt")
      .lean<{ _id: string; updatedAt: Date }[]>();

    coursePages = courses.map((course) => ({
      url: `${baseUrl}/courses/${course._id}`,
      lastModified: course.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Sitemap: Failed to fetch courses", error);
  }

  return [...staticPages, ...coursePages];
}
