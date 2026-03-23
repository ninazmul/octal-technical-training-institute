"use client";

import { useState, useMemo } from "react";
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
import { deleteSuccessStories } from "@/lib/actions/success-stories.actions";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SuccessStoriesForm from "./SuccessStoriesForm";
import { ISuccessStories } from "@/lib/database/models/success-stories.model";

const SuccessStoriesTable = ({
  successStories,
}: {
  successStories: ISuccessStories[];
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"title" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredSuccessStories = useMemo(() => {
    const filtered = successStories.filter((SuccessStory) =>
      SuccessStory.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        const valueA = a[sortKey].toLowerCase();
        const valueB = b[sortKey].toLowerCase();
        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [successStories, searchQuery, sortKey, sortOrder]);

  const paginatedSuccessStories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSuccessStories.slice(start, start + itemsPerPage);
  }, [filteredSuccessStories, currentPage, itemsPerPage]);

  const handleDeleteStory = async (successStoryId: string) => {
    try {
      const response = await deleteSuccessStories(successStoryId);
      if (response) {
        toast.success("Success Story deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete Success Story");
      console.error(error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSort = (key: "title") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        placeholder="Search by title"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 w-full md:w-1/2 lg:w-1/3"
      />

      {/* Table */}
      <Table className="border border-gray-200 rounded-md">
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>
              <div
                onClick={() => handleSort("title")}
                className="flex items-center gap-2 cursor-pointer"
              >
                Title
                {sortKey === "title" &&
                  (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
              </div>
            </TableHead>
            <TableHead>Photo</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedSuccessStories.map((story, index) => (
            <TableRow key={index} className="hover:bg-gray-100">
              <TableCell>
                {(currentPage - 1) * itemsPerPage + index + 1}
              </TableCell>
              <TableCell className="w-72 line-clamp-1 truncate">{story.title}</TableCell>
              <TableCell>
                <Image
                  src={story.photo || "/assets/images/logo.png"}
                  alt={story.title}
                  height={50}
                  width={50}
                />
              </TableCell>
              <TableCell className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger>
                    <Button variant="outline" className="text-purple-500">
                      <Edit2 />
                    </Button>
                  </SheetTrigger>

                  <SheetContent className="bg-white">
                    <SheetHeader>
                      <SheetTitle>Update Success Story</SheetTitle>
                      <SheetDescription>
                        Review and update the success story details to ensure
                        our records remain accurate and current. Make any
                        necessary changes while following system guidelines for
                        proper record management.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-5">
                      <SuccessStoriesForm
                        successStories={story}
                        successStoriesId={story?._id.toString()}
                        type="Update"
                      />
                    </div>
                  </SheetContent>
                </Sheet>
                <Button
                  onClick={() => setConfirmDeleteId(story._id.toString())}
                  variant="outline"
                  className="text-red-500"
                >
                  <Trash />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-muted-foreground line-clamp-1">
          Showing{" "}
          {Math.min(itemsPerPage * currentPage, filteredSuccessStories.length)}{" "}
          of {filteredSuccessStories.length} successStories
        </span>
        <div className="flex items-center space-x-2">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            size="sm"
          >
            Previous
          </Button>
          <Button
            disabled={
              currentPage ===
              Math.ceil(filteredSuccessStories.length / itemsPerPage)
            }
            onClick={() => setCurrentPage((prev) => prev + 1)}
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md space-y-4">
            <p>Are you sure you want to delete this Success Story?</p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setConfirmDeleteId(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteStory(confirmDeleteId)}
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

export default SuccessStoriesTable;
