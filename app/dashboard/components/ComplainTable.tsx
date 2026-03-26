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
import { Trash, SortAsc, SortDesc, X } from "lucide-react";
import toast from "react-hot-toast";
import { IComplain } from "@/lib/database/models/complain.model";
import { deleteComplain } from "@/lib/actions/complain.actions";
import Image from "next/image";

const ComplainTable = ({ complains }: { complains: IComplain[] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [imageModalSrc, setImageModalSrc] = useState<string | null>(null);
  const [data, setData] = useState<IComplain[]>(complains);

  const filteredComplains = useMemo(() => {
    const query = searchQuery.toLowerCase();

    let filtered = data.filter((c) =>
      [c.name, c.email, c.phone].join(" ").toLowerCase().includes(query),
    );

    if (sortKey) {
      filtered = [...filtered].sort((a, b) => {
        const valueA = a[sortKey].toLowerCase();
        const valueB = b[sortKey].toLowerCase();

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchQuery, sortKey, sortOrder]);

  const paginatedComplains = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredComplains.slice(start, start + itemsPerPage);
  }, [filteredComplains, currentPage, itemsPerPage]);

  const handleDeleteComplain = async (complainId: string) => {
    try {
      await deleteComplain(complainId);
      setData((prev) => prev.filter((c) => c._id.toString() !== complainId));
      toast.success("Complain deleted successfully");
    } catch (error) {
      toast.error("Failed to delete complain");
      console.error(error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSort = (key: "name") => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        placeholder="Search by name, email, or phone"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
        className="mb-4 w-full md:w-1/2 lg:w-1/3"
      />

      {/* Table */}
      <Table className="border rounded-xl overflow-hidden">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>
              <div
                onClick={() => handleSort("name")}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                Name
                {sortKey === "name" &&
                  (sortOrder === "asc" ? (
                    <SortAsc size={16} />
                  ) : (
                    <SortDesc size={16} />
                  ))}
              </div>
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Proof</TableHead>
            <TableHead>Details</TableHead> {/* new column */}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedComplains.length > 0 ? (
            paginatedComplains.map((complain, index) => (
              <TableRow
                key={complain._id.toString()}
                className="hover:bg-gray-50"
              >
                <TableCell className="text-sm text-muted-foreground">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>

                <TableCell className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold">
                    {complain.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{complain.name}</span>
                </TableCell>

                <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {complain.email}
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  {complain.phone}
                </TableCell>

                <TableCell>
                  {complain.proof ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setImageModalSrc(complain.proof!)}
                    >
                      View Image
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No file
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">
                  {complain.details || "-"} {/* new cell */}
                </TableCell>

                <TableCell className="flex justify-end">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setConfirmDeleteId(complain._id.toString())}
                    className="hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10">
                <p className="text-muted-foreground text-sm">
                  No complaints found
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Showing{" "}
          {Math.min(itemsPerPage * currentPage, filteredComplains.length)} of{" "}
          {filteredComplains.length} complaints
        </span>

        <div className="flex gap-2">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            size="sm"
          >
            Previous
          </Button>
          <Button
            disabled={
              currentPage === Math.ceil(filteredComplains.length / itemsPerPage)
            }
            onClick={() => setCurrentPage((p) => p + 1)}
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-md space-y-4">
            <p>Are you sure you want to delete this complaint?</p>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setConfirmDeleteId(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteComplain(confirmDeleteId)}
                variant="destructive"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModalSrc && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setImageModalSrc(null)}
              className="absolute top-2 right-2 text-white bg-black/50 rounded-full p-1 hover:bg-black/70"
            >
              <X size={20} />
            </button>
            <Image
              src={imageModalSrc}
              alt="Proof"
              height={500}
              width={500}
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-md shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplainTable;
