import React, { useCallback, useEffect, useState } from "react";
import { Image } from "mcp-use/react";
import { IconButton } from "@medusajs/ui";
import { ArrowLeftMini, ArrowRightMini } from "@medusajs/icons";

interface ImageGalleryProps {
  thumbnail: string | null;
  images: string[];
  title: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  thumbnail,
  images,
  title,
}) => {
  const allImages = images.length > 0 ? images : thumbnail ? [thumbnail] : [];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleArrowClick = useCallback(
    (direction: "left" | "right") => {
      if (allImages.length === 0) return;
      if (direction === "left" && selectedIndex > 0) {
        setSelectedIndex((prev) => prev - 1);
      } else if (direction === "right" && selectedIndex < allImages.length - 1) {
        setSelectedIndex((prev) => prev + 1);
      }
    },
    [allImages.length, selectedIndex]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement instanceof HTMLInputElement) return;
      if (e.key === "ArrowLeft") handleArrowClick("left");
      else if (e.key === "ArrowRight") handleArrowClick("right");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleArrowClick]);

  if (allImages.length === 0) {
    return (
      <div className="flex items-center justify-center bg-neutral-100 rounded-lg w-full aspect-square">
        <span className="text-neutral-400 text-5xl">?</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-neutral-100 rounded-lg p-6 gap-4 w-full">
      {/* Main image */}
      <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden">
        <Image
          src={allImages[selectedIndex]}
          alt={title}
          className="object-contain w-full h-full p-8"
        />
      </div>

      {/* Navigation & thumbnails */}
      {allImages.length > 1 && (
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2">
            <IconButton
              variant="transparent"
              size="small"
              disabled={selectedIndex === 0}
              className="rounded-full"
              onClick={() => handleArrowClick("left")}
            >
              <ArrowLeftMini />
            </IconButton>
            <IconButton
              variant="transparent"
              size="small"
              disabled={selectedIndex === allImages.length - 1}
              className="rounded-full"
              onClick={() => handleArrowClick("right")}
            >
              <ArrowRightMini />
            </IconButton>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {allImages.map((img, index) => (
              <button
                key={index}
                className="w-8 h-8 rounded shrink-0 overflow-hidden"
                onClick={() => setSelectedIndex(index)}
              >
                <Image
                  src={img}
                  alt={`${title} ${index + 1}`}
                  className={`w-full h-full object-contain transition-opacity ${
                    index === selectedIndex ? "opacity-100" : "opacity-40"
                  } hover:opacity-100`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
