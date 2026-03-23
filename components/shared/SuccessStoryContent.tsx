"use client";

import { ISettingSafe } from "@/lib/database/models/setting.model";
import { ISuccessStories } from "@/lib/database/models/success-stories.model";
import Image from "next/image";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { useState } from "react";

export default function SuccessStoryContent({
  settings,
  stories,
}: {
  settings: ISettingSafe | null;
  stories: ISuccessStories[];
}) {
  const themeColor = settings?.theme || "#0055CE";
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentIndex(-1);
  };

  const currentStory = stories[currentIndex];

  const renderPhotos = () => {
    return stories.length > 0 ? (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {stories.map((story, index) => (
          <motion.div
            key={index}
            className="cursor-pointer rounded-2xl shadow-lg bg-white dark:bg-gray-800"
            whileHover={{ scale: 1.02 }}
            onClick={() => openModal(index)}
          >
            <Image
              src={story.photo}
              alt={story.title}
              width={500}
              height={500}
              className="w-full rounded-t-lg object-cover"
            />
            <div className="p-3">
              <h3 className="font-semibold text-primary dark:text-gray-100">
                {story.title}
              </h3>
              <div
                className="prose prose-sm max-w-none dark:prose-invert text-gray-700 dark:text-gray-300 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: story.description }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    ) : (
      <p className="text-center text-gray-500">No success stories available.</p>
    );
  };

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
            Success Stories
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto text-sm sm:text-base">
            Explore inspiring journeys through photos and videos.
          </p>
        </motion.div>

        {/* Tabs */}
        {/* Tabs */}
        <Tabs defaultValue="photos" className="flex flex-col gap-6">
          <TabsList className="flex gap-4 justify-center">
            <TabsTrigger
              value="photos"
              className="w-full px-4 py-2 text-sm font-semibold rounded-lg transition-colors
                 data-[state=active]:bg-[color:var(--theme)]
                 data-[state=active]:text-white
                 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
              style={{ "--theme": themeColor } as React.CSSProperties}
            >
              Photos
            </TabsTrigger>
            <TabsTrigger
              value="videos"
              className="w-full px-4 py-2 text-sm font-semibold rounded-lg transition-colors
                 data-[state=active]:bg-[color:var(--theme)]
                 data-[state=active]:text-white
                 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
              style={{ "--theme": themeColor } as React.CSSProperties}
            >
              Videos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos">{renderPhotos()}</TabsContent>
          <TabsContent value="videos">
            <p className="text-center text-gray-400">
              Videos will be displayed here soon...
            </p>
          </TabsContent>
        </Tabs>

        {/* Modal for photos */}
        <AnimatePresence>
          {modalOpen && currentStory && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="relative w-11/12 max-w-2xl max-h-[90vh] mx-auto rounded-lg shadow-lg bg-white flex flex-col"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={currentStory.photo}
                  alt={currentStory.title}
                  width={500}
                  height={500}
                  className="w-full rounded-t-lg object-cover"
                />
                <div className="p-4 flex-1 overflow-y-auto">
                  <h2 className="text-xl font-bold mb-2">
                    {currentStory.title}
                  </h2>
                  <div
                    className="prose prose-base max-w-none dark:prose-invert text-justify"
                    dangerouslySetInnerHTML={{
                      __html: currentStory.description,
                    }}
                  />
                </div>
                <Button
                  size="sm"
                  className="absolute top-2 right-2 text-white bg-rose-500"
                  onClick={closeModal}
                >
                  ✕
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
