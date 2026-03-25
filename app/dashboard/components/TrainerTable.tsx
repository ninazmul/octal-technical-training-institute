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
import { ITrainer } from "@/lib/database/models/trainer.model";
import { deleteTrainer } from "@/lib/actions/trainer.actions";
import TrainerForm from "./TrainerForm";

const TrainerTable = ({ trainers }: { trainers: ITrainer[] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredTrainers = useMemo(() => {
    const filtered = trainers.filter((trainer) =>
      trainer.name.toLowerCase().includes(searchQuery.toLowerCase()),
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
  }, [trainers, searchQuery, sortKey, sortOrder]);

  const paginatedTrainers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTrainers.slice(start, start + itemsPerPage);
  }, [filteredTrainers, currentPage, itemsPerPage]);

  const handleDeleteTrainer = async (trainerId: string) => {
    try {
      const response = await deleteTrainer(trainerId);
      if (response) {
        toast.success("Trainer deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete trainer");
      console.error(error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSort = (key: "name") => {
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
        placeholder="Search by name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
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
            <TableHead>CV</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedTrainers.length > 0 ? (
            paginatedTrainers.map((trainer, index) => (
              <TableRow
                key={index}
                className="hover:bg-gray-50 transition-all"
              >
                <TableCell className="text-muted-foreground text-sm">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>

                {/* Name with Avatar */}
                <TableCell className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold">
                    {trainer.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{trainer.name}</span>
                </TableCell>

                <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {trainer.email}
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  {trainer.phone}
                </TableCell>

                {/* CV */}
                <TableCell>
                  {trainer.cv ? (
                    <a
                      href={trainer.cv}
                      target="_blank"
                      className="text-blue-600 text-sm hover:underline"
                    >
                      View CV
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No file
                    </span>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="flex justify-end gap-2">
                  {/* Edit */}
                  <Sheet>
                    <SheetTrigger asChild>
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
                        <SheetTitle>Update trainer</SheetTitle>
                        <SheetDescription>
                          Update trainer details.
                        </SheetDescription>
                      </SheetHeader>

                      <div className="py-5">
                        <TrainerForm
                          trainers={trainer}
                          trainerId={trainer._id.toString()}
                          type="Update"
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Delete */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setConfirmDeleteId(trainer._id.toString())}
                    className="hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10">
                <p className="text-muted-foreground text-sm">
                  No trainers found
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-muted-foreground line-clamp-1">
          Showing{" "}
          {Math.min(itemsPerPage * currentPage, filteredTrainers.length)} of{" "}
          {filteredTrainers.length} trainers
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
              currentPage === Math.ceil(filteredTrainers.length / itemsPerPage)
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
            <p>Are you sure you want to delete this trainer?</p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setConfirmDeleteId(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteTrainer(confirmDeleteId)}
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

export default TrainerTable;
