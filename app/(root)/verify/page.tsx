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

const CertificateSearch = () => {
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    setNotFound(false);
    setResult(null);

    const reg = await getRegistrationByNumber(searchId);
    if (!reg || reg.certificateStatus === "Not Certified") {
      setNotFound(true);
      return;
    }
    const course = await getCourseById(reg.course._id);
    setResult({ reg, course });
  };

  return (
    <div className="w-full py-16 min-h-screen px-6 md:px-12 max-w-7xl mx-auto">
      {/* Search box */}
      <div className="flex justify-center gap-2">
        <input
          type="text"
          placeholder="Enter certificate number"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="border rounded-lg px-4 py-2 w-64"
        />
        <button
          onClick={handleSearch}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Search className="w-4 h-4 mr-2" /> Verify
        </button>
      </div>

      {/* Not found message */}
      {notFound && (
        <p className="text-red-600 mt-4">
          No valid certificate found for {searchId}
        </p>
      )}

      {/* Result */}
      {result && (
        <VerifyCertificateView
          registration={result.reg}
          course={result.course}
        />
      )}
    </div>
  );
};

export default CertificateSearch;
