"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { Layout, ZoomIn, Award } from "lucide-react"; // using Lucide icons only

type CourseHeroProps = {
  image: string;
  title: string;
  certification: string | undefined;
  category: string;
};

const CourseHero = ({
  image,
  title,
  certification,
  category,
}: CourseHeroProps) => {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100 shadow-lg p-4 group">
      <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden">
        <Image
          src={image}
          alt={title || "Course Hero Image"}
          width={1920}
          height={1080}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          priority
        />

        {/* Subtle Overlay Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
      </div>

      {/* Content Floating Glass */}
      <div className="mt-4 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pb-6">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-2">
            {title}
          </h1>
          <div className="flex flex-wrap gap-3">
            {certification && (
              <span className="flex items-center gap-2 px-5 py-2 bg-gray-100 rounded-2xl text-xs font-semibold uppercase text-gray-700 border border-gray-300 whitespace-nowrap">
                <Award size={14} className="text-gray-700" /> {certification}
              </span>
            )}
            <span className="flex items-center gap-2 px-5 py-2 bg-gray-100 rounded-2xl text-xs font-semibold uppercase text-gray-700 border border-gray-300 whitespace-nowrap">
              <Layout size={14} className="text-gray-700" /> {category}
            </span>
          </div>
        </div>

        {/* Zoom Button */}
        <div className="flex-shrink-0">
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-5 py-2 bg-gray-100 rounded-2xl text-xs font-semibold uppercase text-gray-700 border border-gray-300 whitespace-nowrap">
                <ZoomIn
                  size={18}
                  className="group-hover/btn:scale-110 transition-transform"
                />
                <span className="tracking-tight">ENLARGE VIEW</span>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-white backdrop-blur-2xl p-0 max-w-7xl border border-gray-300 overflow-hidden rounded-2xl">
              <div className="relative w-full h-[80vh]">
                <Image
                  src={image}
                  alt={title || "Full Course Image"}
                  fill
                  className="object-contain p-4"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default CourseHero;
