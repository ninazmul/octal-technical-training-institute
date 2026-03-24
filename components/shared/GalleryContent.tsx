"use client";

import { ISettingSafe } from "@/lib/database/models/setting.model";
import Image from "next/image";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { IGallery } from "@/lib/database/models/gallery.model";

export default function GalleryContent({
  settings,
  photos,
}: {
  settings: ISettingSafe | null;
  photos: IGallery[];
}) {
  const themeColor = settings?.theme || "#0055CE";
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentIndex(-1);
  };

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // Close modal with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const currentPhoto = photos[currentIndex];

  const renderGallery = () =>
    photos.length > 0 ? (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {photos.map((image, index) => (
          <motion.div
            key={index}
            className="relative cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => openModal(index)}
          >
            {/* Square container with black background */}
            <div className="w-full aspect-square flex items-center justify-center bg-black rounded-lg shadow-md">
              <Image
                src={image.image}
                alt={image.title}
                width={500}
                height={500}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>

            {/* Caption overlay */}
            <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white text-sm p-1 rounded-b-lg w-full text-center">
              {image.title}
            </div>
          </motion.div>
        ))}
      </motion.div>
    ) : (
      <div className="flex items-center justify-center min-h-[50vh] bg-primary-50 bg-dotted-pattern bg-contain p-5 md:p-10">
        <p className="text-center text-gray-500">No images available.</p>
      </div>
    );

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 md:mb-16"
        >
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: themeColor }}
          >
            Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto text-sm sm:text-base">
            Discover stories captured in every frame.
          </p>
        </motion.div>

        <div className="mt-8">{renderGallery()}</div>

        {/* Modal */}
        <AnimatePresence>
          {modalOpen && currentPhoto && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              role="dialog"
              aria-modal="true"
            >
              <motion.div
                className="relative w-11/12 max-w-3xl max-h-[90vh] mx-auto rounded-lg shadow-lg"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={currentPhoto.image}
                  alt={currentPhoto.title}
                  width={800}
                  height={600}
                  className="w-full max-h-[80vh] object-contain rounded-lg"
                />

                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="sm"
                    className="text-white bg-rose-500"
                    onClick={closeModal}
                  >
                    ✕
                  </Button>
                </div>
                <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4">
                  <Button
                    size="sm"
                    onClick={prevPhoto}
                    className="bg-gray-700 text-white"
                  >
                    ◀ Prev
                  </Button>
                  <Button
                    size="sm"
                    onClick={nextPhoto}
                    className="bg-gray-700 text-white"
                  >
                    Next ▶
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
