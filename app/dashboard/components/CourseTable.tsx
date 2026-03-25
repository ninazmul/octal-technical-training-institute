"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { deleteCourse, toggleCourseStatus } from "@/lib/actions/course.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, SortAsc, SortDesc, Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import { ICourseSafe } from "@/lib/database/models/course.model";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";

const CourseTable = ({ courses }: { courses: ICourseSafe[] }) => {
  const [courseList, setCourseList] = useState<ICourseSafe[]>(courses);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof ICourseSafe | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredCourses = useMemo(() => {
    const filtered = courseList.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];
      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      }
      const strA = String(valueA ?? "").toLowerCase();
      const strB = String(valueB ?? "").toLowerCase();
      if (strA < strB) return sortOrder === "asc" ? -1 : 1;
      if (strA > strB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [courseList, searchQuery, sortKey, sortOrder]);

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(start, start + itemsPerPage);
  }, [filteredCourses, currentPage, itemsPerPage]);

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteCourse(courseId);
      toast.success("Course deleted successfully");
      setCourseList((prev) =>
        prev.filter((c) => c._id.toString() !== courseId),
      );
      if (paginatedCourses.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error) {
      toast.error("Failed to delete course");
      console.error(error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSort = (key: keyof ICourseSafe) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleToggleActive = async (courseId: string) => {
    try {
      const updated = await toggleCourseStatus(courseId);
      if (!updated) {
        toast.error("Failed to update course status");
        return;
      }
      toast.success(
        `Course status updated to ${updated.isActive ? "Active" : "Inactive"}`,
      );
      setCourseList((prev) =>
        prev.map((c) =>
          c._id === courseId ? { ...c, isActive: updated.isActive } : c,
        ),
      );
    } catch {
      toast.error("Failed to update course status");
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by title"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 w-full md:w-1/2 lg:w-1/3"
      />

      <Table className="border rounded-xl overflow-hidden">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-10">#</TableHead>

            {[
              "title",
              "price",
              "discountPrice",
              "seats",
              "SKU",
              "isActive",
            ].map((key) => (
              <TableHead key={key}>
                <div
                  onClick={() => handleSort(key as keyof ICourseSafe)}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  {sortKey === key &&
                    (sortOrder === "asc" ? (
                      <SortAsc size={16} />
                    ) : (
                      <SortDesc size={16} />
                    ))}
                </div>
              </TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedCourses.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-6 text-muted-foreground"
              >
                No courses found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedCourses.map((course, index) => (
              <TableRow
                key={course._id}
                className="hover:bg-gray-50 transition-all"
              >
                {/* Index */}
                <TableCell className="text-muted-foreground text-sm">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>

                {/* Title + Thumbnail */}
                <TableCell className="flex items-center gap-3 whitespace-nowrap">
                  <Image
                    src={course.photo || "/assets/images/placeholder.png"}
                    alt={course.title}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover rounded-md border border-gray-200"
                  />
                  <span className="line-clamp-1 truncate font-medium">
                    {course.title}
                  </span>
                </TableCell>

                {/* Prices */}
                <TableCell>৳{course.price.toLocaleString()}</TableCell>
                <TableCell>
                  {course.discountPrice
                    ? `৳${course.discountPrice.toLocaleString()}`
                    : "-"}
                </TableCell>

                {/* Seats & SKU */}
                <TableCell>{course.seats}</TableCell>
                <TableCell>{course.sku}</TableCell>

                {/* Active Toggle */}
                <TableCell>
                  <Switch
                    checked={course.isActive}
                    onCheckedChange={() =>
                      handleToggleActive(course._id.toString())
                    }
                  />
                </TableCell>

                {/* Actions */}
                <TableCell className="flex justify-end gap-2">
                  <Link href={`/dashboard/courses/${course._id}/update`}>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:bg-blue-100 hover:text-blue-600"
                    >
                      <Edit2 size={16} />
                    </Button>
                  </Link>

                  <Button
                    onClick={() => setConfirmDeleteId(course._id.toString())}
                    size="icon"
                    variant="ghost"
                    className="hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-muted-foreground">
            Showing{" "}
            {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of{" "}
            {filteredCourses.length} courses
          </span>

          <div className="flex items-center space-x-2">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              size="sm"
            >
              Previous
            </Button>

            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-md space-y-4 max-w-sm w-full">
            <p className="text-lg font-semibold">
              Are you sure you want to delete this course?
            </p>

            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setConfirmDeleteId(null)}
                variant="outline"
              >
                Cancel
              </Button>

              <Button
                onClick={() => handleDeleteCourse(confirmDeleteId)}
                variant="destructive"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseTable;
