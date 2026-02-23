import { IconButton } from "@medusajs/ui";
import { Heart } from "@medusajs/icons";
import { Image } from "mcp-use/react";
import React from "react";

export interface CarouselItemProps {
  fruit: string;
  color: string;
  isFavorite?: boolean;
  onClick: () => void;
  onToggleFavorite?: () => void;
}

export const CarouselItem: React.FC<CarouselItemProps> = ({
  fruit,
  color,
  isFavorite,
  onClick,
  onToggleFavorite,
}) => {
  return (
    <div
      className={`carousel-item size-52 rounded-xl border border-subtle ${color} cursor-pointer`}
      onClick={onClick}
    >
      {onToggleFavorite && (
        <IconButton
          variant="transparent"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`absolute top-2 right-2 z-10 ${isFavorite ? "text-red-500" : ""}`}
        >
          {isFavorite ? <Heart fill="red" /> : <Heart />}
        </IconButton>
      )}
      <div className="carousel-item-bg">
        <Image src={"/fruits/" + fruit + ".png"} alt={fruit} />
      </div>
      <div className="carousel-item-content">
        <Image
          src={"/fruits/" + fruit + ".png"}
          alt={fruit}
          className="w-24 h-24 object-contain"
        />
      </div>
    </div>
  );
};
