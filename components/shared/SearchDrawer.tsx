"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { FaMagnifyingGlass } from "react-icons/fa6";
import Image from "next/image";
import { ICourse } from "@/lib/database/models/course.model";
import { searchCourses } from "@/lib/actions/course.actions";

interface SearchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headerHeight: number;
}

export default function SearchDrawer({
  open,
  onOpenChange,
  headerHeight,
}: SearchDrawerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      const data = await searchCourses(query);
      setResults(data);
      setLoading(false);
    };

    const delay = setTimeout(fetchResults, 400);
    return () => clearTimeout(delay);
  }, [query]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="p-0 bg-white shadow-lg"
        style={{
          height: `calc(100vh - ${headerHeight}px)`,
          top: `${headerHeight}px`,
          borderTopLeftRadius: "0.75rem",
          borderTopRightRadius: "0.75rem",
        }}
      >
        {/* Fixed Header */}
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <SheetHeader>
            <SheetTitle className="text-primary">Search Course</SheetTitle>
          </SheetHeader>

          <div className="relative mt-3">
            <Input
              placeholder="Type to search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full py-2 px-4 border-primary focus:ring-2 focus:ring-red-500 rounded-full"
            />
            <FaMagnifyingGlass className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(100vh-180px)] p-4">
          {loading && (
            <p className="text-gray-500 text-sm text-center py-4">
              Searching...
            </p>
          )}

          {!loading && results.length === 0 && query && (
            <p className="text-gray-500 text-sm text-center py-4">
              No results found for “{query}”.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item, idx) => (
              <a
                key={idx}
                href={`/courses/${item._id}`}
                onClick={() => onOpenChange(false)}
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border hover:bg-primary-50 transition shadow-sm"
              >
                {/* Thumbnail */}
                <div className="w-full sm:w-24 h-32 sm:h-24 relative flex-shrink-0">
                  <Image
                    src={item.photo || "/assets/images/placeholder.png"}
                    alt={item.title}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1">
                  <span className="font-semibold text-gray-900 text-base line-clamp-2">
                    {item.title}
                  </span>

                  {/* Batch & Duration */}
                  <span className="text-sm text-gray-600 mt-1">
                    {item.batch ? `Batch: ${item.batch}` : "Upcoming Batch"}
                    {item.duration && ` • Duration: ${item.duration}`}
                  </span>

                  {/* Price */}
                  {item.discountPrice ? (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-red-500 line-through text-sm">
                        ৳{item.price}
                      </span>
                      <span className="text-primary font-bold">
                        ৳{item.discountPrice}
                      </span>
                    </div>
                  ) : (
                    <span className="text-primary font-bold mt-2">
                      ৳{item.price}
                    </span>
                  )}

                  {/* Dates */}
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                    {item.courseStartDate && (
                      <span>Starts: {item.courseStartDate}</span>
                    )}
                    {item.registrationDeadline && (
                      <span>Deadline: {item.registrationDeadline}</span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
