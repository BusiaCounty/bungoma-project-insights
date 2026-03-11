import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
}

const StarRating = ({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: StarRatingProps) => {
  const [hovered, setHovered] = useState(0);
  const dim = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Rating: ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (readOnly ? value : hovered || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            className={`transition-all ${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`${dim} transition-colors ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/40"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
