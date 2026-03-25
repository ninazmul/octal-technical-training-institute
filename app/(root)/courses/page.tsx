"use client";

import { useState, useEffect } from "react";
import { getSetting } from "@/lib/actions";
import Image from "next/image";
import { CourseLink } from "@/components/shared/CourseLink";
import { ICourseSafe } from "@/lib/database/models/course.model";
import { getCourses } from "@/lib/actions/course.actions";

type TabKey = "all" | "upcoming" | "ongoing" | "old";

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("ongoing");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [courses, setCourses] = useState<ICourseSafe[]>([]);
  const [themeColor, setThemeColor] = useState("#0055CE");

  const categories: string[] = [
    "All Categories",
    "Design",
    "Front End Development",
    "IT Security",
    "Management",
    "Mobile Application Development",
    "Web Development",
    "Programming",
    "Office Application",
    "Video Editing & Motion",
    "Marketing",
    "Workshop",
    "Networking",
    "Database Administration",
    "Freelancing",
  ];

  useEffect(() => {
    async function loadSetting() {
      const setting = await getSetting();
      setThemeColor(setting?.theme || "#0055CE");
    }
    loadSetting();
  }, []);

  useEffect(() => {
    async function loadCourses() {
      const data = await getCourses({
        tab: activeTab,
        category: selectedCategory === "All Categories" ? "" : selectedCategory,
      });
      setCourses(data);
    }
    loadCourses();
  }, [activeTab, selectedCategory]);

  return (
    <main className="w-full py-12 md:py-20 px-6 md:px-12">
      <div className="text-center mb-12">
        <h1
          className="text-4xl md:text-5xl font-bold"
          style={{ color: themeColor }}
        >
          আমাদের কোর্সসমূহ
        </h1>
        <p className="mt-4 text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
          আপনার প্রয়োজন অনুযায়ী কোর্স নির্বাচন করুন।
        </p>
      </div>

      {/* Tabs with All as dropdown */}
      <div className="flex justify-center gap-4 mb-10 flex-wrap">
        {/* All Courses Dropdown */}
        <select
          value={selectedCategory || "All Categories"}
          onChange={(e) => {
            setActiveTab("all");
            setSelectedCategory(e.target.value);
          }}
          className={`px-4 py-2 rounded-xl font-semibold transition ${
            activeTab === "all"
              ? "text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          style={activeTab === "all" ? { backgroundColor: themeColor } : {}}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Other Tabs */}
        {(["upcoming", "ongoing", "old"] as TabKey[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSelectedCategory(""); // reset category
            }}
            className={`px-4 py-2 rounded-xl font-semibold transition ${
              activeTab === tab
                ? "text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={activeTab === tab ? { backgroundColor: themeColor } : {}}
          >
            {tab === "upcoming" && "Upcoming Courses"}
            {tab === "ongoing" && "Ongoing Courses"}
            {tab === "old" && "Old Courses"}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {courses.length > 0 ? (
          courses.map((course, idx) => (
            <div
              key={idx}
              className="border rounded-2xl overflow-hidden shadow-md flex flex-col bg-white hover:scale-[1.02] transition"
            >
              <div className="relative w-full h-48">
                <Image
                  src={course.photo || "/assets/images/placeholder.png"}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5 flex flex-col flex-1 text-left">
                <CourseLink id={course._id.toString()}>
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900 line-clamp-2 hover:text-primary transition">
                    {course.title}
                  </h3>
                </CourseLink>

                <div className="mt-auto flex justify-between items-center">
                  {course.discountPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-red-500 line-through text-sm">
                        টাকা {course.price}
                      </span>
                      <span className="font-bold text-lg text-primary">
                        টাকা {course.discountPrice}
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold text-lg text-primary">
                      টাকা {course.price}
                    </span>
                  )}

                  {course.certification && (
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${themeColor}20`,
                        color: themeColor,
                      }}
                    >
                      {course.certification}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            এই ট্যাবে কোনো কোর্স নেই।
          </p>
        )}
      </div>
    </main>
  );
}
