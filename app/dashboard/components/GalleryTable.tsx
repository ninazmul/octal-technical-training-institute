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
import { Trash, SortAsc, SortDesc } from "lucide-react";
import { deletePhoto } from "@/lib/actions/gallery.actions";
import Image from "next/image";

type Photo = {
  _id: string;
  title: string;
  image: string;
};

const GalleryTable = ({
  photos,
}: {
  photos: Array<Photo>;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"title" | "image" | null>(
    null
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredPhotos = useMemo(() => {
    const filtered = photos.filter(
      (photo) =>
        photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.image.toLowerCase().includes(searchQuery.toLowerCase())
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
  }, [photos, searchQuery, sortKey, sortOrder]);

  const paginatedPhotos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPhotos.slice(start, start + itemsPerPage);
  }, [filteredPhotos, currentPage, itemsPerPage]);

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const response = await deletePhoto(photoId);
      if (response) {
        alert(response.message);
      }
    } catch (error) {
      alert("Failed to delete photo");
      console.error(error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSort = (key: "title" | "image" ) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name, image, or category"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 w-full md:w-1/2 lg:w-1/3"
      />
      <Table className="border border-gray-200 rounded-md">
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>
              <div
                onClick={() => handleSort("image")}
                className="flex items-center gap-2 cursor-pointer"
              >
                Image
                {sortKey === "image" &&
                  (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
              </div>
            </TableHead>
            <TableHead>
              <div
                onClick={() => handleSort("title")}
                className="flex items-center gap-2 cursor-pointer"
              >
                Name
                {sortKey === "title" &&
                  (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
              </div>
            </TableHead>

            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedPhotos.map((photo, index) => (
            <TableRow key={photo._id} className="hover:bg-gray-100">
              <TableCell>
                {(currentPage - 1) * itemsPerPage + index + 1}
              </TableCell>
              <TableCell>
                <Image
                  src={photo.image}
                  alt={photo.title}
                  width={50}
                  height={50}
                  className="object-cover rounded-md"
                />
              </TableCell>
              <TableCell>{photo.title}</TableCell>
              <TableCell>
                <Button
                  onClick={() => setConfirmDeleteId(photo._id)}
                  variant={"outline"}
                  className="text-red-500"
                >
                  <Trash />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-muted-foreground line-clamp-1">
          Showing {Math.min(itemsPerPage * currentPage, filteredPhotos.length)}{" "}
          of {filteredPhotos.length} photos
        </span>
        <div className="flex items-center space-x-2">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            size={"sm"}
          >
            Previous
          </Button>
          <Button
            disabled={
              currentPage === Math.ceil(filteredPhotos.length / itemsPerPage)
            }
            onClick={() => setCurrentPage((prev) => prev + 1)}
            size={"sm"}
          >
            Next
          </Button>
        </div>
      </div>
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md space-y-4">
            <p>Are you sure you want to delete this photo?</p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setConfirmDeleteId(null)}
                variant={"outline"}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeletePhoto(confirmDeleteId)}
                variant={"destructive"}
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

export default GalleryTable;