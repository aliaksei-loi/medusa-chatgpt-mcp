import React from "react";

const SKELETON_COUNT = 6;

export const CarouselSkeleton: React.FC = () => {
  return (
    <div className="carousel-scroll-container w-full overflow-x-auto overflow-y-visible pl-8">
      <div className="overflow-hidden">
        <div className="flex gap-4">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-44 rounded-xl border border-subtle animate-pulse bg-gray-100 flex flex-col"
            >
              <div className="h-36 rounded-t-xl bg-gray-200" />
              <div className="p-2.5 space-y-1.5">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-14 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
