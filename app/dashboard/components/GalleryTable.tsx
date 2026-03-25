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
import { deletePhoto } from "@/lib/actions/gallery.actions";
import Image from "next/image";
import GalleryForm from "./GalleryForm";

type Photo = {
  _id: string;
  title: string;
  image: string;
};

const GalleryTable = ({ photos }: { photos: Array<Photo> }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"title" | "image" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredPhotos = useMemo(() => {
    const filtered = photos.filter(
      (photo) =>
        photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.image.toLowerCase().includes(searchQuery.toLowerCase()),
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

  const handleSort = (key: "title" | "image") => {
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
      <Table className="border rounded-xl overflow-hidden">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-10">#</TableHead>

            <TableHead>
              <div
                onClick={() => handleSort("image")}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                Image
                {sortKey === "image" &&
                  (sortOrder === "asc" ? (
                    <SortAsc size={16} />
                  ) : (
                    <SortDesc size={16} />
                  ))}
              </div>
            </TableHead>

            <TableHead>
              <div
                onClick={() => handleSort("title")}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                Name
                {sortKey === "title" &&
                  (sortOrder === "asc" ? (
                    <SortAsc size={16} />
                  ) : (
                    <SortDesc size={16} />
                  ))}
              </div>
            </TableHead>

            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedPhotos.length > 0 ? (
            paginatedPhotos.map((photo, index) => (
              <TableRow
                key={photo._id}
                className="hover:bg-gray-50 transition-all"
              >
                {/* Index */}
                <TableCell className="text-muted-foreground text-sm">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>

                {/* Image */}
                <TableCell>
                  <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200">
                    <Image
                      src={photo.image}
                      alt={photo.title}
                      width={50}
                      height={50}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </TableCell>

                {/* Title */}
                <TableCell className="font-medium text-sm">
                  {photo.title}
                </TableCell>

                {/* Actions */}
                <TableCell className="flex justify-end gap-2">
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
                        <SheetTitle>Update Gallery</SheetTitle>
                        <SheetDescription>
                          Review and update the gallery details to keep records
                          accurate. Make necessary changes while following
                          system guidelines for proper record management.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-5">
                        <GalleryForm
                          photos={photo}
                          photoId={photo?._id.toString()}
                          type="Update"
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setConfirmDeleteId(photo._id)}
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
                No photos found
              </TableCell>
            </TableRow>
          )}
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
