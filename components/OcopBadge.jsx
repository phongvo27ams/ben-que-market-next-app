import { StarIcon } from "lucide-react";

const OCOP_LETTERS = [
  { letter: "O", color: "#9F5237" },
  { letter: "C", color: "#087943" },
  { letter: "O", color: "#195CAA" },
  { letter: "P", color: "#F8A41D" },
];

const STAR_STYLES = {
  3: {
    fill: "#CD7F32",
    stroke: "#8B4513",
  },
  4: {
    fill: "#E1E1E1",
    stroke: "#6B7280",
  },
  5: {
    fill: "#FFD700",
    stroke: "#D4AF37",
  },
};

const getOcopStarStyle = (stars) => STAR_STYLES[stars] || STAR_STYLES[5];

const normalizeOcopStars = (stars) => {
  const value = Number(stars || 0);
  if (!Number.isFinite(value) || value < 3) return 0;
  return Math.min(Math.round(value), 5);
};

export default function OcopBadge({
  stars,
  className = "",
  letterClassName = "",
  starSize = 16,
}) {
  const normalizedStars = normalizeOcopStars(stars);

  if (normalizedStars === 0) {
    return null;
  }

  const starStyle = getOcopStarStyle(normalizedStars);
  return (
    <div className={className}>
      <p className={`text-center font-black uppercase leading-none tracking-[0.1em] ${letterClassName}`}>
        {OCOP_LETTERS.map(({ letter, color }, index) => (
          <span key={`${letter}-${index}`} style={{ color }}>{letter}</span>
        ))}
      </p>

      <div className="mt-1 flex items-center justify-center gap-1">
        {Array.from({ length: normalizedStars }).map((_, index) => (
          <StarIcon
            key={index}
            size={starSize}
            className="shrink-0"
            style={{ color: starStyle.stroke }}
            fill={starStyle.fill}
            strokeWidth={2.2}
          />
        ))}
      </div>
    </div>
  );
}
