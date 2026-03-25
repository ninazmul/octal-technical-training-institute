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
      <Table className="border border-gray-200 rounded-md">
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>
              <div
                onClick={() => handleSort("name")}
                className="flex items-center gap-2 cursor-pointer"
              >
                Name
                {sortKey === "name" &&
                  (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
              </div>
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>CV</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedTrainers.map((trainer, index) => (
            <TableRow key={index} className="hover:bg-gray-100">
              <TableCell>
                {(currentPage - 1) * itemsPerPage + index + 1}
              </TableCell>
              <TableCell className="w-72 line-clamp-1 truncate">
                {trainer.name}
              </TableCell>
              <TableCell className="w-72 line-clamp-1 truncate">
                {trainer.email}
              </TableCell>
              <TableCell className="w-72 line-clamp-1 truncate">
                {trainer.phone}
              </TableCell>
              <TableCell>
                {trainer.cv ? (
                  <a
                    href={trainer.cv}
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    CV/Resume
                  </a>
                ) : (
                  <span className="text-muted-foreground text-sm">No file</span>
                )}
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
                      <SheetTitle>Update trainer</SheetTitle>
                      <SheetDescription>
                        Review and update the trainer details to keep our records
                        accurate and up to date. Make any necessary edits while
                        following system guidelines for proper management and
                        organization.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-5">
                      <TrainerForm
                        trainers={trainer}
                        trainerId={trainer?._id.toString()}
                        type="Update"
                      />
                    </div>
                  </SheetContent>
                </Sheet>
                <Button
                  onClick={() => setConfirmDeleteId(trainer._id.toString())}
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
          Showing {Math.min(itemsPerPage * currentPage, filteredTrainers.length)}{" "}
          of {filteredTrainers.length} trainers
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
