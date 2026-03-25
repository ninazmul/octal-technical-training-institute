"use client";

import { useState, useMemo } from "react";
import { deleteNotice } from "@/lib/actions/notice.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, SortAsc, SortDesc, Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import { INotice } from "@/lib/database/models/notice.model";
import NoticeForm from "./NoticeForm";

const NoticeTable = ({ notices }: { notices: INotice[] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"title" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredNotices = useMemo(() => {
    const filtered = notices.filter((notice) =>
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()),
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
  }, [notices, searchQuery, sortKey, sortOrder]);

  const paginatedNotices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotices.slice(start, start + itemsPerPage);
  }, [filteredNotices, currentPage, itemsPerPage]);

  const handleDeleteNotice = async (noticeId: string) => {
    try {
      const response = await deleteNotice(noticeId);
      if (response) {
        toast.success("Notice deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete notice");
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

            <TableHead>File</TableHead>

            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedNotices.length > 0 ? (
            paginatedNotices.map((notice, index) => (
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
                  {notice.title}
                </TableCell>

                {/* File */}
                <TableCell>
                  {notice.file ? (
                    <a
                      href={notice.file}
                      target="_blank"
                      className="text-primary hover:underline font-medium text-sm"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      No file
                    </span>
                  )}
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
                        <SheetTitle>Update Notice</SheetTitle>
                        <SheetDescription>
                          Review and update the notice details to keep records
                          accurate. Make necessary changes while following
                          system guidelines for proper record management.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-5">
                        <NoticeForm
                          notices={notice}
                          noticeId={notice?._id.toString()}
                          type="Update"
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Delete */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setConfirmDeleteId(notice._id.toString())}
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
                No notices found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-muted-foreground line-clamp-1">
          Showing {Math.min(itemsPerPage * currentPage, filteredNotices.length)}{" "}
          of {filteredNotices.length} notices
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
              currentPage === Math.ceil(filteredNotices.length / itemsPerPage)
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
            <p>Are you sure you want to delete this notice?</p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setConfirmDeleteId(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteNotice(confirmDeleteId)}
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

export default NoticeTable;
