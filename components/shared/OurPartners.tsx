"use client";

import { ISettingSafe } from "@/lib/database/models/setting.model";
import Image from "next/image";
import Marquee from "react-fast-marquee";

function OurPartners({ setting }: { setting: ISettingSafe | null }) {
  const themeColor = setting?.theme || "#0055CE";
  const logos = setting?.partners?.logos || [];

  return (
    <main className="relative w-full py-12 md:py-20 flex flex-col items-center justify-center text-center px-6 md:px-12 bg-gradient-to-r from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="flex flex-col items-center gap-4">
        <div
          className="border rounded-full px-4 py-2 text-sm shadow-md flex items-center gap-2 w-max font-semibold"
          style={{
            backgroundColor: `${themeColor}20`,
            borderColor: themeColor,
            color: "#000000",
          }}
        >
          {setting?.partners?.badge}
        </div>

        <h2
          className="text-3xl md:text-5xl font-bold"
          style={{ color: themeColor }}
        >
          {setting?.partners?.title}
        </h2>

        {setting?.partners?.description && (
          <div
            className="max-w-3xl text-gray-600 text-lg md:text-xl"
            dangerouslySetInnerHTML={{ __html: setting?.partners.description }}
          />
        )}
      </div>

      {/* Logos Auto-Scroll Section */}
      <div className="relative w-full max-w-7xl overflow-hidden mt-10">
        <Marquee
          gradient={false} // no fade edges
          speed={40} // adjust scroll speed
          pauseOnHover // optional: pause when hovered
          autoFill
        >
          {logos.map((logo, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center px-6 flex-shrink-0"
            >
              {logo.photo ? (
                <Image
                  src={logo.photo}
                  alt={logo.name || "Partner"}
                  width={120}
                  height={120}
                  className="object-contain h-[80px] w-auto"
                  loading="lazy"
                />
              ) : (
                <div className="w-[120px] h-[80px] flex items-center justify-center bg-gray-200 rounded-md text-gray-600 font-semibold">
                  {logo.name || "Company"}
                </div>
              )}
              <p className="text-sm text-gray-700 font-medium">{logo.name}</p>
            </div>
          ))}
        </Marquee>
      </div>
    </main>
  );
}

export default OurPartners;
