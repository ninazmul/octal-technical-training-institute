"use client";

import { useState } from "react";
import {
  getRegistrationByNumber,
  SerializedRegistration,
} from "@/lib/actions/registration.actions";
import { getCourseById } from "@/lib/actions/course.actions";
import { Search } from "lucide-react";
import { ICourseSafe } from "@/lib/database/models/course.model";
import VerifyCertificateView from "@/components/shared/VerifyCertificateView";

type SearchResult = { reg: SerializedRegistration; course: ICourseSafe | null };

export default function VerifyClient() {
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchId.trim()) return;

    setIsSearching(true);
    setNotFound(false);
    setResult(null);

    try {
      const reg = await getRegistrationByNumber(searchId.trim());
      if (!reg || reg.certificateStatus === "Not Certified") {
        setNotFound(true);
        return;
      }
      const course = await getCourseById(reg.course._id);
      setResult({ reg, course });
    } catch {
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full py-16 min-h-screen px-6 md:px-12 max-w-7xl mx-auto">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Verify Certificate
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Verify the authenticity of certificates issued by Octal Technical Training Institute
        </p>
      </div>

      {/* Search box */}
      <div className="flex justify-center gap-2 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Enter certificate / reg number"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 flex-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg flex items-center font-medium transition-colors"
        >
          <Search className="w-4 h-4 mr-2" />
          {isSearching ? "Checking..." : "Verify"}
        </button>
      </div>

      {/* Not found message */}
      {notFound && (
        <div className="max-w-md mx-auto mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">
            No valid certificate found for ID: &quot;{searchId}&quot;
          </p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-10">
          <VerifyCertificateView
            registration={result.reg}
            course={result.course}
          />
        </div>
      )}
    </div>
  );
}
