import { ISettingSafe } from "@/lib/database/models/setting.model";
import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { ICourseSafe } from "@/lib/database/models/course.model";
import ApplyModal from "./ApplyModal";

function Hero({
  setting,
  courses,
}: {
  setting: ISettingSafe | null;
  courses?: ICourseSafe[];
}) {
  const themeColor = setting?.theme || "#0055CE"; // LMS blue default

  const titleParts = setting?.hero?.title?.split(/[.,]/).filter(Boolean) || [];

  return (
    <section className="relative w-full bg-gradient-to-r from-blue-50 to-indigo-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
          {/* Left Content */}
          <div className="flex flex-col w-full lg:w-1/2 gap-6 text-center lg:text-left">
            {/* Offer Banner (Static Bengali Text with Lucide Icon) */}
            <div
              className="mt-8 inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold shadow-md mx-auto lg:mx-0 w-max"
              style={{
                backgroundColor: `${themeColor}20`,
                border: `1px solid ${themeColor}`,
                color: themeColor,
              }}
            >
              <GraduationCap size={16} />
              আমাদের ওয়েবসাইটে স্বাগতম
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold leading-tight text-gray-900 space-y-2">
              {titleParts.map((part, index) => (
                <span
                  key={index}
                  className="block"
                  style={{ color: index === 1 ? themeColor : "#000000" }}
                >
                  {part.trim()}
                </span>
              ))}
            </h1>

            {/* Description */}
            {setting?.hero?.description && (
              <div
                className="text-gray-700 text-base md:text-lg lg:text-xl max-w-xl mx-auto lg:mx-0"
                dangerouslySetInnerHTML={{ __html: setting?.hero.description }}
              />
            )}

            {/* CTA */}
            <ApplyModal courses={courses} />

            {/* Contact */}
            <div className="text-gray-800 text-sm font-medium mb-6">
              সাহায্য দরকার? কল করুন: {setting?.phoneNumber}
            </div>
          </div>

          {/* Right Image */}
          <div className="relative w-full lg:w-1/2 h-[300px] md:h-[500px]">
            <Image
              src={setting?.hero?.image || "/assets/images/logo.png"}
              alt="Learning Hero"
              fill
              className="object-contain"
              sizes="(max-width: 1023px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
