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
      <Table className="border rounded-xl overflow-hidden">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-10">#</TableHead>

            <TableHead>
              <div
                onClick={() => handleSort("title")}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                Title
                {sortKey === "title" &&
                  (sortOrder === "asc" ? (
                    <SortAsc size={16} />
                  ) : (
                    <SortDesc size={16} />
                  ))}
              </div>
            </TableHead>

            <TableHead>Photo</TableHead>

            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedSuccessStories.length > 0 ? (
            paginatedSuccessStories.map((story, index) => (
              <TableRow
                key={index}
                className="hover:bg-gray-50 transition-all"
              >
                {/* Index */}
                <TableCell className="text-muted-foreground text-sm">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>

                {/* Title */}
                <TableCell className="font-medium text-sm line-clamp-1 truncate">
                  {story.title}
                </TableCell>

                {/* Photo */}
                <TableCell>
                  <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200">
                    <Image
                      src={story.photo || "/assets/images/logo.png"}
                      alt={story.title}
                      width={50}
                      height={50}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="flex justify-end gap-2">
                  {/* Edit */}
                  <Sheet>
                    <SheetTrigger>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-purple-100 hover:text-purple-600"
                      >
                        <Edit2 size={16} />
                      </Button>
                    </SheetTrigger>

                    <SheetContent className="bg-white">
                      <SheetHeader>
                        <SheetTitle>Update Success Story</SheetTitle>
                        <SheetDescription>
                          Review and update the success story details to keep
                          records accurate. Make any necessary changes while
                          following system guidelines for proper record
                          management.
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

                  {/* Delete */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setConfirmDeleteId(story._id.toString())}
                    className="hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-10 text-muted-foreground"
              >
                No success stories found
              </TableCell>
            </TableRow>
          )}
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
